import React from "react";
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
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Collection Reports</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor billing targets vs collected receipts by month cycles.</p>
        </div>
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
    </PropertyOwnerLayout>
  );
}
