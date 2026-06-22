import React, { useState, useEffect } from "react";
import { Search, AlertTriangle, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AnalyticsDueRents() {
  const [dueRents, setDueRents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/analytics/due-rents");
      if (res.success) {
        setDueRents(res.dueRents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = dueRents.filter(d => 
    d.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
    d.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Due Rent Aging Report</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Debt aging metrics and delinquent tenant balances</p>
         </div>
         <button onClick={loadData} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Delinquent Ledger</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Invoice No</th>
                     <th className="pb-4">Tenant Name</th>
                     <th className="pb-4 text-center">Due Amount</th>
                     <th className="pb-4 text-center">Due Date</th>
                     <th className="pb-4 text-center">Days Overdue</th>
                     <th className="pb-4 text-center">Status</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">Checking aging ledger...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No outstanding rents due</td></tr>
                  ) : filtered.map((d, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono font-bold text-blue-600">{d.invoiceNumber}</td>
                       <td className="py-3 font-bold text-slate-800">{d.tenantName}</td>
                       <td className="py-3 text-center font-bold text-rose-600">₹{d.dueAmount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center text-slate-400 font-medium">{new Date(d.dueDate).toLocaleDateString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase inline-flex items-center gap-1",
                            d.daysOverdue > 5 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                             <AlertTriangle size={10} />
                             {d.daysOverdue} Days
                          </span>
                       </td>
                       <td className="py-3 text-center">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-100 uppercase">{d.status}</span>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
