const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'room-photos.jsx', title: 'Property Gallery', icon: 'Image' },
  { name: 'tenant-docs.jsx', title: 'Tenant Documents', icon: 'FolderOpen' },
  { name: 'dues-report.jsx', title: 'Pending Dues', icon: 'AlertTriangle' },
  { name: 'late-fine.jsx', title: 'Late Payments', icon: 'Clock' },
  { name: 'payment-dashboard.jsx', title: 'Online Payments', icon: 'CreditCard' },
  { name: 'receipts.jsx', title: 'Receipts', icon: 'Receipt' },
  { name: 'collection-report.jsx', title: 'Collection Report', icon: 'BarChart3' },
  { name: 'expense-tracking.jsx', title: 'Expense Tracking', icon: 'TrendingDown' },
  { name: 'revenue-analytics.jsx', title: 'Revenue Analytics', icon: 'PieChart' },
  { name: 'hra-gst.jsx', title: 'GST & Tax', icon: 'Calculator' },
  { name: 'agreement.jsx', title: 'Agreements', icon: 'FileText' },
  { name: 'announcements.jsx', title: 'Announcements', icon: 'Megaphone' },
  { name: 'whatsapp.jsx', title: 'WhatsApp Integration', icon: 'MessageCircle' },
  { name: 'listing.jsx', title: 'Property Listing', icon: 'Globe' },
  { name: 'occupancy-report.jsx', title: 'Occupancy Report', icon: 'BarChart3' },
];

const template = (title, icon) => `import React from 'react';
import PropertyOwnerLayout from '../../components/propertyowner/PropertyOwnerLayout';
import { Search, Filter, Download, Plus, ${icon} } from 'lucide-react';
import { Pill } from '../../components/propertyowner/Pill';

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <PropertyOwnerLayout title="${title}">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
        <div>
          <h1 className="font-serif text-[34px] md:text-[40px] leading-[1.05]">
            ${title}
          </h1>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Manage your ${title.toLowerCase()} here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90">
            <Plus className="size-3.5" /> Add New
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft animate-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-transparent border border-border rounded-xl pl-9 pr-4 py-2 text-[13px] focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40">
              <Filter className="size-3.5" /> Filter
            </button>
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40">
              <Download className="size-3.5" /> Export
            </button>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl bg-muted/10">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
            <${icon} className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-[15px] font-medium text-foreground mb-1">No Records Found</h3>
          <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
            Get started by adding your first record to ${title}.
          </p>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
`;

pages.forEach(p => {
  const filePath = path.join(__dirname, 'src/pages/propertyowner', p.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template(p.title, p.icon));
    console.log('Created:', p.name);
  }
});

let routesContent = fs.readFileSync(path.join(__dirname, 'src/routes.jsx'), 'utf8');
let changed = false;

pages.forEach(p => {
  const routePath = "/propertyowner/" + p.name.replace('.jsx', '');
  if (!routesContent.includes(routePath)) {
    // We append just before the array ends
    // Look for the last element in the array export default [ ... ];
    const insertionPoint = routesContent.lastIndexOf(']');
    if (insertionPoint !== -1) {
      const routeStr = '  ["' + routePath + '", "./pages/propertyowner/' + p.name + '"],\n';
      routesContent = routesContent.slice(0, insertionPoint) + routeStr + routesContent.slice(insertionPoint);
      changed = true;
    }
  }
});

if (changed) {
  fs.writeFileSync(path.join(__dirname, 'src/routes.jsx'), routesContent);
  console.log('Routes updated!');
}
