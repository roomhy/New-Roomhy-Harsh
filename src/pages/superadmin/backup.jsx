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
  BarChart3, Plus, Loader2, Database, HardDrive,
  ShieldCheck, Cloud, Server, Archive, History,
  Sparkles, Layers, Box, Globe2
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function SuperadminBackup() {
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => ({
    total: "1.2k",
    used: "2.4 GB",
    health: "99.9%",
    lastSync: "2h ago",
    speed: "45MB/s",
    longevity: "30 Days"
  }), []);

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Data Continuity & Vault Hub</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Operational Integrity</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Infrastructure Backup & Recovery</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <p className="text-sm font-bold text-slate-400 max-w-2xl">Configure automated data archival strategies, monitor storage vault health and manage critical system recovery points in real-time.</p>
         <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Snapshot Hub
         </button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Vault Integrity" value="99.9%" trend="Optimal Health" up icon={ShieldCheck} color="green" />
        <StatCardLarge label="Archive Volume" value="1.2k" trend="+ 156 Delta" up icon={Archive} color="blue" />
        <StatCardLarge label="Storage Pulse" value="2.4GB" trend="24% Capacity" up icon={HardDrive} color="indigo" />
        <StatCardLarge label="Transfer Speed" value="45MB/s" trend="Optimized Flow" up icon={Zap} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Strategy Engine */}
         <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                     <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Archival Strategy Hub</h3>
               </div>
               <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full uppercase border border-emerald-100 shadow-sm">Automated Mode Pulse</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Frequency Velocity</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none">
                     <option>Every 24 Hours (Daily)</option>
                     <option>Weekly (Recommended)</option>
                     <option>Monthly Strategic Snapshot</option>
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Temporal Window (UTC)</label>
                  <input type="time" defaultValue="02:00" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
               </div>
            </div>

            <div className="space-y-8">
               <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Inclusion Intelligence Matrix</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Payments", "Owners", "Tenants", "Logs", "Properties", "System", "Settings", "Analytics"].map((mod) => (
                    <label key={mod} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-300">
                       <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-widest transition-colors">{mod}</span>
                       <div className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-600 transition-all">
                          <Check className="w-3 h-3 text-indigo-600 opacity-0 group-hover:opacity-100" />
                       </div>
                    </label>
                  ))}
               </div>
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50 flex justify-end">
               <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all">Commit Strategy Hub Changes</button>
            </div>
         </div>

         {/* Vault Metrics */}
         <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-10">Vault Capacity Index</h3>
            <div className="flex-1 space-y-10">
               <div className="relative pt-2">
                  <div className="flex mb-4 items-center justify-between">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">Storage Allocated</span>
                     <span className="text-sm font-bold text-blue-600">24% Pulse</span>
                  </div>
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-50 border border-slate-100 p-1">
                     <div style={{ width: "24%" }} className="shadow-lg flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 rounded-full transition-all duration-1000 shadow-blue-200"></div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest mt-4">2.4 GB / 10 GB Secure Cloud Fortress</p>
               </div>

               <div className="p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 space-y-5">
                  <div className="flex items-center gap-3 text-indigo-600">
                     <ShieldCheck className="w-6 h-6" />
                     <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Integrity Policy</p>
                  </div>
                  <p className="text-[10px] font-bold text-indigo-900 leading-relaxed uppercase tracking-tight opacity-70">
                     ALL ARCHIVES ARE RETAINED FOR A PROFESSIONAL INTERVAL OF 30 DAYS AUTOMATICALLY. ELITE ENCRYPTION IS ENABLED FOR ALL COLD STORAGE SNAPSHOTS BY DEFAULT.
                  </p>
               </div>
            </div>
            <button className="w-full mt-10 py-4 rounded-2xl bg-slate-50 text-[10px] font-bold uppercase text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">Audit Vault Policies</button>
         </div>
      </div>

      {/* History Ledger */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Vault Archival History Ledger</h3>
            <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Full System History</button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-6">Snapshot Identity</th>
                     <th className="pb-6">Archival Hub Logic</th>
                     <th className="pb-6 text-center">Data Velocity</th>
                     <th className="pb-6 text-center">Status Hub Index</th>
                     <th className="pb-6 text-right">Vault Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {[
                    { date: "Oct 24, 2025", time: "02:00 AM", type: "Automated Velocity", size: "128 MB", status: "Optimal", mods: "Payments, Users, Properties Hubs" },
                    { date: "Oct 17, 2025", time: "02:00 AM", type: "Automated Velocity", size: "125 MB", status: "Optimal", mods: "Payments, Users, Properties Hubs" },
                    { date: "Oct 15, 2025", time: "04:30 PM", type: "Manual Integrity", size: "124 MB", status: "Optimal", mods: "Full System Infrastructure Snapshot" }
                  ].map((b, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-6">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <History className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-800">{b.date}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{b.time}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-6">
                          <p className="text-xs font-bold text-slate-700">{b.type}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{b.mods}</p>
                       </td>
                       <td className="py-6 text-center">
                          <p className="text-xs font-bold text-slate-800">{b.size}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Snapshot Yield</p>
                       </td>
                       <td className="py-6 text-center">
                          <span className={cn(
                             "text-[9px] font-bold px-3.5 py-1.5 rounded-full border shadow-sm uppercase tracking-widest",
                             "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                             {b.status} Hub
                          </span>
                       </td>
                       <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all border border-slate-100 shadow-sm" title="Download">
                                <Download className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all border border-slate-100 shadow-sm" title="Restore">
                                <RefreshCw className="w-4 h-4" />
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
