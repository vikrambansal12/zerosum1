const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pages = [
  { url: 'https://zerosumtechnologies.com/collaborations/dss', file: 'dss.html' },
  { url: 'https://zerosumtechnologies.com/collaborations/eureka-dynamics', file: 'eureka-dynamics.html' },
  { url: 'https://zerosumtechnologies.com/collaborations/schubeler', file: 'schubeler.html' },
  { url: 'https://zerosumtechnologies.com/collaborations/drone-rescue', file: 'drone-rescue.html' }
];

async function scrape() {
  console.log('Starting Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const item of pages) {
    console.log(`Navigating to ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // extra wait for animations/rendering

    // Extract the full rendered document HTML
    let html = await page.content();

    // ── Asset & Link Path Transformations ──
    // Replace /_next/ references with relative path ../next/
    html = html.replace(/\/_next\//g, '../next/');

    // Fix stylesheet paths to use local styles
    html = html.replace(/"\/next\/static\//g, '"../next/static/');

    // Fix favicon and manifest references
    html = html.replace(/"\/favicon/g, '"../favicon');
    html = html.replace(/"\/manifest\.json"/g, '"../manifest.json"');
    html = html.replace(/"\/apple-touch-icon/g, '"../apple-touch-icon');

    // Fix logo and image paths
    html = html.replace(/"\/images\//g, '"../images/');

    // Fix navigation links
    // Replace "/index" or "/" navigation links with "../index.html"
    html = html.replace(/href="\/index\.html"/g, 'href="../index.html"');
    html = html.replace(/href="\/"/g, 'href="../index.html"');
    html = html.replace(/href="\/contact"/g, 'href="../contact.html"');
    html = html.replace(/href="\/collaborations\//g, 'href="./');

    // Set visibility options (remove opacity:0 / translateY / etc.)
    html = html.replace(/opacity:0/g, 'opacity:1');
    html = html.replace(/transform:translateY\([^)]*\)/g, '');
    html = html.replace(/transform:translateX\([^)]*\)/g, '');
    html = html.replace(/transform:scale\(0\)/g, '');

    // Write file back to collaborations folder
    const destPath = path.join(__dirname, 'zerosumtechnologies.com', 'collaborations', item.file);
    fs.writeFileSync(destPath, html, 'utf8');
    console.log(`Successfully saved rendered page to ${destPath}`);
  }

  await browser.close();
  console.log('All pages scraped and updated successfully!');
}

scrape().catch(err => {
  console.error('Error during scraping:', err);
  process.exit(1);
});
