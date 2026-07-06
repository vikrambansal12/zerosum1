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
    ? db.prepare('SELECT * FROM products WHERE section = ? ORDER BY id ASC').all(section)
    : db.prepare('SELECT * FROM products ORDER BY id ASC').all();
  return rows.map(rowToProduct);
}

function getProduct(id) {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  return row ? rowToProduct(row) : null;
}

function createProduct({ name, category, description, price, image, features, specifications, section, page_slug }) {
  const stmt = db.prepare(`
    INSERT INTO products (name, category, description, price, image, features, specifications, section, page_slug)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    name,
    category || '',
    description || '',
    price || '',
    image || '',
    JSON.stringify(features || []),
    JSON.stringify(specifications || []),
    section || 'homepage',
    page_slug || ''
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

function deleteProduct(id) {
  const existing = getProduct(id);
  if (!existing) return null;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return existing;
}

module.exports = {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  createAdmin, getAdminByEmail, getAdminById, countAdmins
};
