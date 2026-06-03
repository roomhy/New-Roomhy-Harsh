import React from "react";
import StaffLayout from "../../components/StaffLayout";
import { Search, Filter, Home, Bed, CheckCircle2, XCircle, MoreVertical, IndianRupee, Layers, Zap } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function StaffRooms() {
  const rooms = [
    { id: "101", type: "Single Elite", status: "Occupied", price: "12,000", tenant: "Aman Gupta", gender: "Male" },
    { id: "102", type: "Double Classic", status: "Available", price: "8,500", tenant: "Unoccupied", gender: "Co-ed" },
    { id: "103", type: "Triple Budget", status: "Maintenance", price: "6,500", tenant: "Locked", gender: "Female" },
    { id: "104", type: "Single Elite", status: "Occupied", price: "14,000", tenant: "Rajesh Kumar", gender: "Male" },
    { id: "105", type: "Double Classic", status: "Occupied", price: "9,000", tenant: "Suresh P.", gender: "Male" },
    { id: "106", type: "Single Elite", status: "Available", price: "12,500", tenant: "Unoccupied", gender: "Female" },
  ];

  return (
    <StaffLayout 
      title="Room Inventory"
      subtitle="Check room availability and occupancy status."
    >
      <div className="space-y-12">
        {/* Modern Filter Tabs */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
           <div className="flex gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm w-fit">
              <FilterTab label="All Rooms" active count="120" />
              <FilterTab label="Occupied" count="98" />
              <FilterTab label="Available" count="18" />
              <FilterTab label="Maintenance" count="04" />
           </div>
           <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-100 w-full md:w-[320px] shadow-sm focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search room..." className="bg-transparent border-none outline-none text-xs font-bold w-full" />
              </div>
              <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 border border-slate-100">
                 <Zap size={14} className="text-blue-600" /> Quick Update
              </button>
           </div>
        </div>

        {/* Room Grid - Even More Compact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${
                    room.status === 'Occupied' ? 'bg-blue-600 text-white shadow-sm' : 
                    room.status === 'Available' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm'
                  }`}>
                    <Home size={18} />
                  </div>
                  <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-100">
                    <MoreVertical size={14} className="text-slate-400" />
                  </button>
               </div>

               <div className="space-y-0">
                  <h4 className="text-xl font-black text-slate-900 tracking-tighter italic">Room {room.id}</h4>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{room.type}</p>
               </div>

               <div className="mt-5 space-y-2.5">
                  <RoomFeature label="Current Status" value={room.status} color={room.status === 'Occupied' ? 'blue' : room.status === 'Available' ? 'emerald' : 'rose'} />
                  <RoomFeature label="Monthly Rent" value={`₹${room.price}`} />
                  <RoomFeature label="Active Tenant" value={room.tenant} />
               </div>

               <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Layers size={12} className="text-blue-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{room.gender}</span>
                  </div>
                  <button className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1.5 uppercase tracking-widest transition-colors italic">
                     View Details <ArrowRight size={12} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}

function FilterTab({ label, active, count }) {
   return (
      <button className={cn(
         "px-5 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2.5 uppercase tracking-widest",
         active ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
      )}>
         {label}
         <span className={cn(
            "px-1.5 py-0.5 rounded-md text-[8px] font-black",
            active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
         )}>{count}</span>
      </button>
   );
}

function RoomFeature({ label, value, color }) {
   const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      rose: 'bg-rose-50 text-rose-600 border-rose-100'
   };
   return (
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{label}</span>
         {color ? (
            <span className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border", colors[color])}>
               {value}
            </span>
         ) : (
            <span className="text-[10px] font-black text-slate-900 italic">{value}</span>
         )}
      </div>
   );
}

function ArrowRight({ size, className }) {
   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}
