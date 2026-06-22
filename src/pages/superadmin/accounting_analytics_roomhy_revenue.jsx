import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw, TrendingUp } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AnalyticsRoomhyRevenue() {
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/analytics/roomhy-revenue");
      if (res.success) {
        setRevenue(res.roomhyRevenue || []);
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

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Roomhy Monthly Yields</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Net Platform commissions and service fees collected month-over-month</p>
         </div>
         <button onClick={loadData} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Yield curve</h3>
            <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase">
               <TrendingUp size={12} />
               Optimal growth
            </div>
         </div>

         {loading ? (
           <div className="py-24 text-center text-slate-400 font-bold">Rendering yields chart...</div>
         ) : (
           <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenue}>
                    <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700}} />
                    <Area type="monotone" dataKey="commission" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} name="Platform Yield (₹)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
         )}
      </div>
    </div>
  );
}
