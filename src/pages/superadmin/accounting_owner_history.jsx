import React, { useState, useEffect } from "react";
import { Search, RotateCcw, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function OwnerHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/owner/history");
      if (res.success) {
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = history.filter(h => 
    h.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    h.payout_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Owner Payout History</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Immutable Log of Bank Transfer & Digital Wallet Payouts</p>
         </div>
         <button onClick={loadHistory} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Payout logs</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payout..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Payout ID</th>
                     <th className="pb-4">Owner Name</th>
                     <th className="pb-4 text-center">Date</th>
                     <th className="pb-4 text-center">Net Amount</th>
                     <th className="pb-4 text-center">Transfer Mode</th>
                     <th className="pb-4 text-center">Status</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">Loading logs...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No payouts logged</td></tr>
                  ) : filtered.map((h, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono text-[10px] font-bold text-blue-600">{h.payout_id || "N/A"}</td>
                       <td className="py-3 font-bold text-slate-800">{h.owner_name}</td>
                       <td className="py-3 text-center text-slate-500 font-medium">{new Date(h.created_at).toLocaleDateString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{h.amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center text-slate-600 font-semibold uppercase">{h.mode}</td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase inline-flex items-center gap-1",
                            h.status.includes("failed") ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                             {h.status.includes("failed") ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                             {h.status}
                          </span>
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
