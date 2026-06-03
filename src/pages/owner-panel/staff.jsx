import React from "react";
import OwnerLayout from "../../components/OwnerLayout";
import { Users, Search, Plus, Star, Phone, ShieldCheck, MoreVertical, MapPin, ArrowRight, Zap, TrendingUp } from "lucide-react";

export default function OwnerStaff() {
  const staff = [
    { name: "John Staff", role: "Hostel Manager", property: "Roomhy Residency", rating: "4.8", status: "On Duty", phone: "+91 98765 43210", salary: "₹45,000" },
    { name: "Suresh Kumar", role: "Caretaker", property: "Blue Heights", rating: "4.5", status: "Away", phone: "+91 98765 43211", salary: "₹18,000" },
    { name: "Anita Devi", role: "Facility Manager", property: "The Urban Stay", rating: "4.9", status: "On Duty", phone: "+91 98765 43212", salary: "₹32,000" },
  ];

  return (
    <OwnerLayout 
      title="Staff Management"
      subtitle="Manage your hostel workers and their performance."
    >
      <div className="space-y-12">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
           <div className="flex gap-3">
              <div className="bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[140px]">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Total Staff</p>
                 <p className="text-2xl font-black text-slate-900 tracking-tighter italic">24</p>
              </div>
              <div className="bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[140px]">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">On Duty</p>
                 <p className="text-2xl font-black text-emerald-600 tracking-tighter italic">18</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 w-full md:w-[320px] shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search staff..." className="bg-transparent border-none outline-none text-xs font-bold w-full" />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2 group">
                 <Plus size={16} className="group-hover:rotate-90 transition-transform duration-500" /> Hire Talent
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {staff.map((s, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                     <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black italic shadow-sm group-hover:rotate-3 transition-transform">
                        {s.name.split(' ').map(n => n[0]).join('')}
                     </div>
                     <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-lg border-2 border-white ${s.status === 'On Duty' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                  <div className="text-right">
                     <p className={`text-[7px] font-black uppercase tracking-widest ${s.status === 'On Duty' ? 'text-emerald-500' : 'text-amber-500'}`}>{s.status}</p>
                     <div className="flex items-center gap-1 text-amber-500 mt-0.5 justify-end font-black italic text-[10px]">
                        <Star size={10} fill="currentColor" /> {s.rating}
                     </div>
                  </div>
               </div>

               <div className="space-y-0 mb-4">
                  <h4 className="text-lg font-black text-slate-900 tracking-tighter italic">{s.name}</h4>
                  <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest italic opacity-70">{s.role}</p>
               </div>

               <div className="space-y-2 pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Property</span>
                     <span className="text-[9px] font-black text-slate-900 italic flex items-center gap-1"><MapPin size={10} className="text-indigo-400" /> {s.property}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Salary</span>
                     <span className="text-[9px] font-black text-indigo-600 italic">{s.salary}</span>
                  </div>
               </div>

               <div className="mt-6 flex gap-2">
                  <button className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-500 border border-slate-100 flex items-center justify-center gap-1.5">
                     <Phone size={10} /> Contact
                  </button>
                  <button className="w-10 h-10 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-500 active:scale-90 shadow-sm">
                     <ArrowRight size={16} />
                  </button>
               </div>
            </div>
          ))}

          {/* Hire New Staff Placeholder */}
          <div className="bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-indigo-300 transition-all duration-700 h-[220px]">
             <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-500 mb-3">
                <Users size={20} />
             </div>
             <p className="text-[10px] font-black text-slate-900 italic tracking-tight uppercase">Expand Your Team</p>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
