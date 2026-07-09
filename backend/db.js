// Postgres data layer for the admin product catalog and admin accounts.
// Previously SQLite on a Railway volume -- switched because that volume
// repeatedly failed to reattach across deploys/restarts, silently wiping
// both tables. A managed Postgres instance (Railway's Postgres add-on)
// doesn't have that failure mode.
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Schema is created fresh each boot (idempotent via IF NOT EXISTS) -- unlike
// the old SQLite file, there's no pre-existing-file column migration to
// carry forward, so the full final shape can just be declared directly.
const schemaReady = pool.query(`
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    price TEXT,
    image TEXT,
    images TEXT NOT NULL DEFAULT '[]',
    features TEXT NOT NULL DEFAULT '[]',
    specifications TEXT NOT NULL DEFAULT '[]',
    section TEXT NOT NULL DEFAULT 'homepage',
    page_slug TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Case-insensitive email uniqueness/lookup (Postgres has no COLLATE NOCASE
  -- equivalent to SQLite's -- callers below always lower() the email instead).
  CREATE UNIQUE INDEX IF NOT EXISTS admins_email_lower_idx ON admins (LOWER(email));
`);

// Every exported function awaits this first so callers never race the
// schema-creation query above (matters on cold start under concurrent hits).
async function ready() {
  await schemaReady;
}

// Inserts a new admin account. Caller is responsible for hashing the password first.
async function createAdmin({ name, email, passwordHash, passwordSalt }) {
  await ready();
  const result = await pool.query(
    `INSERT INTO admins (name, email, password_hash, password_salt)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [name, email, passwordHash, passwordSalt]
  );
  return getAdminById(result.rows[0].id);
}

async function getAdminByEmail(email) {
  await ready();
  const result = await pool.query('SELECT * FROM admins WHERE LOWER(email) = LOWER($1)', [email]);
  return result.rows[0] || null;
}

async function getAdminById(id) {
  await ready();
  const result = await pool.query('SELECT * FROM admins WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Used to decide whether admin registration should still be open (see
// server.js) -- self-service signup is only allowed while this is 0.
async function countAdmins() {
  await ready();
  const result = await pool.query('SELECT COUNT(*) AS c FROM admins');
  return Number(result.rows[0].c);
}

// Products are stored with features/specifications/images as JSON text
// columns; this turns a raw DB row back into the array shape the API/
// frontend expect. `image` is kept in sync as images[0] for any older
// consumer that only reads the single-image field.
function rowToProduct(row) {
  return {
    ...row,
    features: JSON.parse(row.features || '[]'),
    specifications: JSON.parse(row.specifications || '[]'),
    images: JSON.parse(row.images || '[]'),
  };
}

async function listProducts(section) {
  await ready();
  const result = section
    ? await pool.query('SELECT * FROM products WHERE section = $1 ORDER BY sort_order ASC, id ASC', [section])
    : await pool.query('SELECT * FROM products ORDER BY section ASC, sort_order ASC, id ASC');
  return result.rows.map(rowToProduct);
}

async function getProduct(id) {
  await ready();
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] ? rowToProduct(result.rows[0]) : null;
}

async function createProduct({ name, category, description, price, images, features, specifications, section, page_slug }) {
  await ready();
  const targetSection = section || 'homepage';
  const imageList = images || [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [{ maxorder }] } = await client.query(
      'SELECT COALESCE(MAX(sort_order), 0) AS maxorder FROM products WHERE section = $1',
      [targetSection]
    );
    const result = await client.query(
      `INSERT INTO products (name, category, description, price, image, images, features, specifications, section, page_slug, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        name, category || '', description || '', price || '', imageList[0] || '',
        JSON.stringify(imageList), JSON.stringify(features || []), JSON.stringify(specifications || []),
        targetSection, page_slug || '', Number(maxorder) + 1
      ]
    );
    await client.query('COMMIT');
    return getProduct(result.rows[0].id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateProduct(id, { name, category, description, price, images, features, specifications, section, page_slug }) {
  await ready();
  const existing = await getProduct(id);
  if (!existing) return null;
  const imageList = images !== undefined ? images : existing.images;
  await pool.query(
    `UPDATE products
     SET name = $1, category = $2, description = $3, price = $4, image = $5, images = $6,
         features = $7, specifications = $8, section = $9, page_slug = $10
     WHERE id = $11`,
    [
      name, category || '', description || '', price || '', imageList[0] || '',
      JSON.stringify(imageList), JSON.stringify(features || []), JSON.stringify(specifications || []),
      section || 'homepage', page_slug !== undefined ? (page_slug || '') : existing.page_slug, id
    ]
  );
  return getProduct(id);
}

// Swaps sort_order with the previous/next product in the same section (by
// current display order), so it moves one place up or down. No-op if the
// product is already first/last in its section. Ordering is resolved by
// walking the actual ordered list (rather than comparing sort_order values
// directly) so it stays correct even if two rows ever end up with equal
// sort_order.
async function moveProduct(id, direction) {
  await ready();
  const product = await getProduct(id);
  if (!product) return null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: siblings } = await client.query(
      'SELECT id, sort_order FROM products WHERE section = $1 ORDER BY sort_order ASC, id ASC',
      [product.section]
    );
    const index = siblings.findIndex(s => s.id === id);
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= siblings.length) {
      await client.query('ROLLBACK');
      return product; // already at the boundary
    }

    const current = siblings[index];
    const neighbor = siblings[neighborIndex];
    await client.query('UPDATE products SET sort_order = $1 WHERE id = $2', [neighbor.sort_order, current.id]);
    await client.query('UPDATE products SET sort_order = $1 WHERE id = $2', [current.sort_order, neighbor.id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getProduct(id);
}

async function deleteProduct(id) {
  await ready();
  const existing = await getProduct(id);
  if (!existing) return null;
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
  return existing;
}

module.exports = {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct, moveProduct,
  createAdmin, getAdminByEmail, getAdminById, countAdmins
};
