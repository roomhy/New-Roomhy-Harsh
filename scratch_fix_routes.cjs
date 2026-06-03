const fs = require('fs');
let code = fs.readFileSync('src/routes.jsx', 'utf8');

const regex = /const routes = routeEntries\.map\(\(\[path, modulePath[\s\S]*?\]\) => \(\{/;
code = code.replace(regex, 'const routes = routeEntries.map(([path, modulePath]) => ({');

const toInject = `  ["/propertyowner/room-photos", "./pages/propertyowner/room-photos.jsx"],
  ["/propertyowner/tenant-docs", "./pages/propertyowner/tenant-docs.jsx"],
  ["/propertyowner/dues-report", "./pages/propertyowner/dues-report.jsx"],
  ["/propertyowner/late-fine", "./pages/propertyowner/late-fine.jsx"],
  ["/propertyowner/payment-dashboard", "./pages/propertyowner/payment-dashboard.jsx"],
  ["/propertyowner/receipts", "./pages/propertyowner/receipts.jsx"],
  ["/propertyowner/collection-report", "./pages/propertyowner/collection-report.jsx"],
  ["/propertyowner/expense-tracking", "./pages/propertyowner/expense-tracking.jsx"],
  ["/propertyowner/revenue-analytics", "./pages/propertyowner/revenue-analytics.jsx"],
  ["/propertyowner/hra-gst", "./pages/propertyowner/hra-gst.jsx"],
  ["/propertyowner/agreement", "./pages/propertyowner/agreement.jsx"],
  ["/propertyowner/announcements", "./pages/propertyowner/announcements.jsx"],
  ["/propertyowner/whatsapp", "./pages/propertyowner/whatsapp.jsx"],
  ["/propertyowner/listing", "./pages/propertyowner/listing.jsx"],
  ["/propertyowner/occupancy-report", "./pages/propertyowner/occupancy-report.jsx"],
`;

code = code.replace(/\["\/"\,\s*"\.\/HomePage\.jsx"\]\r?\n\];/, '["/", "./HomePage.jsx"],\n' + toInject + '];');

fs.writeFileSync('src/routes.jsx', code);
