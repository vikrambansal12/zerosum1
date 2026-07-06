const fs = require('fs');
const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\148\\content.md`;
let content = fs.readFileSync(directPath, 'utf8');

// Replace all escaped quotes
const cleaned = content.replace(/\\"/g, '"');

// Find the index of {"data":{"id":
const searchStr = '{"data":{"id":';
const idx = cleaned.indexOf(searchStr);
console.log("Index of search string:", idx);

if (idx !== -1) {
  const snippet = cleaned.substring(idx, idx + 500);
  console.log("Snippet:", snippet);
}
