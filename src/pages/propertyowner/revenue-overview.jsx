import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, 
  Calendar, CheckCircle, Clock, AlertTriangle, FileText, Download, Wallet
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { fetchJson } from "../../utils/api";

export default function RevenueOverviewPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [dateRange, setDateRange] = useState("This Month");
  const [activeTab, setActiveTab] = useState("tenants");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    summaryMetrics: {
      tenantCollected: 0,
      ownerPayouts: 0,
      pendingPayouts: 0,
      tenantDues: 0
    },
    recentPayments: [],
    recentPayouts: [],
    revenueChartData: []
  });

  useEffect(() => {
    if (!owner?.loginId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchJson(`/api/owners/${owner.loginId}/revenue-dashboard`);
        if (res.success || res.summaryMetrics) {
          setDashboardData({
            summaryMetrics: res.summaryMetrics || { tenantCollected: 0, ownerPayouts: 0, pendingPayouts: 0, tenantDues: 0 },
            recentPayments: res.recentPayments || [],
            recentPayouts: res.recentPayouts || [],
            revenueChartData: res.revenueChartData || []
          });
        } else {
          setError(res.error || "Failed to load dashboard data");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [owner?.loginId]);

  const { summaryMetrics, recentPayments, recentPayouts, revenueChartData } = dashboardData;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
      case "Processed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-rose-50 text-rose-600 border-rose-100";
    }
  };

  if (loading) {
    return (
      <PropertyOwnerLayout 
        owner={owner} 
        title="Revenue Overview" 
        onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading Revenue Overview...</p>
        </div>
      </PropertyOwnerLayout>
    );
  }

  if (error) {
    return (
      <PropertyOwnerLayout 
        owner={owner} 
        title="Revenue Overview" 
        onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
          <div className="size-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="font-serif text-lg text-foreground font-bold">Error Loading Data</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">{error}</p>
        </div>
      </PropertyOwnerLayout>
    );
  }

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Revenue Overview" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Revenue Overview</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor collections from tenants and payouts settled to your account.</p>
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
              <TrendingUp size={12} /> Tenant Rent
            </span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Tenant collections</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{summaryMetrics.tenantCollected.toLocaleString("en-IN")}</h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Wallet size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Received</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Owner Payouts (Net)</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{summaryMetrics.ownerPayouts.toLocaleString("en-IN")}</h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">In Transit</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Pending Payouts</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{summaryMetrics.pendingPayouts.toLocaleString("en-IN")}</h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Due</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Dues</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{summaryMetrics.tenantDues.toLocaleString("en-IN")}</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-serif text-[20px] text-foreground mb-6">Tenant Rent vs Owner Payouts (MoM)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                <Area type="monotone" dataKey="tenantRent" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRent)" name="Tenant Rent Collected" />
                <Area type="monotone" dataKey="ownerPayout" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPayout)" name="Owner Payout Settled" />
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
                <span>₹1,59,000 (86%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "86%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Food & Kitchen</span>
                <span>₹18,000 (10%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Late Fines & Penalties</span>
                <span>₹8,000 (4%)</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "4%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details (Tabbed View) */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-serif text-[20px] text-foreground">Recent Transactions</h3>
          <div className="flex bg-muted/60 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("tenants")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "tenants" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Tenant Payments
            </button>
            <button 
              onClick={() => setActiveTab("payouts")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "payouts" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Owner Payouts
            </button>
          </div>
        </div>

        {activeTab === "tenants" ? (
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                  <th className="px-6 py-3 font-semibold">Payout ID</th>
                  <th className="px-6 py-3 font-semibold">Payout Title</th>
                  <th className="px-6 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-3 font-mono font-bold text-muted-foreground">{p.id}</td>
                    <td className="px-6 py-3 font-medium text-foreground">{p.title}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.method}</td>
                    <td className="px-6 py-3 font-bold text-foreground">₹{p.amount.toLocaleString("en-IN")}</td>
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
        )}
      </div>
    </PropertyOwnerLayout>
  );
}
