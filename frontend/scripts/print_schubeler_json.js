const fs = require('fs');

const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\187\\content.md`;
let content = fs.readFileSync(directPath, 'utf8');

let cleaned = content;
cleaned = cleaned.split('\\\\\\\"').join('__LITERAL_QUOTE__');
cleaned = cleaned.split('\\"').join('"');
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

const obj = JSON.parse(jsonStr);
console.log(JSON.stringify(obj.data, null, 2));
