const fs = require('fs');
const path = require('path');

const srcReportsFile = 'e:/Roomhy-Website/admin-master-ui/src/pages/Reports.tsx';
const srcAllListingsFile = 'e:/Roomhy-Website/admin-master-ui/src/pages/property/AllListings.tsx';
const destDir = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin';

function transform(content, title, subtitle) {
  // Replace aliased imports
  content = content.replace(/@\/components\/dashboard\//g, '../../components/dashboard/');
  content = content.replace(/@\/lib\/utils/g, '../../lib/utils');
  
  // Remove TS type annotations
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

  // Add margin fix
  content = content.replace(/<div className="space-y-6">/, '<div className="p-4 md:p-8 space-y-6">');
  
  // Update Title and Subtitle
  if (title) {
    content = content.replace(/title="Reports Overview"/, `title="${title}"`);
    content = content.replace(/title="All Listings"/, `title="${title}"`);
  }
  if (subtitle) {
    content = content.replace(/subtitle="[^"]+"/, `subtitle="${subtitle}"`);
  }
  
  return content;
}

const reports = [
  { file: 'reports_listings.jsx', title: 'Listings Report', sub: 'Detailed performance of all property listings.', src: srcAllListingsFile },
  { file: 'reports_users.jsx', title: 'Users Report', sub: 'Insights into user growth and engagement.', src: srcReportsFile },
  { file: 'reports_leads.jsx', title: 'Leads & Bookings Report', sub: 'Track lead generation and booking conversions.', src: srcReportsFile },
  { file: 'reports_revenue.jsx', title: 'Revenue Report', sub: 'Comprehensive financial breakdown of platform earnings.', src: srcReportsFile },
  { file: 'reports_commission.jsx', title: 'Commission Report', sub: 'Analysis of commission collected from bookings.', src: srcReportsFile },
  { file: 'reports_subscriptions.jsx', title: 'Subscriptions Report', sub: 'Overview of user subscription plans and renewals.', src: srcReportsFile },
  { file: 'reports_performance.jsx', title: 'Performance Report', sub: 'Key performance indicators and platform metrics.', src: srcReportsFile },
  { file: 'reports_exports.jsx', title: 'Exports History', sub: 'History of all generated and exported reports.', src: srcReportsFile }
];

reports.forEach(r => {
  const content = fs.readFileSync(r.src, 'utf8');
  const transformed = transform(content, r.title, r.sub);
  fs.writeFileSync(path.join(destDir, r.file), transformed);
  console.log('Generated:', r.file);
});

console.log('Done.');
