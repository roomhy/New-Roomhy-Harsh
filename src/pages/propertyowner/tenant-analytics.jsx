import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Users, BarChart3, TrendingUp, Download, 
  ArrowUpRight, PieChart, ShieldCheck
} from "lucide-react";

export default function TenantAnalyticsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const demographics = [
    { class: "Working Professionals", count: 42, percentage: "72.4%" },
    { class: "College Students", count: 16, percentage: "27.6%" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Residents Analytics" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Tenant Analytics</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor average duration of stay, resident profile types (students vs professionals), and verification status ratios.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Average Resident Stay</span>
          <h3 className="text-[28px] font-bold text-slate-900 mt-1">9.4 Months</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">KYC Compliance Rate</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">98.5%</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Food / Mess Opt-in Rate</span>
          <h3 className="text-[28px] font-bold text-primary mt-1">88.2%</h3>
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Residents Demographics Breakdown</h3>
        <div className="space-y-4">
          {demographics.map((d, index) => (
            <div key={index} className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">{d.class}</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">{d.count} Active Residents</p>
              </div>
              <span className="font-bold text-primary text-[15px]">{d.percentage}</span>
            </div>
          ))}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
