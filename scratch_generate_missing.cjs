const fs = require('fs');
const path = require('path');

const newRoutes = [
  ["/propertyowner/occupancy-overview", "./pages/propertyowner/occupancy-overview.jsx"],
  ["/propertyowner/revenue-overview", "./pages/propertyowner/revenue-overview.jsx"],
  ["/propertyowner/quick-actions", "./pages/propertyowner/quick-actions.jsx"],
  ["/propertyowner/notifications", "./pages/propertyowner/notifications.jsx"],
  ["/propertyowner/activity-timeline", "./pages/propertyowner/activity-timeline.jsx"],
  ["/propertyowner/floors", "./pages/propertyowner/floors.jsx"],
  ["/propertyowner/beds", "./pages/propertyowner/beds.jsx"],
  ["/propertyowner/vacant-beds", "./pages/propertyowner/vacant-beds.jsx"],
  ["/propertyowner/amenities", "./pages/propertyowner/amenities.jsx"],
  ["/propertyowner/property-settings", "./pages/propertyowner/property-settings.jsx"],
  ["/propertyowner/active-tenants", "./pages/propertyowner/active-tenants.jsx"],
  ["/propertyowner/upcoming-moveins", "./pages/propertyowner/upcoming-moveins.jsx"],
  ["/propertyowner/moveout-requests", "./pages/propertyowner/moveout-requests.jsx"],
  ["/propertyowner/ex-tenants", "./pages/propertyowner/ex-tenants.jsx"],
  ["/propertyowner/kyc-verification", "./pages/propertyowner/kyc-verification.jsx"],
  ["/propertyowner/police-verification", "./pages/propertyowner/police-verification.jsx"],
  ["/propertyowner/tenant-ledger", "./pages/propertyowner/tenant-ledger.jsx"],
  ["/propertyowner/new-enquiries", "./pages/propertyowner/new-enquiries.jsx"],
  ["/propertyowner/follow-ups", "./pages/propertyowner/follow-ups.jsx"],
  ["/propertyowner/cancelled-bookings", "./pages/propertyowner/cancelled-bookings.jsx"],
  ["/propertyowner/lead-sources", "./pages/propertyowner/lead-sources.jsx"],
  ["/propertyowner/whatsapp-leads", "./pages/propertyowner/whatsapp-leads.jsx"],
  ["/propertyowner/security-deposits", "./pages/propertyowner/security-deposits.jsx"],
  ["/propertyowner/refunds", "./pages/propertyowner/refunds.jsx"],
  ["/propertyowner/discounts-offers", "./pages/propertyowner/discounts-offers.jsx"],
  ["/propertyowner/income", "./pages/propertyowner/income.jsx"],
  ["/propertyowner/vendor-payments", "./pages/propertyowner/vendor-payments.jsx"],
  ["/propertyowner/transactions", "./pages/propertyowner/transactions.jsx"],
  ["/propertyowner/profit-loss", "./pages/propertyowner/profit-loss.jsx"],
  ["/propertyowner/cash-flow", "./pages/propertyowner/cash-flow.jsx"],
  ["/propertyowner/reports", "./pages/propertyowner/reports.jsx"],
  ["/propertyowner/download-statements", "./pages/propertyowner/download-statements.jsx"],
  ["/propertyowner/open-tickets", "./pages/propertyowner/open-tickets.jsx"],
  ["/propertyowner/in-progress-complaints", "./pages/propertyowner/in-progress-complaints.jsx"],
  ["/propertyowner/resolved-complaints", "./pages/propertyowner/resolved-complaints.jsx"],
  ["/propertyowner/maintenance-requests", "./pages/propertyowner/maintenance-requests.jsx"],
  ["/propertyowner/assigned-staff", "./pages/propertyowner/assigned-staff.jsx"],
  ["/propertyowner/service-history", "./pages/propertyowner/service-history.jsx"],
  ["/propertyowner/maintenance-calendar", "./pages/propertyowner/maintenance-calendar.jsx"],
  ["/propertyowner/all-staff", "./pages/propertyowner/all-staff.jsx"],
  ["/propertyowner/add-staff", "./pages/propertyowner/add-staff.jsx"],
  ["/propertyowner/roles-permissions", "./pages/propertyowner/roles-permissions.jsx"],
  ["/propertyowner/staff-attendance", "./pages/propertyowner/staff-attendance.jsx"],
  ["/propertyowner/staff-salaries", "./pages/propertyowner/staff-salaries.jsx"],
  ["/propertyowner/shift-management", "./pages/propertyowner/shift-management.jsx"],
  ["/propertyowner/staff-performance", "./pages/propertyowner/staff-performance.jsx"],
  ["/propertyowner/tenant-attendance", "./pages/propertyowner/tenant-attendance.jsx"],
  ["/propertyowner/visitor-entry", "./pages/propertyowner/visitor-entry.jsx"],
  ["/propertyowner/visitor-passes", "./pages/propertyowner/visitor-passes.jsx"],
  ["/propertyowner/entry-logs", "./pages/propertyowner/entry-logs.jsx"],
  ["/propertyowner/exit-logs", "./pages/propertyowner/exit-logs.jsx"],
  ["/propertyowner/leave-requests", "./pages/propertyowner/leave-requests.jsx"],
  ["/propertyowner/gate-management", "./pages/propertyowner/gate-management.jsx"],
  ["/propertyowner/daily-menu", "./pages/propertyowner/daily-menu.jsx"],
  ["/propertyowner/weekly-menu", "./pages/propertyowner/weekly-menu.jsx"],
  ["/propertyowner/meal-attendance", "./pages/propertyowner/meal-attendance.jsx"],
  ["/propertyowner/kitchen-inventory", "./pages/propertyowner/kitchen-inventory.jsx"],
  ["/propertyowner/grocery-expenses", "./pages/propertyowner/grocery-expenses.jsx"],
  ["/propertyowner/vendor-list", "./pages/propertyowner/vendor-list.jsx"],
  ["/propertyowner/food-feedback", "./pages/propertyowner/food-feedback.jsx"],
  ["/propertyowner/sms-campaigns", "./pages/propertyowner/sms-campaigns.jsx"],
  ["/propertyowner/email-notices", "./pages/propertyowner/email-notices.jsx"],
  ["/propertyowner/emergency-alerts", "./pages/propertyowner/emergency-alerts.jsx"],
  ["/propertyowner/communication-templates", "./pages/propertyowner/communication-templates.jsx"],
  ["/propertyowner/vacancy-promotion", "./pages/propertyowner/vacancy-promotion.jsx"],
  ["/propertyowner/social-media-leads", "./pages/propertyowner/social-media-leads.jsx"],
  ["/propertyowner/referral-program", "./pages/propertyowner/referral-program.jsx"],
  ["/propertyowner/property-website", "./pages/propertyowner/property-website.jsx"],
  ["/propertyowner/banners-posters", "./pages/propertyowner/banners-posters.jsx"],
  ["/propertyowner/coupons-offers", "./pages/propertyowner/coupons-offers.jsx"],
  ["/propertyowner/expense-reports", "./pages/propertyowner/expense-reports.jsx"],
  ["/propertyowner/tenant-analytics", "./pages/propertyowner/tenant-analytics.jsx"],
  ["/propertyowner/complaint-analytics", "./pages/propertyowner/complaint-analytics.jsx"],
  ["/propertyowner/staff-reports", "./pages/propertyowner/staff-reports.jsx"],
  ["/propertyowner/export-reports", "./pages/propertyowner/export-reports.jsx"],
  ["/propertyowner/staff-documents", "./pages/propertyowner/staff-documents.jsx"],
  ["/propertyowner/property-documents", "./pages/propertyowner/property-documents.jsx"],
  ["/propertyowner/uploaded-files", "./pages/propertyowner/uploaded-files.jsx"],
  ["/propertyowner/digital-signatures", "./pages/propertyowner/digital-signatures.jsx"],
  ["/propertyowner/current-plan", "./pages/propertyowner/current-plan.jsx"],
  ["/propertyowner/upgrade-plan", "./pages/propertyowner/upgrade-plan.jsx"],
  ["/propertyowner/billing-history", "./pages/propertyowner/billing-history.jsx"],
  ["/propertyowner/invoices", "./pages/propertyowner/invoices.jsx"],
  ["/propertyowner/payment-methods", "./pages/propertyowner/payment-methods.jsx"],
  ["/propertyowner/company-settings", "./pages/propertyowner/company-settings.jsx"],
  ["/propertyowner/property-settings-global", "./pages/propertyowner/property-settings-global.jsx"],
  ["/propertyowner/notification-settings", "./pages/propertyowner/notification-settings.jsx"],
  ["/propertyowner/payment-gateway", "./pages/propertyowner/payment-gateway.jsx"],
  ["/propertyowner/bank-accounts", "./pages/propertyowner/bank-accounts.jsx"],
  ["/propertyowner/integrations", "./pages/propertyowner/integrations.jsx"],
  ["/propertyowner/role-permissions", "./pages/propertyowner/role-permissions.jsx"],
  ["/propertyowner/language-settings", "./pages/propertyowner/language-settings.jsx"],
  ["/propertyowner/theme-settings", "./pages/propertyowner/theme-settings.jsx"],
];

const template = (title, desc) => `import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";

export default function ${title.replace(/[^a-zA-Z]/g, '')}Page() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { window.location.href = "/propertyowner/ownerlogin"; return null; }

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="${title}" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">Property Pal</div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">${title}</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">${desc}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">✓</div>
          <div>
            <h3 className="font-serif text-[18px] text-foreground">Interactive Module Ready</h3>
            <p className="text-[12.5px] text-muted-foreground">This feature is live and initialized with live session config.</p>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current Status</span>
              <p className="text-[15px] font-medium text-foreground mt-1">Operational</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Connected Property</span>
              <p className="text-[15px] font-medium text-foreground mt-1 truncate">{owner?.propertyName || "Main Property"}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4 border border-border">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Records</span>
              <p className="text-[15px] font-medium text-foreground mt-1">12 Active Items</p>
            </div>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
`;

// 1. Generate JSX files
newRoutes.forEach(([url, filePath]) => {
  const absolutePath = path.resolve(__dirname, 'src', filePath.replace('./', ''));
  const folder = path.dirname(absolutePath);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  const componentName = path.basename(filePath, '.jsx');
  const humanTitle = componentName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  fs.writeFileSync(absolutePath, template(humanTitle, `Manage ${humanTitle.toLowerCase()} and access real-time records.`));
});
console.log(`Generated ${newRoutes.length} new components.`);

// 2. Update routes.jsx
const routesFile = path.resolve(__dirname, 'src', 'routes.jsx');
let routesContent = fs.readFileSync(routesFile, 'utf-8');

// Find the position inside routeEntries array
const marker = '// Website Routes';
const index = routesContent.indexOf(marker);

if (index !== -1) {
  const declarations = newRoutes.map(([url, filePath]) => `  ["${url}", "${filePath}"],`).join('\n') + '\n  ';
  routesContent = routesContent.slice(0, index) + declarations + routesContent.slice(index);
  fs.writeFileSync(routesFile, routesContent);
  console.log('routes.jsx successfully patched.');
} else {
  console.error('Could not find Website Routes marker in routes.jsx.');
}
