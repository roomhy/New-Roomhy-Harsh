const fs = require('fs');
let content = fs.readFileSync('tailwind.config.js', 'utf8');
content = content.replace(/hsl\(var\((.*?)\)\)/g, 'oklch(var($1))');
fs.writeFileSync('tailwind.config.js', content);
