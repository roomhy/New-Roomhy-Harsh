import React, { useState, useEffect } from "react";
import { Search, Globe, RefreshCw, CheckCircle2 } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PayoutsBankTransfer() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/bank-transfer");
      if (res.success) {
        setTransfers(res.tracking || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const filtered = transfers.filter(t => 
    t.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.payout_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bank Payout Reconciliation</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Settled NEFT/RTGS transaction trackers and gateway references</p>
         </div>
         <button onClick={loadTransfers} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Bank settlements ledger</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tracking..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">UTR/Gateway Ref</th>
                     <th className="pb-4">Partner Profile</th>
                     <th className="pb-4 text-center">Date Settled</th>
                     <th className="pb-4 text-center">Net Transferred</th>
                     <th className="pb-4 text-center">Target Account</th>
                     <th className="pb-4 text-center">Status</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">Loading bank tracking...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No bank transfers completed</td></tr>
                  ) : filtered.map((t, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono text-[10px] font-bold text-slate-600">{t.payout_id}</td>
                       <td className="py-3 font-bold text-slate-800">{t.owner_name}</td>
                       <td className="py-3 text-center text-slate-500 font-medium">{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-emerald-600">₹{t.amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <p className="text-[10px] font-mono font-bold text-slate-700 leading-none">{t.bank_name}</p>
                          <p className="text-[8px] font-mono text-slate-400 mt-1">Acct: •••• {String(t.account_number).slice(-4)}</p>
                       </td>
                       <td className="py-3 text-center">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-100 uppercase inline-flex items-center gap-1">
                             <CheckCircle2 size={10} />
                             SETTLED
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
