const fs = require('fs');
const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\185\\content.md`;
let content = fs.readFileSync(directPath, 'utf8');

const idx = content.indexOf('real flight');
if (idx !== -1) {
  console.log("Bytes around 'real flight':", JSON.stringify(content.substring(idx - 30, idx + 30)));
}
