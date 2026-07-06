const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'zerosumtechnologies.com', 'collaborations', 'dynotis.html');
let html = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove leading semicolons in inline styles (style=";..." -> style="...")
const beforeSemi = (html.match(/style=";/g) || []).length;
html = html.replace(/style=";/g, 'style="');
console.log('Fixed leading-semicolon styles:', beforeSemi);

// Fix 2: Remove empty style attributes (style="" or style=" ")
const beforeEmpty = (html.match(/style="\s*"/g) || []).length;
html = html.replace(/\s*style="\s*"/g, '');
console.log('Fixed empty style attributes:', beforeEmpty);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Done.');
