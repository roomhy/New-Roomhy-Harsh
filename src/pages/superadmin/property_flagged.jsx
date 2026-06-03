import React from "react";
import { 
  Flag, AlertTriangle, ShieldAlert, CheckCircle2, 
  Eye, Trash2, Check, Search, Filter, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers,
  ChevronRight, Clock, ShieldCheck, Activity
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const flagged = [
  { id: "L-2544", title: "Maple House", owner: "Vikram Patel", loc: "Chennai", reason: "Misleading photos", reports: 5, flagged: "18 May", status: "Flagged", color: "blue" },
  { id: "L-2520", title: "Green Oasis", owner: "Suresh Kumar", loc: "Bangalore", reason: "Spam content", reports: 8, flagged: "16 May", status: "Flagged", color: "emerald" },
  { id: "L-2515", title: "City Center Apt", owner: "Pooja Gupta", loc: "Delhi", reason: "Inappropriate content", reports: 3, flagged: "15 May", status: "Flagged", color: "indigo" },
  { id: "L-2498", title: "Skyline View", owner: "Rajesh Verma", loc: "Mumbai", reason: "Duplicate listing", reports: 2, flagged: "14 May", status: "Flagged", color: "amber" },
  { id: "L-2487", title: "Garden Residency", owner: "Anita Joshi", loc: "Pune", reason: "Fake pricing", reports: 6, flagged: "12 May", status: "Flagged", color: "rose" },
];

export default function FlaggedListings() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Violation Citadel</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">High-Risk Asset Governance & Platform Content Integrity Protocol Matrix</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
               <ShieldAlert className="w-3.5 h-3.5" /> Emergency Lock
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Flagged Assets" value="18" trend="+5 Priority" up icon={Flag} color="rose" />
        <StatCardHorizontal label="Spam Pulse" value="06" trend="High Velocity" up icon={ShieldAlert} color="amber" />
        <StatCardHorizontal label="Violation Index" value="04" trend="Manual Audit" up icon={AlertTriangle} color="indigo" />
        <StatCardHorizontal label="Resolved Yield" value="28" trend="+12% Alpha" up icon={CheckCircle2} color="emerald" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Violation Registry</h3>
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
                     <th className="pb-4">Asset Identity Hub</th>
                     <th className="pb-4">Stakeholder</th>
                     <th className="pb-4">Violation Root</th>
                     <th className="pb-4 text-center">Pulse Density</th>
                     <th className="pb-4">Pulse Status</th>
                     <th className="pb-4 text-right">Audit Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {flagged.map((r, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0 transition-transform group-hover:scale-105",
                                r.color === "blue" ? "bg-blue-600 shadow-blue-50" :
                                r.color === "indigo" ? "bg-indigo-600 shadow-indigo-50" :
                                r.color === "amber" ? "bg-amber-600 shadow-amber-50" :
                                r.color === "rose" ? "bg-rose-600 shadow-rose-50" : "bg-emerald-600 shadow-emerald-50"
                             )}>
                                {r.title.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{r.title}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{r.loc} • ID-{r.id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-3 text-[10px] font-bold text-slate-800">{r.owner}</td>
                       <td className="py-3">
                          <p className="text-[10px] font-bold text-slate-600 leading-none">{r.reason}</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60 leading-none">{r.flagged} Cycle</p>
                       </td>
                       <td className="py-3 text-center">
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 shadow-sm">{r.reports} Reports</span>
                       </td>
                       <td className="py-3">
                          <span className="text-[7px] font-bold px-2 py-0.5 rounded-lg border border-amber-100 bg-amber-50 text-amber-600 uppercase tracking-wider shadow-sm">Audit Active</span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all border border-slate-100 shadow-sm"><Check className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
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
    rose: "bg-rose-50 text-rose-600 border-rose-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100", 
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
