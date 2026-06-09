import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  TrendingUp, BarChart3, IndianRupee, Download, 
  ArrowUpRight, PieChart, ShieldCheck
} from "lucide-react";

export default function CollectionReport() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [tab, setTab] = useState("Summary");
  const reports = [
    { month: "May 2026", billed: 580000, collected: 560000, rate: "96.5%" },
    { month: "April 2026", billed: 580000, collected: 575000, rate: "99.1%" },
    { month: "March 2026", billed: 550000, collected: 548000, rate: "99.6%" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Collections Audits" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Accounting & Collections</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor billing targets vs collected receipts by month cycles.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center hover:border-primary/20 transition-all">
          <div className="font-serif text-[28px] font-bold text-emerald-600 leading-none">98.4%</div>
          <div className="text-[11.5px] text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">Avg Collection Rate</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center hover:border-primary/20 transition-all">
          <div className="font-serif text-[28px] font-bold text-foreground leading-none">₹1.7M</div>
          <div className="text-[11.5px] text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">Total Billed (YTD)</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center hover:border-primary/20 transition-all">
          <div className="font-serif text-[28px] font-bold text-emerald-600 leading-none">₹1.68M</div>
          <div className="text-[11.5px] text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">Total Collected (YTD)</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft text-center hover:border-primary/20 transition-all">
          <div className="font-serif text-[28px] font-bold text-rose-600 leading-none">₹20K</div>
          <div className="text-[11.5px] text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">Total Dues (YTD)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5 border-b border-border">
        {["Summary", "Breakup", "Property-wise"].map((k) => (
          <button 
            key={k} 
            onClick={() => setTab(k)} 
            className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px transition-colors ${tab === k ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Grid Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Month Cycle</th>
                <th className="px-6 py-3.5 font-semibold">Total Rent Billed</th>
                <th className="px-6 py-3.5 font-semibold">Total Rent Collected</th>
                <th className="px-6 py-3.5 font-semibold">Dues Remaining</th>
                <th className="px-6 py-3.5 font-semibold text-right">Collection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r, index) => (
                <tr key={index} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{r.month}</td>
                  <td className="px-6 py-4 text-muted-foreground">₹{r.billed.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{r.collected.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-rose-600 font-bold">₹{(r.billed - r.collected).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-3 pb-8 mt-4">
        {reports.map((r, index) => (
          <div key={index} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-[16px] font-black text-slate-900">{r.month}</h3>
              <span className="inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100">
                {r.rate} Collected
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Billed</p>
                <p className="text-[14px] font-black text-slate-800">₹{r.billed.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Collected</p>
                <p className="text-[14px] font-black text-emerald-700">₹{r.collected.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="border-t border-slate-50 pt-3 flex justify-between items-center">
              <p className="text-[11px] font-bold text-slate-500">Dues Remaining:</p>
              <p className="text-[13px] font-black text-rose-600">₹{(r.billed - r.collected).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
