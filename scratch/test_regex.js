const fs = require('fs');
const path = require('path');

const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\148\\content.md`;
const content = fs.readFileSync(directPath, 'utf8');

console.log("File length:", content.length);

// Print where "dss" occurs
let idx = content.indexOf('"dss"');
if (idx === -1) idx = content.indexOf('\\"dss\\"');
console.log("Index of dss:", idx);

if (idx !== -1) {
  console.log("Snippet:", content.substring(idx - 100, idx + 100));
}
