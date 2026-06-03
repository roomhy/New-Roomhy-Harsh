import React from "react";
import OwnerLayout from "../../components/OwnerLayout";
import { FileText, Download, BarChart3, PieChart, TrendingUp, Calendar } from "lucide-react";

export default function OwnerReports() {
  const reports = [
    { name: "Monthly Revenue Report", type: "Financial", period: "April 2026", format: "PDF", size: "1.2 MB" },
    { name: "Occupancy Analytics", type: "Operations", period: "Q1 2026", format: "Excel", size: "2.4 MB" },
    { name: "Expense Breakdown", type: "Financial", period: "April 2026", format: "PDF", size: "0.8 MB" },
    { name: "Tenant Satisfaction Survey", type: "Feedback", period: "Bi-Annual", format: "PDF", size: "3.1 MB" },
  ];

  return (
    <OwnerLayout 
      title="Financial Reports"
      subtitle="Download and view your monthly hostel earnings and reports."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <BarChart3 size={200} />
          </div>
          <h3 className="text-3xl font-black mb-4">Financial Insights</h3>
          <p className="text-indigo-100 max-w-md mb-8">Download detailed reports and analytics to understand your business performance better.</p>
          <div className="flex gap-4">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-bold shadow-lg transition-all active:scale-95">Generate New Report</button>
            <button className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold border border-indigo-400/50 shadow-lg transition-all active:scale-95">View Schedule</button>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-4">
            <TrendingUp size={32} />
          </div>
          <h4 className="text-xl font-black text-slate-900">14% Growth</h4>
          <p className="text-sm text-slate-500 mt-1">Compared to same period last year</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900">Available Reports</h4>
          <button className="text-sm font-bold text-indigo-600">Archive</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {reports.map((report, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{report.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>{report.period}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{report.format} • {report.size}</span>
                  </div>
                </div>
              </div>
              <button className="p-3 bg-white text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 rounded-xl transition-all border border-transparent group-hover:border-indigo-100">
                <Download size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </OwnerLayout>
  );
}
