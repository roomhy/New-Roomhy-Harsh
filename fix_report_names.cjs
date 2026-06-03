const fs = require('fs');
const path = require('path');

const destDir = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin';

const reports = [
  { file: 'reports_listings.jsx', func: 'ReportsListings' },
  { file: 'reports_users.jsx', func: 'ReportsUsers' },
  { file: 'reports_leads.jsx', func: 'ReportsLeads' },
  { file: 'reports_revenue.jsx', func: 'ReportsRevenue' },
  { file: 'reports_commission.jsx', func: 'ReportsCommission' },
  { file: 'reports_subscriptions.jsx', func: 'ReportsSubscriptions' },
  { file: 'reports_performance.jsx', func: 'ReportsPerformance' },
  { file: 'reports_exports.jsx', func: 'ReportsExports' }
];

reports.forEach(r => {
  const filePath = path.join(destDir, r.file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/export default function Reports\(\)/, `export default function ${r.func}()`);
  content = content.replace(/export default function AllListings\(\)/, `export default function ${r.func}()`);
  fs.writeFileSync(filePath, content);
  console.log('Fixed function name in:', r.file);
});
