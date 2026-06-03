import React from "react";
import { 
  RotateCcw, Clock, CheckCircle2, XCircle, Plus, Eye, 
  MoreVertical, Search, ArrowUpRight, ArrowDownRight,
  ChevronRight, DollarSign, Wallet, ShieldCheck,
  AlertCircle, Activity, Filter, Download, RefreshCw,
  Sparkles, Layers, Box, Globe2, IndianRupee,
  CreditCard, Inbox, FileText, ImageIcon, Save
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const refundStatus = [
  { name: "Refunded", value: 842, color: "#10B981", percent: "68.2%" },
  { name: "Processing", value: 276, color: "#3B82F6", percent: "22.4%" },
  { name: "Pending", value: 78, color: "#F59E0B", percent: "6.3%" },
  { name: "Rejected", value: 39, color: "#EF4444", percent: "3.1%" },
];

const refundsData = [
  { id: "RF-12845", txn: "TXN-125482", customer: "Karan Mehta", reason: "Cancelled subscription", amount: "₹ 8,999", date: "May 28, 2024", status: "Refunded", initial: "KM", color: "blue" },
  { id: "RF-12846", txn: "TXN-125470", customer: "Anjali Roy", reason: "Duplicate payment", amount: "₹ 2,500", date: "May 27, 2024", status: "Refunded", initial: "AR", color: "indigo" },
  { id: "RF-12847", txn: "TXN-125465", customer: "Rajesh Verma", reason: "Service not delivered", amount: "₹ 15,000", date: "May 26, 2024", status: "Processing", initial: "RV", color: "blue" },
  { id: "RF-12848", txn: "TXN-125455", customer: "Pooja Gupta", reason: "Billing error", amount: "₹ 999", date: "May 25, 2024", status: "Pending", initial: "PG", color: "orange" },
  { id: "RF-12849", txn: "TXN-125440", customer: "Suresh Kumar", reason: "Customer request", amount: "₹ 4,500", date: "May 25, 2024", status: "Rejected", initial: "SK", color: "rose" },
];

export default function SuperadminRefunds() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Refund Velocity & Liquidity</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Accounting Operations</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Liquid Capital Settlements</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <p className="text-sm font-bold text-slate-400 max-w-2xl">Process platform-wide refund requests, audit capital distribution and manage high-velocity transactional settlements with total transparency.</p>
         <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Liquidity Report
         </button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Refund Value" value="₹ 4.2L" trend="+ 15.6% Flux" up icon={IndianRupee} color="blue" />
        <StatCardLarge label="Success Velocity" value="842" trend="Optimal Flow" up icon={CheckCircle2} color="green" />
        <StatCardLarge label="Needs Audit" value="78" trend="Action Required" up icon={Clock} color="orange" />
        <StatCardLarge label="Total Requests" value="1,235" trend="+ 12.5% Delta" up icon={RotateCcw} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Status Distribution */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center">
           <div className="flex items-center justify-between w-full mb-10">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Status Segmentation</h3>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This Month</span>
                 <ChevronRight className="w-3 h-3 text-slate-300" />
              </div>
           </div>
           <div className="relative w-64 h-64 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={refundStatus} dataKey="value" innerRadius={70} outerRadius={95} paddingAngle={8} stroke="none">
                       {refundStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <p className="text-4xl font-bold text-slate-800 tracking-tighter leading-none">1,235</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Requests</p>
              </div>
           </div>
           <div className="w-full space-y-4">
              {refundStatus.map(item => (
                <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                   <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: item.color}} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{item.name} Hub</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-800">{item.value.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-slate-400 px-2 py-0.5 bg-white rounded-lg border border-slate-100 uppercase tracking-tighter">{item.percent}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Recent Refund Ledger */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Recent Refund Portfolio</h3>
              <div className="relative group w-48">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input 
                   value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search..." 
                   className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold shadow-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" 
                 />
              </div>
           </div>
           <div className="space-y-6">
              {refundsData.map(rf => (
                <div key={rf.id} className="flex items-center gap-6 group cursor-pointer p-3 rounded-[2rem] hover:bg-slate-50/50 transition-all border border-transparent hover:border-slate-100">
                   <div className={cn(
                      "w-16 h-16 rounded-[1.25rem] flex items-center justify-center font-bold text-white text-xl shadow-xl transition-transform group-hover:scale-105",
                      rf.color === "blue" ? "bg-blue-600 shadow-blue-100" :
                      rf.color === "indigo" ? "bg-indigo-600 shadow-indigo-100" :
                      rf.color === "orange" ? "bg-amber-600 shadow-amber-100" : "bg-rose-600 shadow-rose-100"
                   )}>
                      {rf.initial}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-base font-bold text-slate-800 truncate">{rf.customer}</p>
                        <span className={cn(
                           "text-[9px] font-bold px-3 py-1 rounded-xl border uppercase shadow-sm tracking-widest",
                           rf.status === "Refunded" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                           rf.status === "Processing" ? "bg-blue-50 text-blue-600 border-blue-100" :
                           rf.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                          {rf.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest opacity-60">{rf.reason}</p>
                   </div>
                   <div className="text-right hidden sm:block">
                      <p className="text-base font-bold text-slate-800 tracking-tighter">{rf.amount}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{rf.id}</p>
                   </div>
                   <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg transition-all border border-slate-100">
                      <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   </button>
                </div>
              ))}
           </div>
           <button className="w-full mt-8 py-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline transition-all">Audit Full Portfolio</button>
        </div>
      </div>

      {/* Action Suite Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <ActionCardLarge icon={Plus} label="Process Refund" sub="Initiate a new liquid capital request" count="42" color="blue" btnText="Initiate Flow" />
        <ActionCardLarge icon={CheckCircle2} label="Liquidated Hub" sub="Successful transactional settlements" count="842" color="green" btnText="Audit Success" />
        <ActionCardLarge icon={Clock} label="Pending Review" sub="Refunds awaiting strategic approval" count="78" color="orange" btnText="Review Cycle" />
        <ActionCardLarge icon={AlertCircle} label="Disputed Flow" sub="Manage refunds with payment alerts" count="12" color="red" btnText="Resolve Alerts" />
      </div>
    </div>
  );
}

function StatCardLarge({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    green: "bg-emerald-600 shadow-emerald-200", 
    blue: "bg-blue-600 shadow-blue-200", 
    indigo: "bg-indigo-600 shadow-indigo-200", 
    orange: "bg-amber-600 shadow-amber-200" 
  };
  
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-8 group hover:translate-y-[-8px] transition-all duration-500">
      <div className={cn("w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6", bgColors[color])}>
         <Icon className="w-10 h-10" />
      </div>
      <div>
         <p className="text-[11px] font-bold text-slate-400 uppercase mb-4 leading-none truncate tracking-widest">{label}</p>
         <p className="text-5xl font-bold text-slate-800 tracking-tighter leading-none">{value}</p>
      </div>
      <div className={cn(
        "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-2xl w-fit shadow-sm border",
        up ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-rose-600 bg-rose-50 border-rose-100"
      )}>
         {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
         {trend}
      </div>
    </div>
  );
}

function ActionCardLarge({ icon: Icon, label, sub, count, color, btnText }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 shadow-blue-50",
    green: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 shadow-emerald-50",
    orange: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 shadow-amber-50",
    red: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 shadow-rose-50",
  };
  
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center group cursor-pointer transition-all hover:translate-y-[-8px]">
       <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:text-white group-hover:scale-110", colors[color])}>
          <Icon className="w-8 h-8" />
       </div>
       <h4 className="text-base font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{label}</h4>
       <p className="text-[10px] text-slate-400 font-bold uppercase mb-8 opacity-50 tracking-widest">{sub}</p>
       
       <div className="mt-auto flex flex-col items-center">
          <p className="text-3xl font-bold text-slate-800 leading-none mb-2 tracking-tighter">{count}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Hubs</p>
       </div>
       
       <button className="mt-10 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          {btnText} <ArrowUpRight className="w-4 h-4" />
       </button>
    </div>
  );
}
