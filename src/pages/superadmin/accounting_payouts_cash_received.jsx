import React, { useState, useEffect } from "react";
import { Search, Wallet, RefreshCw, CheckCircle2 } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PayoutsCashReceived() {
  const [cashList, setCashList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCash = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/cash-received");
      if (res.success) {
        setCashList(res.cashReceived || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCash();
  }, []);

  const filtered = cashList.filter(c => 
    c.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
    c.propertyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Offline Cash Collections</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Reconciliation of Cash Rents Handed Over Directly by Tenants</p>
         </div>
         <button onClick={loadCash} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Cash ledger logs</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Tenant Name</th>
                     <th className="pb-4">Property</th>
                     <th className="pb-4 text-center">Collection Month</th>
                     <th className="pb-4 text-center">Cash Collected</th>
                     <th className="pb-4 text-center">Date Received</th>
                     <th className="pb-4 text-center">Status</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">Loading cash logs...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No cash payments logged in ledger</td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-bold text-slate-800">{c.tenantName}</td>
                       <td className="py-3 font-medium text-slate-600">{c.propertyName}</td>
                       <td className="py-3 text-center text-slate-500 font-semibold">{c.collectionMonth}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{c.paidAmount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center text-slate-500 font-medium">{new Date(c.paymentDate).toLocaleDateString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-100 uppercase inline-flex items-center gap-1">
                             <CheckCircle2 size={10} />
                             {c.paymentStatus}
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
