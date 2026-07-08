const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const webDir = path.join(rootDir, 'zerosumtechnologies.com');
const collabDir = path.join(webDir, 'collaborations');

const filesToCheck = [
  { dir: webDir, file: 'index.html' },
  { dir: webDir, file: 'contact.html' }
];

// Add all files in collaborations/
fs.readdirSync(collabDir).filter(f => f.endsWith('.html')).forEach(f => {
  filesToCheck.push({ dir: collabDir, file: f });
});

let totalErrors = 0;

filesToCheck.forEach(item => {
  const filePath = path.join(item.dir, item.file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all src="..." values
  const regex = /src="([^"]+)"/g;
  let match;
  console.log(`\nChecking images in ${item.file}:`);
  
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    const src = match[1];
    
    // Resolve relative path
    let absPath;
    if (src.startsWith('../')) {
      absPath = path.join(webDir, src.slice(3));
    } else if (src.startsWith('./')) {
      absPath = path.join(item.dir, src.slice(2));
    } else if (src.startsWith('/')) {
      absPath = path.join(webDir, src.slice(1));
    } else {
      // Relative to current file's folder
      absPath = path.join(item.dir, src);
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

console.log(`\nGlobal Audit Complete. Total broken image references across site: ${totalErrors}`);
if (totalErrors > 0) {
  process.exit(1);
}
