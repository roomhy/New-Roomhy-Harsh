import React from "react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { StatCard } from "../../components/dashboard/StatCard";
import { DateRangePill } from "../../components/dashboard/DateRangePill";
import { Home, Hourglass, Flag, Eye, IndianRupee, Plus, ListChecks, FolderTree, Sparkles, FileText, AlertTriangle, Shield, ShieldAlert, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const overview = Array.from({ length: 7 }, (_, i) => ({
  name: `${1 + i * 5} May`,
  total: 1900 + i * 90 + (i === 3 ? -100 : 0),
  active: 1300 + i * 70,
  deactivated: 50 + i * 25,
}));

const byStatus = [
  { name: "Active", value: 2102, color: "hsl(var(--chart-1))" },
  { name: "Pending", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Flagged", value: 7, color: "hsl(var(--chart-4))" },
  { name: "Inactive", value: 421, color: "hsl(var(--chart-2))" },
];

const byType = [
  { name: "PG / Co-Living", value: 1248, color: "hsl(var(--chart-1))" },
  { name: "Apartment", value: 872, color: "hsl(var(--chart-2))" },
  { name: "Villa", value: 248, color: "hsl(var(--chart-3))" },
  { name: "Independent House", value: 180, color: "hsl(var(--chart-4))" },
];

const listings = [
  { title: "Green Villa Residency", sub: "3 BHK Villa", owner: "Rahul Sharma", loc: "Bangalore", price: "₹25,000 /mo", status: "Active", date: "20 May 2025" },
  { title: "Silver Heights PG", sub: "Twin Sharing", owner: "Priya Verma", loc: "Pune", price: "₹8,500 /mo", status: "Pending", date: "20 May 2025" },
  { title: "Blue Bells Apartment", sub: "2 BHK Flat", owner: "Amit Kumar", loc: "Hyderabad", price: "₹18,000 /mo", status: "Active", date: "19 May 2025" },
  { title: "Sunset Co-Living", sub: "Private Room", owner: "Neha Singh", loc: "Bangalore", price: "₹12,000 /mo", status: "Active", date: "19 May 2025" },
  { title: "Maple House", sub: "Independent House", owner: "Vikram Patel", loc: "Chennai", price: "₹30,000 /mo", status: "Flagged", date: "18 May 2025" },
];

const topLoc = [
  { name: "Bangalore", count: 856, pct: 33.6 },
  { name: "Pune", count: 412, pct: 16.2 },
  { name: "Hyderabad", count: 386, pct: 15.2 },
  { name: "Chennai", count: 289, pct: 11.3 },
  { name: "Delhi", count: 263, pct: 10.3 },
  { name: "Mumbai", count: 186, pct: 7.3 },
  { name: "Others", count: 156, pct: 6.1 },
];

const statusCls = {
  Active: "bg-success-soft text-success",
  Pending: "bg-warning-soft text-warning",
  Flagged: "bg-destructive/10 text-destructive",
};

export default function PropertyManagement() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Property Management (Marketplace)"
        subtitle="Manage property listings, approvals, categories and marketplace settings."
        actions={
          <>
            <DateRangePill value="20 May 2025" />
            <button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Listing
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Listings" value="2,548" delta="+156 this month" trend="up" icon={Home} iconColor="blue" />
        <StatCard label="Pending Approvals" value="18" delta="View Approval Queue →" icon={Hourglass} iconColor="yellow" />
        <StatCard label="Active Listings" value="2,102" delta="82.6% of total" icon={Flag} iconColor="green" />
        <StatCard label="Flagged Listings" value="7" delta="View Flagged →" icon={Flag} iconColor="red" />
        <StatCard label="Total Views (May)" value="128,547" delta="+12.4% vs Apr" trend="up" icon={Eye} iconColor="purple" />
        <StatCard label="Total Enquiries (May)" value="4,832" delta="+9.7% vs Apr" trend="up" icon={IndianRupee} iconColor="cyan" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1 panel">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Listings Overview</h3>
            <select className="h-8 px-2 rounded-lg border border-border text-xs"><option>This Month</option></select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="active" name="Active" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="deactivated" name="Deactivated" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {[{ title: "Listings by Status", data: byStatus, total: 2548 }, { title: "Listings by Property Type", data: byType, total: 2548 }].map((p) => (
          <div key={p.title} className="panel">
            <h3 className="font-semibold mb-4">{p.title}</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-44 w-44 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={p.data} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                      {p.data.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-xl font-bold">{p.total.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-xs">
                {p.data.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <div className="text-muted-foreground pl-4">
                      {s.value.toLocaleString()} ({((s.value / p.total) * 100).toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Listings</h3>
            <button className="text-sm text-primary font-medium">View All</button>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left px-6 py-2 font-medium">Property Title</th>
                  <th className="text-left py-2 font-medium">Owner</th>
                  <th className="text-left py-2 font-medium">Location</th>
                  <th className="text-left py-2 font-medium">Price</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left px-6 py-2 font-medium">Listed On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listings.map((l, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10" />
                        <div>
                          <div className="font-medium">{l.title}</div>
                          <div className="text-xs text-muted-foreground">{l.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{l.owner}</td>
                    <td className="text-muted-foreground">{l.loc}</td>
                    <td className="font-medium">{l.price}</td>
                    <td><span className={`badge-soft ${statusCls[l.status]}`}>{l.status}</span></td>
                    <td className="px-6 text-muted-foreground">{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-4 text-sm">
            <span className="text-muted-foreground">Showing 1 to 5 of 2,548 entries</span>
            <button className="text-primary font-medium">View All Listings →</button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              {[
                { icon: Plus, color: "blue", title: "Add New Listing", sub: "Create a new property listing" },
                { icon: ListChecks, color: "yellow", title: "Approval Queue", sub: "Review and approve listings", badge: "18" },
                { icon: Flag, color: "red", title: "Flagged Listings", sub: "Review flagged properties", badge: "7" },
                { icon: FolderTree, color: "purple", title: "Manage Categories", sub: "Add or edit categories" },
                { icon: Sparkles, color: "blue", title: "Manage Amenities", sub: "Add or edit amenities" },
                { icon: FileText, color: "yellow", title: "Pricing Plans", sub: "Manage pricing & subscription plans" },
              ].map((a, i) => {
                const Icon = a.icon;
                const cls = {
                  blue: "bg-info-soft text-info",
                  yellow: "bg-warning-soft text-warning",
                  red: "bg-destructive/10 text-destructive",
                  purple: "bg-brand-purple-soft text-brand-purple",
                };
                return (
                  <button key={i} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 text-left">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${cls[a.color]}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{a.sub}</div>
                    </div>
                    {a.badge && <span className="badge-soft bg-destructive text-destructive-foreground">{a.badge}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Top Locations</h3>
          <button className="text-sm text-primary font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {topLoc.map((l) => (
            <div key={l.name} className="grid grid-cols-12 items-center gap-4 text-sm">
              <span className="col-span-3 font-medium">{l.name}</span>
              <span className="col-span-2 text-muted-foreground">{l.count}</span>
              <div className="col-span-5 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${l.pct * 2}%` }} />
              </div>
              <span className="col-span-2 text-right text-muted-foreground">{l.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3 className="font-semibold mb-5">Moderation Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: AlertTriangle, color: "yellow", label: "Total Reported", value: "14", delta: "+3 this week" },
            { icon: Shield, color: "red", label: "Spam Listings", value: "6", delta: "+2 this week" },
            { icon: ShieldAlert, color: "purple", label: "Inappropriate Content", value: "4", delta: "+1 this week" },
            { icon: CheckCircle2, color: "green", label: "Resolved", value: "28", delta: "+8 this week" },
          ].map((m, i) => {
            const Icon = m.icon;
            const cls = {
              yellow: "bg-warning-soft text-warning",
              red: "bg-destructive/10 text-destructive",
              purple: "bg-brand-purple-soft text-brand-purple",
              green: "bg-success-soft text-success",
            };
            return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                <div className={`icon-bubble ${cls[m.color]}`}><Icon className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div className="text-2xl font-bold">{m.value}</div>
                  <div className="text-xs text-muted-foreground">{m.delta}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
