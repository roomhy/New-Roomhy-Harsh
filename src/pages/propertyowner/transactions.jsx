import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  ArrowUpRight, ArrowDownRight, Search, Download, 
  Filter, FileText, Calendar
} from "lucide-react";

export default function TransactionsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const txns = [
    { id: "TXN-1002", desc: "Room 101 rent collection", category: "Rent", type: "income", amount: 17300, date: "18 May 2026", method: "UPI" },
    { id: "TXN-1003", desc: "Housekeeping plumber plumbing fix", category: "Maintenance", type: "expense", amount: 2500, date: "15 May 2026", method: "Cash" },
    { id: "TXN-1004", desc: "Mess kitchen groceries purchase", category: "Food & Kitchen", type: "expense", amount: 4500, date: "15 May 2026", method: "UPI" },
    { id: "TXN-1005", desc: "Utility electricity surcharge Room 102", category: "Utilities", type: "income", amount: 1200, date: "14 May 2026", method: "Razorpay" }
  ];

  const filteredTxns = txns.filter(t => {
    const matchesSearch = t.desc.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search);
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Master Transaction Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Transactions</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Master auditing ledger listing both cash inflows and operational expense outflows.</p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions by reference ID or description..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "income", "expense"]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`h-10 px-4 rounded-xl text-xs font-bold capitalize transition-colors border ${
                filterType === type 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions list table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Txn Reference</th>
                <th className="px-6 py-3.5 font-semibold">Description</th>
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Channel</th>
                <th className="px-6 py-3.5 font-semibold">Transaction Date</th>
                <th className="px-6 py-3.5 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTxns.map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-foreground">{t.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {t.type === "income" ? (
                        <span className="size-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ArrowUpRight size={12} />
                        </span>
                      ) : (
                        <span className="size-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                          <ArrowDownRight size={12} />
                        </span>
                      )}
                      <span className="font-semibold text-foreground">{t.desc}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{t.category}</td>
                  <td className="px-6 py-4 text-muted-foreground">{t.method}</td>
                  <td className="px-6 py-4 text-muted-foreground">{t.date}</td>
                  <td className={`px-6 py-4 font-bold ${
                    t.type === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
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
