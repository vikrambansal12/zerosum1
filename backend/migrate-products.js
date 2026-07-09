// Re-imports products-export.json (69 products dumped from the local
// backend/data/products.db) into the live Railway backend via the admin
// bulk-import endpoint. Requires ADMIN_EMAIL / ADMIN_PASSWORD env vars
// (your existing Railway admin login) and BACKEND_URL.
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.BACKEND_URL || 'https://zerosum-smtppass.up.railway.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars first.');
  process.exit(1);
}

async function main() {
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'products-export.json'), 'utf8'));

  const loginRes = await fetch(`${BACKEND_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.success) {
    console.error('Login failed:', loginData.message || loginRes.status);
    process.exit(1);
  }

  const importRes = await fetch(`${BACKEND_URL}/api/admin/products/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` },
    body: JSON.stringify({ products })
  });
  const importData = await importRes.json();
  if (!importRes.ok || !importData.success) {
    console.error('Import failed:', importData.message || importRes.status);
    process.exit(1);
  }

  console.log('Imported', importData.count, 'products into', BACKEND_URL);
}

main().catch(err => { console.error(err); process.exit(1); });
