import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, CreditCard, RefreshCw
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const subs = [
  { id: "SUB-1024", customer: "Rahul Sharma", plan: "Gold", amount: "₹7,999", cycle: "Monthly", next: "26 Jun", status: "Active" },
  { id: "SUB-1023", customer: "Priya Verma", plan: "Silver", amount: "₹2,999", cycle: "Monthly", next: "25 Jun", status: "Active" },
  { id: "SUB-1022", customer: "Amit Kumar", plan: "Basic", amount: "₹999", cycle: "Monthly", next: "24 Jun", status: "Active" },
  { id: "SUB-1021", customer: "Neha Singh", plan: "Silver", amount: "₹2,999", cycle: "Monthly", next: "23 Jun", status: "Active" },
  { id: "SUB-1020", customer: "Vikram Patel", plan: "Gold", amount: "₹7,999", cycle: "Monthly", next: "—", status: "Cancelled" },
];

export default function Subscriptions() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Subscription Matrix</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Finance & Recurring Revenue Intelligence Lifecycle Ledger</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
               <Download className="w-3.5 h-3.5" /> Export MRR
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCardHorizontal label="Active Subs" value="1,998" trend="+24 Delta" up icon={CreditCard} color="emerald" />
        <StatCardHorizontal label="Total Users" value="2,142" trend="+38 Week" up icon={Users} color="blue" />
        <StatCardHorizontal label="Renewals" value="312" trend="92% Rate" up icon={RefreshCw} color="indigo" />
        <StatCardHorizontal label="Churned" value="18" trend="-4 Delta" up={false} icon={XCircle} color="rose" />
        <StatCardHorizontal label="MRR Yield" value="₹8.2L" trend="+12.1% Alpha" up icon={Zap} color="blue" />
        <StatCardHorizontal label="Avg Plan" value="₹4.1k" trend="+2.4% Zeta" up icon={Activity} color="indigo" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Subscription Registry</h3>
               <select className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-[8px] font-bold text-slate-500 uppercase outline-none shadow-sm">
                  <option>All Tiers</option>
                  <option>Gold</option>
                  <option>Silver</option>
                  <option>Basic</option>
               </select>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="Search customer, ID..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
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
                     <th className="pb-4">Subscription ID</th>
                     <th className="pb-4">Customer Profile</th>
                     <th className="pb-4 text-center">Plan Tier</th>
                     <th className="pb-4 text-center">Billing Cycle</th>
                     <th className="pb-4 text-center">Audit Status</th>
                     <th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {subs.map((s, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 shadow-sm">
                             {s.id}
                          </span>
                       </td>
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-indigo-50">
                                {s.customer.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{s.customer}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Next: {s.next}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                            s.plan === "Gold" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            s.plan === "Silver" ? "bg-slate-50 text-slate-400 border-slate-200" :
                            "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                             {s.plan} Plan
                          </span>
                       </td>
                       <td className="py-3 text-center">
                          <p className="text-[11px] font-bold text-slate-800 tracking-tight">{s.amount}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{s.cycle}</p>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             s.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                             s.status === "Cancelled" ? "bg-rose-50 text-rose-600 border-rose-100" :
                             "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                             {s.status}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"><Eye className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"><MoreVertical className="w-3.5 h-3.5" /></button>
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
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
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
