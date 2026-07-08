const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'zerosumtechnologies.com', 'collaborations');
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

let totalErrors = 0;

files.forEach(file => {
  const filePath = path.join(dirPath, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all src="..." values
  const regex = /src="([^"]+)"/g;
  let match;
  console.log(`\nChecking images in ${file}:`);
  
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    const src = match[1];
    
    // Resolve relative path
    let absPath;
    if (src.startsWith('../')) {
      absPath = path.join(__dirname, 'zerosumtechnologies.com', src.slice(3));
    } else if (src.startsWith('./')) {
      absPath = path.join(dirPath, src.slice(2));
    } else if (src.startsWith('/')) {
      absPath = path.join(__dirname, 'zerosumtechnologies.com', src.slice(1));
    } else {
      absPath = path.join(dirPath, src);
    }
    
    const exists = fs.existsSync(absPath);
    console.log(`  - [${src}]: ${exists ? 'OK' : 'BROKEN'}`);
    if (!exists) {
      totalErrors++;
    }
    count++;
  }
  
  if (count === 0) {
    console.log("  No images found.");
  }
});

console.log(`\nAudit Complete. Total broken image references: ${totalErrors}`);
if (totalErrors > 0) {
  process.exit(1);
}
