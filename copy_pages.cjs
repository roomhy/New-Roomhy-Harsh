const fs = require('fs');
const path = require('path');

const srcDir = 'e:/Roomhy-Website/admin-master-ui/src/pages/property';
const destDir = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin';

const filesToCopy = [
  { src: 'FlaggedListings.tsx', dest: 'property_flagged.jsx' },
  { src: 'Categories.tsx', dest: 'property_categories.jsx' },
  { src: 'Amenities.tsx', dest: 'property_amenities.jsx' },
  { src: 'PricingPlans.tsx', dest: 'property_pricing.jsx' },
  { src: 'FeaturedListings.tsx', dest: 'property_featured.jsx' },
  { src: 'Locations.tsx', dest: 'reports_locations.jsx' },
  { src: 'Moderation.tsx', dest: 'property_moderation.jsx' },
  { src: 'Analytics.tsx', dest: 'property_analytics.jsx' },
  { src: 'PropertySettings.tsx', dest: 'property_settings.jsx' },
  { src: 'ApprovalQueue.tsx', dest: 'property_approvals.jsx' }
];

filesToCopy.forEach(f => {
  const srcPath = path.join(srcDir, f.src);
  const destPath = path.join(destDir, f.dest);
  
  if (!fs.existsSync(srcPath)) {
    console.log('Skipping missing file:', srcPath);
    return;
  }
  let content = fs.readFileSync(srcPath, 'utf8');
  
  // Replace aliased imports with relative imports
  content = content.replace(/@\/components\/dashboard\//g, '../../components/dashboard/');
  content = content.replace(/@\/lib\/utils/g, '../../lib/utils');
  
  fs.writeFileSync(destPath, content);
  console.log('Copied and transformed:', f.dest);
});
console.log('Done.');
