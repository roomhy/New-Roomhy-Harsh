import React, { useState, useEffect } from "react";
import { fetchJson } from "../../utils/api";
import { 
  TrendingUp, IndianRupee, Users, Building2, 
  ArrowUpRight, ArrowDownRight, Calendar, Download,
  ChevronRight, PieChart as PieIcon, BarChart3, 
  MapPin, Clock, Wallet, FileText, LayoutDashboard,
  Filter, Search, MoreVertical, Activity, UserPlus, 
  Target, Percent, Building, TrendingDown
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ReportsOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/superadmin/reports/overview");
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load reports overview data:", err);
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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Platform Intelligence...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  
  const activeRevenueData = charts.revenueOverviewData || [];
  const activeOccupancyData = charts.occupancyData || [];
  const activePropertyPerformance = charts.propertyPerformance || [];
  const activeLocationWiseData = charts.locationWiseData || [];
  const activeStaffPerformance = charts.staffPerformance || [];

  const formatVal = (val, prefix = "", suffix = "") => {
    if (val === undefined || val === null) {
      return "0";
    }
    return `${prefix}${val}${suffix}`;
  };

  const hasRevenueData = activeRevenueData.length > 0 && activeRevenueData.some(d => d.val > 0);
  const hasOccupancyData = activeOccupancyData.length > 0 && activeOccupancyData.some(d => d.value > 0);
  const hasPropertyPerformance = activePropertyPerformance.length > 0;
  const hasLocationWiseData = activeLocationWiseData.length > 0;
  const hasStaffPerformance = activeStaffPerformance.length > 0;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full font-inter text-slate-900">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report & Analytics Overview</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               <span>Reports & Analytics</span>
               <ChevronRight size={12} className="opacity-50" />
               <span className="text-blue-600">Overview</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
               <Calendar className="w-4 h-4 text-slate-400" />
               <span>Last 30 Days</span>
            </div>
         </div>
      </div>

      {/* TOP ROW: 6 STATISTICAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
         <ReportStatCard icon={Building} label="Total Properties" val={formatVal(summary.totalProperties)} trend="+12.6%" color="blue" source="Bookings" />
         <ReportStatCard icon={Users} label="Total Tenants" val={formatVal(summary.totalTenants)} trend="+9.8%" color="emerald" source="Bookings" />
         <ReportStatCard icon={Percent} label="Occupancy Rate" val={`${summary.occupancyRate || 0}%`} trend="+4.3%" color="purple" source="Bookings" />
         <ReportStatCard icon={IndianRupee} label="Monthly Revenue" val={`₹${(summary.monthlyRevenue || 0).toLocaleString('en-IN')}`} trend="+14.7%" color="amber" source="Payments" />
         <ReportStatCard icon={Wallet} label="Net Profit" val={`₹${(summary.netProfit || 0).toLocaleString('en-IN')}`} trend="+18.2%" color="blue" source="Payments" />
         <ReportStatCard icon={TrendingUp} label="Growth Rate" val={`${summary.growthRate || 0}%`} trend="+3.6%" color="emerald" source="Payments" />
      </div>

      {/* MIDDLE ROW: REVENUE, OCCUPANCY, PERFORMANCE */}
      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Revenue Overview */}
         <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
               <span className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500">Last 6 Months</span>
            </div>
            <div className="flex items-center gap-2 mb-8">
               <div className="w-3 h-3 rounded-full bg-blue-600" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue (₹ Lakhs)</span>
            </div>
            <div className="flex-1 min-h-0">
               {!hasRevenueData ? (
                 <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeRevenueData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dx={-10} tickFormatter={(v) => `₹${v}L`} />
                       <Tooltip />
                       <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" dot={{fill: '#3B82F6', r: 4}} />
                    </AreaChart>
                 </ResponsiveContainer>
               )}
            </div>
            <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Revenue</span><span className="text-[13px] font-black text-slate-900 leading-none">{summary.monthlyRevenue ? `₹${summary.monthlyRevenue.toLocaleString('en-IN')}` : "No Data"}</span></div>
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Payout</span><span className="text-[13px] font-black text-slate-900 leading-none">{summary.monthlyRevenue ? `₹${Math.round(summary.monthlyRevenue * 0.9).toLocaleString('en-IN')}` : "No Data"}</span></div>
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Net Profit</span><span className="text-[13px] font-black text-slate-900 leading-none">{summary.netProfit ? `₹${summary.netProfit.toLocaleString('en-IN')}` : "No Data"}</span></div>
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Growth</span><span className="text-[13px] font-black text-emerald-500 leading-none">{summary.growthRate ? `+${summary.growthRate}%` : "No Data"}</span></div>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Payments</p>
         </div>

         {/* Occupancy Rate Trend */}
         <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center h-[480px]">
            <div className="flex items-center justify-between w-full mb-8">
               <h3 className="text-lg font-bold text-slate-900">Occupancy Rate</h3>
               <span className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500">Real-Time</span>
            </div>
            <div className="relative h-48 w-48 flex items-center justify-center mb-8">
               {!hasOccupancyData ? (
                 <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
               ) : (
                 <>
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={activeOccupancyData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                            {activeOccupancyData.map((e, idx) => <Cell key={idx} fill={e.color || '#3B82F6'} />)}
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-2xl font-black text-slate-900">{summary.occupancyRate}%</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Occupancy Rate</p>
                   </div>
                 </>
               )}
            </div>
            <div className="w-full space-y-4 mt-auto">
               {activeOccupancyData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-[11px] font-bold text-slate-500">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-900">{item.value?.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-300">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
            <p className="w-full text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Bookings</p>
         </div>

         {/* Property Performance */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Property Performance <span className="text-slate-400 text-sm font-medium ml-1">(Top 5)</span></h3>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
               <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span className="flex-1">Property Name</span>
                  <span className="w-20 text-center">Location</span>
                  <span className="w-20 text-center">Occupancy</span>
                  <span className="w-24 text-right">Revenue (₹)</span>
               </div>
               {!hasPropertyPerformance ? (
                 <div className="flex-1 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs py-20">No Data Available</div>
               ) : (
                 activePropertyPerformance.map((p, i) => (
                    <div key={i} className="flex items-center group">
                       <div className="flex-1 flex items-center gap-3 min-w-0">
                          <img src={p.img} alt={p.name} className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0" />
                          <span className="text-[12px] font-bold text-slate-900 truncate leading-tight">{p.name}</span>
                       </div>
                       <span className="w-20 text-center text-[11px] font-bold text-slate-400">{p.loc}</span>
                       <span className="w-20 text-center text-[11px] font-black text-emerald-500">{p.occupancy}</span>
                       <span className="w-24 text-right text-[12px] font-black text-slate-900">{p.revenue}</span>
                    </div>
                 ))
               )}
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Bookings</p>
         </div>
      </div>

      {/* BOTTOM ROW: LOCATION, GROWTH, REVENUE REPORT */}
      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Location Wise Data */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Location Wise Data</h3>
            </div>
            <div className="flex-1 flex gap-6">
               <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <MapPin size={80} className="text-slate-200" />
               </div>
               <div className="w-44 space-y-4 pr-2 overflow-y-auto flex flex-col">
                  {!hasLocationWiseData ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
                  ) : (
                    activeLocationWiseData.map((loc, i) => (
                       <div key={i} className="flex flex-col">
                          <div className="flex justify-between items-center mb-0.5">
                             <span className="text-[11px] font-bold text-slate-900">{loc.name}</span>
                             <span className="text-[11px] font-black text-slate-900">{loc.value}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{loc.count}</span>
                       </div>
                    ))
                  )}
               </div>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Bookings</p>
         </div>

         {/* Growth Analytics */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Growth Analytics</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 flex-1">
               {[
                  { label: "Properties", val: summary.totalProperties ? summary.totalProperties.toString() : null, trend: "+12.6%", color: "#3B82F6" },
                  { label: "Tenants", val: summary.totalTenants ? summary.totalTenants.toString() : null, trend: "+9.8%", color: "#10B981" },
                  { label: "Revenue Growth", val: summary.monthlyRevenue ? `₹${summary.monthlyRevenue.toLocaleString('en-IN')}` : null, trend: `+${summary.growthRate}%`, color: "#F59E0B" },
                  { label: "Growth Velocity", val: summary.growthRate ? `${summary.growthRate}%` : null, trend: "+3.6%", color: "#6366F1" },
               ].map((g, i) => (
                  <div key={i} className="flex flex-col">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{g.label}</span>
                        {g.val && <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={10} /> {g.trend}</span>}
                     </div>
                     <h4 className="text-sm font-black text-slate-900 mb-2">{g.val ? g.val : "No Data Available"}</h4>
                     <div className="flex-1 bg-slate-50/50 rounded-xl min-h-[60px] p-2">
                        {hasRevenueData ? (
                          <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={activeRevenueData}>
                                <Line type="monotone" dataKey="val" stroke={g.color} strokeWidth={2} dot={false} />
                             </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-[9px] text-slate-300 font-bold uppercase">No Data</div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Bookings</p>
         </div>

         {/* Revenue Report Chart */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center h-[420px]">
            <div className="flex items-center justify-between w-full mb-8">
               <h3 className="text-lg font-bold text-slate-900">Commission Share Report</h3>
            </div>
            <div className="relative h-48 w-48 flex items-center justify-center mb-8">
               {!summary.monthlyRevenue ? (
                 <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Data Available</div>
               ) : (
                 <>
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={[
                            { name: "Owner Earnings", value: Math.round((summary.monthlyRevenue || 0) * 0.9), color: "#3B82F6", percent: "90.0%" },
                            { name: "Platform Commissions", value: summary.netProfit || 0, color: "#10B981", percent: "10.0%" }
                         ]} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                            {[
                               { name: "Owner Earnings", value: Math.round((summary.monthlyRevenue || 0) * 0.9), color: "#3B82F6", percent: "90.0%" },
                               { name: "Platform Commissions", value: summary.netProfit || 0, color: "#10B981", percent: "10.0%" }
                            ].map((e, idx) => <Cell key={idx} fill={e.color} />)}
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-lg font-black text-slate-900">₹{(summary.monthlyRevenue || 0).toLocaleString('en-IN')}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Bookings</p>
                   </div>
                 </>
               )}
            </div>
            <div className="w-full space-y-3 mt-auto">
               {[
                  { name: "Owner Earnings", value: Math.round((summary.monthlyRevenue || 0) * 0.9), color: "#3B82F6", percent: "90.0%" },
                  { name: "Platform Commissions", value: summary.netProfit || 0, color: "#10B981", percent: "10.0%" }
               ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-slate-400 truncate">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-slate-900">{summary.monthlyRevenue ? `₹${item.value.toLocaleString('en-IN')}` : "No Data"}</span>
                        <span className="text-slate-300 font-medium ml-1">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
            <p className="w-full text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Payments</p>
         </div>
      </div>

      {/* FOOTER SECTION: STAFF & INSIGHTS */}
      <div className="grid grid-cols-12 gap-6">
         {/* Staff Performance Reports */}
         <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Staff Management Command</h3>
            </div>
            <div className="overflow-x-auto flex-1 flex flex-col">
               <table className="w-full">
                  <thead>
                     <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="text-left py-4 font-bold">Staff Name</th>
                        <th className="text-left py-4 font-bold">Role</th>
                        <th className="text-center py-4 font-bold">Properties Managed</th>
                        <th className="text-center py-4 font-bold">Leads Handles</th>
                        <th className="text-right py-4 font-bold">Rating</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {!hasStaffPerformance ? (
                       <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No Data Available</td></tr>
                     ) : (
                       activeStaffPerformance.map((s, i) => (
                          <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                             <td className="py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">{(s.name || "E").split(' ').map(n=>n[0]).join('')}</div>
                                   <span className="font-bold text-[13px] text-slate-900">{s.name}</span>
                                </div>
                             </td>
                             <td className="py-4 text-[11px] text-slate-400 font-medium">{s.role}</td>
                             <td className="py-4 text-center font-black text-[13px] text-slate-900">{s.managed}</td>
                             <td className="py-4 text-center font-black text-[13px] text-slate-900">{s.leads}</td>
                             <td className="py-4 text-right">
                                <span className="text-[12px] font-black text-emerald-500">{s.perf}</span>
                             </td>
                          </tr>
                       ))
                     )}
                  </tbody>
               </table>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Support</p>
         </div>

         {/* Key Insights */}
         <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-8">Platform Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Users size={18} /></div>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                       {summary.occupancyRate ? `Occupancy rate verified at ${summary.occupancyRate}% globally.` : "No Occupancy Data Available"}
                    </p>
                 </div>
                 <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><MapPin size={18} /></div>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                       {hasRevenueData ? "Bangalore is currently the top revenue location." : "No Revenue Distribution Data Available"}
                    </p>
                 </div>
                 <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Building size={18} /></div>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                       {summary.totalProperties ? `${summary.totalProperties} properties operational in core database.` : "No Properties Registered"}
                    </p>
                 </div>
                 <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><TrendingUp size={18} /></div>
                    <p className="text-[11px] font-bold text-slate-600 leading-tight">
                       {summary.netProfit ? "Commission split active at configured settings percentage." : "No Commission Splits Recorded"}
                    </p>
                 </div>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase mt-4 text-right">Data Source: Bookings</p>
         </div>
      </div>
    </div>
  );
}

// --- UTILITY COMPONENTS ---

function ReportStatCard({ icon: Icon, label, val, trend, color, source }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-500 bg-emerald-50",
    purple: "text-purple-500 bg-purple-50",
    amber: "text-amber-500 bg-amber-50",
  };
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:translate-y-[-2px] transition-all justify-between min-h-[220px]">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm", colors[color])}>
          <Icon size={18} />
       </div>
       <h4 className="text-base font-black text-slate-900 leading-none mb-1">{val}</h4>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
       
       <div className="w-full border-t border-slate-50 pt-3 flex flex-col items-center gap-1.5">
          {val !== "No Data Available" && (
            <div className="flex items-center gap-1">
               <TrendingUp size={10} className="text-emerald-500" />
               <span className="text-[10px] font-bold text-emerald-500">{trend}</span>
            </div>
          )}
          <span className="text-[8px] font-black text-blue-500/80 uppercase tracking-wider">Data Source: {source}</span>
       </div>
    </div>
  );
}
