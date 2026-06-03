import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Send, CreditCard, RefreshCw
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const payouts = [
  { id: "PO-3045", recipient: "Rahul Sharma", account: "HDFC ****4521", amount: "₹22,500", method: "Bank", date: "26 May", status: "Completed", initial: "RS", color: "blue" },
  { id: "PO-3044", recipient: "Priya Verma", account: "ICICI ****8842", amount: "₹7,650", method: "Bank", date: "26 May", status: "Processing", initial: "PV", color: "indigo" },
  { id: "PO-3043", recipient: "Amit Kumar", account: "SBI ****1289", amount: "₹16,200", method: "Bank", date: "25 May", status: "Completed", initial: "AK", color: "emerald" },
  { id: "PO-3042", recipient: "Neha Singh", account: "Axis ****3654", amount: "₹10,800", method: "UPI", date: "25 May", status: "Completed", initial: "NS", color: "amber" },
  { id: "PO-3041", recipient: "Vikram Patel", account: "Kotak ****9921", amount: "₹27,000", method: "Bank", date: "24 May", status: "Pending", initial: "VP", color: "purple" },
  { id: "PO-3040", recipient: "Sneha Iyer", account: "HDFC ****5544", amount: "₹19,800", method: "UPI", date: "24 May", status: "Failed", initial: "SI", color: "rose" },
];

export default function Payouts() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Settlement Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Owner Disbursement Lifecycle & Automated Settlement Audits</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-purple-600/10 hover:bg-purple-700 transition-all flex items-center gap-2">
               <Plus className="w-3.5 h-3.5" /> Process Payout
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Total Payouts" value="₹12.4L" trend="+8.3% Yield" up icon={Send} color="purple" />
        <StatCardHorizontal label="Settlement SLA" value="99.4%" trend="Optimal" up icon={Zap} color="blue" />
        <StatCardHorizontal label="Available Bal" value="₹4.5L" trend="Disbursable" up icon={Wallet} color="emerald" />
        <StatCardHorizontal label="Failed Trans" value="03" trend="-1.2% Delta" up={false} icon={XCircle} color="rose" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Settlement Registry</h3>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="Search recipient..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
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
                     <th className="pb-4">PO Identity</th>
                     <th className="pb-4">Recipient Profile</th>
                     <th className="pb-4 text-center">Settlement Method</th>
                     <th className="pb-4 text-center">Disbursed (₹)</th>
                     <th className="pb-4 text-center">Audit Status</th>
                     <th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {payouts.map((p, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 shadow-sm">
                             {p.id}
                          </span>
                       </td>
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm transition-transform group-hover:scale-105",
                                p.color === "blue" ? "bg-blue-600 shadow-blue-50" :
                                p.color === "indigo" ? "bg-indigo-600 shadow-indigo-50" :
                                p.color === "emerald" ? "bg-emerald-600 shadow-emerald-50" :
                                p.color === "amber" ? "bg-amber-600 shadow-amber-50" :
                                p.color === "purple" ? "bg-purple-600 shadow-purple-50" : "bg-rose-600 shadow-rose-50"
                             )}>
                                {p.initial}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{p.recipient}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.date}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <p className="text-[10px] font-bold text-slate-700 leading-tight">{p.account}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-70">{p.method}</p>
                       </td>
                       <td className="py-3 text-center">
                          <p className="text-[11px] font-bold text-slate-800 tracking-tight">{p.amount}</p>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             p.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                             p.status === "Processing" ? "bg-blue-50 text-blue-600 border-blue-100" :
                             p.status === "Failed" ? "bg-rose-50 text-rose-600 border-rose-100" :
                             "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                             {p.status}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-purple-600 transition-all border border-slate-100 shadow-sm"><Eye className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-purple-600 transition-all border border-slate-100 shadow-sm"><MoreVertical className="w-3.5 h-3.5" /></button>
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
    purple: "bg-purple-50 text-purple-600 border-purple-100", 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    rose: "bg-rose-50 text-rose-600 border-rose-100" 
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
