import React, { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AnalyticsOwnerRevenue() {
  const [ownerRevenue, setOwnerRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/analytics/owner-revenue");
      if (res.success) {
        setOwnerRevenue(res.ownerRevenue || []);
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

  const filtered = ownerRevenue.filter(o => 
    o.owner?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Partner Earning Statements</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregated collections and commission cuts per property partner</p>
         </div>
         <button onClick={loadData} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Partner statements</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owner..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Partner Name</th>
                     <th className="pb-4 text-center">Gross Collection (₹)</th>
                     <th className="pb-4 text-center">Roomhy Commission (₹)</th>
                     <th className="pb-4 text-center">Net Settlement Credit (₹)</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-bold">Loading statements...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-bold">No partner collections found</td></tr>
                  ) : filtered.map((o, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-bold text-slate-800">{o.owner}</td>
                       <td className="py-3 text-center font-bold text-slate-700">₹{o.gross?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-rose-500">₹{o.commission?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-emerald-600">₹{o.net?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
