import React, { useState, useEffect } from "react";
import { 
  Users, Building2, Calendar, Wallet, 
  ArrowUpRight, ArrowDownRight, ChevronRight, 
  MoreVertical, Search, Bell, Clock,
  Plus, LayoutDashboard, Home, UserCircle, 
  CreditCard, MessageSquare, PieChart as PieIcon,
  ShieldCheck, Settings, LogOut, CheckCircle2,
  TrendingUp, Activity, ShoppingBag, DollarSign
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from "recharts";
import { fetchSuperadminStats } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { StatCard } from "../../components/superadmin/StatCard";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const overviewData = [
  { name: "Jan", users: 1200, bookings: 800, revenue: 500 },
  { name: "Feb", users: 1500, bookings: 750, revenue: 450 },
  { name: "Mar", users: 1400, bookings: 950, revenue: 600 },
  { name: "Apr", users: 1800, bookings: 1100, revenue: 750 },
  { name: "May", users: 2200, bookings: 1300, revenue: 850 },
];

const usersByRole = [
  { name: "Tenant", value: 7245, color: "hsl(var(--chart-1))", percent: "56.4%" },
  { name: "Owner", value: 3120, color: "hsl(var(--chart-2))", percent: "24.3%" },
  { name: "Agent", value: 1850, color: "hsl(var(--chart-3))", percent: "14.4%" },
  { name: "Others", value: 630, color: "hsl(var(--chart-4))", percent: "4.9%" },
];

const activities = [
  { icon: UserCircle, color: "blue", title: "New tenant Sarah Wilson added", sub: "2 BHK Apartment, Green Residency", time: "10:30 AM" },
  { icon: Building2, color: "green", title: "Property Green Villa updated", sub: "Rent increased to ₹25,000", time: "Yesterday" },
  { icon: DollarSign, color: "yellow", title: "Payment received from Amit Verma", sub: "₹25,000 for May 2025", time: "Yesterday" },
];

const colorMap = {
  blue: "bg-info-soft text-info",
  green: "bg-success-soft text-success",
  yellow: "bg-warning-soft text-warning",
  purple: "bg-purple-soft text-purple",
};

export default function SuperadminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, properties: 0, bookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Superadmin Dashboard - Roomhy",
    description: "Manage properties, tenants, owners and platform statistics securely.",
    canonical: "https://roomhy.com/superadmin/superadmin"
  });

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await fetchSuperadminStats();
        if (res.success) {
          setStats({
            totalUsers: (res.stats.tenants || 0) + (res.stats.owners || 0),
            properties: res.stats.properties || 0,
            bookings: res.stats.totalBookings || 0,
            revenue: res.stats.netRevenue || 0
          });
        }
      } catch (error) {
        console.error("Dashboard Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const resolveUser = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("manager_user") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("staff_user") ||
        localStorage.getItem("manager_user") ||
        localStorage.getItem("user") ||
        "{}"
      );
    } catch {
      return {};
    }
  };

  const user = resolveUser();
  const userName = user?.name || "User";
  const roleLower = String(user?.role || "").toLowerCase();
  const isEmployee = ["employee", "areamanager", "manager"].includes(roleLower);

  return (
    <main className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${userName}! Here's what's happening with Roomhy.`}
        actions={
          <div className="flex items-center gap-3 bg-white border border-border/60 px-4 py-2 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-all text-xs font-bold text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>May 2025</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard 
          label="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          delta="+12.5% this month" 
          trend="up" 
          icon={Users} 
          iconColor="blue" 
          loading={loading}
        />
        <StatCard 
          label="Total Properties" 
          value={stats.properties.toLocaleString()} 
          delta="+8.3% this month" 
          trend="up" 
          icon={Building2} 
          iconColor="green" 
          loading={loading}
        />
        <StatCard 
          label="Total Revenue" 
          value={`₹${stats.revenue.toLocaleString()}`} 
          delta="+15.6% this month" 
          trend="up" 
          icon={Wallet} 
          iconColor="yellow" 
          loading={loading}
        />
        <StatCard 
          label="Active Bookings" 
          value={stats.bookings.toLocaleString()} 
          delta="+5.2% this month" 
          trend="up" 
          icon={ShoppingBag} 
          iconColor="purple" 
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-slate-900">Revenue Overview</h3>
            <select aria-label="Revenue period" className="h-9 px-3 rounded-xl border border-border bg-slate-50 text-xs font-bold text-slate-500 outline-none">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} tickFormatter={(v) => `${v / 100}K`} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={3} fill="url(#rev)" dot={{ fill: "hsl(var(--chart-1))", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3 className="font-bold text-lg text-slate-900 mb-8">Users by Role</h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={usersByRole} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={5} stroke="none">
                  {usersByRole.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-black text-slate-900">12,845</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Users</div>
            </div>
          </div>
          <div className="mt-8 space-y-3">
            {usersByRole.map((s) => (
              <div key={s.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-sm font-semibold text-slate-500">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-slate-900">{s.value.toLocaleString()}</span>
                   <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{s.percent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg text-slate-900">Recent Activities</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {activities.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group">
                  <div className={cn("icon-bubble transition-transform group-hover:scale-105", colorMap[a.color])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900">{a.title}</div>
                    <div className="text-xs text-slate-400 font-medium">{a.sub}</div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest shrink-0">{a.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        {!isEmployee && (
        <div className="panel bg-blue-600 text-white border-none shadow-blue-600/20">
          <h3 className="font-bold text-lg mb-6">Quick Summary</h3>
          <div className="space-y-6">
            {[
              { label: "Total Revenue", value: "₹18.7L", trend: "+12%" },
              { label: "Direct Bookings", value: "842", trend: "+5%" },
              { label: "New Properties", value: "45", trend: "+8%" },
              { label: "Pending KYC", value: "128", trend: "-2%" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-2xl font-black">{item.value}</div>
                </div>
                <div className="bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold">
                  {item.trend}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-white text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg">
             Generate Full Report
          </button>
        </div>
        )}
      </div>
    </main>
  );
}
