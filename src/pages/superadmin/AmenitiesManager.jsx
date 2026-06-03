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
  BarChart3, Plus, Loader2, Wifi, Car, Utensils,
  WashingMachine, Fan, Tv, Sofa, ShieldCheck
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const iconMap = {
  wifi: Wifi, car: Car, utensils: Utensils, "washing-machine": WashingMachine,
  ac: Zap, fan: Fan, shield: ShieldCheck, bed: Home, tv: Tv, couch: Sofa,
  check: CheckCircle2
};

export default function AmenitiesManager() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAmenities = async () => {
    try {
      setLoading(true);
      const data = await fetchJson("/api/amenities");
      if (data.success) setAmenities(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAmenities(); }, []);

  const filteredAmenities = useMemo(() => {
    const q = search.toLowerCase();
    return amenities.filter(a => a.name.toLowerCase().includes(q));
  }, [amenities, search]);

  const stats = useMemo(() => {
    return { total: amenities.length, active: 42, premium: 12, coverage: "94%", popular: "WiFi", growth: "+ 2" };
  }, [amenities]);

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
               <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tight">Amenities Manager</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Standards {">"} Inventory Hub</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
               <input 
                 value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search amenities, categories..." 
                 className="bg-white border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold shadow-sm w-72 outline-none focus:border-indigo-500 transition-all" 
               />
            </div>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
               <Plus className="w-4 h-4" /> Add Amenity
            </button>
         </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
         <StatCardSmall label="Total Items" value={stats.total} trend="Standardized" up icon={Inbox} color="indigo" />
         <StatCardSmall label="Active Specs" value={stats.active} trend="Live Index" up icon={CheckCircle2} color="emerald" />
         <StatCardSmall label="Premium Plus" value={stats.premium} trend="High Flow" up icon={Star} color="amber" />
         <StatCardSmall label="Category Map" value={stats.coverage} trend="Elite" up icon={BarChart3} color="blue" />
         <StatCardSmall label="Most Popular" value={stats.popular} trend="Universal" up icon={Zap} color="emerald" />
         <StatCardSmall label="New Standards" value={stats.growth} trend="Updated" up icon={Clock} color="indigo" />
      </div>

      {/* Amenities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {loading ? (
            <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase tracking-widest">Accessing Standard Vault...</div>
         ) : filteredAmenities.map((a, i) => {
            const Icon = iconMap[a.icon] || CheckCircle2;
            return (
              <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl group hover:-translate-y-2 transition-all">
                 <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110">
                       <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1">
                       <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                          <Edit3 className="w-4 h-4" />
                       </button>
                       <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">{a.name}</h3>
                    <div className="flex items-center gap-2 mt-1 mb-4">
                       <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest">
                          {a.category}
                       </span>
                       <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border shadow-sm",
                          a.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                       )}>
                          {a.status}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed line-clamp-2">
                       {a.description || "Standard platform amenity provided to high-fidelity properties."}
                    </p>
                 </div>
              </div>
            );
         })}
         
         <button className="bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-indigo-600 hover:shadow-xl transition-all min-h-[180px]">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
               <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
               <h4 className="text-sm font-black text-slate-800 tracking-tight">Define Amenity</h4>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Scale Global Inventory</p>
            </div>
         </button>
      </div>
    </div>
  );
}

function StatCardSmall({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { indigo: "bg-indigo-600 shadow-indigo-200", emerald: "bg-emerald-500 shadow-emerald-200", amber: "bg-amber-500 shadow-amber-200", blue: "bg-blue-500 shadow-blue-200", rose: "bg-rose-500 shadow-rose-200" };
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
