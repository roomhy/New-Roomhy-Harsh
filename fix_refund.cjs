const fs = require('fs');
const path = require('path');

const srcAccountingDir = 'e:/Roomhy-Website/admin-master-ui/src/pages/accounting';
const destDir = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin';

function transform(srcPath, destPath) {
  if (!fs.existsSync(srcPath)) return;
  let content = fs.readFileSync(srcPath, 'utf8');
  content = content.replace(/@\/components\/dashboard\//g, '../../components/dashboard/');
  content = content.replace(/@\/lib\/utils/g, '../../lib/utils');
  content = content.replace(/:\s*Record<[^>]+>/g, '')
                  .replace(/:\s*string\[\]/g, '')
                  .replace(/:\s*string/g, '')
                  .replace(/:\s*number/g, '')
                  .replace(/:\s*boolean/g, '')
                  .replace(/:\s*any/g, '')
                  .replace(/as\s+[A-Z][a-zA-Z]+/g, '')
                  .replace(/<\{[^}]+\}>/g, '')
                  .replace(/<[A-Z][a-zA-Z]*(\s*,\s*[A-Z][a-zA-Z]*)*>/g, (match) => {
                      if (match.includes(',') || match.length < 5) return '';
                      return match;
                  });
  content = content.replace(/<div className="space-y-6">/, '<div className="p-4 md:p-8 space-y-6">');
  fs.writeFileSync(destPath, content);
}

// Modernize refund.jsx from Refunds.tsx
transform(path.join(srcAccountingDir, 'Refunds.tsx'), path.join(destDir, 'refund.jsx'));

console.log('Modernized refund.jsx');
