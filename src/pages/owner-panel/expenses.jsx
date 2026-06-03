import React from "react";
import OwnerLayout from "../../components/OwnerLayout";
import { Wallet, IndianRupee, TrendingDown, Clock, Search, Filter, ArrowUpRight, Download, PieChart, Plus } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function OwnerExpenses() {
  const expenses = [
    { title: "Electricity Bill - May", category: "Utilities", property: "Roomhy Residency", amount: "₹45,000", date: "12 May, 2026", status: "Paid" },
    { title: "Staff Salary - April", category: "Salary", property: "All Properties", amount: "₹2,10,000", date: "01 May, 2026", status: "Paid" },
    { title: "Plumbing Repair", category: "Maintenance", property: "Blue Heights", amount: "₹4,500", date: "28 April, 2026", status: "Pending" },
  ];

  return (
    <OwnerLayout 
      title="Expense Tracker"
      subtitle="Track your property maintenance, utilities, and operational costs."
    >
      <div className="space-y-10">
        {/* Expense Overview Cards */}
        {/* Expense Overview Cards - Smaller */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-rose-600 group-hover:scale-110 transition-transform">
                 <TrendingDown size={40} />
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Monthly Burn</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">₹2.8L</h3>
              <div className="flex items-center gap-1 text-rose-500 font-bold text-[7px] mt-2 uppercase tracking-widest bg-rose-50 w-fit px-1.5 py-0.5 rounded-md border border-rose-100">
                 <ArrowUpRight size={10} /> +8.4%
              </div>
           </div>
           <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-600 group-hover:scale-110 transition-transform">
                 <Wallet size={40} />
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 italic">Upcoming</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">₹12,400</h3>
              <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest italic opacity-60">Due in 3 days</p>
           </div>
           <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl text-indigo-600 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                 <PieChart size={40} />
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest mb-0.5 opacity-60 italic">Savings Pool</p>
              <h3 className="text-xl font-black tracking-tighter italic">₹1.5L</h3>
              <button className="mt-2 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest transition-all shadow-sm">
                 Reports
              </button>
           </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 w-full md:w-[450px] shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
              <Search size={20} className="text-slate-400" />
              <input type="text" placeholder="Search expenses..." className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-900" />
           </div>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-slate-100 shadow-sm">
                <Download size={16} /> Export
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2">
                <Plus size={16} /> New Expense
              </button>
           </div>
        </div>

        {/* Expense Ledger - Premium High-End Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100/50">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-r border-slate-100/50">Expense Detail</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-r border-slate-100/50">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic border-r border-slate-100/50">Asset Location</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center italic border-r border-slate-100/50">Value</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right italic">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expenses.map((e, i) => (
                  <tr key={i} className="group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer">
                    <td className="px-8 py-7 border-r border-slate-50/50">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 italic tracking-tight text-base leading-none mb-2 group-hover:text-indigo-600 transition-colors">{e.title}</span>
                        <div className="flex items-center gap-2">
                           <Clock size={12} className="text-indigo-400" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{e.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7 border-r border-slate-50/50">
                       <span className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 shadow-sm italic">{e.category}</span>
                    </td>
                    <td className="px-8 py-7 border-r border-slate-50/50">
                       <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic leading-none">{e.property}</span>
                       </div>
                    </td>
                    <td className="px-8 py-7 text-center border-r border-slate-50/50">
                       <span className="font-black text-slate-900 italic tracking-tighter text-xl">{e.amount}</span>
                    </td>
                    <td className="px-8 py-7 text-right">
                       <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 ${
                         e.status === 'Paid' 
                           ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600' 
                           : 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600'
                       }`}>
                         <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${e.status === 'Paid' ? 'bg-emerald-500 group-hover:bg-white' : 'bg-amber-500 group-hover:bg-white'}`} />
                         {e.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
}
