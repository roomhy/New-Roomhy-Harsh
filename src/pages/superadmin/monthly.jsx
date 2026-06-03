import React, { useState, useMemo } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Hourglass,
  Check, X, Eye, ClipboardCheck, AlertTriangle,
  Camera, Map, Star, Edit3, Trash, UserCheck,
  RefreshCw, Download, Inbox, CreditCard, Tag,
  BarChart3, Plus, Loader2, IndianRupee, TrendingUp,
  TrendingDown, Calendar, Wallet, Receipt
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const revenueBreakdown = [
  { name: "Rent", value: 650000, color: "#6366f1" },
  { name: "Deposit", value: 120000, color: "#3b82f6" },
  { name: "Service", value: 50000, color: "#f59e0b" },
  { name: "Fines", value: 25000, color: "#ef4444" },
];

export default function SuperadminMonthly() {
  const [selectedMonth, setSelectedMonth] = useState("October 2025");

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
               <IndianRupee className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight">Economic Intelligence</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accounting {">"} Monthly Performance</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center bg-white border border-slate-100 rounded-2xl shadow-sm p-1.5">
               <button className="p-2 text-slate-400 hover:text-slate-800 transition-all"><ChevronRight className="w-4 h-4 rotate-180" /></button>
               <span className="px-6 text-[10px] font-black text-slate-800 uppercase tracking-widest">{selectedMonth}</span>
               <button className="p-2 text-slate-400 hover:text-slate-800 transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center gap-2">
               <Download className="w-4 h-4" /> Export Report
            </button>
         </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
         <StatCardSmall label="Monthly Revenue" value="₹ 8.45L" trend="+ 12.5%" up icon={Wallet} color="emerald" />
         <StatCardSmall label="Net Profit" value="₹ 7.25L" trend="85.8% Margin" up icon={TrendingUp} color="indigo" />
         <StatCardSmall label="Total Expenses" value="₹ 1.20L" trend="- 2.1% Drop" up icon={TrendingDown} color="rose" />
         <StatCardSmall label="Active Tenants" value="142" trend="+ 8 New" up icon={Users} color="blue" />
         <StatCardSmall label="Collection Rate" value="98.2%" trend="Elite Index" up icon={CheckCircle2} color="emerald" />
         <StatCardSmall label="Yield Growth" value="+ 4.3%" trend="MoM Increase" up icon={Activity} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Detailed Breakdown */}
         <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-xl font-black text-slate-800 tracking-tight">Revenue Stream Analysis</h3>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incoming</span>
                  </div>
               </div>
            </div>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueBreakdown}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                     <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                     />
                     <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {revenueBreakdown.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution */}
         <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Segmentation</h3>
            <div className="h-[250px] relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={revenueBreakdown} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {revenueBreakdown.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-800">₹ 8.45L</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Revenue</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
               {revenueBreakdown.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.name}</p>
                        <p className="text-sm font-black text-slate-800">₹{(s.value/1000).toFixed(0)}k</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Main Ledger */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Financial Transaction Ledger</h3>
            <div className="flex items-center gap-4">
               <button className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm">
                  <Sheet className="w-4 h-4" /> Export CSV
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                     <th className="pb-6">Date & ID</th>
                     <th className="pb-6">Description</th>
                     <th className="pb-6 text-center">Category</th>
                     <th className="pb-6 text-center">Valuation</th>
                     <th className="pb-6 text-center">Sovereignty Status</th>
                     <th className="pb-6 text-right">Audit Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {[
                    { date: "24 Oct 2025", id: "TXN-88291", desc: "Rent Payment - Room 204", cat: "Rent", val: "+₹6,500", status: "Completed", color: "emerald" },
                    { date: "23 Oct 2025", id: "TXN-88285", desc: "Cleaning Services - Vendor", cat: "Expense", val: "-₹2,500", status: "Completed", color: "rose" },
                    { date: "22 Oct 2025", id: "TXN-88240", desc: "Security Deposit - New Tenant", cat: "Deposit", val: "+₹15,000", status: "Completed", color: "blue" }
                  ].map((t, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="py-6">
                          <p className="text-sm font-black text-slate-800">{t.date}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{t.id}</p>
                       </td>
                       <td className="py-6">
                          <p className="text-xs font-black text-slate-700">{t.desc}</p>
                       </td>
                       <td className="py-6 text-center">
                          <span className={cn(
                             "text-[9px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-widest",
                             t.cat === "Rent" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                             t.cat === "Expense" ? "bg-rose-50 text-rose-600 border-rose-100" :
                             "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                             {t.cat}
                          </span>
                       </td>
                       <td className="py-6 text-center">
                          <p className={cn("text-sm font-black", t.color === "emerald" ? "text-emerald-600" : "text-rose-600")}>{t.val}</p>
                       </td>
                       <td className="py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <div className={cn("w-1.5 h-1.5 rounded-full", t.status === "Completed" ? "bg-emerald-500" : "bg-amber-500")} />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.status}</span>
                          </div>
                       </td>
                       <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                <Receipt className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                <Eye className="w-4 h-4" />
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

function StatCardSmall({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { emerald: "bg-emerald-500 shadow-emerald-200", indigo: "bg-indigo-600 shadow-indigo-200", rose: "bg-rose-500 shadow-rose-200", blue: "bg-blue-500 shadow-blue-200", amber: "bg-amber-500 shadow-amber-200" };
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg flex items-center gap-5 group hover:-translate-y-1 transition-all">
       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 transition-transform group-hover:scale-110", bgColors[color])}>
          <Icon className="w-7 h-7" />
       </div>
       <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
          <p className="text-2xl font-black text-slate-800 mb-0.5 truncate">{value}</p>
          <p className={cn("text-[9px] font-black", up ? "text-emerald-600" : "text-rose-600")}>{trend} {up ? "↑" : "↓"}</p>
       </div>
    </div>
  );
}
