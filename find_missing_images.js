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
    const obj = JSON.parse(jsonStr);
    return obj.data;
  } catch (e) {
    return null;
  }
}

function check() {
  const rootDir = __dirname;
  
  Object.keys(steps).forEach(key => {
    const step = steps[key];
    const directPath = `C:\\Users\\nishi\\.gemini\\antigravity-ide\\brain\\049eba69-025e-4b8f-b975-60406e99279e\\.system_generated\\steps\\${step}\\content.md`;
    
    let rawContent = "";
    try {
      rawContent = fs.readFileSync(directPath, 'utf8');
    } catch(e) {
      console.log(`Could not read ${directPath}`);
      return;
    }

    const data = extractJSON(rawContent);
    if (!data) return;

    console.log(`\n=== Collaboration: ${key} ===`);
    
    // Check hero image
    if (data['hero-image']) {
      const heroRel = data['hero-image'].startsWith('/') ? data['hero-image'].slice(1) : data['hero-image'];
      const heroAbs = path.join(rootDir, 'zerosumtechnologies.com', heroRel);
      const exists = fs.existsSync(heroAbs);
      console.log(`Hero image [${heroRel}]: ${exists ? 'EXISTS' : 'MISSING'}`);
      if (!exists) {
        // Search for any file with same basename
        const dir = path.dirname(heroAbs);
        const base = path.basename(heroAbs, path.extname(heroAbs));
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const matches = files.filter(f => f.startsWith(base));
          if (matches.length > 0) {
            console.log(`  -> Found alternative extensions on disk: ${matches.join(', ')}`);
          }
        }
      }
    }

    // Check products
    if (data.products) {
      data.products.forEach(p => {
        if (p.image) {
          const prodRel = p.image.startsWith('/') ? p.image.slice(1) : p.image;
          const prodAbs = path.join(rootDir, 'zerosumtechnologies.com', prodRel);
          const exists = fs.existsSync(prodAbs);
          console.log(`Product "${p.name}" image [${prodRel}]: ${exists ? 'EXISTS' : 'MISSING'}`);
          if (!exists) {
            const dir = path.dirname(prodAbs);
            const base = path.basename(prodAbs, path.extname(prodAbs));
            if (fs.existsSync(dir)) {
              const files = fs.readdirSync(dir);
              const matches = files.filter(f => f.startsWith(base));
              if (matches.length > 0) {
                console.log(`  -> Found alternative extensions on disk: ${matches.join(', ')}`);
              }
            }
          }
        }
      });
    }
  });
}

check();
