import React from "react";
import { 
  BarChart3, TrendingUp, Users, Building2, 
  IndianRupee, Percent, ArrowUpRight, ArrowDownRight, 
  ChevronRight, MoreVertical, Search, Calendar, 
  MapPin, Globe, Activity, Star, 
  PieChart as PieIcon, LineChart as LineIcon, 
  Download, Filter, Target, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line
} from "recharts";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- EXACT DATA FROM REPORT & ANALYTICS OVERVIEW SCREENSHOT ---

const revenueTrend = [
  { name: "Dec", value: 1400000 },
  { name: "Jan", value: 1800000 },
  { name: "Feb", value: 1600000 },
  { name: "Mar", value: 2200000 },
  { name: "Apr", value: 2000000 },
  { name: "May", value: 2458760 },
];

const occupancyData = [
  { name: "Occupied", value: 2050, color: "#3B82F6", percent: "87.6%" },
  { name: "Vacant", value: 240, color: "#10B981", percent: "10.3%" },
  { name: "Maintenance", value: 50, color: "#F59E0B", percent: "2.1%" },
];

const propertyPerformance = [
  { name: "Ocean View Apartment", location: "Mumbai", occupancy: "98%", revenue: "₹ 2,45,600", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=100&h=100&fit=crop" },
  { name: "Green Valley Villa", location: "Bangalore", occupancy: "96%", revenue: "₹ 2,10,350", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop" },
  { name: "Sunrise Heights", location: "Pune", occupancy: "93%", revenue: "₹ 1,98,760", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=100&h=100&fit=crop" },
  { name: "Lake View Residency", location: "Hyderabad", occupancy: "90%", revenue: "₹ 1,75,430", image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=100&h=100&fit=crop" },
  { name: "Skyline Studio", location: "Delhi", occupancy: "88%", revenue: "₹ 1,60,220", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=100&h=100&fit=crop" },
];

const locationData = [
  { city: "Mumbai", properties: 812, revenue: "₹ 8,45,600", percent: 34 },
  { city: "Bangalore", properties: 632, revenue: "₹ 5,67,230", percent: 26 },
  { city: "Pune", properties: 420, revenue: "₹ 4,35,120", percent: 18 },
  { city: "Hyderabad", properties: 312, revenue: "₹ 3,10,450", percent: 12 },
  { city: "Delhi", properties: 242, revenue: "₹ 2,00,360", percent: 10 },
];

const revenueReportData = [
  { name: "Rent Collection", value: 1985420, color: "#3B82F6", percent: "80.7%" },
  { name: "Service Fees", value: 245300, color: "#10B981", percent: "10.0%" },
  { name: "Other Charges", value: 145230, color: "#F59E0B", percent: "5.9%" },
  { name: "Late Fees", value: 82800, color: "#6366F1", percent: "3.4%" },
];

const staffPerformance = [
  { name: "Neha Verma", role: "Property Manager", managed: 156, leads: 98, performance: "92%", avatar: "https://i.pravatar.cc/150?u=neha" },
  { name: "Rahul Singh", role: "Leasing Executive", managed: 128, leads: 76, performance: "88%", avatar: "https://i.pravatar.cc/150?u=rahul" },
  { name: "Priya Nair", role: "Relationship Manager", managed: 112, leads: 69, performance: "85%", avatar: "https://i.pravatar.cc/150?u=priya" },
  { name: "Vikram Joshi", role: "Support Executive", managed: 98, leads: 54, performance: "78%", avatar: "https://i.pravatar.cc/150?u=vikram" },
];

export default function ReportAnalytics() {
  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full font-inter">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Report & Analytics Overview</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
               <span className="hover:text-blue-600 cursor-pointer transition-colors">Reports & Analytics</span>
               <ChevronRight size={12} className="opacity-50" />
               <span className="text-blue-600">Overview</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
               <Calendar className="w-4 h-4 text-slate-400" />
               <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">May 22 - May 28, 2024</span>
            </div>
         </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
         <StatCardSmall label="Total Properties" value="2,340" trend="12.5%" up icon={Building2} color="blue" />
         <StatCardSmall label="Total Tenants" value="1,248" trend="9.8%" up icon={Users} color="emerald" />
         <StatCardSmall label="Occupancy Rate" value="87.6%" trend="4.3%" up icon={Percent} color="purple" />
         <StatCardSmall label="Monthly Revenue" value="₹ 24,58,760" trend="14.7%" up icon={IndianRupee} color="amber" />
         <StatCardSmall label="Net Profit" value="₹ 6,23,340" trend="16.2%" up icon={TrendingUp} color="blue" />
         <StatCardSmall label="Growth Rate" value="15.2%" trend="3.8%" up icon={Activity} color="emerald" />
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Revenue Overview Hub */}
         <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue (₹)</span>
                  </div>
                  <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none">
                     <option>This Month</option>
                  </select>
               </div>
            </div>
            <div className="h-[300px] mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} dx={-15} />
                     <Tooltip />
                     <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-slate-50">
               <SummaryMiniStat label="Total Revenue" value="₹ 24,58,760" />
               <SummaryMiniStat label="Total Collection" value="₹ 24,20,340" />
               <SummaryMiniStat label="Total Payout" value="₹ 17,35,420" />
               <SummaryMiniStat label="Net Profit" value="₹ 6,23,340" isHighlight />
            </div>
         </div>

         {/* Occupancy Rate Donut */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-slate-900">Occupancy Rate Trend</h3>
               <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="relative h-64 flex items-center justify-center mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={occupancyData} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                        {occupancyData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-black text-slate-900">87.6%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Occupancy Rate</p>
               </div>
            </div>
            <div className="space-y-4">
               {occupancyData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{backgroundColor: item.color}} />
                        <span className="text-sm font-bold text-slate-500">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900">{item.value.toLocaleString()}</span>
                        <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded-lg">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2">
               <ArrowUpRight size={16} className="text-emerald-600" />
               <span className="text-xs font-bold text-emerald-600">4.3% from last month</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Property Performance */}
         <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Property Performance (Top 5)</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="pb-4">Property Name</th>
                        <th className="pb-4">Location</th>
                        <th className="pb-4">Occupancy</th>
                        <th className="pb-4 text-right">Revenue (₹)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {propertyPerformance.map((p, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                           <td className="py-4">
                              <div className="flex items-center gap-3">
                                 <img src={p.image} className="w-10 h-10 rounded-xl object-cover shadow-sm transition-transform group-hover:scale-110" alt="" />
                                 <span className="text-sm font-bold text-slate-800">{p.name}</span>
                              </div>
                           </td>
                           <td className="py-4 text-xs font-semibold text-slate-500">{p.location}</td>
                           <td className="py-4">
                              <div className="flex items-center gap-2">
                                 <span className="text-xs font-bold text-emerald-600">{p.occupancy}</span>
                                 <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{width: p.occupancy}} />
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 text-right text-sm font-black text-slate-900">{p.revenue}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Revenue Report Donut */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-slate-900">Revenue Report</h3>
               <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View Full Report</button>
            </div>
            <div className="relative h-56 flex items-center justify-center mb-10">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={revenueReportData} innerRadius={65} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                        {revenueReportData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-black text-slate-900">₹24,58,760</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Revenue</p>
               </div>
            </div>
            <div className="space-y-4">
               {revenueReportData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-xs font-semibold text-slate-500">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-3 text-right">
                        <span className="text-xs font-black text-slate-900">₹{item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         {/* Location Wise Data */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Location Wise Data</h3>
               <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="relative w-full max-w-[280px] shrink-0 opacity-80 group">
                  {/* Mock India Map Shape */}
                  <div className="w-full h-64 bg-blue-50 rounded-3xl border border-blue-100 flex items-center justify-center overflow-hidden">
                     <Globe size={180} className="text-blue-100/50" />
                     {/* Location Points */}
                     <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 animate-pulse" />
                     <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 animate-pulse" />
                     <div className="absolute bottom-1/4 right-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 animate-pulse" />
                  </div>
               </div>
               <div className="flex-1 space-y-6 w-full">
                  {locationData.map((item) => (
                     <div key={item.city} className="space-y-2">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                              <span className="text-xs font-black text-slate-900">{item.city}</span>
                           </div>
                           <span className="text-xs font-bold text-slate-900">{item.revenue}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{width: `${item.percent}%`}} />
                           </div>
                           <span className="text-[10px] font-bold text-slate-400 w-24 text-right truncate">{item.properties} Properties</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Growth Analytics */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-slate-900">Growth Analytics</h3>
               <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-[10px] font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-10">
               <GrowthItem label="New Properties" value="234" trend="+18.6%" up />
               <GrowthItem label="New Tenants" value="248" trend="+10.4%" up />
               <GrowthItem label="Revenue Growth" value="+14.7%" trend="+14.7%" up isFull />
               <GrowthItem label="Bookings" value="356" trend="+19.3%" up />
            </div>
            <div className="h-[150px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                     <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.05} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Staff Performance */}
         <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Staff Performance Reports</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="pb-4">Staff Name</th>
                        <th className="pb-4">Role</th>
                        <th className="pb-4">Properties Managed</th>
                        <th className="pb-4">Leads</th>
                        <th className="pb-4 text-right">Performance</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {staffPerformance.map((s, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                           <td className="py-4">
                              <div className="flex items-center gap-3">
                                 <img src={s.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm transition-transform group-hover:scale-110" alt="" />
                                 <span className="text-sm font-bold text-slate-800">{s.name}</span>
                              </div>
                           </td>
                           <td className="py-4 text-xs font-semibold text-slate-500">{s.role}</td>
                           <td className="py-4 text-xs font-bold text-slate-900">{s.managed}</td>
                           <td className="py-4 text-xs font-bold text-slate-900">{s.leads}</td>
                           <td className="py-4 text-right">
                              <span className={cn(
                                 "px-2.5 py-1 rounded-lg text-[10px] font-bold",
                                 parseInt(s.performance) > 90 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                              )}>
                                 {s.performance}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Key Insights */}
         <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm h-full flex flex-col justify-between">
               <h3 className="text-lg font-bold text-slate-900 mb-8">Key Insights</h3>
               <div className="space-y-8">
                  <InsightCard 
                    label="Occupancy rate improved by 4.3% compared to last month." 
                    icon={TrendingUp} 
                    color="blue"
                  />
                  <InsightCard 
                    label="Mumbai has the highest revenue contribution (34.4%)." 
                    icon={MapPin} 
                    color="emerald"
                  />
                  <InsightCard 
                    label="New properties added increased by 18.6% this month." 
                    icon={Building2} 
                    color="purple"
                  />
                  <InsightCard 
                    label="Net profit increased by 16.2% compared to last month." 
                    icon={Zap} 
                    color="amber"
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- UTILITY COMPONENTS ---

function StatCardSmall({ label, value, trend, up, icon: Icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
    amber: "text-amber-600 bg-amber-50",
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col transition-all hover:translate-y-[-4px] hover:shadow-md group">
       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm mb-4", colors[color])}>
          <Icon size={22} />
       </div>
       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
       <p className="text-lg font-black text-slate-900 tracking-tight leading-none mb-3 truncate">{value}</p>
       <div className="flex items-center gap-1.5 mt-auto">
          {up ? <ArrowUpRight size={12} className="text-emerald-600" /> : <ArrowDownRight size={12} className="text-rose-600" />}
          <span className={cn("text-[10px] font-bold", up ? "text-emerald-600" : "text-rose-600")}>{trend}</span>
          <span className="text-[10px] text-slate-400 font-medium lowercase">from last month</span>
       </div>
    </div>
  );
}

function SummaryMiniStat({ label, value, isHighlight }) {
  return (
    <div>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{label}</p>
       <p className={cn("text-lg font-black tracking-tight leading-none", isHighlight ? "text-blue-600" : "text-slate-900")}>{value}</p>
    </div>
  );
}

function GrowthItem({ label, value, trend, up, isFull }) {
  return (
    <div className={isFull ? "col-span-2" : ""}>
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
       <div className="flex items-center justify-between">
          <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
          <div className="flex items-center gap-1">
             <ArrowUpRight size={12} className="text-emerald-600" />
             <span className="text-[10px] font-bold text-emerald-600">{trend}</span>
          </div>
       </div>
    </div>
  );
}

function InsightCard({ label, icon: Icon, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
    amber: "text-amber-600 bg-amber-50",
  };
  return (
    <div className="flex items-start gap-5 group cursor-pointer">
       <div className={cn("p-2.5 rounded-xl shrink-0 shadow-sm transition-transform group-hover:scale-110", colors[color])}>
          <Icon size={20} />
       </div>
       <p className="text-[12px] font-semibold text-slate-500 leading-relaxed group-hover:text-slate-900 transition-colors">{label}</p>
    </div>
  );
}
