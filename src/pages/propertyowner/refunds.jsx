import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Undo, Search, FileText, CheckCircle2, XCircle, 
  Clock, IndianRupee, Eye, Download
} from "lucide-react";

export default function RefundsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [refunds, setRefunds] = useState([
    { id: 1, name: "Rahul Varma", room: "201", deposit: 15000, deductions: 2500, refund: 12500, status: "Completed", date: "15 May 2026" },
    { id: 2, name: "Karan Johar", room: "201", deposit: 15000, deductions: 0, refund: 15000, status: "Completed", date: "10 May 2026" },
    { id: 3, name: "Deepak Chawla", room: "203", deposit: 15000, deductions: 5000, refund: 10000, status: "Pending Approval", date: "28 Apr 2026" }
  ]);

  const handleApproveRefund = (id) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: "Completed" } : r));
  };

  const filteredRefunds = refunds.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.room.includes(search)
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Refund Settlements" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Refund Settlements</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Approve payouts, audit move-out checklists, and clear remaining balances.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search refunds by tenant name or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Refunds Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Security Deposit</th>
                <th className="px-6 py-3.5 font-semibold">Total Deductions</th>
                <th className="px-6 py-3.5 font-semibold">Net Refund Payout</th>
                <th className="px-6 py-3.5 font-semibold">Settlement Date</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRefunds.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{r.name}</td>
                  <td className="px-6 py-4 font-bold text-foreground">Room {r.room}</td>
                  <td className="px-6 py-4 text-muted-foreground">₹{r.deposit.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-rose-600 font-bold">₹{r.deductions.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{r.refund.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      r.status === "Completed" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {r.status === "Pending Approval" && (
                      <button 
                        onClick={() => handleApproveRefund(r.id)}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                      >
                        Approve Payout
                      </button>
                    )}
                    <button onClick={() => alert("Downloading refund receipt...")} className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors">
                      <Download size={14} />
                    </button>
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
