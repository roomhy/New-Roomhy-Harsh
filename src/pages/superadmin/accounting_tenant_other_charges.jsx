import React, { useState, useEffect } from "react";
import { Search, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function TenantOtherCharges() {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCharges = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/tenant/other-charges");
      if (res.success) {
        setCharges(res.charges || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
  }, []);

  const filtered = charges.filter(c => 
    c.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
    c.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Other Charges Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Penalties, Late Fines, and Utility Bill Collections</p>
         </div>
         <button onClick={loadCharges} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Charges Records</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Related Invoice</th>
                     <th className="pb-4">Tenant</th>
                     <th className="pb-4 text-center">Charge Class</th>
                     <th className="pb-4 text-center">Amount</th>
                     <th className="pb-4 text-center">Status</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Loading charges...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No Charges Found</td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono font-bold text-blue-600">{c.invoiceNumber}</td>
                       <td className="py-3 font-bold text-slate-800">{c.tenantName}</td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase inline-flex items-center gap-1",
                            c.type.includes("Electricity") ? "bg-yellow-50 text-yellow-600 border-yellow-100" : "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {c.type.includes("Electricity") ? <Zap size={10} /> : <AlertTriangle size={10} />}
                            {c.type}
                          </span>
                       </td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{c.amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase",
                            c.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>{c.status}</span>
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
