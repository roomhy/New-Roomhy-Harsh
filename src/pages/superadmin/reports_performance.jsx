import React, { useState, useEffect } from "react";
import { 
  Users, Search, ChevronRight, Zap, Award, Activity, RotateCcw,
  Download, Eye, Landmark, HelpCircle, CheckCircle2, ShieldAlert
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReportsPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Staff Performance Reports - Roomhy Superadmin",
    description: "Track and audit employee visits, tasks, and submission logs.",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/superadmin/reports/overview");
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load staff performance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-10 bg-[#F8FAFC] min-h-full flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Staff Performance Reports...</p>
      </div>
    );
  }

  const staffPerformance = data?.charts?.staffPerformance || [];
  const visitsCreated = data?.summary?.visitsCreated || 0;

  const filteredStaff = staffPerformance.filter(s => 
    (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.role || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate metrics
  const totalVisits = staffPerformance.reduce((acc, curr) => acc + (curr.tasks || 0), 0);
  const totalApproved = staffPerformance.reduce((acc, curr) => acc + (curr.resolved || 0), 0);
  const topPerformer = staffPerformance[0]?.name || "N/A";
  const activeStaffCount = staffPerformance.length;

  const exportCSV = () => {
    if (!filteredStaff.length) return;
    const headers = "Staff Name,Role,Total Visits,Approved Visits,Performance Score,Status\n";
    const rows = filteredStaff.map(s => 
      `"${s.name}","${s.role}",${s.tasks || 0},${s.resolved || 0},"${s.score}","${s.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Staff_Performance_Report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-8 space-y-8 bg-[#F8FAFC] min-h-full font-inter text-slate-800">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Performance Reports</h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
             <span>Reports</span>
             <ChevronRight size={10} className="opacity-50" />
             <span className="text-blue-600">Staff Performance</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refresh Data
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </div>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider -mt-4">
        Track and monitor staff tasks, visits, and performance metrics.
      </p>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Visits Submitted</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{visitsCreated} Visits</h3>
            <p className="text-[9px] text-slate-400 mt-1">All properties submitted by staff</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Approved Visits</p>
            <h3 className="text-xl font-bold text-emerald-600 leading-tight">{totalApproved} Approved</h3>
            <p className="text-[9px] text-slate-400 mt-1">Verified and listed properties</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Top Staff Member</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight truncate max-w-[150px]">{topPerformer}</h3>
            <p className="text-[9px] text-slate-400 mt-1">Highest tasks submitted this month</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Staff Members</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{activeStaffCount} Employees</h3>
            <p className="text-[9px] text-slate-400 mt-1">Tracked platform staff metrics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
         {/* Efficiency Scorecard / Leaderboard */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Top Performing Staff</h3>
               <div className="space-y-6">
                  {staffPerformance.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold text-sm shrink-0">
                          {s.name ? s.name.split(' ').map(n => n[0]).join('') : "ST"}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                             <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                             <p className="text-xs font-bold text-blue-600">{s.score}</p>
                          </div>
                          <div className="mt-1.5 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                             <div 
                                className="h-full rounded-full bg-blue-600 transition-all duration-500" 
                                style={{ width: s.score }} 
                             />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Staff Performance & Visit Logs Table */}
         <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
               <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Staff Performance & Visit Logs</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Visits and property updates completed by staff</p>
               </div>
               <div className="relative w-full sm:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input
                   type="text"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Search Staff or Role..."
                   className="w-full bg-slate-50 border border-transparent rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100 transition-all"
                 />
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Member</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Role</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Total Visits</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Approved Visits</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Performance Score</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Performance Rank</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredStaff.length === 0 ? (
                       <tr>
                         <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">No staff performance logs found</td>
                       </tr>
                     ) : filteredStaff.map((s, i) => (
                       <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                             <div className="flex items-center gap-3">
                                <div className={cn(
                                   "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs",
                                   s.color === "blue" ? "bg-blue-600" :
                                   s.color === "indigo" ? "bg-indigo-600" :
                                   s.color === "emerald" ? "bg-emerald-600" : "bg-amber-600"
                                )}>
                                   {s.name ? s.name.split(' ').map(n => n[0]).join('') : "ST"}
                                </div>
                                <div>
                                   <p className="text-xs font-bold text-slate-800 leading-none">{s.name}</p>
                                   <p className="text-[9px] text-slate-400 font-mono mt-1 leading-none">STF-0{i+101}</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-600">
                             {s.role}
                          </td>
                          <td className="py-4 text-center font-bold text-slate-800 text-xs">{s.tasks}</td>
                          <td className="py-4 text-center font-bold text-emerald-600 text-xs">{s.resolved}</td>
                          <td className="py-4 text-center font-bold text-blue-600 text-xs">
                             {s.score}
                          </td>
                          <td className="py-4 text-center">
                             <span className={cn(
                               "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase",
                               s.status === "Elite" ? "bg-blue-50 text-blue-600 border-blue-100" : 
                               s.status === "Excellent" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                               s.status === "On Track" ? "bg-slate-50 text-slate-600 border-slate-100" :
                               "bg-amber-50 text-amber-600 border-amber-100"
                             )}>
                                {s.status}
                             </span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
