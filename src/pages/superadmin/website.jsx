import React, { useEffect, useState, useMemo } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Hourglass,
  Check, X, Eye, ClipboardCheck, AlertTriangle,
  Camera, Map, Star, Edit3, Trash, UserCheck,
  RefreshCw, Download, Inbox, CreditCard, Tag,
  BarChart3, Plus, Loader2, Sparkles, Flag, IndianRupee,
  ShieldAlert, ListChecks, FolderTree, FileText,
  Layers, Globe2, LayoutGrid, Save
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import { fetchJson } from "../../utils/api";
import { loadApprovedProperties, updateApprovedPropertyVisibility } from "../../utils/approvedProperties";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const overviewData = Array.from({ length: 7 }, (_, i) => ({
  name: `${1 + i * 5} May`,
  total: 1900 + i * 90,
  active: 1300 + i * 70,
  deactivated: 50 + i * 25,
}));

export default function Website() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await loadApprovedProperties({ includeOffline: true });
      setProperties(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const total = properties.length;
    const active = properties.filter(p => p.isLiveOnWebsite).length;
    const pending = properties.filter(p => p.status === 'pending' || !p.isLiveOnWebsite && p.status !== 'flagged').length;
    const flagged = properties.filter(p => p.status === 'flagged').length;
    return { total, active, pending, flagged, views: "128k", conversion: "12.4%" };
  }, [properties]);

  const byStatus = useMemo(() => [
    { name: "Active Flow", value: stats.active, color: "#10B981" },
    { name: "Pending Hub", value: stats.pending, color: "#F59E0B" },
    { name: "Flagged Protocol", value: stats.flagged, color: "#EF4444" },
    { name: "Inactive Matrix", value: Math.max(0, stats.total - stats.active - stats.pending - stats.flagged), color: "#64748B" },
  ], [stats]);

  const filteredProperties = useMemo(() => {
    const q = search.toLowerCase();
    return properties.filter(p => (p.property_name || "").toLowerCase().includes(q) || (p.city || "").toLowerCase().includes(q));
  }, [properties, search]);

  if (loading) {
    return (
      <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accessing Marketplace Pulse...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Marketplace Performance Hub</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Digital Assets</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Website Visibility & Conversion</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <p className="text-sm font-bold text-slate-400 max-w-2xl">Monitor platform-wide marketplace exposure, audit live digital listings and manage public visibility protocols with real-time conversion intelligence.</p>
         <button className="bg-slate-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all flex items-center gap-2">
            <Globe2 className="w-4 h-4" /> Sync Marketplace Feed
         </button>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Marketplace Views" value={stats.views} trend="Elite Exposure" up icon={Eye} color="blue" />
        <StatCardLarge label="Conversion Pulse" value={stats.conversion} trend="+ 12.4% Yield" up icon={Activity} color="green" />
        <StatCardLarge label="Live Asset Hub" value={stats.active} trend="Active Flow" up icon={Globe2} color="indigo" />
        <StatCardLarge label="Audit Queue" value={stats.pending} trend="Action Required" up={false} icon={Hourglass} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visibility Velocity Chart */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Visibility Velocity Matrix</h3>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-100" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Exposure</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-100" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Velocity</span>
                 </div>
              </div>
           </div>
           <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={20} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}} />
                    <Area type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="active" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Status Segmentation */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center">
           <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-10 w-full text-center">Status Hub Portfolio</h3>
           <div className="relative w-64 h-64 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={byStatus} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                       {byStatus.map((e, i) => <Cell key={i} fill={e.color} className="drop-shadow-lg" />)}
                    </Pie>
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <p className="text-5xl font-bold text-slate-800 tracking-tighter leading-none">{stats.total}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest opacity-60">Global Assets</p>
              </div>
           </div>
           <div className="w-full grid grid-cols-1 gap-4">
              {byStatus.map(item => (
                <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{item.name}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-800">{item.value}</span>
                      <span className="text-[9px] font-bold text-slate-400 px-2 py-0.5 bg-white rounded-lg border border-slate-100 uppercase tracking-tighter">Units</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Digital Asset Audit Ledger */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Digital Asset Audit Ledger</h3>
            <div className="flex items-center gap-4">
               <div className="relative group w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search digital assets..." 
                    className="bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold shadow-sm w-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" 
                  />
               </div>
               <button onClick={loadData} className="p-3.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all border border-slate-100">
                  <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-6">Asset Identity</th>
                     <th className="pb-6">Strategic Context</th>
                     <th className="pb-6 text-center">Rental Valuation Hub</th>
                     <th className="pb-6 text-center">Status Hub Index</th>
                     <th className="pb-6 text-center">Marketplace Visibility</th>
                     <th className="pb-6 text-right">Audit Protocols</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredProperties.slice(0, 15).map((l, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-6">
                          <div className="flex items-center gap-5">
                             <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-blue-600 flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl transition-all">
                                {(l.property_name || "A").charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <p className="text-base font-bold text-slate-800">{l.property_name || "Digital Asset"}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest leading-none">{l.property_type || "Marketplace Listing"}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-6">
                          <p className="text-sm font-bold text-slate-700">{l.locality}, {l.city}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest opacity-60">Owner Hub: {l.owner_name || "System"}</p>
                       </td>
                       <td className="py-6 text-center">
                          <p className="text-base font-bold text-slate-800 tracking-tighter">₹ {l.monthlyRent?.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Rental Yield</p>
                       </td>
                       <td className="py-6 text-center">
                          <span className={cn(
                             "text-[9px] font-bold px-3.5 py-1.5 rounded-full border shadow-sm uppercase tracking-widest",
                             l.status === 'live' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50" : "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50"
                          )}>
                             {l.status === 'live' ? 'Active Flow' : 'Pending Audit'}
                          </span>
                       </td>
                       <td className="py-6 text-center">
                          <button className={cn(
                             "px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase transition-all shadow-xl border tracking-widest",
                             l.isLiveOnWebsite ? "bg-blue-600 text-white border-blue-500 shadow-blue-200" : "bg-slate-50 text-slate-400 border-slate-100 shadow-none"
                          )}>
                             {l.isLiveOnWebsite ? 'Hub Online' : 'Hub Offline'}
                          </button>
                       </td>
                       <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button className="p-3.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all border border-slate-100 shadow-sm">
                                <Edit3 className="w-5 h-5" />
                             </button>
                             <button className="p-3.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md transition-all border border-slate-100 shadow-sm">
                                <Trash2 className="w-5 h-5" />
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
    blue: "bg-blue-600 shadow-blue-200", 
    indigo: "bg-indigo-600 shadow-indigo-200", 
    green: "bg-emerald-600 shadow-emerald-200", 
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
