import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  ArrowUpRight, ArrowDownRight, Search, Download, 
  Filter, FileText, Calendar
} from "lucide-react";

export default function CashFlowPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const flows = [
    { month: "May 2026", inflow: 85000, outflow: 35000, netFlow: 50000, closing: 145000 },
    { month: "Apr 2026", inflow: 78000, outflow: 28000, netFlow: 50000, closing: 95000 },
    { month: "Mar 2026", inflow: 82000, outflow: 37000, netFlow: 45000, closing: 45000 }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Liquidity Analytics" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Cash Flow Analysis</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor property cash liquidity, inflow schedules, and monthly closing balances.</p>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Accounting Period</th>
                <th className="px-6 py-3.5 font-semibold">Gross Cash Inflow</th>
                <th className="px-6 py-3.5 font-semibold">Gross Cash Outflow</th>
                <th className="px-6 py-3.5 font-semibold">Net Cash Flow</th>
                <th className="px-6 py-3.5 font-semibold font-bold text-slate-800">Ending Balance Cash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {flows.map((f, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{f.month}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">₹{f.inflow.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-rose-600 font-medium">₹{f.outflow.toLocaleString("en-IN")}</td>
                  <td className={`px-6 py-4 font-bold ${f.netFlow >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ₹{f.netFlow.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{f.closing.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
