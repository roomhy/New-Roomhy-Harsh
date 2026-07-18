import React, { useState, useEffect } from "react";
import {
  Send, RefreshCw, AlertCircle, Wallet, Clock,
  Search, CheckCircle2, X, IndianRupee, Users
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import useSEO from "../../hooks/useSEO";

const cn = (...c) => c.filter(Boolean).join(" ");
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PayoutsPending() {
  const [pending, setPending]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]   = useState("");

  useSEO({ title: "Pending Payouts – Roomhy Admin", description: "Owner payout disbursement queue" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/pending");
      if (res.success) setPending(res.pending || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleProcess = async () => {
    if (!selectedTx) return;
    setProcessing(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/process", {
        method: "POST",
        body: { transactionId: selectedTx._id, manual: true, notes: "Processed from Pending Payouts panel" }
      });
      if (res.success) {
        setSuccessMsg(`Payout of ${fmt(selectedTx.owner_amount)} to ${selectedTx.owner_name} processed!`);
        setSelectedTx(null);
        load();
      } else {
        setErrorMsg(res.message || "Failed to process payout");
      }
    } catch (e) {
      setErrorMsg("Network error, please retry.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = pending.filter(p =>
    (p.owner_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.property_name || "").toLowerCase().includes(search.toLowerCase()) ||
    String(p._id || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAmt   = pending.reduce((s, p) => s + (p.owner_amount || 0), 0);
  const totalCount = pending.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Payouts"
        subtitle="Owner disbursements waiting for approval & bank transfer"
        actions={
          <button onClick={load} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
          </button>
        }
      />

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-5 py-3 text-sm font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          <button onClick={() => setSuccessMsg("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending Queue",  val: totalCount,       icon: Clock,    color: "#F59E0B", bg: "#FFFBEB", txt: "#B45309", fmt: (v) => v },
          { label: "Total Pending",  val: totalAmt,         icon: Wallet,   color: "#EF4444", bg: "#FEF2F2", txt: "#B91C1C", fmt: fmt },
          { label: "Avg Payout",     val: totalCount ? Math.round(totalAmt / totalCount) : 0, icon: IndianRupee, color: "#6366F1", bg: "#EEF2FF", txt: "#3730A3", fmt: fmt },
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

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Disbursement Queue</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {loading ? "Loading..." : `${filtered.length} payouts pending`}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search owner / property..."
              className="bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                <th className="pb-4">Txn ID</th>
                <th className="pb-4">Owner</th>
                <th className="pb-4">Property</th>
                <th className="pb-4 text-center">Booking Amt</th>
                <th className="pb-4 text-center">Net Payout</th>
                <th className="pb-4 text-center">Commission</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7,8].map(j => (
                      <td key={j} className="py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-400">No pending payouts</p>
                    <p className="text-[10px] text-slate-300 mt-1">All payouts have been processed!</p>
                  </td>
                </tr>
              ) : filtered.map((p, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <span className="font-mono text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                      {String(p._id).slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3">
                    <p className="font-bold text-slate-800 text-xs">{p.owner_name || "N/A"}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">{p.owner_loginId || ""}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-medium text-slate-600 text-[11px]">{p.property_name || "N/A"}</p>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-700">{fmt(p.booking_amount)}</td>
                  <td className="py-3 text-center font-black text-emerald-600">{fmt(p.owner_amount)}</td>
                  <td className="py-3 text-center font-semibold text-purple-600">{fmt(p.commission_amount)}</td>
                  <td className="py-3 text-center">
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-amber-50 text-amber-700 border-amber-100 uppercase">
                      {p.payout_status || "Pending"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => { setSelectedTx(p); setErrorMsg(""); }}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
                    >
                      <Send size={9} /> Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-base">Confirm Payout Transfer</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Owner Disbursement</p>
              </div>
              <button onClick={() => setSelectedTx(null)} className="ml-auto text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Owner</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedTx.owner_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Property</span>
                  <span className="font-semibold text-slate-600 text-xs">{selectedTx.property_name || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Net Payout</span>
                  <span className="font-black text-emerald-600 text-lg">{fmt(selectedTx.owner_amount)}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setSelectedTx(null)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-[10px] font-bold uppercase hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={processing}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</> : <><Send className="w-3.5 h-3.5" /> Approve Transfer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
