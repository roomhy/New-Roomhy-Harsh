import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Percent, Database, TrendingUp,
  LayoutGrid, BarChart3, RefreshCw
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const data = Array.from({ length: 7 }, (_, i) => ({ 
  name: `${20 + i} May`, 
  commission: 35000 + i * 4500 
}));

const records = [
  { id: "C-2148", listing: "Green Villa", amount: "₹2,500", rate: "10%", base: "₹25,000", date: "26 May", status: "Paid", initial: "GV", color: "blue" },
  { id: "C-2147", listing: "Silver Heights", amount: "₹850", rate: "10%", base: "₹8,500", date: "26 May", status: "Pending", initial: "SH", color: "amber" },
  { id: "C-2146", listing: "Blue Bells", amount: "₹1,800", rate: "10%", base: "₹18,000", date: "25 May", status: "Paid", initial: "BB", color: "indigo" },
  { id: "C-2145", listing: "Sunset Co-Liv", amount: "₹1,200", rate: "10%", base: "₹12,000", date: "25 May", status: "Paid", initial: "SC", color: "emerald" },
  { id: "C-2144", listing: "Maple House", amount: "₹3,000", rate: "10%", base: "₹30,000", date: "24 May", status: "Pending", initial: "MH", color: "rose" },
];

export default function Commission() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Commission Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Service Fee Analytics & Global Revenue Lifecycle Ledger</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
               <Download className="w-3.5 h-3.5" /> Export Ledger
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Total Commission" value="₹2.8L" trend="+12.4% Flux" up icon={Database} color="indigo" />
        <StatCardHorizontal label="Net Profit" value="₹4.2L" trend="+18.7% Delta" up icon={Zap} color="blue" />
        <StatCardHorizontal label="Pending Comm" value="₹38.4k" trend="14 Active" up icon={Wallet} color="amber" />
        <StatCardHorizontal label="Monthly Growth" value="+12.4%" trend="Optimal" up icon={TrendingUp} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Trend Chart */}
         <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Earnings Trend</h3>
               <div className="flex items-center gap-3 text-[8px] font-bold text-slate-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  Daily Rev
               </div>
            </div>
            <div className="flex-1 h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} tickFormatter={v => `${v/1000}k`} />
                     <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 700}} cursor={{fill: '#f8fafc'}} />
                     <Bar dataKey="commission" radius={[4, 4, 4, 4]} barSize={20}>
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#4F46E5' : '#E0E7FF'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Commission Ledger */}
         <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Revenue Ledger</h3>
               <div className="flex items-center gap-3">
                  <div className="relative group w-48">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                     <input placeholder="Search listings..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                  </div>
                  <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
                     <RefreshCw className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                        <th className="pb-4">Audit ID</th>
                        <th className="pb-4">Property Listing</th>
                        <th className="pb-4 text-center">Base Amount</th>
                        <th className="pb-4 text-center">Commission</th>
                        <th className="pb-4 text-center">Audit Status</th>
                        <th className="pb-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {records.map((r, i) => (
                       <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                          <td className="py-3">
                             <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 shadow-sm">
                                {r.id}
                             </span>
                          </td>
                          <td className="py-3">
                             <div className="flex items-center gap-3">
                                <div className={cn(
                                   "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm transition-transform group-hover:scale-105",
                                   r.color === "blue" ? "bg-blue-600 shadow-blue-50" :
                                   r.color === "indigo" ? "bg-indigo-600 shadow-indigo-50" :
                                   r.color === "emerald" ? "bg-emerald-600 shadow-emerald-50" :
                                   r.color === "amber" ? "bg-amber-600 shadow-amber-50" :
                                   r.color === "purple" ? "bg-purple-600 shadow-purple-50" : "bg-rose-600 shadow-rose-50"
                                )}>
                                   {r.initial}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{r.listing}</p>
                                   <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{r.date}</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-3 text-center">
                             <p className="text-[10px] font-bold text-slate-700 leading-tight">{r.base}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-70">Rate: {r.rate}</p>
                          </td>
                          <td className="py-3 text-center">
                             <p className="text-[11px] font-bold text-emerald-600 tracking-tight">{r.amount}</p>
                          </td>
                          <td className="py-3 text-center">
                             <span className={cn(
                               "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                               r.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                             )}>
                                {r.status}
                             </span>
                          </td>
                          <td className="py-3 text-right">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm">
                                <Eye className="w-3.5 h-3.5" />
                             </button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
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
