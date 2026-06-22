import React, { useState, useEffect } from "react";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function TenantTracking() {
  const [trackingList, setTrackingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadTracking = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/tenant/tracking");
      if (res.success) {
        setTrackingList(res.tracking || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracking();
  }, []);

  const filtered = trackingList.filter(t => 
    t.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.razorpay_payment_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Real-time Payment Tracking</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Settlement Queue & Payment Initiations</p>
         </div>
         <button onClick={loadTracking} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Active payment sessions</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search session..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Razorpay Payment ID</th>
                     <th className="pb-4">Tenant Name</th>
                     <th className="pb-4 text-center">Amount (₹)</th>
                     <th className="pb-4 text-center">Lifecycle Status</th>
                     <th className="pb-4 text-center">Last Modified</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Loading tracked sessions...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No active sessions tracked</td></tr>
                  ) : filtered.map((t, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono font-bold text-slate-600">{t.razorpay_payment_id || "N/A"}</td>
                       <td className="py-3 font-bold text-slate-800">{t.tenant_name}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{t.booking_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-100 uppercase inline-flex items-center gap-1">
                             <Loader2 size={10} className="animate-spin" />
                             {t.status}
                          </span>
                       </td>
                       <td className="py-3 text-center text-slate-500 font-medium">{new Date(t.updated_at).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
