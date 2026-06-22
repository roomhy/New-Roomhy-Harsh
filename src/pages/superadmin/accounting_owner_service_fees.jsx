import React, { useState, useEffect } from "react";
import { Search, Percent, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function OwnerServiceFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/owner/service-fees");
      if (res.success) {
        setFees(res.serviceFees || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const filtered = fees.filter(f => 
    f.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.property_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Service Fees & Platform Commission</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform charge metrics and flat-rate commissions collected from properties</p>
         </div>
         <button onClick={loadFees} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Service fee ledger</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owner..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Owner Name</th>
                     <th className="pb-4">Property</th>
                     <th className="pb-4 text-center">Gross (₹)</th>
                     <th className="pb-4 text-center">Commission (%)</th>
                     <th className="pb-4 text-center">Platform Fee (₹)</th>
                     <th className="pb-4 text-center">Settlement Date</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">Loading fee ledger...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No commission transactions registered</td></tr>
                  ) : filtered.map((f, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-bold text-slate-800">{f.owner_name}</td>
                       <td className="py-3 font-medium text-slate-600">{f.property_name}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{f.gross_booking?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-semibold text-blue-600 inline-flex items-center gap-0.5 justify-center w-full">
                          <Percent size={10} />
                          {f.commission_percentage}%
                       </td>
                       <td className="py-3 text-center font-bold text-rose-600">₹{f.roomhy_fee?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center text-slate-500 font-medium">{new Date(f.date).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
