const fs = require('fs');
const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\185\\content.md`;
let content = fs.readFileSync(directPath, 'utf8');

const cleaned = content.replace(/\\"/g, '"');
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

console.log("Total jsonStr length:", jsonStr.length);

try {
  JSON.parse(jsonStr);
  console.log("Parsed successfully!");
} catch (e) {
  console.log("Error details:", e.message);
  // Extract index from error message
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    console.log("Context around error index", pos);
    console.log(jsonStr.substring(pos - 50, pos + 50));
  }
}
