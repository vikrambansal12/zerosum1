const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'zerosumtechnologies.com', 'contact.html');
let html = fs.readFileSync(filePath, 'utf8');

// Fix 1: Remove leading semicolons in inline styles (e.g., style=";position:..." -> style="position:...")
const beforeSemi = (html.match(/style=";/g) || []).length;
html = html.replace(/style=";/g, 'style="');
console.log(`Fixed leading-semicolon styles: ${beforeSemi} occurrences`);

// Fix 2: Remove empty style attributes
const beforeEmpty = (html.match(/style="\s*"/g) || []).length;
html = html.replace(/\s*style="\s*"/g, '');
console.log(`Fixed empty style attributes: ${beforeEmpty} occurrences`);

// Fix 3: Break the big minified line 6 into multiple lines
// The whole page is crammed into one line after line 5 comment
// We'll do basic tag-boundary splits to make it multi-line
html = html
  .replace(/></g, '>\n<')   // split adjacent tags
  .replace(/\n<\//g, '\n</') // keep closing tags on own line
  .replace(/>\n<!/g, '><!--'); // don't break HTML comments

// Clean up: remove extra blank lines
html = html.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(filePath, html, 'utf8');
const lines = html.split('\n').length;
console.log(`Done. File now has ${lines} lines.`);
