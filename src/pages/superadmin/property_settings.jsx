import React, { useState } from "react";
import { 
  Settings2, ShieldCheck, Camera, FileCheck, 
  Tag, Clock, Coins, Layers, Search, 
  ChevronRight, RefreshCw, Save, Activity,
  ArrowUpRight, ArrowDownRight, Zap, ListChecks,
  AlertCircle
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function Toggle({ on = false, onChange }) {
  return (
    <button 
      onClick={onChange}
      className={cn(
        "relative w-8 h-4.5 rounded-full transition-all duration-300 outline-none shadow-inner",
        on ? "bg-blue-600" : "bg-slate-200"
      )}
    >
      <div className={cn(
        "absolute top-0.5 h-3.5 w-3.5 bg-white rounded-full shadow-md transition-all duration-300",
        on ? "translate-x-4" : "translate-x-0.5"
      )} />
    </button>
  );
}

export default function PropertySettings() {
  const [rules, setRules] = useState([
    { title: "Auto Approve Listings", sub: "Skip manual audit for verified owners", on: false, icon: Zap },
    { title: "Require Property Photos", sub: "Minimum 3 photos per unique listing", on: true, icon: Camera },
    { title: "Verify Owner Documents", sub: "Mandatory KYC for new onboarding", on: true, icon: ShieldCheck },
    { title: "Allow Negotiable Pricing", sub: "Show 'Negotiable' badge on listings", on: true, icon: Tag },
  ]);

  const toggleRule = (idx) => {
    const newRules = [...rules];
    newRules[idx].on = !newRules[idx].on;
    setRules(newRules);
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Governance Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Property Protocols & Business Logic Configuration Matrix</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
               <Save className="w-3.5 h-3.5" /> Save Configuration
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="System Rules" value={rules.length} trend="Active Protocols" up icon={ListChecks} color="blue" />
        <StatCardHorizontal label="Policy Compliance" value={rules.filter(r => r.on).length} trend="Verified SLA" up icon={FileCheck} color="emerald" />
        <StatCardHorizontal label="Asset Capacity" value="50 Slots" trend="Per Portfolio" up icon={Layers} color="indigo" />
        <StatCardHorizontal label="Governance Pulse" value="100%" trend="Optimal Logic" up icon={Activity} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Listing Protocols */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm"><Settings2 className="w-4.5 h-4.5" /></div>
              <div>
                 <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Operational Protocols</h3>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Define automated business intelligence logic</p>
              </div>
           </div>
           
           <div className="space-y-3">
              {rules.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300">
                    <div className="flex items-center gap-3 min-w-0">
                       <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all shadow-sm group-hover:scale-105 group-hover:rotate-3", 
                          s.on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-300 border-slate-100"
                       )}>
                          <Icon className="w-4.5 h-4.5" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 leading-tight">{s.title}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60 truncate">{s.sub}</p>
                       </div>
                    </div>
                    <Toggle on={s.on} onChange={() => toggleRule(i)} />
                  </div>
                )
              })}
           </div>
        </div>

        {/* Global Constraints */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm"><Layers className="w-4.5 h-4.5" /></div>
              <div>
                 <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Global Constraints</h3>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Configure platform-wide threshold parameters</p>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Portfolio Listing Cap", val: "50", icon: Layers },
                { label: "Max Media Per Asset", val: "20", icon: Camera },
                { label: "Ceiling Price (₹)", val: "10,00,000", icon: Coins },
                { label: "Floor Price (₹)", val: "1,000", icon: Activity },
                { label: "Asset Expiry (Days)", val: "90", icon: Clock },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5 pl-1 leading-none">
                       <Icon className="w-3 h-3 opacity-60" /> {f.label}
                    </label>
                    <input defaultValue={f.val} className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                  </div>
                )
              })}
           </div>

           <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4 group">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-amber-100 transition-transform group-hover:scale-105 group-hover:rotate-3">
                 <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-amber-900 leading-tight">Optimization Note</p>
                 <p className="text-[8px] font-bold text-amber-600/80 uppercase tracking-widest mt-1.5 leading-relaxed">System parameters configured here apply to all new assets deployed from the next audit cycle. Existing assets maintain historical thresholds unless manually overridden.</p>
              </div>
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
