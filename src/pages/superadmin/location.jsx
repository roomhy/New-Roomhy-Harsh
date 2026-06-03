import React, { useEffect, useMemo, useState } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Hourglass,
  Check, X, Eye, ClipboardCheck, AlertTriangle,
  Camera, Map, Star, Edit3, Trash, RefreshCw,
  Sparkles, Layers, Box, Globe2, IndianRupee,
  Navigation, Compass, Plus, Loader2, Save
} from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function SuperadminLocation() {
  const [tab, setTab] = useState("cities");
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLocations = async () => {
    try {
      setLoading(true);
      const [citiesData, areasData] = await Promise.all([
        fetchJson("/api/locations/cities"),
        fetchJson("/api/locations/areas")
      ]);
      setCities(citiesData?.data || []);
      setAreas(areasData?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLocations(); }, []);

  const stats = useMemo(() => {
    return { totalCities: cities.length, totalAreas: areas.length, density: "High", topGrowth: "Kota Hub" };
  }, [cities, areas]);

  const activeList = tab === "cities" ? cities : areas;
  const filteredList = activeList.filter(item => (item.name || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Geospatial Intelligence</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Territorial Expansion & Regional Asset Density Ledger</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
               <Plus className="w-3.5 h-3.5" /> Provision Territory
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal label="Global Cities" value={stats.totalCities} trend="Sovereign Index" up icon={Navigation} color="blue" />
        <StatCardHorizontal label="Operational Areas" value={stats.totalAreas} trend="Granular Hubs" up icon={MapPin} color="indigo" />
        <StatCardHorizontal label="Asset Density" value={stats.density} trend="Market Leader" up icon={Building2} color="emerald" />
        <StatCardHorizontal label="Growth Velocity" value={stats.topGrowth} trend="High Flux" up icon={Zap} color="amber" />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Sovereignty Ledger</h3>
               <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {["cities", "areas"].map(f => (
                    <button 
                      key={f} onClick={() => setTab(f)}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all",
                        tab === f ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                       {f === "cities" ? "Cities" : "Areas"}
                    </button>
                  ))}
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search territory..." 
                    className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                  />
               </div>
               <button onClick={loadLocations} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100">
                  <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Territory Identity</th>
                     <th className="pb-4">Jurisdictional Context</th>
                     <th className="pb-4 text-center">Geography Preview</th>
                     <th className="pb-4 text-center">Status Hub</th>
                     <th className="pb-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="5" className="py-20 text-center">
                       <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2 opacity-20" />
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Accessing Geographic Vault...</p>
                    </td></tr>
                  ) : filteredList.map((item, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                       <td className="py-3">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105 shrink-0">
                                {item.name?.charAt(0).toUpperCase()}
                             </div>
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[150px]">{item.name || "Unknown Territory"}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">ID: {item._id?.substring(0,8).toUpperCase()}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-3">
                          <p className="text-[10px] font-bold text-slate-700 leading-tight">{tab === "cities" ? item.state : (item.cityName || item.city?.name)}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-70">{tab === "cities" ? "Regional Hub" : "Metropolitan Hub"}</p>
                       </td>
                       <td className="py-3 text-center">
                          <div className="w-14 h-8 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden mx-auto shadow-sm group-hover:scale-110 transition-transform relative">
                             {item.imageUrl ? (
                               <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-slate-200">
                                  <ImageIcon className="w-3.5 h-3.5" />
                               </div>
                             )}
                          </div>
                       </td>
                       <td className="py-3 text-center">
                          <span className={cn(
                             "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                             "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                             {item.status || "Active Hub"}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><Edit3 className="w-3.5 h-3.5" /></button>
                             <button className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
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
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
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
