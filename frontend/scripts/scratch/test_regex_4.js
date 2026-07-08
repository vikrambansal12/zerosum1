const fs = require('fs');
const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\148\\content.md`;
let content = fs.readFileSync(directPath, 'utf8');

function extractJSON(content) {
  const cleaned = content.replace(/\\"/g, '"');
  const searchStr = '{"data":{"id":';
  const startIdx = cleaned.indexOf(searchStr);
  if (startIdx === -1) return null;
  
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
    return obj.data;
  } catch (e) {
    console.error("JSON parsing error:", e.message);
    return null;
  }
}

const data = extractJSON(content);
if (data) {
  console.log("Successfully extracted data object!");
  console.log("ID:", data.id);
  console.log("Company:", data.companyName);
  console.log("Product count:", data.products ? data.products.length : 0);
  if (data.products && data.products.length > 0) {
    console.log("First product:", data.products[0].name);
  }
} else {
  console.log("Failed to extract data.");
}
