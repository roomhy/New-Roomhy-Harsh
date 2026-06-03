import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, CreditCard, RefreshCw, Calculator,
  Receipt, FileText, Scale, LayoutGrid
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const taxes = [
  { id: "T-01", name: "GST", type: "Perc", rate: "18%", appliesTo: "All", region: "India", status: "Active" },
  { id: "T-02", name: "CGST", type: "Perc", rate: "9%", appliesTo: "Intra", region: "India", status: "Active" },
  { id: "T-03", name: "SGST", type: "Perc", rate: "9%", appliesTo: "Intra", region: "India", status: "Active" },
  { id: "T-04", name: "IGST", type: "Perc", rate: "18%", appliesTo: "Inter", region: "India", status: "Active" },
  { id: "T-05", name: "TDS", type: "Perc", rate: "10%", appliesTo: "Comm", region: "India", status: "Active" },
];

export default function Taxes() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Compliance Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regulatory Rulebook & Global Tax Liability Configurations</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
               <Plus className="w-3.5 h-3.5" /> Add Rule
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Total Collected" value="₹3.3L" trend="+15.6% Flux" up icon={Calculator} color="blue" />
        <StatCardHorizontal label="GST Revenue" value="₹2.7L" trend="Main Stream" up icon={Receipt} color="emerald" />
        <StatCardHorizontal label="Compliance SLA" value="99.8%" trend="Optimal" up icon={Shield} color="indigo" />
        <StatCardHorizontal label="Active Rules" value="05" trend="Platform Wide" up icon={Scale} color="blue" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Regulatory Registry</h3>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input placeholder="Search rules..." className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
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
                     <th className="pb-4">Rule Identity</th>
                     <th className="pb-4">Tax Profile</th>
                     <th className="pb-4 text-center">Velocity Segment</th>
                     <th className="pb-4 text-center">Operational Scope</th>
                     <th className="pb-4 text-center">Audit Status</th>
                     <th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {taxes.map((t, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shadow-sm transition-all group-hover:bg-slate-800 group-hover:text-white">
                             {t.id}
                          </span>
                       </td>
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-slate-800 group-hover:text-white transition-transform group-hover:scale-105">
                                {t.name.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight">{t.name}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t.region} Jurisdiction</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <p className="text-[11px] font-bold text-slate-800 tracking-tight">{t.rate}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 opacity-70">{t.type}</p>
                       </td>
                       <td className="py-3 text-center">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 uppercase shadow-sm group-hover:bg-white">
                             {t.appliesTo}
                          </span>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             t.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                             {t.status}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 transition-all border border-slate-100 shadow-sm"><Eye className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-800 transition-all border border-slate-100 shadow-sm"><MoreVertical className="w-3.5 h-3.5" /></button>
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
