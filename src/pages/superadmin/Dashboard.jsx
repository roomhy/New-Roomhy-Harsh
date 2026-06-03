import React from "react";
import { Building2, User, DollarSign, FileText, UserPlus, Wrench, TrendingUp, FileBarChart } from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { StatCard } from "../../components/dashboard/StatCard";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const revenueData = [
  { name: "Jan", v: 5000 }, { name: "Feb", v: 10500 },
  { name: "Mar", v: 16000 }, { name: "Apr", v: 14500 }, { name: "May", v: 20000 },
];

const propertyStatus = [
  { name: "Occupied", value: 76, color: "hsl(var(--chart-1))" },
  { name: "Vacant", value: 34, color: "hsl(var(--chart-2))" },
  { name: "Maintenance", value: 12, color: "hsl(var(--chart-3))" },
  { name: "Blocked", value: 6, color: "hsl(var(--chart-4))" },
];

const activities = [
  { icon: UserPlus, color: "green", title: "New tenant Rahul Sharma added", sub: "2 BHK Apartment, Green Residency", time: "10:30 AM" },
  { icon: Building2, color: "blue", title: "Property Green Villa updated", sub: "Rent increased to ₹25,000", time: "Yesterday" },
  { icon: DollarSign, color: "yellow", title: "Payment received from Amit Verma", sub: "₹25,000 for May 2025", time: "Yesterday" },
  { icon: Wrench, color: "purple", title: "Maintenance request #MR-125 updated", sub: "Bathroom plumbing issue resolved", time: "19 May 2025" },
];

const colorMap = {
  green: "bg-success-soft text-success",
  blue: "bg-info-soft text-info",
  yellow: "bg-warning-soft text-warning",
  purple: "bg-brand-purple-soft text-brand-purple",
};

export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back, Aman! Here's what's happening."
        actions={<DateRangePill value="20 May 2025" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Properties" value="128" delta="+12 this month" trend="up" icon={Building2} iconColor="blue" />
        <StatCard label="Total Tenants" value="342" delta="+18 this month" trend="up" icon={User} iconColor="green" />
        <StatCard label="Total Revenue" value="₹18,75,000" delta="+15.6% this month" trend="up" icon={DollarSign} iconColor="yellow" />
        <StatCard label="Total Expenses" value="₹6,45,000" delta="-5.3% this month" trend="down" icon={FileText} iconColor="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Revenue Overview</h3>
            <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#rev)" dot={{ fill: "hsl(var(--chart-1))", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3 className="font-semibold text-lg mb-6">Property Status</h3>
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={propertyStatus} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {propertyStatus.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-bold">128</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {propertyStatus.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span>{s.name}</span>
                </div>
                <span className="text-muted-foreground">{s.value} ({((s.value / 128) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-lg">Recent Activities</h3>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-border">
            {activities.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className={`icon-bubble h-11 w-11 ${colorMap[a.color]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.sub}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{a.time}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <h3 className="font-semibold text-lg mb-5">Monthly Summary</h3>
          <div className="space-y-4">
            {[
              { icon: DollarSign, color: "green", label: "Total Revenue", value: "₹18,75,000", valColor: "text-success" },
              { icon: FileText, color: "red", label: "Total Expenses", value: "₹6,45,000", valColor: "text-destructive" },
              { icon: TrendingUp, color: "blue", label: "Net Profit", value: "₹12,30,000", valColor: "text-info" },
              { icon: FileBarChart, color: "yellow", label: "Outstanding Amount", value: "₹3,25,000", valColor: "text-warning" },
            ].map((row, i) => {
              const Icon = row.icon;
              const cls = {
                green: "bg-success-soft text-success",
                red: "bg-destructive/10 text-destructive",
                blue: "bg-info-soft text-info",
                yellow: "bg-warning-soft text-warning",
              };
              return (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${cls[row.color]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{row.label}</span>
                  </div>
                  <span className={`font-semibold text-sm ${row.valColor}`}>{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
