import os

pages = [
    "property_flagged.jsx", "property_categories.jsx", "property_amenities.jsx",
    "property_pricing.jsx", "property_featured.jsx", "property_moderation.jsx",
    "property_analytics.jsx", "property_settings.jsx",
    "accounting_transactions.jsx", "accounting_commission.jsx", "accounting_subscriptions.jsx",
    "accounting_payouts.jsx", "accounting_invoices.jsx", "accounting_taxes.jsx",
    "accounting_reports.jsx", "accounting_settings.jsx",
    "reports_listings.jsx", "reports_users.jsx", "reports_leads.jsx",
    "reports_revenue.jsx", "reports_commission.jsx", "reports_subscriptions.jsx",
    "reports_refunds.jsx", "reports_performance.jsx", "reports_locations.jsx",
    "reports_exports.jsx"
]

template = """import React from "react";
import { useHeadAssets } from "../../utils/useHeadAssets.js";
import { useTailwindProcessor } from "../../utils/useTailwindProcessor.js";
import { LayoutDashboard } from "lucide-react";

export default function [component_name]() {{
  const title = "Roomhy - [page_title]";
  const metas = [{{ charset: "UTF-8" }}, {{ name: "viewport", content: "width=device-width, initial-scale=1.0" }}];
  const links = [
    {{ rel: "preconnect", href: "https://fonts.googleapis.com" }},
    {{ rel: "preconnect", href: "https://fonts.gstatic", crossorigin: true }},
    {{ href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap", rel: "stylesheet" }}
  ];
  const scripts = [{{ src: "https://cdn.tailwindcss.com" }}];

  useHeadAssets({{ title, metas, links, scripts, htmlAttrs: {{ lang: "en" }}, bodyAttrs: {{ class: "bg-slate-50 text-slate-800" }} }});
  useTailwindProcessor();

  return (
    <main className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">[page_title]</h3>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          This module is currently being synchronized with the master dashboard template.
          Access level and data integration are in progress.
        </p>
      </div>
    </main>
  );
}}
"""

output_dir = "e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin"

for page in pages:
    component_name = page.replace(".jsx", "").replace("_", " ").title().replace(" ", "") + "Page"
    page_title = page.replace(".jsx", "").replace("_", " ").title()
    content = template.replace("[component_name]", component_name).replace("[page_title]", page_title)
    with open(os.path.join(output_dir, page), "w") as f:
        f.write(content)
    print(f"Created {page}")
