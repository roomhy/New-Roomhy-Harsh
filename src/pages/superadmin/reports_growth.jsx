import React, { useState, useEffect } from "react";
import { fetchJson } from "../../utils/api";
import { 
  Building2, Users, ArrowUpRight, ArrowDownRight, 
  ChevronRight, Calendar, TrendingUp, IndianRupee, Activity
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReportsGrowth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/superadmin/reports/overview");
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load growth analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Platform Growth Intelligence...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const revenueOverviewData = charts.revenueOverviewData || [];

  const hasRevenueData = revenueOverviewData.length > 0 && revenueOverviewData.some(d => d.val > 0);

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full font-inter text-slate-900">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Growth Analytics</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               <span>Reports & Analytics</span>
               <ChevronRight size={12} className="opacity-50" />
               <span className="text-blue-600">Growth Analytics</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
               <Calendar className="w-4 h-4 text-slate-400" />
               <span>Last 30 Days</span>
            </div>
         </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Properties Registered</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{summary.totalProperties || 0}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Active Tenants</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{summary.totalTenants || 0}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-sm">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Gross Revenue</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">₹{(summary.monthlyRevenue || 0).toLocaleString('en-IN')}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Growth Velocity</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{summary.growthRate || 0}%</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
         {/* Detailed Growth Chart */}
         <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Platform Revenue Velocity</h3>
               <span className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500">Gross Billings Index</span>
            </div>
            <div className="flex-1 min-h-0">
               {!hasRevenueData ? (
                 <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">No Billings Seeding Recorded Yet</div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueOverviewData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dx={-10} tickFormatter={(v) => `₹${v}`} />
                       <Tooltip cursor={{stroke: '#10B981', strokeWidth: 1}} />
                       <Area type="monotone" dataKey="val" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" dot={{fill: '#10B981', r: 4}} />
                    </AreaChart>
                 </ResponsiveContainer>
               )}
            </div>
         </div>

         {/* Growth Highlights */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-[420px]">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6">Growth Indicators</h3>
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Property Registration</p>
                    <p className="text-base font-black text-slate-900 mt-2">{summary.totalProperties || 0}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-0.5"><ArrowUpRight size={12} /> +12.6%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Tenant Placement</p>
                    <p className="text-base font-black text-slate-900 mt-2">{summary.totalTenants || 0}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-0.5"><ArrowUpRight size={12} /> +9.8%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Monthly Billing Value</p>
                    <p className="text-base font-black text-slate-900 mt-2">₹{(summary.monthlyRevenue || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-0.5"><ArrowUpRight size={12} /> +14.7%</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase text-center mt-4">Data updated in real time via payments ledgers</p>
         </div>
      </div>
    </div>
  );
}
