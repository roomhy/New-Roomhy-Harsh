import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Send, FileText, Receipt, LayoutGrid,
  TrendingUp, Calendar, UserPlus, UserCheck, BarChart3
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const growthData = Array.from({ length: 7 }, (_, i) => ({
  name: `${20 + i} May`,
  newUsers: 450 + i * 120,
  activeUsers: 12000 + i * 800,
}));

const userTypes = [
  { name: "Tenants", value: 65, color: "#3B82F6", percent: "65%" },
  { name: "Owners", value: 25, color: "#10B981", percent: "25%" },
  { name: "Agents", value: 10, color: "#6366F1", percent: "10%" },
];

export default function ReportsUsers() {
  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">User Demographic Intelligence</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Reports</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">User Growth Analytics</span>
         </div>
      </div>

      <p className="text-sm font-bold text-slate-400">Comprehensive analysis of user acquisition trends, retention velocity and platform demographic distribution.</p>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Total Ecosystem" value="18.7k" trend="+ 8.6% Growth" up icon={Users} color="blue" />
        <StatCardLarge label="New Signups" value="+ 2.4k" trend="This Month" up icon={UserPlus} color="indigo" />
        <StatCardLarge label="Active Retention" value="94.2%" trend="Elite Engagement" up icon={UserCheck} color="green" />
        <StatCardLarge label="Platform Reach" value="12 Regions" trend="Geographical Expansion" up icon={Globe} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Growth Chart */}
         <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Acquisition Velocity</h3>
               <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                     New Signups
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                     Active Pulse
                  </div>
               </div>
            </div>
            <div className="flex-1 min-h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                     <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-15} />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} />
                     <Area type="monotone" dataKey="newUsers" stroke="#3B82F6" strokeWidth={5} fillOpacity={1} fill="url(#colorUsers)" />
                     <Area type="monotone" dataKey="activeUsers" stroke="#10B981" strokeWidth={5} fill="transparent" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution */}
         <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-10">User Distribution</h3>
            <div className="relative h-64 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={userTypes} dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={8} stroke="none">
                        {userTypes.map((c, i) => <Cell key={i} fill={c.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-4xl font-bold text-slate-800 tracking-tighter">100%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Ecosystem Split</p>
               </div>
            </div>
            <div className="mt-10 space-y-6">
               {userTypes.map(c => (
                 <div key={c.name} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-4">
                       <div className="w-3 h-3 rounded-full" style={{backgroundColor: c.color}} />
                       <span className="text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-bold text-slate-400">{c.value}%</span>
                       <span className="text-sm font-bold text-slate-800">{c.percent}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Retention Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <InsightCard icon={TrendingUp} title="Acquisition Velocity" value="+ 12.4%" sub="Week-over-Week growth" color="blue" />
         <InsightCard icon={UserCheck} title="Verified Profiles" value="98.2%" sub="KYC completion rate" color="green" />
         <InsightCard icon={Activity} title="Churn Rate" value="1.2%" sub="Platform departure velocity" color="red" />
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

function InsightCard({ icon: Icon, title, value, sub, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    red: "text-rose-600 bg-rose-50"
  };
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/50 flex items-center gap-6 group hover:bg-slate-800 transition-all cursor-default">
       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", colors[color])}>
          <Icon className="w-7 h-7" />
       </div>
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 group-hover:text-slate-300 transition-colors">{title}</p>
          <p className="text-2xl font-bold text-slate-800 group-hover:text-white transition-colors">{value}</p>
          <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors">{sub}</p>
       </div>
    </div>
  );
}
