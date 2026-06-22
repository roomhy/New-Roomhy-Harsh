import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AnalyticsCashflow() {
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/analytics/cashflow");
      if (res.success) {
        setCashflow(res.cashflow || []);
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Cashflow Dashboard</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time analysis of operating inflows (payments) vs operating outflows (refunds + payouts)</p>
         </div>
         <button onClick={loadData} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Operating liquidity trends</h3>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /><span className="text-[8px] font-bold text-slate-400 uppercase">Inflow</span></div>
               <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full" /><span className="text-[8px] font-bold text-slate-400 uppercase">Outflow</span></div>
            </div>
         </div>

         {loading ? (
           <div className="py-24 text-center text-slate-400 font-bold">Rendering liquidity trends...</div>
         ) : (
           <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={cashflow}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700}} />
                    <Area type="monotone" dataKey="inflow" stroke="#3b82f6" fill="none" strokeWidth={3} name="Total Inflow (₹)" />
                    <Area type="monotone" dataKey="outflow" stroke="#f43f5e" fill="none" strokeWidth={3} name="Total Outflow (₹)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
         )}
      </div>
    </div>
  );
}
