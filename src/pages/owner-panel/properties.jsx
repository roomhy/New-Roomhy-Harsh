import React from "react";
import OwnerLayout from "../../components/OwnerLayout";
import { Building2, MapPin, Users, IndianRupee, Plus, MoreVertical, TrendingUp, ArrowUpRight, LayoutGrid, List, Sparkles } from "lucide-react";

export default function OwnerProperties() {
  const properties = [
    { name: "Roomhy Residency", location: "Sector 62, Noida", units: "45 Units", occupancy: "98%", revenue: "₹4.5L", status: "Active", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&q=80" },
    { name: "Blue Heights", location: "DLF Phase 3, Gurgaon", units: "32 Units", occupancy: "92%", revenue: "₹3.2L", status: "Active", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80" },
    { name: "The Urban Stay", location: "Koramangala, Bangalore", units: "28 Units", occupancy: "88%", revenue: "₹2.8L", status: "Under Review", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&q=80" },
  ];

  return (
    <OwnerLayout 
      title="My Properties"
      subtitle="View and manage all your hostel locations here."
    >
      <div className="space-y-12">
        <div className="flex items-center justify-between gap-6 mb-8">
           <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
              <button className="p-3 bg-white shadow-xl shadow-slate-200 rounded-xl text-indigo-600 transition-all"><LayoutGrid size={20} /></button>
              <button className="p-3 text-slate-400 hover:text-slate-600 transition-all"><List size={20} /></button>
           </div>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2 group italic uppercase tracking-widest">
             <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
             Register Asset
           </button>
        </div>

        {/* Portfolio Grid - Luxury Style - More Dense */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((p, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-700 group relative">
               {/* Property Image with Overlay */}
               <div className="relative h-[180px] overflow-hidden">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest backdrop-blur-md border ${
                       p.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                     }`}>{p.status}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <h4 className="text-xl font-black text-white italic tracking-tighter mb-0.5">{p.name}</h4>
                     <div className="flex items-center gap-1.5 text-slate-300 text-[9px] font-bold uppercase tracking-widest">
                        <MapPin size={10} className="text-indigo-400" /> {p.location}
                     </div>
                  </div>
                  <button className="absolute top-4 right-4 w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all duration-500">
                     <MoreVertical size={16} />
                  </button>
               </div>

               {/* Property Intelligence Stats */}
               <div className="p-6">
                  <div className="grid grid-cols-3 gap-3">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Asset Revenue</p>
                        <p className="text-xl font-black text-indigo-600 italic tracking-tighter">{p.revenue}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Occupancy</p>
                        <p className="text-xl font-black text-slate-900 italic tracking-tighter">{p.occupancy}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-1">MoM Growth</p>
                        <div className="flex items-center gap-1.5 text-emerald-500 font-black text-base italic">
                           <ArrowUpRight size={14} /> 12%
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex -space-x-1.5">
                        {[...Array(4)].map((_, idx) => (
                           <div key={idx} className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[7px] font-black text-slate-400 overflow-hidden">
                              <img src={`https://i.pravatar.cc/100?img=${idx + 10}`} alt="Resident" />
                           </div>
                        ))}
                     </div>
                     <button className="px-5 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm border border-indigo-100">
                        Analytics
                     </button>
                  </div>
               </div>
            </div>
          ))}

          {/* Add New Property Empty State Card - Smaller */}
          <div className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-700 h-[350px]">
             <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:rotate-12 transition-all duration-700 mb-6">
                <Plus size={28} />
             </div>
             <h4 className="text-xl font-black text-slate-900 italic mb-2 tracking-tight">Expand Portfolio</h4>
             <p className="text-[10px] text-slate-500 font-black max-w-[180px] uppercase tracking-widest italic">Register next high-yield asset.</p>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
