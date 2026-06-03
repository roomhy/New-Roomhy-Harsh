import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  History, Search, Download, CheckCircle2, 
  IndianRupee, CreditCard
} from "lucide-react";

export default function BillingHistoryPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const list = [
    { id: "SUB-8012", plan: "Gold Monthly Plan", amount: 4999, date: "15 May 2026", status: "Paid" },
    { id: "SUB-7011", plan: "Gold Monthly Plan", amount: 4999, date: "15 April 2026", status: "Paid" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Renewal Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Billing History</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Review your past recurring software renewals, upgrades history, and print receipts.</p>
        </div>
      </div>

      {/* Roster list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Transaction ID</th>
                <th className="px-6 py-3.5 font-semibold">Billing Plan</th>
                <th className="px-6 py-3.5 font-semibold">Renewal Date</th>
                <th className="px-6 py-3.5 font-semibold">Total Paid</th>
                <th className="px-6 py-3.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((l) => (
                <tr key={l.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-foreground">{l.id}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{l.plan}</td>
                  <td className="px-6 py-4 text-muted-foreground">{l.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">₹{l.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
