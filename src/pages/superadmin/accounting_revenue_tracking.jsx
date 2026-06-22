import React, { useState, useEffect } from "react";
import { DollarSign, Shield, Receipt, RefreshCw, BarChart3 } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function RevenueTracking() {
  const [metrics, setMetrics] = useState({ totalCollected: 0, totalCommissions: 0, totalOwnerEarnings: 0 });
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/revenue/tracking");
      if (res.success) {
        setMetrics(res.metrics || { totalCollected: 0, totalCommissions: 0, totalOwnerEarnings: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Global Revenue Tracker</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Cash Inflow Calculations & Platform Commission Yields</p>
         </div>
         <button onClick={loadMetrics} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold">Loading revenue data...</div>
      ) : (
        <div className="space-y-6">
           {/* Card Rows */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                    <DollarSign size={24} />
                 </div>
                 <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Gross Collections</p>
                    <h4 className="text-2xl font-bold text-slate-800">₹{metrics.totalCollected?.toLocaleString('en-IN')}</h4>
                 </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                    <BarChart3 size={24} />
                 </div>
                 <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Roomhy Platform Share</p>
                    <h4 className="text-2xl font-bold text-slate-800">₹{metrics.totalCommissions?.toLocaleString('en-IN')}</h4>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md flex items-center gap-4">
                 <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                    <Receipt size={24} />
                 </div>
                 <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Partners Settlement Share</p>
                    <h4 className="text-2xl font-bold text-slate-800">₹{metrics.totalOwnerEarnings?.toLocaleString('en-IN')}</h4>
                 </div>
              </div>
           </div>

           {/* Analytical visual card */}
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-6">Revenue Split Distribution</h3>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase">
                       <span>Partner Earnings</span>
                       <span>{metrics.totalCollected > 0 ? Math.round((metrics.totalOwnerEarnings / metrics.totalCollected) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${metrics.totalCollected > 0 ? (metrics.totalOwnerEarnings / metrics.totalCollected) * 100 : 0}%` }} />
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase">
                       <span>Roomhy Commission Share</span>
                       <span>{metrics.totalCollected > 0 ? Math.round((metrics.totalCommissions / metrics.totalCollected) * 100) : 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${metrics.totalCollected > 0 ? (metrics.totalCommissions / metrics.totalCollected) * 100 : 0}%` }} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
