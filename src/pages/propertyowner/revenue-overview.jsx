import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, 
  Calendar, CheckCircle, Clock, AlertTriangle, FileText, Download
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function RevenueOverviewPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [dateRange, setDateRange] = useState("This Month");

  // Mock revenue chart data
  const revenueChartData = [
    { name: "Jan", revenue: 42000, dues: 4500 },
    { name: "Feb", revenue: 48000, dues: 3000 },
    { name: "Mar", revenue: 51000, dues: 2500 },
    { name: "Apr", revenue: 58000, dues: 6000 },
    { name: "May", revenue: 64000, dues: 3500 }
  ];

  // Mock payments list
  const recentPayments = [
    { id: "TXN-8451", tenant: "Amit Sharma", room: "101", amount: 8500, category: "Rent", date: "18 May 2026", status: "Paid" },
    { id: "TXN-8452", tenant: "Vijay Kumar", room: "101", amount: 8500, category: "Rent", date: "17 May 2026", status: "Paid" },
    { id: "TXN-8453", tenant: "Rohan Mehra", room: "202", amount: 9000, category: "Rent + Food", date: "15 May 2026", status: "Pending" },
    { id: "TXN-8454", tenant: "Rahul Varma", room: "201", amount: 8200, category: "Rent", date: "14 May 2026", status: "Paid" },
    { id: "TXN-8455", tenant: "Ajay Devgn", room: "204", amount: 7500, category: "Rent", date: "12 May 2026", status: "Overdue" }
  ];

  const summaryMetrics = {
    collected: 168000,
    dues: 18500,
    projected: 186500,
    occupancyRate: 85
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-rose-50 text-rose-600 border-rose-100";
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Revenue Overview" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Revenue Overview</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor collections, monthly dues tracking, and financial statements.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="h-10 px-3 border border-border bg-card rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="Last 3 Months">Last 3 Months</option>
          </select>
          <button onClick={() => alert(`Downloading Statement for ${dateRange}...`)} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity">
            <Download className="size-4" /> Download Statement
          </button>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <IndianRupee size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={12} /> +12%
            </span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Collected Revenue</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{summaryMetrics.collected.toLocaleString("en-IN")}</h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Needs Follow-up</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Dues</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{summaryMetrics.dues.toLocaleString("en-IN")}</h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Target Met</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Projected Revenue</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{summaryMetrics.projected.toLocaleString("en-IN")}</h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <CheckCircle size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">92% Target</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Payment On-Time Rate</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">94% <span className="text-sm font-normal text-muted-foreground">Rate</span></h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-serif text-[20px] text-foreground mb-6">Revenue & Dues Trend (MoM)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown sidebar */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-serif text-[20px] text-foreground mb-4">Collection Breakdown</h3>
          <div className="space-y-4 mt-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Rent Collections</span>
                <span>₹1,45,000 (86%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "86%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Food & Kitchen</span>
                <span>₹15,000 (9%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "9%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Late Fines & Penalties</span>
                <span>₹8,000 (5%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "5%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-serif text-[20px] text-foreground">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3 font-semibold">Transaction ID</th>
                <th className="px-6 py-3 font-semibold">Tenant Name</th>
                <th className="px-6 py-3 font-semibold">Room</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentPayments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-3 font-mono font-bold text-muted-foreground">{p.id}</td>
                  <td className="px-6 py-3 font-medium text-foreground">{p.tenant}</td>
                  <td className="px-6 py-3 text-muted-foreground">Room {p.room}</td>
                  <td className="px-6 py-3 font-bold text-foreground">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-6 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
