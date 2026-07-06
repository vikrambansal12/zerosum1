const fs = require('fs');
const path = require('path');

const base = 'zerosumtechnologies.com';
const pages = ['collaborations/dss.html', 'collaborations/drone-rescue.html', 'collaborations/schubeler.html'];
const missing = [];

pages.forEach(function(p) {
  const html = fs.readFileSync(path.join(base, p), 'utf8');
  const matches = html.match(/src="(\.\.\/images\/[^"]+)"/g) || [];
  matches.forEach(function(m) {
    const rel = m.replace(/src="/, '').replace(/"$/, '');
    const full = path.join(base, 'collaborations', rel);
    if (!fs.existsSync(full)) {
      missing.push({ page: p, path: full });
    }
  });
});

if (missing.length === 0) {
  console.log('All images exist locally!');
} else {
  console.log('MISSING images:');
  missing.forEach(function(m) { console.log('  [' + m.page + '] ' + m.path); });
}
