import { PageHeader } from "../../components/dashboard/PageHeader";
import { StatCard } from "../../components/dashboard/StatCard";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import { Home, Users, FileText, IndianRupee, Database, Eye, Download, Filter, RotateCcw, ArrowUp, ArrowDown, Building2, MapPin } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const perf = Array.from({ length: 7 }, (_, i) => ({
  name: `${20 + i} May`,
  listings: 16000 + i * 800,
  users: 11000 + i * 700,
  leads: 7000 + i * 800,
  revenue: 3000 + i * 400,
}));

const cats = [
  { name: "Listings", value: 12, color: "hsl(var(--chart-1))" },
  { name: "Users", value: 8, color: "hsl(var(--chart-2))" },
  { name: "Leads / Bookings", value: 10, color: "hsl(var(--chart-5))" },
  { name: "Revenue", value: 8, color: "hsl(var(--chart-3))" },
  { name: "Commission", value: 6, color: "hsl(var(--chart-4))" },
  { name: "Subscriptions", value: 4, color: "hsl(187 85% 43%)" },
  { name: "Refunds", value: 4, color: "hsl(280 75% 60%)" },
  { name: "Others", value: 4, color: "hsl(215 16% 65%)" },
];

const recentReports = [
  { name: "Revenue Summary Report", category: "Revenue", date: "26 May 2025, 10:30 AM", by: "Aman (Superadmin)", format: "PDF" },
  { name: "Listings Performance Report", category: "Listings", date: "26 May 2025, 09:15 AM", by: "Aman (Superadmin)", format: "Excel" },
  { name: "User Growth Report", category: "Users", date: "26 May 2025, 08:45 AM", by: "Aman (Superadmin)", format: "PDF" },
  { name: "Leads & Bookings Report", category: "Leads / Bookings", date: "25 May 2025, 07:30 PM", by: "Aman (Superadmin)", format: "Excel" },
  { name: "Commission Summary Report", category: "Commission", date: "25 May 2025, 06:10 PM", by: "Aman (Superadmin)", format: "PDF" },
];

const catCls = {
  Revenue: "bg-warning-soft text-warning",
  Listings: "bg-success-soft text-success",
  Users: "bg-brand-purple-soft text-brand-purple",
  "Leads / Bookings": "bg-orange-100 text-orange-600",
  Commission: "bg-destructive/10 text-destructive",
};

const shortcuts = [
  { icon: Home, label: "Listings Report", color: "blue" },
  { icon: Users, label: "Users Report", color: "green" },
  { icon: FileText, label: "Leads / Bookings Report", color: "purple" },
  { icon: IndianRupee, label: "Revenue Report", color: "yellow" },
  { icon: Database, label: "Commission Report", color: "red" },
  { icon: FileText, label: "Subscriptions Report", color: "blue" },
  { icon: FileText, label: "Refunds Report", color: "purple" },
  { icon: Building2, label: "Performance Report", color: "blue" },
  { icon: MapPin, label: "Locations Report", color: "green" },
];

export default function ReportsCommission() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader
        title="Commission Report"
        subtitle="Analysis of commission collected from bookings."
        actions={
          <>
            <DateRangePill value="20 May 2025 - 26 May 2025" />
            <button className="h-11 px-5 rounded-xl border border-border bg-card font-medium text-sm flex items-center gap-2 hover:bg-muted">
              <Download className="h-4 w-4" /> Export Report
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Listings" value="2,548" delta="+156 vs last week" trend="up" icon={Home} iconColor="blue" />
        <StatCard label="Total Users" value="18,745" delta="+8.6% vs last week" trend="up" icon={Users} iconColor="green" />
        <StatCard label="Total Leads / Bookings" value="6,482" delta="+12.3% vs last week" trend="up" icon={FileText} iconColor="purple" />
        <StatCard label="Total Revenue" value="₹18,75,000" delta="+15.6% vs last week" trend="up" icon={IndianRupee} iconColor="yellow" />
        <StatCard label="Total Commission" value="₹2,85,750" delta="+12.4% vs last week" trend="up" icon={Database} iconColor="red" />
        <StatCard label="Total Refunds" value="₹45,250" delta="-3.2% vs last week" trend="down" icon={Eye} iconColor="purple" />
      </div>

      {/* Filters */}
      <div className="panel">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-end">
          {[
            { label: "Date Range", value: "20 May 2025 - 26 May 2025" },
            { label: "Compare With", value: "13 May 2025 - 19 May 2025" },
            { label: "Property Type", value: "All Types" },
            { label: "Location", value: "All Locations" },
          ].map((f) => (
            <div key={f.label} className="xl:col-span-1">
              <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <button className="w-full h-11 px-3 rounded-xl border border-border bg-card text-sm text-left flex items-center justify-between">
                <span className="truncate">{f.value}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            </div>
          ))}
          <button className="h-11 rounded-xl border border-border bg-card font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="h-11 rounded-xl border border-border bg-card font-medium text-sm flex items-center justify-center gap-2 hover:bg-muted">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="panel">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Performance Summary</h3>
            <select className="h-8 px-2 rounded-lg border border-border text-xs"><option>This Week</option></select>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={perf}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="listings" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="leads" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3 className="font-semibold mb-4">Reports by Category</h3>
          <div className="flex items-center gap-4">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={cats} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {cats.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xl font-bold">56</div>
                <div className="text-[10px] text-muted-foreground">Reports</div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-1.5 text-xs">
              {cats.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-muted-foreground">{c.value} ({((c.value / 56) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Top Insights</h3>
            <button className="text-sm text-primary font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { trend: "up", color: "success", title: "Revenue increased by 15.6%", sub: "vs last week" },
              { trend: "up", color: "info", title: "Leads increased by 12.3%", sub: "vs last week" },
              { trend: "up", color: "warning", title: "Active users increased by 8.6%", sub: "vs last week" },
              { trend: "down", color: "destructive", title: "Refunds decreased by 3.2%", sub: "vs last week" },
            ].map((ins, i) => {
              const cls = {
                success: "bg-success-soft text-success",
                info: "bg-info-soft text-info",
                warning: "bg-warning-soft text-warning",
                destructive: "bg-destructive/10 text-destructive",
              };
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${cls[ins.color]}`}>
                    {ins.trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{ins.title}</div>
                    <div className="text-xs text-muted-foreground">{ins.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Reports</h3>
            <button className="text-sm text-primary font-medium">View All</button>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left px-6 py-2 font-medium">Report Name</th>
                  <th className="text-left py-2 font-medium">Category</th>
                  <th className="text-left py-2 font-medium">Generated On</th>
                  <th className="text-left py-2 font-medium">Generated By</th>
                  <th className="text-left py-2 font-medium">Format</th>
                  <th className="text-right px-6 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentReports.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-6 py-3 font-medium">{r.name}</td>
                    <td><span className={`badge-soft ${catCls[r.category] ?? "bg-muted text-muted-foreground"}`}>{r.category}</span></td>
                    <td className="text-muted-foreground">{r.date}</td>
                    <td className="text-muted-foreground">{r.by}</td>
                    <td className="text-muted-foreground">{r.format}</td>
                    <td className="px-6 text-right">
                      <button className="p-2 rounded-lg hover:bg-muted text-primary"><Download className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h3 className="font-semibold mb-4">Report Shortcuts</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {shortcuts.map((s, i) => {
              const Icon = s.icon;
              const cls = {
                blue: "bg-info-soft text-info",
                green: "bg-success-soft text-success",
                purple: "bg-brand-purple-soft text-brand-purple",
                yellow: "bg-warning-soft text-warning",
                red: "bg-destructive/10 text-destructive",
              };
              return (
                <button key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-border hover:bg-muted/50 text-left">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${cls[s.color]}`}><Icon className="h-4 w-4" /></div>
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="font-semibold mb-1">Schedule Reports</h3>
        <p className="text-sm text-muted-foreground mb-5">Automate your reports and get them delivered on time.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: "Weekly Revenue Report", schedule: "Every Monday at 08:00 AM", recipients: "aman@roomhy.com, finance@roomhy.com" },
            { title: "Monthly Commission Report", schedule: "1st of Every Month at 10:00 AM", recipients: "aman@roomhy.com" },
            { title: "Monthly User Report", schedule: "1st of Every Month at 10:30 AM", recipients: "team@roomhy.com" },
          ].map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-info-soft text-info flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{r.schedule}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">Recipients: {r.recipients}</div>
                </div>
                <span className="badge-soft bg-success-soft text-success">Active</span>
              </div>
              <div className="flex justify-end mt-2">
                <div className="relative w-10 h-5 bg-primary rounded-full">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          ))}
          <button className="p-4 rounded-xl border-2 border-dashed border-border hover:bg-muted/50 flex flex-col items-center justify-center gap-2 text-sm text-primary font-medium">
            <span className="text-2xl">+</span>
            Schedule New Report
            <span className="text-xs text-muted-foreground">Create a new scheduled report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
