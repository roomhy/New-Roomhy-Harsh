import React, { useState, useEffect } from "react";
import { 
  Wallet, CreditCard, TrendingUp, Clock, AlertCircle,
  IndianRupee, ArrowUpRight, Calendar, RefreshCw,
  CheckCircle2, Bell, Settings, Activity, Building2, Users
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { PageHeader } from "../../components/superadmin/PageHeader";
import { fetchAccountingOverviewStats } from "../../utils/api";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const fmt = (n) => {
  if (!n || n === 0) return "₹0";
  return `₹${Number(n).toLocaleString("en-IN")}`;
};

export default function AccountingOverview() {
  const [stats, setStats] = useState({
    summary: { totalCollection: 0, totalPayout: 0, revenue: 0, dueRent: 0, pendingPayout: 0 },
    trends: [],
    ledger: [],
    dueRentAging: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("This Month");

  useSEO({
    title: "Accounting Overview - Roomhy",
    description: "Track payouts and outstanding rents.",
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchAccountingOverviewStats();
      if (res && (res.success || res.summary)) {
        setStats(res);
      }
    } catch (error) {
      console.error("Error fetching accounting stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const { summary, trends, ledger, dueRentAging } = stats;
  const totalDue = summary.dueRent || 0;

  // Derived stats
  const totalRevenue = summary.totalCollection || 0;
  const ownerExpense = summary.totalPayout || 0;
  const platformRevenue = summary.revenue || 0;

  // Mini sparkline data (fallback)
  const sparkline = trends.length > 0 ? trends : [
    { name: "J", collection: 0 }, { name: "F", collection: 0 }, { name: "M", collection: 0 }
  ];

  // Cashflow derived
  const closingBalance = totalRevenue - ownerExpense;

  // Donut aging - filter empty
  const agingData = (dueRentAging || []).filter(d => d.value > 0);

  // Top stat cards
  const statCards = [
    { label: "Total Collected", val: fmt(totalRevenue), sub: "Rent from tenants", icon: Wallet, color: "#3B82F6", bg: "#EFF6FF", txt: "#1D4ED8" },
    { label: "Total Paid Out", val: fmt(ownerExpense), sub: "Sent to owners", icon: CreditCard, color: "#10B981", bg: "#F0FDF4", txt: "#166534" },
    { label: "Due Rent", val: fmt(totalDue), sub: "Pending from tenants", icon: AlertCircle, color: "#F59E0B", bg: "#FFFBEB", txt: "#B45309" },
    { label: "Pending Payout", val: fmt(summary.pendingPayout || 0), sub: "Owner payout pending", icon: Clock, color: "#EF4444", bg: "#FEF2F2", txt: "#B91C1C" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting Overview"
        subtitle="Live financial summary of the platform."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
            <button onClick={loadStats} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
            </button>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <div>
              <p className={cn("text-xl font-black tracking-tight", loading ? "text-slate-200" : "")} style={{ color: loading ? undefined : card.txt }}>
                {loading ? "—" : card.val}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{card.label}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Collection vs Payout Trend Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Collection vs Payout Trend</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Monthly · This Year</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] font-bold text-slate-400">Collection</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-400">Payout</span></div>
            </div>
          </div>
          <div className="h-64">
            {trends.length === 0 && !loading ? (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-300 bg-slate-50 rounded-xl">
                No transaction data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline}>
                  <defs>
                    <linearGradient id="coll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                  <Tooltip
                    formatter={(v, name) => [`₹${Number(v).toLocaleString("en-IN")}`, name === "collection" ? "Collection" : "Payout"]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="collection" stroke="#3B82F6" strokeWidth={2.5} fill="url(#coll)" dot={{ fill: "#3B82F6", r: 3 }} />
                  <Area type="monotone" dataKey="payout" stroke="#10B981" strokeWidth={2.5} fill="url(#pay)" dot={{ fill: "#10B981", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[280px] custom-scrollbar">
            {loading ? (
              <div className="py-8 text-center text-xs font-bold text-slate-300">Loading...</div>
            ) : ledger.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-300">No transactions yet</div>
            ) : ledger.slice(0, 8).map((t, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[9px] font-black",
                  t.color === "green" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                )}>
                  {t.type ? t.type.split(" ").map(x => x[0]).join("") : "TX"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-bold text-slate-800 truncate leading-none">{t.desc}</p>
                    <p className={cn(
                      "text-[11px] font-black shrink-0 ml-2",
                      String(t.amount).startsWith("+") ? "text-emerald-600" : "text-rose-600"
                    )}>{t.amount}</p>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[9px] text-slate-400 font-bold">{t.date}</p>
                    <span className={cn(
                      "text-[8px] font-bold px-1.5 py-0.5 rounded",
                      t.status === "Success" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                    )}>{t.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Due Rent Aging Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">Due Rent Overview</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase mb-4">Age-wise breakdown</p>
          {agingData.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-300">
              <CheckCircle2 size={28} className="mb-2 text-emerald-400" />
              <p className="text-xs font-bold text-emerald-600">No Due Rents!</p>
            </div>
          ) : (
            <>
              <div className="relative h-44 flex items-center justify-center mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={agingData} innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                      {agingData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-lg font-black text-slate-900">{fmt(totalDue)}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Total Due</p>
                </div>
              </div>
              <div className="space-y-2">
                {agingData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-semibold text-slate-500">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-700">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Collections Trend Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Collections Trend</h3>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{period}</span>
          </div>
          <div className="space-y-3 mb-4">
            {[
              { label: "Owner Expense", val: ownerExpense, color: "text-blue-600" },
              { label: "Total Collections", val: totalRevenue, color: "text-slate-900" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">{row.label}</span>
                <span className={cn("text-[12px] font-black", row.color)}>{fmt(row.val)}</span>
              </div>
            ))}
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <Line type="monotone" dataKey="collection" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Tooltip
                  formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, "Collection"]}
                  contentStyle={{ borderRadius: 10, border: "none", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-slate-50 mt-3 pt-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400">Available Cash Balance</span>
            <span className="text-sm font-black text-emerald-600">{fmt(closingBalance)}</span>
          </div>
        </div>

        {/* Cashflow Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Cashflow Summary</h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{period}</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Opening Balance", val: 0, icon: "💰", color: "text-slate-700" },
              { label: "Total Collections", val: totalRevenue, icon: "📥", color: "text-blue-600" },
              { label: "Total Payouts", val: ownerExpense, icon: "📤", color: "text-rose-500" },
              { label: "Closing Balance", val: closingBalance, icon: "🏦", color: closingBalance >= 0 ? "text-emerald-600" : "text-rose-600" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{row.icon}</span>
                  <span className="text-[11px] font-semibold text-slate-500">{row.label}</span>
                </div>
                <span className={cn("text-[12px] font-black", row.color)}>{fmt(row.val)}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 text-xs font-bold text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-50 transition-all">
            View Full Report →
          </button>
        </div>
      </div>
    </div>
  );
}
