// SQLite data layer for the admin product catalog and admin accounts.
// Uses Node's built-in node:sqlite (experimental) instead of a dependency
// like better-sqlite3 -- no native build step needed.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'products.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    price TEXT,
    image TEXT,
    features TEXT NOT NULL DEFAULT '[]',
    specifications TEXT NOT NULL DEFAULT '[]',
    section TEXT NOT NULL DEFAULT 'homepage',
    page_slug TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Migrate older DB files created before these columns existed
const existingColumns = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
if (!existingColumns.includes('section')) {
  db.exec("ALTER TABLE products ADD COLUMN section TEXT NOT NULL DEFAULT 'homepage'");
}
if (!existingColumns.includes('page_slug')) {
  db.exec("ALTER TABLE products ADD COLUMN page_slug TEXT NOT NULL DEFAULT ''");
}
if (!existingColumns.includes('sort_order')) {
  db.exec("ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");
  // Backfill using id so existing display order (previously id ASC) is preserved.
  db.exec("UPDATE products SET sort_order = id");
}

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Inserts a new admin account. Caller is responsible for hashing the password first.
function createAdmin({ name, email, passwordHash, passwordSalt }) {
  const stmt = db.prepare(`
    INSERT INTO admins (name, email, password_hash, password_salt)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, email, passwordHash, passwordSalt);
  return getAdminById(Number(result.lastInsertRowid));
}

function getAdminByEmail(email) {
  return db.prepare('SELECT * FROM admins WHERE email = ?').get(email) || null;
}

function getAdminById(id) {
  return db.prepare('SELECT * FROM admins WHERE id = ?').get(id) || null;
}

// Used to decide whether admin registration should still be open (see
// server.js) -- self-service signup is only allowed while this is 0.
function countAdmins() {
  return db.prepare('SELECT COUNT(*) AS c FROM admins').get().c;
}

// Products are stored with features/specifications as JSON text columns;
// this turns a raw DB row back into the array shape the API/frontend expect.
function rowToProduct(row) {
  return {
    ...row,
    features: JSON.parse(row.features || '[]'),
    specifications: JSON.parse(row.specifications || '[]'),
  };
}

function listProducts(section) {
  const rows = section
    ? db.prepare('SELECT * FROM products WHERE section = ? ORDER BY sort_order ASC, id ASC').all(section)
    : db.prepare('SELECT * FROM products ORDER BY section ASC, sort_order ASC, id ASC').all();
  return rows.map(rowToProduct);
}

function getProduct(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return row ? rowToProduct(row) : null;
}

function createProduct({ name, category, description, price, image, features, specifications, section, page_slug }) {
  const targetSection = section || 'homepage';
  // New products are appended after everything already in their section.
  const { maxOrder } = db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS maxOrder FROM products WHERE section = ?').get(targetSection);

  const stmt = db.prepare(`
    INSERT INTO products (name, category, description, price, image, features, specifications, section, page_slug, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    category || '',
    description || '',
    price || '',
    image || '',
    JSON.stringify(features || []),
    JSON.stringify(specifications || []),
    targetSection,
    page_slug || '',
    maxOrder + 1
  );
  return getProduct(Number(result.lastInsertRowid));
}

function updateProduct(id, { name, category, description, price, image, features, specifications, section, page_slug }) {
  const existing = getProduct(id);
  if (!existing) return null;
  const stmt = db.prepare(`
    UPDATE products
    SET name = ?, category = ?, description = ?, price = ?, image = ?, features = ?, specifications = ?, section = ?, page_slug = ?
    WHERE id = ?
  `);
  stmt.run(
    name,
    category || '',
    description || '',
    price || '',
    image,
    JSON.stringify(features || []),
    JSON.stringify(specifications || []),
    section || 'homepage',
    page_slug !== undefined ? (page_slug || '') : existing.page_slug,
    id
  );
  return getProduct(id);
}

// Swaps sort_order with the previous/next product in the same section (by
// current display order), so it moves one place up or down. No-op if the
// product is already first/last in its section. Ordering is resolved by
// walking the actual ordered list (rather than comparing sort_order values
// directly) so it stays correct even if two rows ever end up with equal
// sort_order.
function moveProduct(id, direction) {
  const product = getProduct(id);
  if (!product) return null;

  const siblings = db.prepare(
    'SELECT id, sort_order FROM products WHERE section = ? ORDER BY sort_order ASC, id ASC'
  ).all(product.section);
  const index = siblings.findIndex(s => s.id === id);

  const neighborIndex = direction === 'up' ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= siblings.length) return product; // already at the boundary

  const current = siblings[index];
  const neighbor = siblings[neighborIndex];
  db.prepare('UPDATE products SET sort_order = ? WHERE id = ?').run(neighbor.sort_order, current.id);
  db.prepare('UPDATE products SET sort_order = ? WHERE id = ?').run(current.sort_order, neighbor.id);

  return getProduct(id);
}

function deleteProduct(id) {
  const existing = getProduct(id);
  if (!existing) return null;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return existing;
}

module.exports = {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct, moveProduct,
  createAdmin, getAdminByEmail, getAdminById, countAdmins
};
