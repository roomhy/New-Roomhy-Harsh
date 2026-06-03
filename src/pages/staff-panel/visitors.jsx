import React from "react";
import StaffLayout from "../../components/StaffLayout";
import { UserPlus, Search, Calendar, Clock, ChevronRight } from "lucide-react";

export default function StaffVisitors() {
  const visitors = [
    { name: "John Doe", relation: "Father", tenant: "Rahul Sharma", checkIn: "10:30 AM", checkOut: "11:45 AM", date: "Today" },
    { name: "Suman Lata", relation: "Mother", tenant: "Priya Patel", checkIn: "02:15 PM", checkOut: "-", date: "Today" },
    { name: "Karan Singh", relation: "Friend", tenant: "Amit Verma", checkIn: "05:00 PM", checkOut: "06:30 PM", date: "Yesterday" },
  ];

  return (
    <StaffLayout title="Visitors Log">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 w-full md:w-96 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input type="text" placeholder="Search visitors..." className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2">
          <UserPlus size={20} />
          New Entry
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Visitor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Visiting Tenant</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visitors.map((v, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-900">{v.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{v.relation}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{v.tenant}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{v.checkIn}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{v.checkOut}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}
