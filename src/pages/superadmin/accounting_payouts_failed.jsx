import React, { useState, useEffect } from "react";
import {
  AlertTriangle, RefreshCw, Search, RotateCcw,
  X, AlertCircle, CheckCircle2, TrendingDown,
  ShieldAlert
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import useSEO from "../../hooks/useSEO";

const cn = (...c) => c.filter(Boolean).join(" ");
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PayoutsFailed() {
  const [failed, setFailed]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]   = useState("");

  useSEO({ title: "Failed Payout Alerts – Roomhy Admin", description: "Payout failures, bank API errors and retry dashboard" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/failed");
      if (res.success) setFailed(res.failed || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleRetry = async (log) => {
    setRetryingId(log._id);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/process", {
        method: "POST",
        body: { transactionId: log.transaction_id, manual: false, notes: "Retry from failed payouts panel" }
      });
      if (res.success) {
        setSuccessMsg(`Retry successful for ${log.owner_name}!`);
        load();
      } else {
        setErrorMsg(res.message || "Retry failed");
      }
    } catch (e) {
      setErrorMsg("Network error on retry.");
    } finally {
      setRetryingId(null);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = failed.filter(f =>
    (f.owner_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.error_message || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.bank_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalFailed = failed.length;
  const totalAmt = failed.reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Failed Payout Alerts"
        subtitle="Disbursement failures, gateway errors and retry dashboard"
        actions={
          <button onClick={load} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
          </button>
        }
      />

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          <button onClick={() => setSuccessMsg("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          <button onClick={() => setErrorMsg("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Failed Transactions", val: totalFailed, icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2", txt: "#B91C1C", fmt: v => v },
          { label: "Amount at Risk",      val: totalAmt,    icon: TrendingDown,  color: "#F97316", bg: "#FFF7ED", txt: "#C2410C", fmt: fmt },
          { label: "Needs Attention",     val: totalFailed, icon: ShieldAlert,   color: "#8B5CF6", bg: "#F5F3FF", txt: "#5B21B6", fmt: v => `${v} Alerts` },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: card.bg }}>
              <card.icon size={20} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              {loading
                ? <div className="h-6 w-24 bg-slate-100 rounded animate-pulse mt-1" />
                : <p className="text-xl font-black mt-0.5" style={{ color: card.txt }}>{card.fmt(card.val)}</p>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {!loading && totalFailed > 0 && (
        <div className="flex items-start gap-4 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-rose-700">{totalFailed} payout failure{totalFailed > 1 ? "s" : ""} detected</p>
            <p className="text-[10px] text-rose-500 font-bold mt-0.5">
              Total amount at risk: {fmt(totalAmt)}. Review each failure and retry or contact your payment gateway.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Failure Log</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {loading ? "Loading..." : `${filtered.length} failures in queue`}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search owner / error..."
              className="bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all shadow-sm w-52"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                <th className="pb-4">Owner</th>
                <th className="pb-4 text-center">Amount</th>
                <th className="pb-4 text-center">Bank Account</th>
                <th className="pb-4">Error Details</th>
                <th className="pb-4 text-center">Failed At</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j} className="py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">No failed payouts!</p>
                    <p className="text-[10px] text-slate-300 mt-1">All disbursements are running smoothly.</p>
                  </td>
                </tr>
              ) : filtered.map((f, i) => (
                <tr key={i} className="group hover:bg-rose-50/40 transition-colors">
                  <td className="py-3">
                    <p className="font-bold text-slate-800 text-xs">{f.owner_name || "N/A"}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{f.owner_id || ""}</p>
                  </td>
                  <td className="py-3 text-center font-black text-slate-800">{fmt(f.amount)}</td>
                  <td className="py-3 text-center">
                    <p className="text-[10px] font-bold text-slate-700">{f.bank_name || "N/A"}</p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {f.account_number ? `••••${String(f.account_number).slice(-4)}` : "N/A"}
                    </p>
                  </td>
                  <td className="py-3 max-w-[220px]">
                    <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded inline-flex items-start gap-1 leading-snug">
                      <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                      {f.error_message || "Payment gateway returned an error"}
                    </span>
                  </td>
                  <td className="py-3 text-center text-[10px] text-slate-500">
                    {f.failed_at ? new Date(f.failed_at).toLocaleDateString("en-IN") : "N/A"}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleRetry(f)}
                      disabled={retryingId === f._id}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RotateCcw size={9} className={cn(retryingId === f._id && "animate-spin")} />
                      {retryingId === f._id ? "Retrying..." : "Retry"}
                    </button>
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
