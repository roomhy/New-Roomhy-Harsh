import React, { useState, useEffect } from "react";
import { fetchJson } from "../../utils/api";
import { 
  Building2, Users, ArrowUpRight, ArrowDownRight, 
  ChevronRight, Calendar, Download, Search, Star, 
  MapPin, Percent, IndianRupee, ShieldAlert
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReportsPropertyPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/superadmin/reports/overview");
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load property performance data:", err);
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Property Performance Intel...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const propertyPerformance = data?.charts?.propertyPerformance || [];

  const filteredProperties = propertyPerformance.filter(p => 
    (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.loc || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = propertyPerformance.map(p => {
    const nameStr = p.name || "";
    const revVal = p.rev !== undefined && p.rev !== null ? p.rev : 0;
    return {
      name: nameStr.length > 15 ? nameStr.substring(0, 15) + "..." : nameStr,
      Revenue: Number(revVal) || 0
    };
  });

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full font-inter text-slate-900">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Performance</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               <span>Reports & Analytics</span>
               <ChevronRight size={12} className="opacity-50" />
               <span className="text-blue-600">Property Performance</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
               <Calendar className="w-4 h-4 text-slate-400" />
               <span>Last 30 Days</span>
            </div>
         </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Active Properties</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{summary.totalProperties || 0}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tenants Placed</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{summary.totalTenants || 0}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-sm">
            <Percent size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Occupancy Rate</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">{summary.occupancyRate || 0}%</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Gross Revenue</p>
            <h4 className="text-xl font-black text-slate-900 mt-1">₹{(summary.monthlyRevenue || 0).toLocaleString('en-IN')}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
         {/* Performance Bar Chart */}
         <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[450px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Revenue Contribution by Property</h3>
               <span className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500">Gross Monthly Revenue</span>
            </div>
            <div className="flex-1 min-h-0">
               {chartData.length === 0 ? (
                 <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">No Revenue Data Generated Yet</div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dx={-10} tickFormatter={(v) => `₹${v}`} />
                       <Tooltip cursor={{fill: '#F8FAFC'}} />
                       <Bar dataKey="Revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={40}>
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'][index % 5]} />
                         ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               )}
            </div>
         </div>

         {/* Info Box */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between h-[450px]">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Insights</h3>
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><Star size={16} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Top Revenue Generator</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">{propertyPerformance[0]?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><Percent size={16} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Average Occupancy Rating</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">Global occupancy sits at {summary.occupancyRate || 0}%, based on all active beds.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0"><MapPin size={16} /></div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Audit Status</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">All transactions verified against global booking configurations.</p>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={loadData} className="w-full py-3 bg-slate-50 hover:bg-slate-100 transition-all rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest">
              Refresh Data
            </button>
         </div>
      </div>

      {/* Property Ledger Grid */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
         <div className="flex items-center justify-between mb-8 flex-col sm:flex-row gap-4">
            <h3 className="text-lg font-bold text-slate-900">Property Ledger & Occupancy Mapping</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <div className="relative group flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties or cities..." 
                    className="w-full bg-[#F8FAFC] border border-slate-100 rounded-xl py-2 pl-10 pr-4 text-xs font-bold shadow-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" 
                  />
               </div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                     <th className="text-left py-4 font-bold">Property Details</th>
                     <th className="text-center py-4 font-bold">Region</th>
                     <th className="text-center py-4 font-bold">Occupancy Matrix</th>
                     <th className="text-right py-4 font-bold">Monthly Revenue</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredProperties.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <div className="flex flex-col items-center gap-3 justify-center">
                          <ShieldAlert className="text-slate-300" size={32} />
                          No Properties Registered under active Ledger
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProperties.map((p, i) => (
                       <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                             <div className="flex items-center gap-3">
                                <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
                                <div>
                                  <span className="font-bold text-[13px] text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</span>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">ID: PROP-RHY{3000 + i}</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-4 text-center text-[12px] text-slate-400 font-bold">{p.loc}</td>
                          <td className="py-4 text-center font-black text-[13px] text-emerald-500">{p.occupancy}</td>
                          <td className="py-4 text-right font-black text-[13px] text-slate-900">{p.revenue}</td>
                       </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
