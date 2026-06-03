const fs = require('fs');
const path = require('path');

const srcAccountingDir = 'e:/Roomhy-Website/admin-master-ui/src/pages/accounting';
const srcPagesDir = 'e:/Roomhy-Website/admin-master-ui/src/pages';
const destDir = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin';

const accountingFiles = [
  { src: 'AccountingReports.tsx', dest: 'accounting_reports.jsx' },
  { src: 'AccountingSettings.tsx', dest: 'accounting_settings.jsx' },
  { src: 'Commission.tsx', dest: 'accounting_commission.jsx' },
  { src: 'Invoices.tsx', dest: 'accounting_invoices.jsx' },
  { src: 'Payouts.tsx', dest: 'accounting_payouts.jsx' },
  { src: 'Refunds.tsx', dest: 'reports_refunds.jsx' }, // Mapped to reports_refunds per user request/sidebar
  { src: 'Subscriptions.tsx', dest: 'accounting_subscriptions.jsx' },
  { src: 'Taxes.tsx', dest: 'accounting_taxes.jsx' },
  { src: 'Transactions.tsx', dest: 'accounting_transactions.jsx' }
];

const rootFiles = [
  { src: 'Accounting.tsx', dest: 'accounting_dashboard.jsx' },
  { src: 'Reports.tsx', dest: 'reports_overview.jsx' }
];

function transform(srcPath, destPath) {
  if (!fs.existsSync(srcPath)) {
    console.log('Skipping missing file:', srcPath);
    return;
  }
  let content = fs.readFileSync(srcPath, 'utf8');
  
  // Replace aliased imports
  content = content.replace(/@\/components\/dashboard\//g, '../../components/dashboard/');
  content = content.replace(/@\/lib\/utils/g, '../../lib/utils');
  
  // Remove TS type annotations (simple version)
  content = content.replace(/:\s*Record<[^>]+>/g, '')
                  .replace(/:\s*string\[\]/g, '')
                  .replace(/:\s*string/g, '')
                  .replace(/:\s*number/g, '')
                  .replace(/:\s*boolean/g, '')
                  .replace(/:\s*any/g, '')
                  .replace(/as\s+[A-Z][a-zA-Z]+/g, '')
                  .replace(/<\{[^}]+\}>/g, '')
                  .replace(/<[A-Z][a-zA-Z]*(\s*,\s*[A-Z][a-zA-Z]*)*>/g, (match) => {
                      // Only remove if it's not a JSX tag (e.g. <T>, <{on: boolean}>)
                      if (match.includes(',') || match.length < 5) return '';
                      return match;
                  });

  // Add margin fix: replace the first <div className="space-y-6"> with <div className="p-4 md:p-8 space-y-6">
  content = content.replace(/<div className="space-y-6">/, '<div className="p-4 md:p-8 space-y-6">');
  
  fs.writeFileSync(destPath, content);
  console.log('Copied and transformed:', destPath);
}

accountingFiles.forEach(f => transform(path.join(srcAccountingDir, f.src), path.join(destDir, f.dest)));
rootFiles.forEach(f => transform(path.join(srcPagesDir, f.src), path.join(destDir, f.dest)));

console.log('Done.');
