import React, { useState, useEffect } from "react";
import { 
  Building2, CheckCircle2, Clock, XCircle, 
  ArrowUpRight, ArrowDownRight, ChevronRight, 
  MoreVertical, Search, Calendar, Plus,
  MapPin, User, ListFilter, LayoutGrid,
  ClipboardCheck, Eye, Trash2, Edit3,
  Users, MessageSquare, List
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";
import { fetchPropertyOverviewStats } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { StatCard } from "../../components/superadmin/StatCard";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const propertyStatusData = [
  { name: "Approved", value: 1783, color: "hsl(var(--chart-1))", percent: "76.2%" },
  { name: "Pending", value: 324, color: "hsl(var(--chart-2))", percent: "13.8%" },
  { name: "Rejected", value: 233, color: "hsl(var(--chart-3))", percent: "9.9%" },
];

const recentProperties = [
  { name: "Ocean View Apartment", owner: "John Doe", loc: "Mumbai", status: "Approved", date: "May 28, 2024" },
  { name: "Green Valley Villa", owner: "Priya Sharma", loc: "Bangalore", status: "Pending", date: "May 27, 2024" },
  { name: "Sunrise Heights", owner: "Amit Patel", loc: "Pune", status: "Approved", date: "May 27, 2024" },
  { name: "Lake View Residency", owner: "Neha Singh", loc: "Hyderabad", status: "Rejected", date: "May 26, 2024" },
];

const actionCards = [
  { title: "Add Properties", desc: "Add new properties to the platform", count: "142", sub: "Added this month", btn: "Add New Property", icon: Building2, color: "blue" },
  { title: "Approve / Reject", desc: "Review and take action on submitted properties", count: "324", sub: "Pending review", btn: "Review Now", icon: ClipboardCheck, color: "green" },
  { title: "Pending Properties", desc: "Properties waiting for approval", count: "324", sub: "Pending approval", btn: "View Pending", icon: Clock, color: "yellow" },
  { title: "All Properties List", desc: "View and manage all properties", count: "2,340", sub: "Total properties", btn: "View All Properties", icon: List, color: "purple" },
  { title: "Online Leads", desc: "Manage all incoming online leads", count: "1,256", sub: "This month", btn: "View Online Leads", icon: Users, color: "cyan" },
];

const COLORS = {
  blue: "bg-info-soft text-info",
  green: "bg-success-soft text-success",
  yellow: "bg-warning-soft text-warning",
  purple: "bg-purple-soft text-purple",
  cyan: "bg-cyan-50 text-cyan-600",
};

export default function PropertyOverview() {
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, leads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetchPropertyOverviewStats();
        if (res.success && res.summary) {
          setStats({
            total: res.summary.totalProperties || 2340,
            active: res.summary.activeProperties || 1783,
            pending: res.summary.pendingReview || 324,
            leads: 1256
          });
        }
      } catch (error) {
        console.error("Property Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Property Management" 
        subtitle="Manage and oversee all platform property listings."
        actions={
          <div className="flex items-center gap-3 bg-white border border-border/60 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>May 2025</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
         <StatCard label="Total Properties" value={stats.total.toLocaleString()} delta="+8.3%" trend="up" icon={Building2} iconColor="blue" loading={loading} />
         <StatCard label="Approved" value={stats.active.toLocaleString()} delta="+12.5%" trend="up" icon={CheckCircle2} iconColor="green" loading={loading} />
         <StatCard label="Pending Review" value={stats.pending.toLocaleString()} delta="+5.2%" trend="up" icon={Clock} iconColor="yellow" loading={loading} />
         <StatCard label="Incoming Leads" value={stats.leads.toLocaleString()} delta="+18.6%" trend="up" icon={MessageSquare} iconColor="purple" loading={loading} />
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-12 lg:col-span-5 panel">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-lg font-bold text-slate-900">Status Overview</h3>
               <select className="h-9 px-3 rounded-xl border border-border bg-slate-50 text-xs font-bold text-slate-500 outline-none">
                  <option>This Month</option>
               </select>
            </div>
            <div className="flex flex-col items-center justify-center">
               <div className="relative h-56 w-56 flex items-center justify-center mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={propertyStatusData} innerRadius={70} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                           {propertyStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <p className="text-3xl font-black text-slate-900">2,340</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</p>
                  </div>
               </div>
               <div className="w-full space-y-4">
                  {propertyStatusData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                           <span className="text-sm font-bold text-slate-500">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-black text-slate-900">{item.value.toLocaleString()}</span>
                           <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded-lg">{item.percent}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-7 panel">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-slate-900">Recent Listings</h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="text-left pb-4 font-bold">Property</th>
                        <th className="text-left pb-4 font-bold">Owner</th>
                        <th className="text-left pb-4 font-bold">Status</th>
                        <th className="text-left pb-4 font-bold">Date</th>
                        <th className="text-right pb-4"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {recentProperties.map((prop, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                           <td className="py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <Building2 size={16} />
                                 </div>
                                 <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-slate-900 truncate">{prop.name}</div>
                                    <div className="text-[11px] text-slate-400 font-medium">{prop.loc}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 text-[13px] text-slate-500 font-medium">{prop.owner}</td>
                           <td className="py-4">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-bold",
                                prop.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                prop.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                              )}>{prop.status}</span>
                           </td>
                           <td className="py-4 text-[11px] text-slate-400 font-bold uppercase tracking-tight">{prop.date}</td>
                           <td className="py-4 text-right">
                              <button className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-300 hover:text-slate-600">
                                 <MoreVertical size={16} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
         {actionCards.map((card, i) => (
            <div key={i} className="panel !p-6 flex flex-col items-center text-center group hover:translate-y-[-4px] transition-all">
               <div className={cn("icon-bubble mb-5 transition-transform group-hover:scale-110", COLORS[card.color])}>
                  <card.icon size={22} />
               </div>
               <h4 className="text-sm font-bold text-slate-900 mb-2 leading-tight">{card.title}</h4>
               <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-5">{card.desc}</p>
               
               <div className="mb-6 mt-auto">
                  <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{card.count}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{card.sub}</p>
               </div>

               <button className={cn(
                 "w-full py-2.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest",
                 card.color === "blue" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" :
                 "bg-slate-100 text-slate-600 hover:bg-slate-200"
               )}>
                  {card.btn}
               </button>
            </div>
         ))}
      </div>
    </div>
  );
}
