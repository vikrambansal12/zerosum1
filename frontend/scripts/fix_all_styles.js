const fs = require('fs');
const path = require('path');

const webDir = path.join(__dirname, 'zerosumtechnologies.com');
const files = [
  path.join(webDir, 'index.html'),
  path.join(webDir, 'contact.html'),
  ...fs.readdirSync(path.join(webDir, 'collaborations'))
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(webDir, 'collaborations', f))
];

let totalSemi = 0, totalEmpty = 0;

files.forEach(filePath => {
  let html = fs.readFileSync(filePath, 'utf8');

  const semi = (html.match(/style=";/g) || []).length;
  const empty = (html.match(/style="\s*"/g) || []).length;

  if (semi > 0 || empty > 0) {
    html = html.replace(/style=";/g, 'style="');
    html = html.replace(/\s*style="\s*"/g, '');
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Fixed ${path.basename(filePath)}: ${semi} leading-semicolons, ${empty} empty styles`);
    totalSemi += semi;
    totalEmpty += empty;
  }
});

console.log(`\nTotal fixed: ${totalSemi} leading-semicolons, ${totalEmpty} empty style attributes across all pages.`);
