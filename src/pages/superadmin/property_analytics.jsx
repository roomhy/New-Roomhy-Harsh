import React from "react";
import { 
  Eye, MousePointerClick, MessageSquare, TrendingUp,
  Search, Filter, RefreshCw, ArrowUpRight, 
  ArrowDownRight, Layers, Globe, Activity,
  ChevronRight, Calendar, BarChart3
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const traffic = Array.from({ length: 7 }, (_, i) => ({ day: `${20 + i} May`, views: 14000 + i * 1500, enquiries: 600 + i * 80 }));
const byType = [
  { name: "PG", value: 49, color: "#2563eb" },
  { name: "Apartment", value: 34, color: "#10b981" },
  { name: "Villa", value: 10, color: "#6366f1" },
  { name: "Other", value: 7, color: "#f59e0b" },
];
const cityViews = [
  { city: "Bangalore", views: 38540 },
  { city: "Pune", views: 22150 },
  { city: "Hyderabad", views: 18420 },
  { city: "Chennai", views: 14820 },
  { city: "Delhi", views: 13560 },
  { city: "Mumbai", views: 9840 },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Intelligence Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Engagement Pulse & Market Intelligence</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
               <Calendar className="w-3.5 h-3.5" /> Past 30 Days
            </button>
            <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
               <RefreshCw className="w-3.5 h-3.5" /> Re-Sync
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Global Views" value="128.5K" trend="+12.4% Delta" up icon={Eye} color="blue" />
        <StatCardHorizontal label="Yield Clicks" value="42.3K" trend="+8.6% Growth" up icon={MousePointerClick} color="emerald" />
        <StatCardHorizontal label="Active Enquiries" value="4.8K" trend="+9.7% Pulse" up icon={MessageSquare} color="indigo" />
        <StatCardHorizontal label="Conversion" value="3.76%" trend="+0.4% Optim." up icon={TrendingUp} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Traffic Velocity</h3>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5 mr-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Views</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Enquiries</span>
                 </div>
              </div>
           </div>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={traffic}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700 }}
                    />
                    <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="enquiries" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Type Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
           <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-8">Asset Segments</h3>
           <div className="h-44 relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={byType} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={8} stroke="none">
                       {byType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-xl font-bold text-slate-800 leading-none">100%</p>
                 <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">Coverage</p>
              </div>
           </div>
           <div className="mt-auto space-y-2.5">
              {byType.map((s) => (
                <div key={s.name} className="flex items-center justify-between group">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition-colors">{s.name}</span>
                   </div>
                   <span className="text-[9px] font-bold text-slate-800">{s.value}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* City Performance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Regional Yield</h3>
           <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100">
              <BarChart3 className="w-3.5 h-3.5" />
           </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityViews}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="city" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `${v / 1000}K`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700 }}
              />
              <Bar dataKey="views" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100" 
  };
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105", bgColors[color])}>
         <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">{label}</p>
         <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</p>
         <div className={cn(
           "flex items-center gap-1 text-[7px] font-bold uppercase",
           up ? "text-emerald-600" : "text-rose-600"
         )}>
            {up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {trend}
         </div>
      </div>
    </div>
  );
}
