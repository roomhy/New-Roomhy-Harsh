import React from "react";
import { 
  AlertTriangle, Shield, ShieldAlert, CheckCircle2, 
  Eye, Check, X, Search, Filter, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers,
  ChevronRight, Clock, ShieldCheck, Activity
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const reports = [
  { id: "R-1248", listing: "Maple House", reporter: "user_4521", reason: "Misleading photos", category: "Spam", date: "20 May", status: "Pending", color: "blue" },
  { id: "R-1247", listing: "Green Oasis", reporter: "user_1289", reason: "Fake pricing details", category: "Spam", date: "20 May", status: "Pending", color: "emerald" },
  { id: "R-1246", listing: "City Center Apt", reporter: "user_8742", reason: "Inappropriate content", category: "Inappropriate", date: "19 May", status: "Resolved", color: "indigo" },
  { id: "R-1245", listing: "Skyline View", reporter: "user_3214", reason: "Duplicate listing", category: "Spam", date: "19 May", status: "Resolved", color: "amber" },
  { id: "R-1244", listing: "Garden Residency", reporter: "user_9821", reason: "Owner unresponsive", category: "Other", date: "18 May", status: "Resolved", color: "rose" },
];

export default function Moderation() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Moderation Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Content Integrity & Automated Auditor Protocol Governance Matrix</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
               <ShieldCheck className="w-3.5 h-3.5" /> Global Audit Pulse
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Total Reports" value="14" trend="+3 Priority" up icon={AlertTriangle} color="amber" />
        <StatCardHorizontal label="Spam Shield" value="06" trend="Priority Review" up icon={Shield} color="rose" />
        <StatCardHorizontal label="Violation Pulse" value="04" trend="Manual Audit" up icon={ShieldAlert} color="indigo" />
        <StatCardHorizontal label="Resolved Yield" value="28" trend="+8 This Cycle" up icon={CheckCircle2} color="emerald" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Moderation Ledger</h3>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="Search reports..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
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
                     <th className="pb-4">Report Identity Hub</th>
                     <th className="pb-4">Asset Pulse</th>
                     <th className="pb-4">Reporter Insight</th>
                     <th className="pb-4">Category Index</th>
                     <th className="pb-4">Status Index</th>
                     <th className="pb-4 text-right">Audit Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {reports.map((r, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <p className="text-[11px] font-bold text-blue-600 leading-tight">#{r.id}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{r.date} Cycle</p>
                       </td>
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-[10px] shadow-sm shrink-0 transition-transform group-hover:scale-105",
                                r.color === "blue" ? "bg-blue-600" :
                                r.color === "emerald" ? "bg-emerald-600" :
                                r.color === "indigo" ? "bg-indigo-600" :
                                r.color === "amber" ? "bg-amber-600" : "bg-rose-600"
                             )}>
                                {r.listing.charAt(0)}
                             </div>
                             <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[120px]">{r.listing}</p>
                          </div>
                       </td>
                       <td className="py-3">
                          <p className="text-[10px] font-bold text-slate-800 leading-none">{r.reporter}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[180px] mt-1">{r.reason}</p>
                       </td>
                       <td className="py-3">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             r.category === "Spam" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                          )}>
                             {r.category}
                          </span>
                       </td>
                       <td className="py-3">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             r.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                             {r.status}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all border border-slate-100 shadow-sm"><Check className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"><X className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><Eye className="w-3.5 h-3.5" /></button>
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
    amber: "bg-amber-50 text-amber-600 border-amber-100", 
    rose: "bg-rose-50 text-rose-600 border-rose-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100" 
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
