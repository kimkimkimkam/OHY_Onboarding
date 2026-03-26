const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'dist', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Remove type="module" and crossorigin
content = content.replace(/<script type="module" crossorigin/g, '<script');

fs.writeFileSync(filePath, content);
console.log('Fixed index.html for local file opening.');
