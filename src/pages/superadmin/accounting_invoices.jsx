import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Send, FileText, Receipt, LayoutGrid,
  RefreshCw, AlertCircle
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const invoices = [
  { id: "INV-2025-0512", customer: "Rahul Sharma", amount: "₹25,000", issued: "26 May", due: "10 Jun", status: "Paid", initial: "RS", color: "emerald" },
  { id: "INV-2025-0511", customer: "Priya Verma", amount: "₹8,500", issued: "26 May", due: "10 Jun", status: "Paid", initial: "PV", color: "emerald" },
  { id: "INV-2025-0510", customer: "Amit Kumar", amount: "₹18,000", issued: "25 May", due: "09 Jun", status: "Pending", initial: "AK", color: "amber" },
  { id: "INV-2025-0509", customer: "Neha Singh", amount: "₹12,000", issued: "25 May", due: "09 Jun", status: "Paid", initial: "NS", color: "emerald" },
  { id: "INV-2025-0508", customer: "Vikram Patel", amount: "₹30,000", issued: "20 May", due: "04 Jun", status: "Overdue", initial: "VP", color: "rose" },
];

export default function Invoices() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Billing Center</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fiscal Documentation & Automated Accounts Receivable Ledger</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all flex items-center gap-2">
               <Plus className="w-3.5 h-3.5" /> Create Invoice
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Total Invoices" value="1,245" trend="+58 Delta" up icon={FileText} color="blue" />
        <StatCardHorizontal label="Paid Volume" value="₹14.8L" trend="94.7% Yield" up icon={CheckCircle2} color="emerald" />
        <StatCardHorizontal label="Pending Coll" value="₹3.2L" trend="Active Flow" up icon={Receipt} color="amber" />
        <StatCardHorizontal label="Overdue Alerts" value="12" trend="+2.1% Risk" up={false} icon={AlertCircle} color="rose" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Billing Registry</h3>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="Search invoices..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
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
                     <th className="pb-4">Document Identity</th>
                     <th className="pb-4">Recipient Profile</th>
                     <th className="pb-4 text-center">Amount (₹)</th>
                     <th className="pb-4 text-center">Lifecycle Dates</th>
                     <th className="pb-4 text-center">Audit Status</th>
                     <th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 shadow-sm">
                             {inv.id}
                          </span>
                       </td>
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm transition-transform group-hover:scale-105",
                                inv.color === "emerald" ? "bg-emerald-600 shadow-emerald-50" :
                                inv.color === "amber" ? "bg-amber-600 shadow-amber-50" :
                                inv.color === "rose" ? "bg-rose-600 shadow-rose-50" : "bg-slate-600 shadow-slate-50"
                             )}>
                                {inv.initial}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{inv.customer}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Primary Tenant</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <p className="text-[11px] font-bold text-slate-800 tracking-tight">{inv.amount}</p>
                       </td>
                       <td className="py-3 text-center">
                          <p className="text-[10px] font-bold text-slate-700 leading-tight">Issued: {inv.issued}</p>
                          <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Due: {inv.due}</p>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             inv.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                             inv.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                             inv.status === "Overdue" ? "bg-rose-50 text-rose-600 border-rose-100" :
                             "bg-slate-50 text-slate-600 border-slate-100"
                          )}>
                             {inv.status}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><Eye className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><Send className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><Download className="w-3.5 h-3.5" /></button>
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
    amber: "bg-amber-50 text-amber-600 border-amber-100", 
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
