import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, RefreshCw,
  LayoutGrid, ShieldCheck, Fingerprint, Check, X,
  Eye, ShieldAlert, Activity, CreditCard, Download,
  Smartphone, Monitor, AlertCircle, Sparkles,
  BarChart3, Layers, Database, Lock
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const recentLogs = [
  { user: "Aman", email: "admin@roomhy.com", role: "Super Admin", date: "Oct 24", time: "10:30 AM", ip: "192.168.1.45", device: "Chrome (Win)", status: "Success", color: "blue" },
  { user: "Rajesh Kumar", email: "PO-BLR-089", role: "Owner", date: "Oct 24", time: "09:15 AM", ip: "10.0.0.12", device: "Safari (iOS)", status: "Success", color: "indigo" },
  { user: "Security Watch", email: "suresh.r@gmail.com", role: "Visitor", date: "Oct 23", time: "11:45 PM", ip: "45.22.19.110", device: "Firefox (Linux)", status: "Failed", color: "rose" },
  { user: "Aman", email: "admin@roomhy.com", role: "Super Admin", date: "Oct 23", time: "05:20 PM", ip: "192.168.1.45", device: "Chrome (Win)", status: "Success", color: "blue" },
];

export default function Log() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Governance Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Integrity & Global Administrative Audit Pulse</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
               <Download className="w-3.5 h-3.5" /> Export Audit
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Access Velocity" value="1.2k" trend="+15.6% Flux" up icon={Zap} color="blue" />
        <StatCardHorizontal label="Success Index" value="98.8%" trend="Optimal" up icon={ShieldCheck} color="emerald" />
        <StatCardHorizontal label="Security Alerts" value="03" trend="Audit Required" up={false} icon={ShieldAlert} color="amber" />
        <StatCardHorizontal label="Active Pulse" value="142" trend="Live Sync" up icon={Activity} color="indigo" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Audit Trail Intelligence</h3>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="Search trails..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
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
                     <th className="pb-4">Administrative Identity</th>
                     <th className="pb-4">Jurisdiction</th>
                     <th className="pb-4 text-center">Temporal Index</th>
                     <th className="pb-4 text-center">Network Signature</th>
                     <th className="pb-4 text-center">Fingerprint</th>
                     <th className="pb-4 text-center">Security Status</th>
                     <th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {recentLogs.map((l, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm transition-transform group-hover:scale-105",
                                l.color === "blue" ? "bg-blue-600 shadow-blue-50" :
                                l.color === "indigo" ? "bg-indigo-600 shadow-indigo-50" : "bg-rose-600 shadow-rose-50"
                             )}>
                                {l.user.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{l.user}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{l.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-3">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 uppercase tracking-widest shadow-sm">
                             {l.role}
                          </span>
                       </td>
                       <td className="py-3 text-center">
                          <div className="inline-flex flex-col items-center">
                             <p className="text-[10px] font-bold text-slate-800 leading-tight">{l.date}</p>
                             <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{l.time}</p>
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <p className="inline-block text-[8px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                             {l.ip}
                          </p>
                       </td>
                       <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                             {l.device.includes('Chrome') ? <Monitor className="w-3.5 h-3.5 opacity-30" /> : <Smartphone className="w-3.5 h-3.5 opacity-30" />}
                             <span className="truncate max-w-[80px]">{l.device}</span>
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             l.status === "Success" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                             {l.status === "Success" ? "Optimal" : "Breached"}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
                             <Eye className="w-3.5 h-3.5" />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Live Sync Enabled</p>
            </div>
            <div className="flex items-center gap-2">
               <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-white hover:shadow-md transition-all border border-slate-100 group">
                  <ChevronRight className="w-3.5 h-3.5 rotate-180 group-hover:scale-110 transition-transform" />
               </button>
               <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-[10px] shadow-sm">1</button>
                  <button className="w-8 h-8 rounded-lg text-slate-400 font-bold text-[10px] hover:text-blue-600 transition-colors">2</button>
               </div>
               <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-white hover:shadow-md transition-all border border-slate-100 group">
                  <ChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
               </button>
            </div>
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
