const fs = require('fs');
const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\185\\content.md`;
let content = fs.readFileSync(directPath, 'utf8');

let cleaned = content;
// Replace multi-escaped literal quotes with a placeholder
cleaned = cleaned.split('\\\\\\\"').join('__LITERAL_QUOTE__');
// Replace standard JSON property quotes
cleaned = cleaned.split('\\"').join('"');
// Restore literal quotes as properly escaped JSON quotes
cleaned = cleaned.split('__LITERAL_QUOTE__').join('\\"');

const searchStr = '{"data":{"id":';
const startIdx = cleaned.indexOf(searchStr);
if (startIdx === -1) {
  console.log("Not found search string.");
  process.exit(1);
}

let braces = 0;
let jsonStr = "";
for (let i = startIdx; i < cleaned.length; i++) {
  const char = cleaned[i];
  jsonStr += char;
  if (char === '{') braces++;
  if (char === '}') {
    braces--;
    if (braces === 0) break;
  }
}

try {
  const obj = JSON.parse(jsonStr);
  console.log("Parsed successfully!");
  console.log("ID:", obj.data.id);
  console.log("Company:", obj.data.companyName);
  console.log("Features of first product:", obj.data.products[0].features);
} catch (e) {
  console.log("Error details:", e.message);
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log("Snippet:", jsonStr.substring(pos - 50, pos + 50));
  }
}
