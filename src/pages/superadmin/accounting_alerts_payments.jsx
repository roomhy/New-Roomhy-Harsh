import React, { useState, useEffect } from "react";
import { 
  RotateCcw, Download, Search, CheckCircle2, AlertTriangle, 
  IndianRupee, CreditCard, Calendar, Activity, XOctagon
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

export default function PaymentAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all"); // all, verified, unverified

  useSEO({
    title: "Payment Success/Failure Alerts - Roomhy Superadmin",
    description: "Monitor Razorpay payment callback statuses and transaction webhook dispatches.",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/alerts/payments");
      if (res && res.success) {
        setAlerts(res.alerts || []);
      }
    } catch (e) {
      console.error("PaymentAlerts load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = alerts.filter(a => {
    const matchesSearch = 
      (a.tenant_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.razorpay_payment_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.property_name || "").toLowerCase().includes(search.toLowerCase());
    
    if (statusTab === "all") return matchesSearch;
    if (statusTab === "verified") return matchesSearch && (a.status === "Verified" || a.status === "Settled");
    return matchesSearch && a.status === "Created";
  });

  const countSuccess = alerts.filter(a => a.status === 'Verified' || a.status === 'Settled').length;
  const countFailed = alerts.filter(a => a.status === 'Created').length;
  const totalVolume = alerts.reduce((acc, curr) => acc + (curr.booking_amount || 0), 0);
  const successRate = alerts.length > 0 ? Math.round((countSuccess / alerts.length) * 100) : 0;

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = "Razorpay Payment ID,Tenant Name,Property,Amount,Method,Status,Date\n";
    const rows = filtered.map(a => 
      `"${a.razorpay_payment_id || 'N/A'}","${a.tenant_name}","${a.property_name}",${a.booking_amount},"${a.payment_method}","${a.status}","${a.payment_date ? a.payment_date.split('T')[0] : 'N/A'}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Payment_Alerts_Logs.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <PageHeader
        title="Payment Success/Failure Alerts"
        subtitle="Gateway callback monitors, transaction webhook dispatches, and manual payment confirmations."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <RotateCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Transaction Value</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{fmt(totalVolume)}</h3>
            <p className="text-[9px] text-slate-400 mt-1">Gross platform transaction volume</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Verified Success Payments</p>
            <h3 className="text-xl font-bold text-emerald-600 leading-tight">{countSuccess} Payments</h3>
            <p className="text-[9px] text-slate-400 mt-1">Confirmed transaction callbacks</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <XOctagon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unverified / Created status</p>
            <h3 className="text-xl font-bold text-rose-700 leading-tight">{countFailed} Payments</h3>
            <p className="text-[9px] text-slate-400 mt-1">Awaiting client signature verify</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Success Rate</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{successRate}%</h3>
            <p className="text-[9px] text-slate-400 mt-1">Payment conversion percentage</p>
          </div>
        </div>
      </div>

      {/* Main Registry */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl self-start">
            {[
              { id: "all", label: "All Callbacks" },
              { id: "verified", label: "Success (Verified)" },
              { id: "unverified", label: "Pending (Created)" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                  statusTab === tab.id
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ID, Tenant or Property..."
              className="w-full bg-slate-50 border border-transparent rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment ID</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenant</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Method</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">Loading payment transactions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">No records found matching filters</td>
                </tr>
              ) : filtered.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 text-xs font-bold text-slate-800">
                    <span className="font-mono text-slate-500">{row.razorpay_payment_id || 'N/A'}</span>
                  </td>
                  <td className="py-4 text-xs font-bold text-slate-700">
                    {row.tenant_name || 'Guest User'}
                  </td>
                  <td className="py-4 text-xs font-semibold text-slate-600">
                    {row.property_name}
                  </td>
                  <td className="py-4 text-xs font-black text-slate-800 text-right">{fmt(row.booking_amount)}</td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      <CreditCard className="w-3.5 h-3.5" />
                      {row.payment_method || 'razorpay'}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={cn(
                      "px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border",
                      (row.status === 'Verified' || row.status === 'Settled')
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {row.status === 'Verified' || row.status === 'Settled' ? 'SUCCESS' : 'PENDING / FAILED'}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-semibold text-slate-500">
                    {row.payment_date ? new Date(row.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
