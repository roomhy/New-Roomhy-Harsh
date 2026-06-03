import React from "react";
import { 
  IndianRupee, Wallet, TrendingUp, Clock, 
  ArrowUpRight, ArrowDownRight, ChevronRight, 
  MoreVertical, Search, Calendar, FileText,
  CheckCircle2, AlertCircle, Activity,
  Users, Building2, CreditCard, Filter, Download,
  Bell, XCircle, Settings
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { StatCard } from "../../components/superadmin/StatCard";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const collectionPayoutTrend = [
  { name: "Jan", collection: 120000, payout: 80000 },
  { name: "Feb", collection: 180000, payout: 100000 },
  { name: "Mar", collection: 150000, payout: 120000 },
  { name: "Apr", collection: 220000, payout: 140000 },
  { name: "May", collection: 190000, payout: 130000 },
];

const transactions = [
  { date: "May 28, 2024", desc: "Rent Payment - Ocean View Apartment", type: "Tenant Payment", amount: "+ ₹ 28,500", status: "Success", color: "green" },
  { date: "May 28, 2024", desc: "Owner Payout - John Doe", type: "Owner Payout", amount: "- ₹ 45,000", status: "Processed", color: "blue" },
  { date: "May 27, 2024", desc: "Service Fee - Green Valley Villa", type: "Service Fee", amount: "+ ₹ 2,250", status: "Success", color: "purple" },
];

const dueRentAging = [
  { name: "0 - 30 Days", value: 125430, color: "hsl(var(--chart-1))" },
  { name: "31 - 60 Days", value: 110250, color: "hsl(var(--chart-2))" },
  { name: "61 - 90 Days", value: 65000, color: "hsl(var(--chart-3))" },
  { name: "90+ Days", value: 44990, color: "hsl(var(--chart-4))" },
];

const alerts = [
  { label: "Rent Reminders", count: 28, sub: "Sent Today", icon: Bell, color: "yellow" },
  { label: "Payment Success", count: 54, sub: "Alerts Sent", icon: CheckCircle2, color: "green" },
  { label: "Payment Failure", count: 6, sub: "Action Required", icon: XCircle, color: "red" },
  { label: "Payout Done", count: 18, sub: "Processed", icon: IndianRupee, color: "purple" },
];

const COLORS = {
  blue: "bg-info-soft text-info",
  green: "bg-success-soft text-success",
  yellow: "bg-warning-soft text-warning",
  purple: "bg-purple-soft text-purple",
  red: "bg-rose-50 text-rose-600",
};

export default function AccountingOverview() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Accounting Overview" 
        subtitle="Comprehensive overview of platform financials and transactions."
        actions={
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-border/60 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>May 2025</span>
             </div>
             <button className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform">
                <Download size={18} />
             </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
         <StatCard label="Collections" value="₹ 24.58L" delta="+12.6%" trend="up" icon={Wallet} iconColor="green" />
         <StatCard label="Payouts" value="₹ 18.35L" delta="+9.4%" trend="up" icon={CreditCard} iconColor="blue" />
         <StatCard label="Revenue" value="₹ 6.23L" delta="+15.2%" trend="up" icon={TrendingUp} iconColor="purple" />
         <StatCard label="Due Rents" value="₹ 3.45L" delta="+8.7%" trend="up" icon={Clock} iconColor="yellow" />
         <StatCard label="Pending Payouts" value="₹ 2.15L" delta="-2.1%" trend="down" icon={AlertCircle} iconColor="red" />
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-12 lg:col-span-8 panel">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-slate-900">Collection vs Payout Trend</h3>
               <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Collection</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Payout</span>
                     </div>
                  </div>
                  <select className="h-9 px-3 rounded-xl border border-border bg-slate-50 text-xs font-bold text-slate-500 outline-none">
                     <option>This Year</option>
                  </select>
               </div>
            </div>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={collectionPayoutTrend}>
                     <defs>
                        <linearGradient id="coll" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="pay" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                           <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} tickFormatter={(v) => `${v / 1000}K`} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Area type="monotone" dataKey="collection" stroke="#3B82F6" strokeWidth={3} fill="url(#coll)" dot={{fill: "#3B82F6", r: 4}} />
                     <Area type="monotone" dataKey="payout" stroke="#10B981" strokeWidth={3} fill="url(#pay)" dot={{fill: "#10B981", r: 4}} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 panel">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Recent Ledger</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="space-y-5 flex-1 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
               {transactions.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 group border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                     <div className={cn("icon-bubble !h-10 !w-10 transition-transform group-hover:scale-105", COLORS[t.color])}>
                        <span className="text-[10px] font-black">{t.type.split(' ').map(x => x[0]).join('')}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                           <p className="text-[13px] font-bold text-slate-900 truncate leading-none">{t.desc}</p>
                           <p className={cn("text-sm font-black", t.amount.startsWith('+') ? "text-emerald-600" : "text-rose-600")}>{t.amount}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.type}</p>
                           <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg", t.status === "Success" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{t.status}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="panel">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Due Rent Aging</h3>
            <div className="relative h-48 mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={dueRentAging} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                        {dueRentAging.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-black text-slate-900">₹ 3.45L</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Due</p>
               </div>
            </div>
            <div className="space-y-3">
               {dueRentAging.map((item) => (
                  <div key={item.name} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-xs font-semibold text-slate-500">{item.name}</span>
                     </div>
                     <span className="text-xs font-black text-slate-900">₹ {item.value.toLocaleString()}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="panel">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Automation Stats</h3>
            <div className="space-y-5">
               {alerts.map((alert, i) => (
                  <div key={i} className="flex items-center justify-between group hover:translate-x-1 transition-transform">
                     <div className="flex items-center gap-4">
                        <div className={cn("icon-bubble !h-10 !w-10 shadow-sm", COLORS[alert.color])}>
                           <alert.icon size={18} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[13px] font-bold text-slate-900 truncate leading-none mb-1">{alert.label}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{alert.sub}</p>
                        </div>
                     </div>
                     <p className="text-lg font-black text-slate-900 tracking-tight">{alert.count}</p>
                  </div>
               ))}
            </div>
         </div>

         <div className="panel bg-slate-900 text-white border-none shadow-xl">
            <h3 className="text-lg font-bold mb-8">Quick Actions</h3>
            <div className="space-y-4">
               {[
                 { label: "Generate Owner Payout", icon: IndianRupee },
                 { label: "Monthly GST Report", icon: FileText },
                 { label: "Refund Management", icon: Activity },
                 { label: "Invoice Settings", icon: Settings },
               ].map((item, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                     <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-blue-400" />
                        <span className="text-sm font-bold">{item.label}</span>
                     </div>
                     <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                  </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
