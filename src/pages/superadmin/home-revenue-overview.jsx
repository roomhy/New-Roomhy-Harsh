import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee, Wallet, TrendingUp, Clock, AlertCircle,
  CreditCard, ArrowUpRight, Calendar, FileText,
  ChevronRight, RotateCcw, CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import { fetchAccountingOverviewStats } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import useSEO from "../../hooks/useSEO";

const fmtNum = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtAmt = (v) => {
  const n = Number(v) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${fmtNum(n)}`;
};

const AGING_COLORS = ["#EF4444", "#F97316", "#EAB308", "#6B7280"];

export default function RevenueOverviewPage() {
  const navigate  = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Revenue Overview – Roomhy Superadmin",
    description: "Full accounting module revenue summary.",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAccountingOverviewStats();
      if (res && res.success) setData(res);
    } catch (e) {
      console.error("RevenueOverviewPage:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const S  = data?.summary || {};
  const TR = data?.trends   || [];
  const LD = data?.ledger   || [];
  const AG = data?.dueRentAging || [];

  const totalCollection = S.totalCollection || 0;
  const totalPayout     = S.totalPayout     || 0;
  const revenue         = S.revenue         || 0;
  const dueRent         = S.dueRent         || 0;
  const pendingPayout   = S.pendingPayout   || 0;
  const netLiquidity    = totalCollection - totalPayout;

  const statCards = [
    { label: "Total Collected",    val: totalCollection, icon: Wallet,       color: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8", tag: "Rent collected from tenants" },
    { label: "Total Paid",         val: totalPayout,     icon: CreditCard,   color: "#10B981", bg: "#ECFDF5", text: "#065F46", tag: "Sent to property owners" },
    { label: "Our Commission",     val: revenue,         icon: TrendingUp,   color: "#8B5CF6", bg: "#F5F3FF", text: "#5B21B6", tag: "Our earnings from bookings" },
    { label: "Cash Balance",       val: netLiquidity,    icon: IndianRupee,  color: "#F59E0B", bg: "#FFFBEB", text: "#92400E", tag: "Available cash on hand" },
    { label: "Pending Rent",       val: dueRent,         icon: Clock,        color: "#EF4444", bg: "#FEF2F2", text: "#991B1B", tag: "Rent not yet received" },
    { label: "Pending Payout",     val: pendingPayout,   icon: AlertCircle,  color: "#6366F1", bg: "#EEF2FF", text: "#3730A3", tag: "Payouts not yet sent" },
  ];

  const modules = [
    { label: "Tenant Transactions", path: "/superadmin/accounting/transactions" },
    { label: "Owner Payouts",       path: "/superadmin/accounting/payouts" },
    { label: "Reports",             path: "/superadmin/accounting/reports" },
    { label: "Refunds",             path: "/superadmin/accounting" },
    { label: "Taxes",               path: "/superadmin/accounting/taxes" },
    { label: "Settings",            path: "/superadmin/accounting/settings" },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <PageHeader
        title="Revenue Overview"
        subtitle="Simple summary of all collections, payouts, commission, and pending rent."
        actions={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={load}
              style={{ display:"flex", alignItems:"center", gap:6, background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"8px 14px", fontSize:11, fontWeight:700, cursor:"pointer" }}
            >
              <RotateCcw size={14} /> Refresh
            </button>
            <button
              onClick={() => navigate("/superadmin/accounting")}
              style={{ display:"flex", alignItems:"center", gap:6, background:"#2563EB", color:"#fff", border:"none", borderRadius:12, padding:"8px 16px", fontSize:11, fontWeight:700, cursor:"pointer" }}
            >
              <FileText size={14} /> Go to Accounting Dashboard
            </button>
          </div>
        }
      />

      {/* ── 6 Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div style={{ width:38, height:38, borderRadius:10, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <s.icon size={18} color={s.color} />
              </div>
              <ArrowUpRight size={13} color="#94A3B8" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-1">{s.label}</p>
            {loading
              ? <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
              : <p className="text-xl font-black" style={{ color: s.text }}>{fmtAmt(s.val)}</p>
            }
            <p className="text-[9px] text-slate-300 font-semibold mt-0.5">{s.tag}</p>
          </div>
        ))}
      </div>

      {/* ── Trend Chart + Recent Ledger ── */}
      <div className="grid grid-cols-12 gap-5">
        {/* Area Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Trend</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Collected vs Paid Out (Last 5 Months)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><span style={{ width:8, height:8, borderRadius:"50%", background:"#3B82F6", display:"inline-block" }} /><span className="text-[10px] font-bold text-slate-400 uppercase">Collections</span></div>
              <div className="flex items-center gap-1.5"><span style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", display:"inline-block" }} /><span className="text-[10px] font-bold text-slate-400 uppercase">Payouts</span></div>
            </div>
          </div>
          <div style={{ height: 240 }}>
            {loading
              ? <div className="h-full bg-slate-50 rounded-xl animate-pulse" />
              : TR.length === 0
                ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <TrendingUp size={36} color="#CBD5E1" />
                    <p className="text-xs font-bold text-slate-400 mt-2">No trend data yet</p>
                    <p className="text-[10px] text-slate-300 mt-1">Data appears as transactions happen</p>
                  </div>
                )
                : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TR} margin={{ top:5, right:10, left:0, bottom:0 }}>
                      <defs>
                        <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:"#94A3B8", fontSize:10, fontWeight:600 }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill:"#94A3B8", fontSize:10, fontWeight:600 }} tickFormatter={v => `₹${v>=1000?(v/1000).toFixed(0)+"K":v}`} />
                      <Tooltip
                        formatter={(v, n) => [fmtAmt(v), n === "collection" ? "Collection" : "Payout"]}
                        contentStyle={{ borderRadius:12, border:"none", boxShadow:"0 10px 25px -5px rgba(0,0,0,0.1)", fontSize:11 }}
                      />
                      <Area type="monotone" dataKey="collection" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gC)" dot={{ fill:"#3B82F6", r:4 }} activeDot={{ r:6 }} />
                      <Area type="monotone" dataKey="payout"     stroke="#10B981" strokeWidth={2.5} fill="url(#gP)" dot={{ fill:"#10B981", r:4 }} activeDot={{ r:6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )
            }
          </div>
        </div>

        {/* Recent Ledger */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Latest Activity</p>
            </div>
            <button onClick={() => navigate("/superadmin/accounting/transactions")} className="text-[11px] font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 230 }}>
            {loading
              ? [1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)
              : LD.length === 0
                ? <div className="py-10 text-center text-xs font-bold text-slate-300">No Transactions Yet</div>
                : LD.slice(0, 7).map((t, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-slate-50 pb-3 last:border-0">
                    <div style={{ width:36, height:36, borderRadius:10, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:9, fontWeight:900, color:"#3B82F6" }}>
                      {(t.type || "TX").split(" ").map(x => x[0]).join("").slice(0,2)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p className="text-xs font-bold text-slate-900 truncate">{t.desc || "Transaction"}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{t.type || ""}</p>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p className="text-sm font-black text-emerald-600">{t.amount || "—"}</p>
                      <span style={{ fontSize:9, fontWeight:700, background:"#ECFDF5", color:"#065F46", padding:"2px 6px", borderRadius:6 }}>{t.status || "Done"}</span>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* ── Due Rent Aging + Module Navigation ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">Pending Rent Details</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-5">Breakdown by days overdue</p>
          {loading
            ? <div className="h-44 bg-slate-50 rounded-xl animate-pulse" />
            : (!AG.length || AG.every(a => (a.value || 0) === 0))
              ? (
                <div className="h-36 flex flex-col items-center justify-center">
                  <CheckCircle2 size={36} color="#10B981" />
                  <p className="text-sm font-bold text-emerald-600 mt-2">All Rents Collected!</p>
                  <p className="text-[10px] text-slate-300 mt-1">No overdue rents found</p>
                </div>
              )
              : (
                <>
                  <div style={{ position:"relative", height:160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={AG} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                          {AG.map((e, i) => <Cell key={i} fill={e.color || AGING_COLORS[i % AGING_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => [`₹${fmtNum(v)}`, ""]} contentStyle={{ borderRadius:10, fontSize:11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                      <p className="text-lg font-black text-slate-900">₹{fmtNum(dueRent)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Due</p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    {AG.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span style={{ width:9, height:9, borderRadius:"50%", background: item.color || AGING_COLORS[i % AGING_COLORS.length], display:"inline-block" }} />
                          <span className="text-slate-500 font-semibold">{item.name}</span>
                        </div>
                        <span className="font-black text-slate-900">₹{fmtNum(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )
          }
        </div>

        {/* Module Nav */}
        <div style={{ background:"#0F172A", borderRadius:16, padding:24, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div>
            <h3 style={{ color:"#fff", fontSize:15, fontWeight:700, marginBottom:4 }}>Accounting Sections</h3>
            <p style={{ color:"#64748B", fontSize:12, marginBottom:20 }}>Quick links to accounting details</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {modules.map((m, i) => (
              <button
                key={i}
                onClick={() => navigate(m.path)}
                style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:10, padding:"10px 12px", textAlign:"left", cursor:"pointer", color:"#CBD5E1", fontSize:11, fontWeight:700, transition:"background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/superadmin/accounting")}
            style={{ marginTop:20, width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, background:"#2563EB", color:"#fff", border:"none", borderRadius:12, padding:"12px 0", fontSize:12, fontWeight:700, cursor:"pointer" }}
          >
            Go to Accounting Dashboard <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── Bottom Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label:"Total Collected", val: fmtAmt(totalCollection) },
          { label:"Total Paid Out",  val: fmtAmt(totalPayout) },
          { label:"Our Earnings",    val: fmtAmt(revenue) },
          { label:"Cash Balance",    val: fmtAmt(netLiquidity) },
          { label:"Pending Rent",    val: fmtAmt(dueRent) },
          { label:"Pending Payouts", val: fmtAmt(pendingPayout) },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
            {loading
              ? <div className="h-5 w-16 bg-slate-100 rounded animate-pulse mx-auto mt-1" />
              : <p className="text-base font-black text-slate-900 mt-0.5">{k.val}</p>
            }
          </div>
        ))}
      </div>
    </div>
  );
}
