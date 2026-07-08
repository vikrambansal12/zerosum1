/**
 * Fix image paths in dss.html, drone-rescue.html, schubeler.html
 * to match the actual locally-available filenames (as saved by PyWebCopy)
 */
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, 'zerosumtechnologies.com');

// Map of live path -> actual local filename
const pathMap = {
  // DSS
  '../images/collaborations/dss/featured-product.jpg': '../images/collaborations/dss/featured-product.jpg.jpeg',
  '../images/collaborations/dss/swarm-platform.png':   '../images/collaborations/dss/swarm-platform.svg',
  '../images/collaborations/dss/drone-designer.jpg':   '../images/collaborations/dss/drone-designer.svg',
  '../images/collaborations/dss/flight-control.jpg':   '../images/collaborations/dss/flight-control.svg',
  '../images/collaborations/dss/led.gif':              '../images/collaborations/dss/led.svg',

  // Drone Rescue
  '../images/collaborations/drone-rescue/featured-product.jpeg':          '../images/collaborations/drone-rescue/featured-product.jpeg',
  '../images/collaborations/drone-rescue/drone-rescue-systems_sharing.jpg': '../images/collaborations/drone-rescue/drone-rescue-systems_sharing.svg',
  '../images/collaborations/drone-rescue/multiple-models.png':            '../images/collaborations/drone-rescue/multiple-models.svg',

  // Schubeler
  '../images/collaborations/schubeler/featured-product.png': '../images/collaborations/schubeler/featured-product.png',
  '../images/collaborations/schubeler/images2.jpg':          '../images/collaborations/schubeler/images2.svg',
  '../images/collaborations/schubeler/aerospace.png':        '../images/collaborations/schubeler/aerospace.svg',
  '../images/collaborations/schubeler/industrial.jpg':       '../images/collaborations/schubeler/industrial.svg',
};

const pages = ['collaborations/dss.html', 'collaborations/drone-rescue.html', 'collaborations/schubeler.html'];

pages.forEach(function(p) {
  const filePath = path.join(base, p);
  let html = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;

  Object.keys(pathMap).forEach(function(from) {
    const to = pathMap[from];
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const before = html;
    html = html.replace(regex, to);
    if (html !== before) fixCount++;
  });

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Fixed ' + p + ': ' + fixCount + ' image path(s) updated');
});

console.log('\nDone. Verifying...');

// Re-check
let allGood = true;
pages.forEach(function(p) {
  const html = fs.readFileSync(path.join(base, p), 'utf8');
  const matches = html.match(/src="(\.\.\/images\/[^"]+)"/g) || [];
  matches.forEach(function(m) {
    const rel = m.replace(/src="/, '').replace(/"$/, '');
    const full = path.join(base, 'collaborations', rel);
    if (!fs.existsSync(full)) {
      console.log('STILL MISSING: ' + full);
      allGood = false;
    }
  });
});
if (allGood) console.log('All images verified OK!');
