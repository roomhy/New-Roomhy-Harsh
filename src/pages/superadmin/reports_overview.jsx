import React, { useState } from "react";
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

// --- DATA FROM SCREENSHOT (REPORT & ANALYTICS - PAGE 9) ---

const revenueOverviewData = [
  { name: "Dec", val: 10 }, { name: "Jan", val: 18 }, { name: "Feb", val: 15 },
  { name: "Mar", val: 22 }, { name: "Apr", val: 18 }, { name: "May", val: 28 },
];

const occupancyData = [
  { name: "Occupied", value: 2050, color: "#3B82F6", percent: "87.6%" },
  { name: "Vacant", value: 240, color: "#10B981", percent: "10.3%" },
  { name: "Maintenance", value: 50, color: "#F59E0B", percent: "2.1%" },
];

const propertyPerformance = [
  { name: "Ocean View Apartment", loc: "Mumbai", occupancy: "98%", revenue: "₹2,45,600", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=100&fit=crop" },
  { name: "Green Valley Villa", loc: "Bangalore", occupancy: "96%", revenue: "₹2,10,350", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop" },
  { name: "Sunrise Heights", loc: "Pune", occupancy: "93%", revenue: "₹1,98,760", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=100&h=100&fit=crop" },
  { name: "Lake View Residency", loc: "Hyderabad", occupancy: "90%", revenue: "₹1,75,430", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=100&h=100&fit=crop" },
  { name: "Skyline Studio", loc: "Delhi", occupancy: "88%", revenue: "₹1,60,220", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop" },
];

const growthAnalytics = [
  { label: "New Properties", val: "234", trend: "+18.6%", color: "#3B82F6" },
  { label: "New Tenants", val: "248", trend: "+10.4%", color: "#10B981" },
  { label: "Revenue Growth", val: "₹24,58,760", trend: "+14.7%", color: "#F59E0B" },
  { label: "Bookings", val: "356", trend: "+19.3%", color: "#6366F1" },
];

const revenueReportData = [
  { name: "Rent Collection", value: 1985430, color: "#3B82F6", percent: "80.7%" },
  { name: "Service Fees", value: 245300, color: "#10B981", percent: "10.0%" },
  { name: "Other Charges", value: 145230, color: "#F59E0B", percent: "5.9%" },
  { name: "Late Fees", value: 82800, color: "#6366F1", percent: "3.4%" },
];

const staffPerformance = [
  { name: "Neha Verma", role: "Property Manager", managed: 156, leads: 98, perf: "92%" },
  { name: "Rahul Singh", role: "Leasing Executive", managed: 128, leads: 76, perf: "88%" },
  { name: "Priya Nair", role: "Relationship Manager", managed: 112, leads: 69, perf: "85%" },
  { name: "Vikram Joshi", role: "Support Executive", managed: 98, leads: 54, perf: "78%" },
];

export default function ReportsOverview() {
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
               <span>May 22 - May 28, 2024</span>
            </div>
         </div>
      </div>

      {/* TOP ROW: 6 STATISTICAL CARDS (EXACT MATCH) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
         <ReportStatCard icon={Building} label="Total Properties" val="2,340" trend="+12.6%" color="blue" />
         <ReportStatCard icon={Users} label="Total Tenants" val="1,248" trend="+9.8%" color="emerald" />
         <ReportStatCard icon={Percent} label="Occupancy Rate" val="87.6%" trend="+4.3%" color="purple" />
         <ReportStatCard icon={IndianRupee} label="Monthly Revenue" val="₹24,58,760" trend="+14.7%" color="amber" />
         <ReportStatCard icon={Wallet} label="Net Profit" val="₹6,23,340" trend="+18.2%" color="blue" />
         <ReportStatCard icon={TrendingUp} label="Growth Rate" val="15.2%" trend="+3.6%" color="emerald" />
      </div>

      {/* MIDDLE ROW: REVENUE, OCCUPANCY, PERFORMANCE */}
      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Revenue Overview */}
         <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
               <select className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="flex items-center gap-2 mb-8">
               <div className="w-3 h-3 rounded-full bg-blue-600" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue (₹)</span>
            </div>
            <div className="flex-1 min-h-0">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueOverviewData}>
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
            </div>
            <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Revenue</span><span className="text-[13px] font-black text-slate-900 leading-none">₹24,58,760</span></div>
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Collection</span><span className="text-[13px] font-black text-slate-900 leading-none">₹24,20,340</span></div>
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total Payout</span><span className="text-[13px] font-black text-slate-900 leading-none">₹17,35,420</span></div>
               <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Net Profit</span><span className="text-[13px] font-black text-slate-900 leading-none">₹6,23,340</span></div>
            </div>
         </div>

         {/* Occupancy Rate Trend */}
         <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center h-[480px]">
            <div className="flex items-center justify-between w-full mb-8">
               <h3 className="text-lg font-bold text-slate-900">Occupancy Rate Trend</h3>
               <select className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="relative h-48 w-48 flex items-center justify-center mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={occupancyData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                        {occupancyData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-black text-slate-900">87.6%</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Occupancy Rate</p>
               </div>
            </div>
            <div className="w-full space-y-4 mt-auto">
               {occupancyData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-[11px] font-bold text-slate-500">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-900">{item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-300">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
            <div className="w-full mt-6 pt-4 border-t border-slate-50 flex items-center gap-2">
               <TrendingUp size={14} className="text-emerald-500" />
               <span className="text-[10px] font-bold text-emerald-500">4.3% from last month</span>
            </div>
         </div>

         {/* Property Performance */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Property Performance <span className="text-slate-400 text-sm font-medium ml-1">(Top 5)</span></h3>
               <button className="text-xs font-bold text-blue-600">View All</button>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span className="flex-1">Property Name</span>
                  <span className="w-20 text-center">Location</span>
                  <span className="w-20 text-center">Occupancy</span>
                  <span className="w-24 text-right">Revenue (₹)</span>
               </div>
               {propertyPerformance.map((p, i) => (
                  <div key={i} className="flex items-center group">
                     <div className="flex-1 flex items-center gap-3 min-w-0">
                        <img src={p.img} alt={p.name} className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0" />
                        <span className="text-[12px] font-bold text-slate-900 truncate leading-tight">{p.name}</span>
                     </div>
                     <span className="w-20 text-center text-[11px] font-bold text-slate-400">{p.loc}</span>
                     <span className="w-20 text-center text-[11px] font-black text-emerald-500">{p.occupancy}</span>
                     <span className="w-24 text-right text-[12px] font-black text-slate-900">{p.revenue}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* BOTTOM ROW: LOCATION, GROWTH, REVENUE REPORT */}
      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Location Wise Data */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Location Wise Data</h3>
               <select className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="flex-1 flex gap-6">
               <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center opacity-40">
                  <MapPin size={80} className="text-slate-200" />
               </div>
               <div className="w-44 space-y-4 pr-2">
                  {[
                     { name: "Mumbai", value: "₹8,45,600", count: "812 Properties" },
                     { name: "Bangalore", value: "₹5,67,230", count: "642 Properties" },
                     { name: "Pune", value: "₹4,35,120", count: "420 Properties" },
                     { name: "Hyderabad", value: "₹3,10,450", count: "312 Properties" },
                     { name: "Delhi", value: "₹2,00,360", count: "242 Properties" },
                  ].map((loc, i) => (
                     <div key={i} className="flex flex-col">
                        <div className="flex justify-between items-center mb-0.5">
                           <span className="text-[11px] font-bold text-slate-900">{loc.name}</span>
                           <span className="text-[11px] font-black text-slate-900">{loc.value}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{loc.count}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Growth Analytics */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-[420px]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Growth Analytics</h3>
               <select className="bg-slate-50 border-none rounded-xl px-4 py-1 text-xs font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="grid grid-cols-2 gap-6 flex-1">
               {growthAnalytics.map((g, i) => (
                  <div key={i} className="flex flex-col">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{g.label}</span>
                        <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={10} /> {g.trend}</span>
                     </div>
                     <h4 className="text-lg font-black text-slate-900 mb-2">{g.val}</h4>
                     <div className="flex-1 bg-slate-50/50 rounded-xl min-h-[60px] p-2">
                        <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={revenueOverviewData}>
                              <Line type="monotone" dataKey="val" stroke={g.color} strokeWidth={2} dot={false} />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Revenue Report */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center h-[420px]">
            <div className="flex items-center justify-between w-full mb-8">
               <h3 className="text-lg font-bold text-slate-900">Revenue Report</h3>
               <button className="text-xs font-bold text-blue-600">View Full Report</button>
            </div>
            <div className="relative h-48 w-48 flex items-center justify-center mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={revenueReportData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                        {revenueReportData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-lg font-black text-slate-900">₹24,58,760</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Revenue</p>
               </div>
            </div>
            <div className="w-full space-y-3 mt-auto">
               {revenueReportData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] font-bold">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-slate-400 truncate">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-slate-900">{item.value.toLocaleString()}</span>
                        <span className="text-slate-300 font-medium ml-1">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* FOOTER SECTION: STAFF & INSIGHTS */}
      <div className="grid grid-cols-12 gap-6">
         {/* Staff Performance Reports */}
         <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Staff Performance Reports</h3>
               <button className="text-xs font-bold text-blue-600">View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="text-left py-4 font-bold">Staff Name</th>
                        <th className="text-left py-4 font-bold">Role</th>
                        <th className="text-center py-4 font-bold">Properties Managed</th>
                        <th className="text-center py-4 font-bold">Leads</th>
                        <th className="text-right py-4 font-bold">Performance</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {staffPerformance.map((s, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">{s.name.split(' ').map(n=>n[0]).join('')}</div>
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
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Key Insights */}
         <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Key Insights</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Users size={18} /></div>
                  <p className="text-[11px] font-bold text-slate-600 leading-tight">Occupancy rate improved by 4.3% compared to last month.</p>
               </div>
               <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><MapPin size={18} /></div>
                  <p className="text-[11px] font-bold text-slate-600 leading-tight">Mumbai has the highest revenue contribution (34.4%).</p>
               </div>
               <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Building size={18} /></div>
                  <p className="text-[11px] font-bold text-slate-600 leading-tight">New properties added increased by 18.6% this month.</p>
               </div>
               <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><TrendingUp size={18} /></div>
                  <p className="text-[11px] font-bold text-slate-600 leading-tight">Net profit increased by 18.2% compared to last month.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- UTILITY COMPONENTS ---

function ReportStatCard({ icon: Icon, label, val, trend, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-500 bg-emerald-50",
    purple: "text-purple-500 bg-purple-50",
    amber: "text-amber-500 bg-amber-50",
  };
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:translate-y-[-2px] transition-all">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm", colors[color])}>
          <Icon size={18} />
       </div>
       <h4 className="text-xl font-black text-slate-900 leading-none mb-1">{val}</h4>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
       <div className="flex items-center gap-1">
          <TrendingUp size={10} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500">{trend}</span>
          <span className="text-[10px] font-medium text-slate-300 ml-1">from last month</span>
       </div>
    </div>
  );
}
