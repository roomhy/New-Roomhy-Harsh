import React from "react";
import OwnerLayout from "../../components/OwnerLayout";
import { AlertCircle, Clock, CheckCircle2, Home, User, MoreHorizontal, Filter, Sparkles, ArrowRight, ShieldAlert } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function OwnerComplaints() {
  const complaints = [
    { id: "#CMP-1024", property: "Roomhy Residency", tenant: "Rahul Sharma", issue: "Plumbing issue in Room 102", priority: "High", status: "Pending", date: "2 hours ago", category: "Maintenance" },
    { id: "#CMP-1025", property: "Blue Heights", tenant: "Priya Patel", issue: "AC not cooling", priority: "Medium", status: "In Progress", date: "5 hours ago", category: "Electrical" },
    { id: "#CMP-1026", property: "Roomhy Residency", tenant: "Amit Verma", issue: "WiFi connectivity issue", priority: "Low", status: "Resolved", date: "Yesterday", category: "Network" },
  ];

  return (
    <OwnerLayout 
      title="Complaints"
      subtitle="Track and fix issues reported by your residents."
    >
      <div className="space-y-12">
        {/* Modern Support Overview */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
           <div className="flex flex-wrap gap-3">
              <ComplaintTab label="All Tickets" active count="12" />
              <ComplaintTab label="Pending" count="08" color="rose" />
              <ComplaintTab label="Resolved" count="45" color="emerald" />
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 w-full md:w-[320px] shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                <Filter size={16} className="text-indigo-600" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">Filter Assets</span>
              </div>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2">
                 <ShieldAlert size={16} className="text-rose-400" /> Critical
              </button>
           </div>
        </div>

        {/* Complaint Feed - Premium Style - More Compact */}
        <div className="grid grid-cols-1 gap-3">
          {complaints.map((item, i) => (
            <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-700 group relative overflow-hidden">
               <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                       item.priority === 'High' ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'
                     }`}>
                       <AlertCircle size={20} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{item.id}</span>
                           <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                             item.status === 'Pending' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                             item.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                           }`}>{item.status}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tighter italic mb-1 group-hover:text-indigo-600 transition-colors">{item.issue}</h4>
                        <div className="flex flex-wrap gap-5 items-center">
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                              <Home size={12} className="text-indigo-500" /> {item.property}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                              <User size={12} className="text-indigo-500" /> {item.tenant}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                              <Clock size={12} className="text-indigo-500" /> {item.date}
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <div className="text-right mr-4 hidden md:block">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mb-0.5">Category</p>
                        <p className="text-xs font-black text-slate-900 italic">{item.category}</p>
                     </div>
                     <button className="px-5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all border border-slate-100 flex items-center gap-1.5 group/btn">
                        Review <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                     </button>
                     <button className="p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg transition-all">
                        <MoreHorizontal size={16} className="text-slate-300" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Global Efficiency Score - Smaller */}
        <div className="bg-indigo-50/30 rounded-3xl p-6 border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                 <div className="relative w-10 h-10">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="20" cy="20" r="18" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
                       <circle cx="20" cy="20" r="18" stroke="#4F46E5" strokeWidth="4" fill="transparent" strokeDasharray="113.1" strokeDashoffset="17" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-indigo-600">85%</div>
                 </div>
              </div>
              <div>
                 <h4 className="text-lg font-black text-slate-900 italic mb-0.5">Efficiency Score</h4>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Tickets resolved within 24 hours.</p>
              </div>
           </div>
           <button className="bg-white px-6 py-2.5 rounded-xl font-black text-[8px] uppercase tracking-widest shadow-sm hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 italic">
              Audit Report
           </button>
        </div>
      </div>
    </OwnerLayout>
  );
}

function ComplaintTab({ label, active, count, color }) {
   const colors = {
      rose: 'bg-rose-50 text-rose-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      indigo: 'bg-indigo-50 text-indigo-600'
   };
   return (
      <button className={cn(
         "px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border italic",
         active ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
      )}>
         {label}
         <span className={cn(
            "px-2 py-0.5 rounded-md text-[8px] font-black",
            active ? "bg-white/20 text-white" : color ? colors[color] : "bg-slate-100 text-slate-500"
         )}>{count}</span>
      </button>
   );
}
