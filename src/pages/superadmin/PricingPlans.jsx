import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Hourglass,
  Check, X, Eye, ClipboardCheck, AlertTriangle,
  Camera, Map, Star, Edit3, Trash, UserCheck,
  RefreshCw, Download, Inbox, CreditCard, Tag,
  BarChart3, Plus, Loader2
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PricingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await fetchJson("/api/pricing");
      if (data.success) setPlans(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const filteredPlans = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter(p => p.name.toLowerCase().includes(q));
  }, [plans, search]);

  const stats = useMemo(() => {
    return { total: plans.length, active: 142, revenue: "₹ 8.4L", avg: "₹ 4.2k", popularity: "92%", growth: "+ 12%" };
  }, [plans]);

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
               <Tag className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pricing Plans</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue {">"} Strategy Center</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
               <input 
                 value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search plans, features..." 
                 className="bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold shadow-sm w-72 outline-none focus:border-indigo-500 transition-all" 
               />
            </div>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
               <Plus className="w-4 h-4" /> Add Plan
            </button>
         </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
         <StatCardSmall label="Total Plans" value={stats.total} trend="Active Index" up icon={CreditCard} color="indigo" />
         <StatCardSmall label="Active Subs" value={stats.active} trend="+ 24 today" up icon={Users} color="emerald" />
         <StatCardSmall label="Plan Revenue" value={stats.revenue} trend="+ 14.2%" up icon={Zap} color="blue" />
         <StatCardSmall label="Avg Plan Value" value={stats.avg} trend="Stable" up icon={Activity} color="indigo" />
         <StatCardSmall label="Popularity" value={stats.popularity} trend="High Flow" up icon={Star} color="amber" />
         <StatCardSmall label="MRR Growth" value={stats.growth} trend="Elite" up icon={BarChart3} color="blue" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Revenue Strategy Ledger</h3>
            <div className="flex items-center gap-4">
               <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black text-slate-500 outline-none">
                  <option>All Tiers</option>
                  <option>Standard</option>
                  <option>Enterprise</option>
               </select>
               <button className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">
                  <Sheet className="w-4 h-4" /> Export Plans
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                     <th className="pb-6">Tier Identity</th>
                     <th className="pb-6">Plan Specification</th>
                     <th className="pb-6 text-center">Unit Price</th>
                     <th className="pb-6 text-center">Asset Limits</th>
                     <th className="pb-6 text-center">Market Index</th>
                     <th className="pb-6 text-center">Status</th>
                     <th className="pb-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="7" className="py-20 text-center text-slate-400 font-black uppercase tracking-widest">Accessing Revenue Vault...</td></tr>
                  ) : filteredPlans.map((p, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                {p.name.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-800">{p.name}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{p.billingCycle} cycle</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-6">
                          <div className="flex flex-wrap gap-1 max-w-[300px]">
                             {(p.features || []).slice(0, 3).map((f, idx) => (
                               <span key={idx} className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                                  {f}
                               </span>
                             ))}
                             {(p.features || []).length > 3 && (
                               <span className="text-[9px] font-black text-indigo-600">+{(p.features || []).length - 3} More</span>
                             )}
                          </div>
                       </td>
                       <td className="py-6 text-center">
                          <p className="text-sm font-black text-slate-800">₹ {p.price?.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">per period</p>
                       </td>
                       <td className="py-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                             <p className="text-xs font-black text-slate-700">{p.maxProperties} Properties</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.maxPhotos} Photo limit</p>
                          </div>
                       </td>
                       <td className="py-6 text-center">
                          {p.isPopular ? (
                            <span className="text-[9px] font-black px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest flex items-center justify-center gap-1 w-fit mx-auto shadow-sm">
                               <Star className="w-3 h-3 fill-amber-600" /> Best Seller
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-3 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-widest w-fit mx-auto">Standard</span>
                          )}
                       </td>
                       <td className="py-6 text-center">
                          <span className={cn(
                            "text-[9px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-widest",
                            p.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                             {p.status}
                          </span>
                       </td>
                       <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                <Edit3 className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all">
                                <Trash2 className="w-4 h-4" />
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

function StatCardSmall({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { indigo: "bg-indigo-600 shadow-indigo-200", emerald: "bg-emerald-500 shadow-emerald-200", amber: "bg-amber-500 shadow-amber-200", rose: "bg-rose-500 shadow-rose-200", blue: "bg-blue-500 shadow-blue-200" };
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg flex items-center gap-5 group hover:-translate-y-1 transition-all">
       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 transition-transform group-hover:scale-110", bgColors[color])}>
          <Icon className="w-7 h-7" />
       </div>
       <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
          <p className="text-2xl font-black text-slate-800 mb-0.5 truncate">{value}</p>
          <p className={cn("text-[9px] font-black", up ? "text-emerald-600" : "text-rose-600")}>{trend} {up ? "↑" : "↓"}</p>
       </div>
    </div>
  );
}

import { useMemo } from "react";
