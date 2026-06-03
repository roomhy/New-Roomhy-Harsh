import React from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Edit, Flag, LayoutGrid
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DateRangePill } from "../../components/dashboard/DateRangePill";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const allListings = [
  { id: "L-2548", title: "Green Villa Residency", type: "Villa", owner: "Rahul Sharma", loc: "Bangalore", price: "₹ 25,000", status: "Active", views: 1245, date: "20 May 2024", color: "blue" },
  { id: "L-2547", title: "Silver Heights PG", type: "PG", owner: "Priya Verma", loc: "Pune", price: "₹ 8,500", status: "Pending", views: 432, date: "20 May 2024", color: "amber" },
  { id: "L-2546", title: "Blue Bells Apartment", type: "Apartment", owner: "Amit Kumar", loc: "Hyderabad", price: "₹ 18,000", status: "Active", views: 876, date: "19 May 2024", color: "indigo" },
  { id: "L-2545", title: "Sunset Co-Living", type: "Co-Living", owner: "Neha Singh", loc: "Bangalore", price: "₹ 12,000", status: "Active", views: 1530, date: "19 May 2024", color: "emerald" },
  { id: "L-2544", title: "Maple House", type: "House", owner: "Vikram Patel", loc: "Chennai", price: "₹ 30,000", status: "Flagged", views: 198, date: "18 May 2024", color: "rose" },
  { id: "L-2543", title: "Royal Apartments", type: "Apartment", owner: "Sneha Iyer", loc: "Delhi", price: "₹ 22,000", status: "Active", views: 945, date: "17 May 2024", color: "purple" },
  { id: "L-2542", title: "Pearl Residency", type: "PG", owner: "Karan Mehta", loc: "Mumbai", price: "₹ 9,500", status: "Inactive", views: 234, date: "16 May 2024", color: "slate" },
];

export default function ReportsListings() {
  return (
    <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-bold text-slate-800 tracking-tight leading-none">Inventory Intelligence Hub</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-2">
            <span>Reports</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600">Property Performance</span>
         </div>
      </div>

      <p className="text-sm font-bold text-slate-400">Detailed performance audit of global property listings, market reach and engagement velocity.</p>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCardLarge label="Total Inventory" value="2,548" trend="+ 156 this month" up icon={Home} color="blue" />
        <StatCardLarge label="Active Listings" value="2,102" trend="82.6% Health" up icon={CheckCircle2} color="green" />
        <StatCardLarge label="Global Reach" value="128.5k" trend="+ 12.4% Views" up icon={Eye} color="indigo" />
        <StatCardLarge label="Flagged Assets" value="07" trend="Requires Audit" up={false} icon={Flag} color="red" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Property Ledger</h3>
            <div className="flex items-center gap-4">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input placeholder="Search properties..." className="bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-xs font-bold shadow-sm w-64 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" />
               </div>
               <button className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                  <Download className="w-4 h-4" /> Export Ledger
               </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
               <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-6">Property Identity</th>
                     <th className="pb-6">Listed Asset</th>
                     <th className="pb-6">Owner / Loc</th>
                     <th className="pb-6 text-center">Rental (₹)</th>
                     <th className="pb-6 text-center">Velocity (Views)</th>
                     <th className="pb-6 text-center">Status</th>
                     <th className="pb-6 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {allListings.map((l, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                       <td className="py-6">
                          <span className="text-xs font-mono bg-slate-50 text-slate-400 px-3 py-1.5 rounded-xl border border-slate-100 font-bold group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-md transition-all">
                             {l.id}
                          </span>
                       </td>
                       <td className="py-6">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg transition-transform group-hover:scale-110",
                                l.color === "blue" ? "bg-blue-600 shadow-blue-100" :
                                l.color === "amber" ? "bg-amber-600 shadow-amber-100" :
                                l.color === "indigo" ? "bg-indigo-600 shadow-indigo-100" :
                                l.color === "emerald" ? "bg-emerald-600 shadow-emerald-100" :
                                l.color === "rose" ? "bg-rose-600 shadow-rose-100" :
                                l.color === "purple" ? "bg-purple-600 shadow-purple-100" : "bg-slate-600"
                             )}>
                                <Building2 className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-800">{l.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{l.type}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-6">
                          <p className="text-xs font-bold text-slate-700">{l.owner}</p>
                          <div className="flex items-center gap-1 mt-1 opacity-70">
                             <MapPin className="w-3 h-3 text-slate-400" />
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{l.loc}</p>
                          </div>
                       </td>
                       <td className="py-6 text-center font-bold text-slate-800">
                          {l.price}
                       </td>
                       <td className="py-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                             <p className="text-base font-bold text-blue-600">{l.views}</p>
                             <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden"><div className="w-2/3 h-full bg-blue-500" /></div>
                          </div>
                       </td>
                       <td className="py-6 text-center">
                          <span className={cn(
                            "text-[9px] font-bold px-3 py-1 rounded-full border shadow-sm uppercase",
                            l.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                            l.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                            l.status === "Flagged" ? "bg-rose-50 text-rose-600 border-rose-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                             {l.status}
                          </span>
                       </td>
                       <td className="py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all">
                                <Edit className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md transition-all">
                                <Trash2 className="w-4 h-4" />
                             </button>
                             <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all">
                                <MoreVertical className="w-4 h-4" />
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
    green: "bg-emerald-600 shadow-emerald-200", 
    indigo: "bg-indigo-600 shadow-indigo-200", 
    red: "bg-rose-600 shadow-rose-200" 
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
