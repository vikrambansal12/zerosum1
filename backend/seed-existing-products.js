const fs = require('fs');
const path = require('path');
const products = require('./db');

const SCRATCH = 'C:/Users/nishi/AppData/Local/Temp/claude/e--zerosum-clone/0a29b229-2bc8-49fa-98f8-5d831b2ef63b/scratchpad';

const perPageProducts = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'extracted_products.json'), 'utf8'));
const homepageCards = JSON.parse(fs.readFileSync(path.join(SCRATCH, 'extracted_homepage_cards.json'), 'utf8'));

let created = 0;

for (const p of homepageCards) {
  products.createProduct({
    name: p.name,
    category: p.category,
    description: p.description,
    price: p.price,
    image: p.image,
    features: p.features,
    specifications: p.specifications,
    section: 'homepage',
    page_slug: p.slug
  });
  created++;
}

for (const p of perPageProducts) {
  products.createProduct({
    name: p.name,
    category: p.category,
    description: p.description,
    price: p.price,
    image: p.image,
    features: p.features,
    specifications: [],
    section: p.section,
    page_slug: ''
  });
  created++;
}

console.log('Seeded', created, 'products.');
console.log('Total in DB now:', products.listProducts().length);
