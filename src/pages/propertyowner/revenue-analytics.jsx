import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  TrendingUp, BarChart3, IndianRupee, Download, 
  ArrowUpRight, PieChart, ShieldCheck
} from "lucide-react";

export default function RevenueReportsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const items = [
    { source: "Room Rent Collection", amount: 485000, percentage: "82%" },
    { source: "Food / Mess Charges", amount: 65000, percentage: "11%" },
    { source: "Maintenance & Addons", amount: 41000, percentage: "7%" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Revenue Analytics" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Revenue Reports</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor collections growth, monthly sales statistics, and category distributions.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Collection</span>
          <h3 className="text-[28px] font-bold text-slate-900 mt-1">₹5,91,000</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Avg. Rent per Occupied Bed</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">₹10,189</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Collection Efficiency</span>
          <h3 className="text-[28px] font-bold text-primary mt-1">96.5%</h3>
        </div>
      </div>

      {/* Sources */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Revenue Streams Breakdown</h3>
        <div className="space-y-4">
          {items.map((i, index) => (
            <div key={index} className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">{i.source}</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">₹{i.amount.toLocaleString("en-IN")}</p>
              </div>
              <span className="font-bold text-primary text-[15px]">{i.percentage}</span>
            </div>
          ))}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
