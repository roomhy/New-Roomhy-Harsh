import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Send, FileText, Receipt, LayoutGrid,
  IndianRupee, Database, TrendingUp, Calendar,
  Smartphone, BarChart3, PieChart as PieIcon, LineChart as LineIcon
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const perf = Array.from({ length: 7 }, (_, i) => ({
  name: `${20 + i} May`,
  listings: 16000 + i * 800,
  users: 11000 + i * 700,
  leads: 7000 + i * 800,
  revenue: 3000 + i * 400,
}));

const cats = [
  { name: "Listings", value: 12, color: "#3B82F6", percent: "21.4%" },
  { name: "Users", value: 8, color: "#10B981", percent: "14.3%" },
  { name: "Leads", value: 10, color: "#6366F1", percent: "17.8%" },
  { name: "Revenue", value: 8, color: "#F59E0B", percent: "14.3%" },
  { name: "Commission", value: 6, color: "#8B5CF6", percent: "10.7%" },
  { name: "Others", value: 12, color: "#94A3B8", percent: "21.5%" },
];

const recentReports = [
  { name: "Revenue Summary Report", category: "Revenue", date: "26 May 2024", time: "10:30 AM", by: "Aman", format: "PDF", color: "blue" },
  { name: "Listings Performance Report", category: "Listings", date: "26 May 2024", time: "09:15 AM", by: "Aman", format: "Excel", color: "emerald" },
  { name: "User Growth Report", category: "Users", date: "26 May 2024", time: "08:45 AM", by: "Aman", format: "PDF", color: "indigo" },
  { name: "Leads & Bookings Report", category: "Leads", date: "25 May 2024", time: "07:30 PM", by: "Aman", format: "Excel", color: "purple" },
];

export default function ReportsRevenue() {
  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Revenue Intelligence Dashboard</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Reports</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Revenue Analytics</span>
         </div>
      </div>

      <p className="text-sm font-bold text-slate-400">Comprehensive financial breakdown of platform earnings, growth velocity and fiscal performance.</p>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCardLarge label="Total Revenue" value="₹ 18.7L" trend="+ 15.6%" up icon={IndianRupee} color="blue" />
        <StatCardLarge label="Commission" value="₹ 2.8L" trend="+ 12.4%" up icon={Database} color="indigo" />
        <StatCardLarge label="Total Leads" value="6.4k" trend="+ 12.3%" up icon={FileText} color="purple" />
        <StatCardLarge label="Total Users" value="18.7k" trend="+ 8.6%" up icon={Users} color="green" />
        <StatCardLarge label="Total Listings" value="2.5k" trend="+ 156" up icon={Home} color="emerald" />
        <StatCardLarge label="Refunds" value="₹ 45k" trend="- 3.2%" up={false} icon={RotateCcw} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Growth Velocity</h3>
              <div className="flex items-center gap-6">
                 <LegendPill color="#3B82F6" label="Revenue" />
                 <LegendPill color="#10B981" label="Users" />
                 <select className="bg-slate-50 border-none rounded-2xl px-5 py-2.5 text-xs font-bold text-slate-500 outline-none cursor-pointer">
                    <option>This Week</option>
                 </select>
              </div>
           </div>
           <div className="flex-1 min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={perf}>
                    <defs>
                       <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-15} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="listings" stroke="#10B981" strokeWidth={5} fill="transparent" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
           <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-10">Reports by Category</h3>
           <div className="relative h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={cats} dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={8} stroke="none">
                       {cats.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-4xl font-bold text-slate-800 tracking-tighter">56</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Total Reports</p>
              </div>
           </div>
           <div className="mt-10 space-y-4">
              {cats.map(c => (
                <div key={c.name} className="flex items-center justify-between group cursor-default">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}} />
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">{c.name}</span>
                   </div>
                   <span className="text-xs font-bold text-slate-800">{c.percent}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Recent Reports */}
         <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Generated Intelligence</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline uppercase">View Full Archive</button>
            </div>
            <div className="space-y-6">
               {recentReports.map((r, i) => (
                 <div key={i} className="flex items-center gap-6 group cursor-pointer p-2 rounded-3xl transition-all">
                    <div className={cn(
                       "w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-105",
                       r.color === "blue" ? "bg-blue-600 shadow-blue-100" :
                       r.color === "emerald" ? "bg-emerald-600 shadow-emerald-100" :
                       r.color === "indigo" ? "bg-indigo-600 shadow-indigo-100" : "bg-purple-600 shadow-purple-100"
                    )}>
                       <FileText className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-base font-bold text-slate-800 truncate">{r.name}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{r.date} • {r.time}</p>
                    </div>
                    <div className="text-center hidden sm:block mr-4">
                       <span className="text-[9px] font-bold px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 uppercase">{r.category}</span>
                    </div>
                    <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all">
                       <Download className="w-5 h-5" />
                    </button>
                 </div>
               ))}
            </div>
         </div>

         {/* Scheduled Automations */}
         <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-10">Active Schedules</h3>
            <div className="space-y-6 flex-1">
               <ScheduleCard title="Weekly Revenue" date="Every Monday" />
               <ScheduleCard title="Monthly Payouts" date="1st of Month" />
               <ScheduleCard title="User Growth" date="Bi-Weekly" />
            </div>
            <button className="mt-10 w-full py-5 rounded-3xl border-2 border-dashed border-slate-100 text-xs font-bold text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all uppercase">
               Create New Schedule
            </button>
        </div>
      </div>
    </div>
  );
}

function StatCardLarge({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    blue: "bg-blue-600 shadow-blue-200", 
    indigo: "bg-indigo-600 shadow-indigo-200", 
    purple: "bg-purple-600 shadow-purple-200", 
    green: "bg-emerald-600 shadow-emerald-200", 
    emerald: "bg-emerald-600 shadow-emerald-200", 
    red: "bg-rose-600 shadow-rose-200" 
  };
  
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6 group hover:translate-y-[-8px] transition-all duration-500">
      <div className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6", bgColors[color])}>
         <Icon className="w-8 h-8" />
      </div>
      <div>
         <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 leading-none truncate">{label}</p>
         <p className="text-4xl font-bold text-slate-800 tracking-tighter leading-none">{value}</p>
      </div>
      <div className={cn(
        "flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-xl w-fit",
        up ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
      )}>
         {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
         {trend}
      </div>
    </div>
  );
}

function LegendPill({ color, label }) {
  return (
    <div className="flex items-center gap-2">
       <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: color}} />
       <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
    </div>
  );
}

function ScheduleCard({ title, date }) {
  return (
    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:bg-slate-800 hover:shadow-xl transition-all cursor-pointer">
       <div className="flex items-center justify-between">
          <div>
             <p className="text-sm font-bold text-slate-800 group-hover:text-white transition-colors">{title}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 group-hover:text-slate-300 transition-colors">{date}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
             <CheckCircle2 className="w-5 h-5" />
          </div>
       </div>
    </div>
  );
}
