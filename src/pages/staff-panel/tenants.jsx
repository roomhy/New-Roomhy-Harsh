import React from "react";
import StaffLayout from "../../components/StaffLayout";
import { Search, Plus, Filter, MoreHorizontal, UserCheck, Phone, MapPin, ArrowRight, ShieldCheck, Mail, Home, AlertCircle } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function StaffTenants() {
  const tenants = [
    { name: "Rahul Sharma", room: "102-A", status: "Active", kyc: "Verified", phone: "+91 98765 43210", email: "rahul@example.com", date: "Joined 2 months ago" },
    { name: "Priya Patel", room: "205-B", status: "Active", kyc: "Pending", phone: "+91 98765 43211", email: "priya@example.com", date: "Joined 1 month ago" },
    { name: "Amit Verma", room: "108-C", status: "Active", kyc: "Verified", phone: "+91 98765 43212", email: "amit@example.com", date: "Joined 3 weeks ago" },
    { name: "Sneha Reddy", room: "301-A", status: "Checking Out", kyc: "Verified", phone: "+91 98765 43213", email: "sneha@example.com", date: "Joined 6 months ago" },
  ];

  return (
    <StaffLayout 
      title="Tenants"
      subtitle="View and manage all residents living in the hostel."
    >
      <div className="space-y-8">
        {/* Top Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-[2rem] border border-slate-100 w-full md:w-[500px] focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:bg-white transition-all shadow-sm">
             <Search size={20} className="text-slate-400" />
             <input type="text" placeholder="Search by name, room, or unique ID..." className="bg-transparent border-none outline-none text-sm font-semibold w-full text-slate-900 placeholder:text-slate-400" />
           </div>
           <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-6 py-4 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-all border border-slate-100">
               <Filter size={18} />
               Advanced Filters
             </button>
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 transition-all flex items-center gap-2 active:scale-95 group">
               <Plus size={20} />
               Add New Resident
             </button>
           </div>
        </div>

        {/* Premium Compact Grid View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tenants.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
               <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center relative z-10">
                  <div className="relative">
                     <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:rotate-3 transition-transform italic">
                        {t.name.split(' ').map(n => n[0]).join('')}
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                        {t.kyc === 'Verified' ? <ShieldCheck size={10} className="text-emerald-500" /> : <AlertCircle size={10} className="text-amber-500" />}
                     </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-lg font-black text-slate-900 tracking-tighter italic truncate">{t.name}</h4>
                        <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border shrink-0 ${
                          t.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>{t.status}</span>
                     </div>
                     <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                           <Home size={12} className="text-blue-500" /> Room {t.room}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                           <Phone size={12} className="text-blue-500" /> {t.phone}
                        </div>
                     </div>
                  </div>
                  
                  <button className="w-9 h-9 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-100 active:scale-90 group/btn">
                     <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
               </div>

               <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-10">
                     <div className="flex flex-col">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Email Address</p>
                        <p className="text-sm font-black text-slate-900 flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-none italic">{t.email}</p>
                     </div>
                     <div className="flex flex-col">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Member Since</p>
                        <p className="text-sm font-black text-slate-900 italic">{t.date}</p>
                     </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><MoreHorizontal size={20} /></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}
