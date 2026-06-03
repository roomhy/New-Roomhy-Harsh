import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  TrendingUp, BarChart3, IndianRupee, Download, 
  ArrowUpRight, PieChart, ShieldCheck
} from "lucide-react";

export default function ExpenseReportsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const items = [
    { source: "Staff Salaries & Wages", amount: 46800, percentage: "35%" },
    { source: "Kitchen Groceries & Vegetables", amount: 37500, percentage: "28%" },
    { source: "Utilities (Electricity, WiFi, Water)", amount: 28000, percentage: "21%" },
    { source: "Asset Repair & Maintenance", amount: 22000, percentage: "16%" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Expense Reports Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Expense Reports</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Log and audit kitchen raw materials, gas cylinders, salaries, and repair expenses.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Operations Costs</span>
          <h3 className="text-[28px] font-bold text-slate-900 mt-1">₹1,34,300</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Gross Operating Cost / Bed</span>
          <h3 className="text-[28px] font-bold text-rose-600 mt-1">₹2,315</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Expense vs Revenue Ratio</span>
          <h3 className="text-[28px] font-bold text-primary mt-1">22.7%</h3>
        </div>
      </div>

      {/* Sources */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Expense Channels Distribution</h3>
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
