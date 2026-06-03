import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, CreditCard, LayoutGrid, RefreshCw
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const txns = [
  { id: "TXN-125487", desc: "Listing - Green Villa", type: "Income", amount: "₹25,000", method: "Razorpay", status: "Completed", date: "26 May" },
  { id: "TXN-125486", desc: "Comm - Green Villa", type: "Commission", amount: "₹2,500", method: "Internal", status: "Completed", date: "26 May" },
  { id: "TXN-125485", desc: "Payout - Green Villa", type: "Payout", amount: "₹22,500", method: "Bank", status: "Completed", date: "25 May" },
  { id: "TXN-125484", desc: "Sub - Silver Plan", type: "Subscription", amount: "₹8,999", method: "Stripe", status: "Completed", date: "25 May" },
  { id: "TXN-125483", desc: "Featured - Blue Res", type: "Income", amount: "₹1,999", method: "Razorpay", status: "Completed", date: "24 May" },
  { id: "TXN-125482", desc: "Refund - Sub", type: "Refund", amount: "₹8,999", method: "Stripe", status: "Refunded", date: "24 May" },
];

export default function Transactions() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Financial Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Transaction History & Audit-Ready Fiscal Flows</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition-all flex items-center gap-2">
               <Download className="w-3.5 h-3.5" /> Export Ledger
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Total Volume" value="₹18.7L" trend="+15.6% Flux" up icon={Wallet} color="blue" />
        <StatCardHorizontal label="Gross Income" value="₹14.2L" trend="+12.4% Delta" up icon={ArrowDownCircle} color="emerald" />
        <StatCardHorizontal label="Total Payouts" value="₹12.4L" trend="+8.3% Yield" up icon={ArrowUpCircle} color="amber" />
        <StatCardHorizontal label="Net Growth" value="12.4%" trend="+2.1% Alpha" up icon={Zap} color="indigo" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Fiscal Audit Stream</h3>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="Search TXN ID..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
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
                     <th className="pb-4">TXN Identity</th>
                     <th className="pb-4">Fiscal Description</th>
                     <th className="pb-4 text-center">Velocity Segment</th>
                     <th className="pb-4 text-center">Amount (₹)</th>
                     <th className="pb-4 text-center">Gateway Hub</th>
                     <th className="pb-4 text-center">Audit Status</th>
                     <th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {txns.map((tx, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 shadow-sm">
                             {tx.id}
                          </span>
                       </td>
                       <td className="py-3">
                          <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{tx.desc}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{tx.date}</p>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[7px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm border",
                            tx.type === "Income" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            tx.type === "Payout" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            tx.type === "Commission" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                             {tx.type}
                          </span>
                       </td>
                       <td className="py-3 text-center">
                          <p className={cn("text-[11px] font-bold", tx.type === "Income" || tx.type === "Commission" ? "text-emerald-600" : "text-rose-600")}>
                             {tx.amount}
                          </p>
                       </td>
                       <td className="py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{tx.method}</p>
                             <div className="w-10 h-0.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-2/3 h-full bg-blue-500" /></div>
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             tx.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                             {tx.status}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><Eye className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><MoreVertical className="w-3.5 h-3.5" /></button>
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
