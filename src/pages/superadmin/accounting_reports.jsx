import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, CreditCard, RefreshCw, Calculator,
  Receipt, FileText, Scale, LayoutGrid, FileBarChart,
  Send, Database, Calendar
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const reports = [
  { name: "Revenue Report", desc: "Detailed revenue breakdown", icon: IndianRupee, color: "blue" },
  { name: "Commission Report", desc: "Fee earnings overview", icon: Database, color: "emerald" },
  { name: "Payouts Report", desc: "Owner settlement logs", icon: Send, color: "amber" },
  { name: "Refunds Report", desc: "Processed refund history", icon: RotateCcw, color: "rose" },
  { name: "Tax Report", desc: "Tax collection details", icon: Calculator, color: "indigo" },
  { name: "P&L Statement", desc: "Fiscal performance overview", icon: FileBarChart, color: "emerald" },
];

const generated = [
  { name: "May 2025 Revenue", date: "26 May", size: "2.4 MB", format: "PDF" },
  { name: "Q1 2025 P&L", date: "31 Mar", size: "1.8 MB", format: "Excel" },
  { name: "April 2025 Tax", date: "01 May", size: "1.2 MB", format: "PDF" },
  { name: "April 2025 Comm", date: "01 May", size: "856 KB", format: "Excel" },
];

export default function AccountingReports() {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Reports Engine</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Fiscal Documentation & Automated Reporting Intelligence Matrix</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
               <RefreshCw className="w-3.5 h-3.5" /> Refresh Assets
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Generated" value="1,245" trend="+58 Delta" up icon={FileText} color="blue" />
        <StatCardHorizontal label="Schedules" value="12 Active" trend="Automated" up icon={Calendar} color="emerald" />
        <StatCardHorizontal label="Data Density" value="98.8%" trend="Optimal" up icon={Database} color="indigo" />
        <StatCardHorizontal label="Sync Status" value="Active" trend="Cloud Live" up icon={Zap} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Reports Grid */}
         <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg shadow-slate-200/50 group hover:translate-y-[-2px] transition-all">
                 <div className="flex items-start gap-4 mb-6">
                    <div className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105",
                       r.color === "blue" ? "bg-blue-50 text-blue-600 border-blue-100" :
                       r.color === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                       r.color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" :
                       r.color === "rose" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    )}>
                       <r.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                       <h4 className="text-[11px] font-bold text-slate-800 leading-none mb-1.5">{r.name}</h4>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-tight">{r.desc}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="flex-1 bg-slate-50 text-slate-500 border border-slate-100 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-white hover:border-blue-100 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                       <Calendar className="w-3 h-3" /> Schedule
                    </button>
                    <button className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-slate-200">
                       <Download className="w-3 h-3" /> Generate
                    </button>
                 </div>
              </div>
            ))}
         </div>

         {/* Recently Generated */}
         <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none mb-8">Recently Generated</h3>
            <div className="space-y-4">
               {generated.map((g, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm group-hover:scale-105 transition-transform"><FileBarChart className="w-4 h-4" /></div>
                       <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 leading-tight truncate">{g.name}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">{g.date} • {g.size}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                          "text-[7px] font-bold px-1.5 py-0.5 rounded-lg border uppercase tracking-wider",
                          g.format === "PDF" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                       )}>{g.format}</span>
                       <button className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Download className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-slate-50 text-slate-400 text-[8px] font-bold uppercase tracking-widest hover:bg-white border border-slate-50 hover:border-slate-100 transition-all shadow-sm">View Vault History</button>
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

function IndianRupee(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3" />
      <path d="M9 13c6.667 0 6.667-10 0-10" />
    </svg>
  );
}
