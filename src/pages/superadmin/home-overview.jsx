import React, { useState, useEffect } from "react";
import { 
  Building2, Users, IndianRupee, Clock, 
  ArrowUpRight, ArrowDownRight, ChevronRight, 
  MoreVertical, Search, Calendar, Bell,
  CheckCircle2, AlertCircle, Activity,
  TrendingUp, Home, LayoutGrid, MapPin,
  ShieldCheck, Globe, Star, PieChart as PieIcon,
  DollarSign, ShoppingBag, UserCircle, MessageSquare
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { fetchHomeOverviewStats } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// --- STATIC DATA FOR UI CONSISTENCY ---
const revenueLineData = [
  { name: "May 1", revenue: 12000 },
  { name: "May 8", revenue: 28000 },
  { name: "May 15", revenue: 24000 },
  { name: "May 22", revenue: 42000 },
  { name: "May 29", revenue: 48000 },
];

const propertiesByStatus = [
  { name: "Occupied", value: 1480, color: "#10B981", percent: "63.2%" },
  { name: "Vacant", value: 520, color: "#3B82F6", percent: "22.2%" },
  { name: "Maintenance", value: 180, color: "#F59E0B", percent: "7.7%" },
  { name: "Others", value: 160, color: "#6366F1", percent: "6.8%" },
];

const tenantsByType = [
  { name: "Family", value: 6250, color: "#3B82F6", percent: "48.7%" },
  { name: "Bachelor", value: 4320, color: "#10B981", percent: "33.6%" },
  { name: "Commercial", value: 1650, color: "#F59E0B", percent: "12.9%" },
  { name: "Others", value: 625, color: "#6366F1", percent: "4.8%" },
];

const pendingRentAlerts = [
  { name: "John Smith", prop: "Ocean View Apartment - A101", amount: "$1,200", due: "5 days overdue", initial: "JS" },
  { name: "Priya Wilson", prop: "Green Park Residency - B203", amount: "$950", due: "3 days overdue", initial: "PW" },
  { name: "Ravi Mehta", prop: "Sunrise Heights - C301", amount: "$1,500", due: "2 days overdue", initial: "RM" },
  { name: "Ankit Kumar", prop: "Lake View Towers - D404", amount: "$1,100", due: "1 day overdue", initial: "AK" },
  { name: "Sneha Patel", prop: "Prime City Homes - E502", amount: "$800", due: "Today", initial: "SP" },
];

const recentActivities = [
  { title: "New property added", desc: "Sunset Villa has been added.", time: "10 min ago", icon: Building2, color: "bg-blue-50 text-blue-600" },
  { title: "New tenant registered", desc: "Arjun Sharma has registered.", time: "25 min ago", icon: UserCircle, color: "bg-emerald-50 text-emerald-600" },
  { title: "Rent collected", desc: "$2,450 collected from 3 tenants.", time: "1 hour ago", icon: DollarSign, color: "bg-amber-50 text-amber-600" },
  { title: "Maintenance request", desc: "New request from A101 - Ocean View Apartment.", time: "2 hours ago", icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
];

export default function HomeOverview() {
  const [stats, setStats] = useState({ properties: 0, tenants: 0, revenue: 0, alerts: 0 });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [pendingAlerts, setPendingAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetchHomeOverviewStats();
        if (res.success && res.summary) {
          console.log("Home Stats Fetched:", res);
          setStats({
            properties: res.summary.totalProperties || 0,
            tenants: res.summary.totalTenants || 0,
            revenue: res.summary.monthlyRevenue || 0,
            alerts: res.summary.alerts || 0
          });
          if (res.revenueTrend) setRevenueTrend(res.revenueTrend);
          if (res.pendingAlerts) setPendingAlerts(res.pendingAlerts);
        } else {
           console.warn("Home Stats API returned failure or empty summary");
        }
      } catch (error) {
        console.error("Home Overview Stats Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Overview"
        subtitle="Welcome back, Aman! Here's an overview of your platform."
        breadcrumbs={[
          { label: "Home" },
          { label: "Overview", active: true }
        ]}
        actions={
          <div className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>May 22 - May 28, 2024</span>
          </div>
        }
      />


      {/* Stats Row - LIVE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         <HomeStatCard label="Total Properties" value={loading ? "..." : stats.properties.toLocaleString()} trend="+ 8.3% from last week" icon={Building2} color="blue" up loading={loading} />
         <HomeStatCard label="Total Tenants" value={loading ? "..." : stats.tenants.toLocaleString()} trend="+ 12.5% from last week" icon={Users} color="emerald" up loading={loading} />
         <HomeStatCard label="Revenue Overview" value={loading ? "..." : `$${stats.revenue.toLocaleString()}`} trend="+ 18.6% from last week" icon={DollarSign} color="purple" up loading={loading} />
         <HomeStatCard label="Alerts (Pending Rent)" value={loading ? "..." : stats.alerts.toString()} trend="Tenants with pending rent" icon={Bell} color="amber" up loading={loading} />
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
         {/* Revenue Overview Chart */}
         <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
               <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-xs font-bold text-slate-500 outline-none cursor-pointer">
                  <option>This Month</option>
               </select>
            </div>
            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Revenue (USD)</span>
               </div>
            </div>
            <div className="h-[250px] mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend.length > 0 ? revenueTrend : revenueLineData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} dx={-15} />
                     <Tooltip />
                     <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{fill: '#3B82F6', r: 4}} activeDot={{r: 6}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-8 border-t border-slate-50">
               <MiniMetric label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} />
               <MiniMetric label="Collected" value="$72,340" color="text-emerald-500" />
               <MiniMetric label="Pending" value="$13,334" color="text-amber-500" />
               <MiniMetric label="Growth" value="18.6%" color="text-emerald-500" />
            </div>
         </div>

         {/* Pending Rent Alerts Sidebar */}
         <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Pending Rent Alerts</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="space-y-6 flex-1">
               {pendingAlerts.length > 0 ? pendingAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                     <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                        {alert.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[13px] font-bold text-slate-900 truncate leading-none mb-1.5">{alert.name}</h4>
                           <span className="text-[13px] font-bold text-slate-900">₹{alert.amount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] text-slate-400 font-medium truncate">{alert.property}</p>
                           <span className={cn("text-[10px] font-bold", alert.overdue > 0 ? "text-rose-500" : "text-emerald-500")}>
                             {alert.overdue > 0 ? `${alert.overdue} days overdue` : 'Due Today'}
                           </span>
                        </div>
                     </div>
                     <button className="p-1.5 bg-rose-50 text-rose-500 rounded-lg shrink-0">
                        <Bell size={14} />
                     </button>
                  </div>
               )) : (
                 <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                    <Bell size={32} className="mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Pending Alerts</p>
                 </div>
               )}
            </div>
            <button className="w-full mt-8 py-3 text-xs font-bold text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-all uppercase tracking-widest">
               View All Alerts
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Donut Charts & Activity Section */}
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Properties by Status</h3>
            <div className="relative h-48 flex items-center justify-center mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={propertiesByStatus} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {propertiesByStatus.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-slate-900">{stats.properties.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</p>
               </div>
            </div>
            <div className="space-y-3">
               {propertiesByStatus.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-xs font-semibold text-slate-500">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900">{item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Tenants by Type</h3>
            <div className="relative h-48 flex items-center justify-center mb-8">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={tenantsByType} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {tenantsByType.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-slate-900">{stats.tenants.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</p>
               </div>
            </div>
            <div className="space-y-3">
               {tenantsByType.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                        <span className="text-xs font-semibold text-slate-500">{item.name}</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900">{item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400">({item.percent})</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto">
               {recentActivities.map((act, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0", act.color)}>
                        <act.icon size={18} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-slate-900 leading-none mb-1">{act.title}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">{act.desc}</p>
                     </div>
                     <span className="text-[10px] font-bold text-slate-300 shrink-0">{act.time}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

// --- UTILITY COMPONENTS ---

function HomeStatCard({ label, value, trend, icon: Icon, color, up, loading }) {
  const iconBg = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:translate-y-[-4px] hover:shadow-md group">
       <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", iconBg[color])}>
          <Icon size={24} />
       </div>
       <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
          {loading ? (
             <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-md" />
          ) : (
             <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</h4>
          )}
          <div className="flex items-center gap-1.5 mt-2">
             {up ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-rose-500" />}
             <span className="text-[10px] font-bold text-slate-400 truncate">{trend}</span>
          </div>
       </div>
       <button className="text-blue-600 hover:text-blue-700 transition-colors">
          <ChevronRight size={18} />
       </button>
    </div>
  );
}

function MiniMetric({ label, value, color = "text-slate-900" }) {
  return (
    <div className="flex flex-col">
       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
       <span className={cn("text-lg font-black tracking-tight", color)}>{value}</span>
    </div>
  );
}
