/**
 * Extract product JSON data from all fetched collaboration pages.
 * The live site is Next.js and embeds data as JSON in self.__next_f.push() script tags.
 * We parse out the product "data" object from each page's RSC payload.
 */
const fs = require('fs');
const path = require('path');

const stepsDir = 'C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps';

const pages = {
  skypower:         path.join(stepsDir, '664', 'content.md'),
  'eureka-dynamics': path.join(stepsDir, '666', 'content.md'),
  'triad-rf':       path.join(stepsDir, '668', 'content.md'),
  'uav-navigation': path.join(stepsDir, '670', 'content.md'),
  maxamps:          path.join(stepsDir, '672', 'content.md'),
  dss:              path.join(stepsDir, '519', 'content.md'),
  'drone-rescue':   path.join(stepsDir, '521', 'content.md'),
  schubeler:        path.join(stepsDir, '523', 'content.md'),
  // dynotis was already complete via PyWebCopy
};

// The RSC payload embeds a JSON "data" object inside self.__next_f.push() calls.
// We need to find the one that contains "products" array with specifications.
function extractDataFromPage(content) {
  // Look for the data JSON that contains the product info
  // It appears in the RSC payload as a "data":{...} property with products array
  const dataRegex = /\\"data\\":\{[^}]*\\"products\\":\[/;
  
  // Alternative: find the segment that has the full data JSON
  // The data is embedded in __next_f.push calls. Let's reconstruct the full text.
  
  // Combine all __next_f.push content
  const pushes = [];
  const pushRegex = /self\.__next_f\.push\(\[1,"([^]*)"\]\)/g;
  let match;
  while ((match = pushRegex.exec(content)) !== null) {
    pushes.push(match[1]);
  }
  
  const combined = pushes.join('');
  
  // Find the data JSON - it starts with {"data":{ and contains products
  // The pattern in RSC is: $Lc",null,{"data":{...},"theme":{...}}
  const dataMatch = combined.match(/\\"data\\":(\{[^]*?\}),\\"theme\\":/);
  if (!dataMatch) {
    // Try alternate pattern
    const alt = combined.match(/"data":(\{[^]*?\}),"theme":/);
    if (alt) {
      try {
        return JSON.parse(alt[1]);
      } catch(e) {}
    }
    return null;
  }
  
  try {
    // The string is double-escaped JSON
    let jsonStr = dataMatch[1];
    // Unescape the string
    jsonStr = jsonStr.replace(/\\\\"/g, '"').replace(/\\\\/g, '\\');
    return JSON.parse(jsonStr);
  } catch(e) {
    return null;
  }
}

// Better approach: extract the HTML and find data in script tags
function extractDataV2(content) {
  // The content.md file has the raw HTML starting after the --- separator
  const htmlStart = content.indexOf('<!DOCTYPE html>');
  if (htmlStart === -1) return null;
  const html = content.slice(htmlStart);
  
  // Collect all self.__next_f.push([1,"..."]) content
  const chunks = [];
  const regex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    chunks.push(m[1]);
  }
  
  const fullPayload = chunks.join('');
  
  // Find the data block with products
  // Pattern: "data":{"id":"skypower",...,"products":[...],...},"theme":{"primary":...}
  // This is inside escaped JSON
  
  // Try to find and extract the data object
  const dataStart = fullPayload.indexOf('\\"data\\":{');
  if (dataStart === -1) return null;
  
  // Find the matching closing brace by counting
  let depth = 0;
  let inStr = false;
  let escape = false;
  let start = fullPayload.indexOf('{', dataStart + 7); // after "data":
  let extracted = '';
  
  for (let i = start; i < fullPayload.length; i++) {
    const ch = fullPayload[i];
    extracted += ch;
    
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  
  // Unescape the JSON string
  try {
    // The extracted string has escaped quotes
    let unescaped = extracted
      .replace(/\\\\n/g, ' ')
      .replace(/\\\\t/g, ' ')
      .replace(/\\\\"/g, '"')
      .replace(/\\\\\\\\/g, '\\')
      .replace(/\\"/g, '"');
    
    // Try parsing
    const data = JSON.parse(unescaped);
    return data;
  } catch(e) {
    // Try a simpler unescape
    try {
      let simple = extracted.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      return JSON.parse(simple);
    } catch(e2) {
      return null;
    }
  }
}

// Even better: use regex to find the actual products array content
function extractProducts(content) {
  const htmlStart = content.indexOf('<!DOCTYPE html>') || content.indexOf('<html');
  if (htmlStart === -1) return null;
  const html = content.slice(htmlStart);
  
  // Collect all RSC payload chunks
  const chunks = [];
  const regex = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    // Unescape the chunk
    let chunk = m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    chunks.push(chunk);
  }
  
  const payload = chunks.join('');
  
  // Find the collaboration data block
  // It's structured as: "data":{"id":"xxx",...,"products":[...],...},"theme":{...}
  const dataIdx = payload.indexOf('"data":{');
  if (dataIdx === -1) return null;
  
  // Extract from "data":{ to },"theme":
  const themeIdx = payload.indexOf('},"theme":{', dataIdx);
  if (themeIdx === -1) return null;
  
  // We need to find the correct closing brace for data
  // Count braces from dataIdx
  let braceStart = payload.indexOf('{', dataIdx);
  let depth = 0;
  let endIdx = braceStart;
  
  for (let i = braceStart; i < payload.length; i++) {
    if (payload[i] === '{') depth++;
    if (payload[i] === '}') {
      depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  
  const dataStr = payload.slice(braceStart, endIdx);
  
  try {
    const data = JSON.parse(dataStr);
    return data;
  } catch(e) {
    // Try to find just the products array
    const prodIdx = payload.indexOf('"products":[', dataIdx);
    if (prodIdx === -1) return { error: 'no products found', parseError: e.message };
    
    // Extract products array
    let arrStart = payload.indexOf('[', prodIdx);
    depth = 0;
    let arrEnd = arrStart;
    for (let i = arrStart; i < payload.length; i++) {
      if (payload[i] === '[') depth++;
      if (payload[i] === ']') {
        depth--;
        if (depth === 0) {
          arrEnd = i + 1;
          break;
        }
      }
    }
    
    const productsStr = payload.slice(arrStart, arrEnd);
    try {
      const products = JSON.parse(productsStr);
      return { products };
    } catch(e2) {
      return { error: 'parse failed', snippet: productsStr.slice(0, 200), parseError: e2.message };
    }
  }
}

// Process each page
const results = {};
for (const [name, filePath] of Object.entries(pages)) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = extractProducts(content);
    results[name] = data;
    
    if (data && data.products) {
      console.log(`\n=== ${name} === (${data.products.length} products)`);
      data.products.forEach(function(p, i) {
        const specCount = (p.specifications || []).filter(Boolean).length;
        const featCount = (p.features || []).filter(Boolean).length;
        console.log(`  ${i+1}. ${p.name} — specs: ${specCount}, features: ${featCount}`);
        if (specCount > 0) {
          p.specifications.filter(Boolean).forEach(function(s) {
            console.log(`     • ${s}`);
          });
        }
      });
    } else {
      console.log(`\n=== ${name} === FAILED to extract`);
      if (data) console.log('  ', JSON.stringify(data).slice(0, 300));
    }
  } catch(e) {
    console.log(`\n=== ${name} === ERROR: ${e.message}`);
  }
}

// Save the extracted data as JSON for reference
const outPath = path.join(__dirname, 'extracted_products.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\nSaved full extracted data to ${outPath}`);
