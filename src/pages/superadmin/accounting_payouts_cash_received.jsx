import React, { useState, useEffect } from "react";
import {
  Banknote, RefreshCw, Search, CheckCircle2,
  User, Home, Calendar, IndianRupee, TrendingDown
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import useSEO from "../../hooks/useSEO";

const cn = (...c) => c.filter(Boolean).join(" ");
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PayoutsCashReceived() {
  const [cashList, setCashList] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  useSEO({ title: "Cash Received Details – Roomhy Admin", description: "Reconciliation of offline cash rent payments by tenants" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/cash-received");
      if (res.success) setCashList(res.cashReceived || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = cashList.filter(c =>
    (c.tenantName || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.propertyName || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.tenantPhone || "").includes(search)
  );

  const totalCash = cashList.reduce((s, c) => s + (c.paidAmount || 0), 0);
  const totalCount = cashList.length;
  const avgAmt = totalCount ? Math.round(totalCash / totalCount) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash Received Details"
        subtitle="Offline cash rent payments collected directly from tenants — reconciliation ledger"
        actions={
          <button onClick={load} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Cash Entries", val: totalCount,  icon: Banknote,     color: "#10B981", bg: "#ECFDF5", txt: "#065F46", fmt: v => v },
          { label: "Total Cash Received", val: totalCash,  icon: IndianRupee,  color: "#3B82F6", bg: "#EFF6FF", txt: "#1D4ED8", fmt: fmt },
          { label: "Average per Entry",  val: avgAmt,      icon: TrendingDown, color: "#8B5CF6", bg: "#F5F3FF", txt: "#5B21B6", fmt: fmt },
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Cash Ledger</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {loading ? "Loading..." : `${filtered.length} entries found`}
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tenant / property..."
                className="bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm w-48"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                  <th className="pb-4">Tenant</th>
                  <th className="pb-4">Property</th>
                  <th className="pb-4 text-center">Month</th>
                  <th className="pb-4 text-center">Cash</th>
                  <th className="pb-4 text-center">Date</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [1,2,3,4].map(i => (
                    <tr key={i}>{[1,2,3,4,5,6,7].map(j => <td key={j} className="py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Banknote className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-400">No cash entries found</p>
                      <p className="text-[10px] text-slate-300 mt-1">Cash collections will appear here</p>
                    </td>
                  </tr>
                ) : filtered.map((c, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="py-3">
                      <p className="font-bold text-slate-800 text-xs">{c.tenantName || "N/A"}</p>
                      <p className="text-[9px] text-slate-400">{c.tenantPhone || ""}</p>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-slate-600 text-[11px]">{c.propertyName || "N/A"}</p>
                      <p className="text-[9px] text-slate-400">{c.roomNumber ? `Room ${c.roomNumber}` : ""}</p>
                    </td>
                    <td className="py-3 text-center text-[10px] font-bold text-slate-500">{c.collectionMonth || "N/A"}</td>
                    <td className="py-3 text-center font-black text-slate-800">{fmt(c.paidAmount)}</td>
                    <td className="py-3 text-center text-[10px] text-slate-500">
                      {c.paymentDate ? new Date(c.paymentDate).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-100 uppercase inline-flex items-center gap-1">
                        <CheckCircle2 size={9} /> {c.paymentStatus || "Received"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-[9px] font-bold text-blue-600 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="xl:col-span-1">
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 sticky top-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800">Cash Entry Detail</h4>
                <button onClick={() => setSelected(null)} className="text-slate-300 hover:text-slate-600 transition-colors">×</button>
              </div>

              {/* Tenant Info */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{selected.tenantName || "N/A"}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Tenant</p>
                  </div>
                </div>
                <div className="space-y-2 text-[11px]">
                  {[
                    { label: "Phone", val: selected.tenantPhone || "N/A" },
                    { label: "Email", val: selected.tenantEmail || "N/A" },
                    { label: "Move-In", val: selected.moveInDate ? new Date(selected.moveInDate).toLocaleDateString("en-IN") : "N/A" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{r.label}</span>
                      <span className="font-bold text-slate-700">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Home size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{selected.propertyName || "N/A"}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Property</p>
                  </div>
                </div>
                {selected.roomNumber && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Room</span>
                    <span className="font-bold text-slate-700">{selected.roomNumber}</span>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Payment Summary</p>
                <div className="space-y-2 text-[11px]">
                  {[
                    { label: "Month", val: selected.collectionMonth || "N/A" },
                    { label: "Amount Paid", val: fmt(selected.paidAmount) },
                    { label: "Date Received", val: selected.paymentDate ? new Date(selected.paymentDate).toLocaleDateString("en-IN") : "N/A" },
                    { label: "Method", val: "Cash" },
                    { label: "Status", val: selected.paymentStatus || "Received" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-emerald-600 font-semibold">{r.label}</span>
                      <span className="font-black text-slate-800">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center h-48 flex flex-col items-center justify-center">
              <Banknote className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-400">Click a row to see tenant details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
