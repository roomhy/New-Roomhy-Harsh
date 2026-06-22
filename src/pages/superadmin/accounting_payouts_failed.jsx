import React, { useState, useEffect } from "react";
import { Search, RotateCcw, AlertTriangle, RefreshCw, RefreshCcw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PayoutsFailed() {
  const [failed, setFailed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadFailed = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/failed");
      if (res.success) {
        setFailed(res.failed || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (log) => {
    setRetryingId(log._id);
    setMessage("");
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/process", {
        method: "POST",
        body: {
          transactionId: log.transaction_id,
          manual: false,
          notes: "Payout retried from failed disbursements page"
        }
      });
      if (res.success) {
        setMessage("Payout processed successfully on retry!");
        loadFailed();
      } else {
        setMessage(res.message || "Failed retry payout");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error executing retry request");
    } finally {
      setRetryingId(null);
    }
  };

  useEffect(() => {
    loadFailed();
  }, []);

  const filtered = failed.filter(f => 
    f.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.error_message?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Failed Payout Warnings</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Disbursement failures, bank API errors and retry dashboard</p>
         </div>
         <button onClick={loadFailed} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      {message && <div className="text-[10px] font-bold text-blue-600 bg-blue-50 p-3 rounded-lg leading-normal uppercase max-w-xl">{message}</div>}

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Failed Queue</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search failures..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Partner Identity</th>
                     <th className="pb-4 text-center">Amount (₹)</th>
                     <th className="pb-4 text-center">Destination Bank Account</th>
                     <th className="pb-4">Error Log</th>
                     <th className="pb-4 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Loading failures...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No failed payouts detected</td></tr>
                  ) : filtered.map((f, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3">
                          <p className="font-bold text-slate-800 leading-tight">{f.owner_name}</p>
                          <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">{f.owner_id}</p>
                       </td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{f.amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <p className="text-[10px] font-mono font-bold text-slate-700 leading-none">{f.bank_name || "N/A"}</p>
                          <p className="text-[8px] font-mono text-slate-400 mt-1">Acct: {f.account_number || "N/A"}</p>
                       </td>
                       <td className="py-3 max-w-[200px]">
                          <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded inline-flex items-center gap-1 leading-snug">
                             <AlertTriangle size={10} className="shrink-0" />
                             {f.error_message || "Transfer transaction failed in sandboxed gateway retry"}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <button onClick={() => handleRetry(f)} disabled={retryingId === f._id} className="bg-slate-850 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all inline-flex items-center gap-1">
                             <RefreshCcw size={10} className={cn(retryingId === f._id && "animate-spin")} />
                             Retry Transfer
                          </button>
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
