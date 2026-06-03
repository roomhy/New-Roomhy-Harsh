const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, 'src', 'pages', 'propertyowner');

function processDir(currentDir) {
  const files = fs.readdirSync(currentDir);
  files.forEach(file => {
    const filePath = path.join(currentDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // Regex matches any div with class "text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1" and removes it
      const regex = /<div className="text-\[11\.5px\] font-semibold uppercase tracking-\[0\.08em\] text-muted-foreground mb-1">.*?<\/div>\s*/g;
      
      if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Cleaned eyebrow from: ${path.relative(dir, filePath)}`);
      }
    }
  });
}

processDir(dir);
console.log('All eyebrow headings cleaned successfully!');
