const fs = require('fs');
const path = require('path');
const dir = 'public/propertyowner/assets/css';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.css'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Strip out any body blocks that specify Inter or background-color
  content = content.replace(/body\s*\{[^}]*font-family:\s*['"]Inter['"],[^}]*\}/g, '');
  content = content.replace(/font-family:\s*['"]Inter['"],\s*sans-serif;/g, '');
  content = content.replace(/body\s*\{\s*background-color:\s*#[a-f0-9]+;\s*\}/ig, '');
  
  fs.writeFileSync(filePath, content);
  console.log('Cleaned ' + file);
}
