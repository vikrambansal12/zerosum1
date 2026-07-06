const fs = require('fs');
const path = require('path');

const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\148\\content.md`;
const content = fs.readFileSync(directPath, 'utf8');

const searchTerms = ['companyName', 'parentCompanyName', 'Drone Show Software'];

searchTerms.forEach(term => {
  let idx = content.indexOf(term);
  console.log(`Term "${term}": index = ${idx}`);
  if (idx !== -1) {
    console.log(`Snippet around ${term}:`, content.substring(idx - 100, idx + 100));
  }
});
