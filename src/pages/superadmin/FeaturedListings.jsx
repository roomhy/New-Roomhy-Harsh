import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Hourglass,
  Check, X, Eye, ClipboardCheck, AlertTriangle,
  Camera, Map, Star, Edit3, Trash, UserCheck,
  RefreshCw, Download, Inbox, CreditCard, Tag,
  BarChart3, Plus, Loader2, Calendar, IndianRupee,
  Sparkles, Megaphone
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function FeaturedListings() {
  const [listings, setListings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listData, propData] = await Promise.all([
        fetchJson("/api/featured"),
        fetchJson("/api/featured/available-properties")
      ]);
      if (listData.success) setListings(listData.data);
      if (propData.success) setProperties(propData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredListings = useMemo(() => {
    const q = search.toLowerCase();
    return listings.filter(l => l.propertyTitle.toLowerCase().includes(q));
  }, [listings, search]);

  const stats = useMemo(() => {
    const active = listings.filter(l => l.isActive && new Date(l.endDate) >= new Date()).length;
    const totalRev = listings.reduce((acc, l) => acc + (l.paymentAmount || 0), 0);
    return { total: listings.length, active, revenue: `₹ ${(totalRev / 1000).toFixed(1)}k`, boost: "+ 84%", topCity: "Kota", expiring: 12 };
  }, [listings]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <RefreshCw className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Visibility Vault...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">High-Velocity Visibility Ledger</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Growth</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500">Featured Inventory</span>
         </div>
      </div>

      <p className="text-sm font-bold text-slate-400">Manage promotional property slots, track visibility conversion and optimize exposure velocity for premium partners.</p>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Active Exposure" value={stats.active} trend="High Velocity" up icon={Megaphone} color="orange" />
        <StatCardLarge label="Conversion Boost" value={stats.boost} trend="+ 12.4% Pulse" up icon={Activity} color="green" />
        <StatCardLarge label="Visibility Yield" value={stats.revenue} trend="Premium Revenue" up icon={CreditCard} color="blue" />
        <StatCardLarge label="Awaiting Renewal" value={stats.expiring} trend="Needs Review" up={false} icon={Hourglass} color="indigo" />
      </div>

      {/* Main Exposure Card */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Visibility Control Center</h3>
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search visibility slots..." 
                    className="bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs font-bold shadow-sm w-64 outline-none focus:bg-white focus:ring-2 focus:ring-amber-100 transition-all" 
                  />
               </div>
               <button className="bg-amber-500 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all">
                  <Plus className="w-4 h-4" /> Add Slot
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-6">Property Profile</th>
                     <th className="pb-6 text-center">Exposure Timeline</th>
                     <th className="pb-6 text-center">Network Position</th>
                     <th className="pb-6 text-center">Commercial Settlement</th>
                     <th className="pb-6 text-center">Pulse Status</th>
                     <th className="pb-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredListings.map((l, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                                {l.propertyImage ? (
                                  <img src={l.propertyImage} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                                     <ImageIcon className="w-6 h-6" />
                                  </div>
                                )}
                             </div>
                             <div>
                                <p className="text-base font-bold text-slate-800">{l.propertyTitle}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{l.city} • Slot ID: {l._id?.substring(0,8).toUpperCase()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-6 text-center">
                          <div className="inline-flex flex-col items-center gap-1 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                <Calendar className="w-3.5 h-3.5 opacity-50" />
                                {new Date(l.startDate).toLocaleDateString("en-IN")}
                             </div>
                             <p className="text-[9px] text-slate-400 font-bold uppercase">To: {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                          </div>
                       </td>
                       <td className="py-6 text-center">
                          <span className="text-xs font-bold bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                             Position #{l.position || 0}
                          </span>
                       </td>
                       <td className="py-6 text-center">
                          <div className="flex flex-col items-center">
                             <p className="text-sm font-bold text-slate-800">₹ {l.paymentAmount?.toLocaleString()}</p>
                             <span className={cn(
                               "text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase mt-1.5 shadow-sm border",
                               l.paymentStatus === "paid" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-600 bg-amber-50 border-amber-100"
                             )}>
                                {l.paymentStatus}
                             </span>
                          </div>
                       </td>
                       <td className="py-6 text-center">
                          {new Date(l.endDate) < new Date() ? (
                            <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100 uppercase">Expired</span>
                          ) : l.isActive ? (
                            <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border-emerald-100 uppercase shadow-sm">Live Pulse</span>
                          ) : (
                            <span className="text-[9px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border-rose-100 uppercase">Offline</span>
                          )}
                       </td>
                       <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-md transition-all">
                                <Edit3 className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md transition-all">
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

function StatCardLarge({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    orange: "bg-amber-500 shadow-amber-200", 
    green: "bg-emerald-600 shadow-emerald-200", 
    blue: "bg-blue-600 shadow-blue-200", 
    indigo: "bg-indigo-600 shadow-indigo-200" 
  };
  
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-8 group hover:translate-y-[-8px] transition-all duration-500">
      <div className={cn("w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6", bgColors[color])}>
         <Icon className="w-10 h-10" />
      </div>
      <div>
         <p className="text-[11px] font-bold text-slate-400 uppercase mb-4 leading-none truncate">{label}</p>
         <p className="text-5xl font-bold text-slate-800 tracking-tighter leading-none">{value}</p>
      </div>
      <div className={cn(
        "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-2xl w-fit",
        up ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100"
      )}>
         {up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
         {trend}
      </div>
    </div>
  );
}
