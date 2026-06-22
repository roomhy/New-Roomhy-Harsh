import React, { useState, useEffect } from "react";
import { Search, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function RefundsHistory() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/refunds/history");
      if (res.success) {
        setRefunds(res.refunds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const filtered = refunds.filter(r => 
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.booking_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Refund History Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit log of all refund approvals, rejections and processed accounts</p>
         </div>
         <button onClick={loadRefunds} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Refund records</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Booking Ref</th>
                     <th className="pb-4">Recipient Name</th>
                     <th className="pb-4 text-center">Amount Refunded</th>
                     <th className="pb-4 text-center">Reference ID</th>
                     <th className="pb-4 text-center">Audit Status</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Loading records...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No refund requests processed yet</td></tr>
                  ) : filtered.map((r, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono font-bold text-blue-600">{r.booking_id}</td>
                       <td className="py-3 font-bold text-slate-800">{r.user_name}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{r.refund_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-mono text-[10px] text-slate-400">{r.refund_transaction_id || "n/a"}</td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase inline-flex items-center gap-1",
                            r.refund_status === 'processed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            r.refund_status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                             {r.refund_status === 'processed' ? <CheckCircle2 size={10} /> :
                              r.refund_status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
                             {r.refund_status}
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
