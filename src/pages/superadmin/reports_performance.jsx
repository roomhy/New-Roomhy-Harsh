import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Send, FileText, Receipt, LayoutGrid,
  TrendingUp, Calendar, Timer, Award, BarChart3
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const taskData = Array.from({ length: 7 }, (_, i) => ({
  name: `${20 + i} May`,
  resolved: 45 + i * 5,
  pending: 12 - i,
}));

const staffPerf = [
  { name: "Rahul Sharma", role: "Ops Lead", score: "98%", tasks: 145, resolved: 142, status: "Elite", color: "blue" },
  { name: "Priya Verma", role: "Support", score: "95%", tasks: 120, resolved: 114, status: "Excellent", color: "indigo" },
  { name: "Amit Kumar", role: "Verification", score: "92%", tasks: 98, resolved: 90, status: "On Track", color: "emerald" },
  { name: "Neha Singh", role: "Ops Agent", score: "88%", tasks: 110, resolved: 97, status: "Improving", color: "amber" },
];

export default function ReportsPerformance() {
  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Operational Intelligence Hub</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Reports</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Staff Performance Analytics</span>
         </div>
      </div>

      <p className="text-sm font-bold text-slate-400">Deep dive into staff efficiency, resolution velocity and operational platform contributions.</p>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Resolution Velocity" value="94.2%" trend="+ 4.6% Efficiency" up icon={Zap} color="blue" />
        <StatCardLarge label="Avg. Resolution Time" value="1.8 hrs" trend="- 12m Response" up icon={Timer} color="indigo" />
        <StatCardLarge label="Top Performer" value="Rahul S." trend="98% Efficiency Score" up icon={Award} color="green" />
        <StatCardLarge label="Active Tickets" value="48" trend="Platform Wide" up icon={Activity} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Throughput Chart */}
         <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Resolution Throughput</h3>
               <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                     Resolved
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                     Pending
                  </div>
               </div>
            </div>
            <div className="flex-1 min-h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={taskData}>
                     <defs>
                        <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-15} />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} />
                     <Area type="monotone" dataKey="resolved" stroke="#3B82F6" strokeWidth={5} fillOpacity={1} fill="url(#colorRes)" />
                     <Area type="monotone" dataKey="pending" stroke="#E2E8F0" strokeWidth={5} fill="transparent" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Efficiency Scorecard */}
         <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-10">Leaderboard</h3>
            <div className="space-y-8 flex-1">
               {staffPerf.map((s, i) => (
                 <div key={i} className="flex items-center gap-4 group cursor-default">
                    <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform group-hover:scale-110",
                       s.color === "blue" ? "bg-blue-600 shadow-blue-100" :
                       s.color === "indigo" ? "bg-indigo-600 shadow-indigo-100" :
                       s.color === "emerald" ? "bg-emerald-600 shadow-emerald-100" : "bg-amber-600 shadow-amber-100"
                    )}>
                       {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-800">{s.name}</p>
                          <p className="text-xs font-bold text-blue-600">{s.score}</p>
                       </div>
                       <div className="mt-2 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                          <div 
                             className={cn("h-full rounded-full transition-all duration-1000", 
                             s.color === "blue" ? "bg-blue-600" : "bg-indigo-600")} 
                             style={{width: s.score}} 
                          />
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            <button className="mt-10 w-full py-4 rounded-2xl bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all">
               View Full Staff Metrics
            </button>
         </div>
      </div>

      {/* Staff Activity Ledger */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Staff Activity Ledger</h3>
            <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all shadow-sm">
               <Download className="w-4 h-4" /> Export Ledger
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-6">Staff Member</th>
                     <th className="pb-6">Operational Role</th>
                     <th className="pb-6 text-center">Total Tasks</th>
                     <th className="pb-6 text-center">Resolved</th>
                     <th className="pb-6 text-center">Efficiency Score</th>
                     <th className="pb-6 text-center">Audit Status</th>
                     <th className="pb-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {staffPerf.map((s, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-6">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md",
                                s.color === "blue" ? "bg-blue-600" :
                                s.color === "indigo" ? "bg-indigo-600" : "bg-emerald-600"
                             )}>
                                {s.name.split(' ').map(n => n[0]).join('')}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-800">{s.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: STF-202{i+1}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-6">
                          <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 uppercase group-hover:bg-white group-hover:shadow-sm transition-all">
                             {s.role}
                          </span>
                       </td>
                       <td className="py-6 text-center font-bold text-slate-800">{s.tasks}</td>
                       <td className="py-6 text-center font-bold text-emerald-600">{s.resolved}</td>
                       <td className="py-6 text-center">
                          <p className="text-base font-bold text-blue-600">{s.score}</p>
                       </td>
                       <td className="py-6 text-center">
                          <span className={cn(
                            "text-[9px] font-bold px-3 py-1 rounded-full border shadow-sm uppercase",
                            s.status === "Elite" ? "bg-blue-50 text-blue-600 border-blue-100" : 
                            s.status === "Excellent" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                             {s.status}
                          </span>
                       </td>
                       <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all">
                                <Eye className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                          </div>
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

function StatCardLarge({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    blue: "bg-blue-600 shadow-blue-200", 
    indigo: "bg-indigo-600 shadow-indigo-200", 
    green: "bg-emerald-600 shadow-emerald-200", 
    orange: "bg-amber-600 shadow-amber-200" 
  };
  
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-8 group hover:translate-y-[-8px] transition-all duration-500">
      <div className={cn("w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6", bgColors[color])}>
         <Icon className="w-10 h-10" />
      </div>
      <div>
         <p className="text-[11px] font-bold text-slate-400 uppercase mb-4 leading-none truncate">{label}</p>
         <p className="text-5xl font-bold text-slate-800 tracking-tighter leading-none">{value}</p>
      </div>
      <div className={cn(
        "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-2xl w-fit",
        up ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100"
      )}>
         {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
         {trend}
      </div>
    </div>
  );
}
