const fs = require('fs');
const path = require('path');

const steps = {
  dss: '148',
  'eureka-dynamics': '185',
  schubeler: '187',
  'drone-rescue': '190'
};

function extractJSON(content) {
  let cleaned = content;
  cleaned = cleaned.split('\\\\\\\"').join('__LITERAL_QUOTE__');
  cleaned = cleaned.split('\\"').join('"');
  cleaned = cleaned.split('__LITERAL_QUOTE__').join('\\"');

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
    return JSON.parse(jsonStr).data;
  } catch (e) {
    return null;
  }
}

Object.keys(steps).forEach(key => {
  const step = steps[key];
  const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\${step}\\content.md`;
  
  try {
    const raw = fs.readFileSync(directPath, 'utf8');
    const data = extractJSON(raw);
    if (data) {
      console.log(`${key} has applications: ${data.applications ? 'YES' : 'NO'}`);
      if (data.applications) {
        console.log(JSON.stringify(data.applications, null, 2));
      }
    }
  } catch(e) {}
});
