import React from "react";
import StaffLayout from "../../components/StaffLayout";
import { CalendarCheck, MapPin, Clock, CheckCircle2 } from "lucide-react";

export default function StaffAttendance() {
  const history = [
    { date: "16 May, 2026", checkIn: "08:55 AM", checkOut: "-", status: "On Duty", location: "Roomhy Residency" },
    { date: "15 May, 2026", checkIn: "09:02 AM", checkOut: "06:15 PM", status: "Present", location: "Roomhy Residency" },
    { date: "14 May, 2026", checkIn: "08:58 AM", checkOut: "06:05 PM", status: "Present", location: "Roomhy Residency" },
  ];

  return (
    <StaffLayout 
      title="Attendance"
      subtitle="Mark your daily attendance and see your shift history."
    >
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
            <CalendarCheck size={40} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Mark Attendance</h3>
            <p className="text-sm text-slate-500">Your current status is <span className="text-emerald-500 font-bold">On Duty</span></p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95">
            Check In
          </button>
          <button className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-95">
            Check Out
          </button>
        </div>
      </div>

      {/* Attendance Ledger - Premium High-End Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100/50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-r border-slate-100/50">Shift Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center italic border-r border-slate-100/50">Clock In</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center italic border-r border-slate-100/50">Clock Out</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center italic border-r border-slate-100/50">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right italic">Assigned Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((h, i) => (
                <tr key={i} className="group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer">
                  <td className="px-8 py-7 border-r border-slate-50/50">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 italic shadow-sm">
                          {h.date.split(' ')[0]}
                       </div>
                       <span className="font-black text-slate-900 italic tracking-tight text-base group-hover:text-blue-600 transition-colors">{h.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center border-r border-slate-50/50">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-black text-slate-700 italic tracking-tighter">
                       <Clock size={12} className="text-blue-500" /> {h.checkIn}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center text-sm font-black text-slate-400 italic border-r border-slate-50/50">
                    {h.checkOut}
                  </td>
                  <td className="px-8 py-7 text-center border-r border-slate-50/50">
                     <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 ${
                       h.status === 'On Duty' 
                         ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600' 
                         : 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600'
                     }`}>
                       <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${h.status === 'On Duty' ? 'bg-blue-500 group-hover:bg-white' : 'bg-emerald-500 group-hover:bg-white'}`} />
                       {h.status}
                     </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <MapPin size={12} className="text-blue-500" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic leading-none">{h.location}</span>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  );
}
