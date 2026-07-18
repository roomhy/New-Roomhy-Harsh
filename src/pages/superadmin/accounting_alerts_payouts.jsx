import React, { useState, useEffect } from "react";
import { 
  RotateCcw, Download, Search, CheckCircle2, AlertTriangle, 
  IndianRupee, Send, Calendar, Clock, Landmark, ShieldCheck
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import { PageHeader } from "../../components/superadmin/PageHeader";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");
const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

export default function PayoutAlertsNotification() {
  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("paid"); // paid, pending

  useSEO({
    title: "Payout Notifications - Roomhy Superadmin",
    description: "Monitor settled and pending owner bank transfer payouts.",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/alerts/payouts");
      if (res && res.success) {
        setLogs(res.logs || []);
        setPending(res.pending || []);
      }
    } catch (e) {
      console.error("PayoutAlertsNotification load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPaid = logs.filter(l => 
    (l.owner_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.payout_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.bank_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredPending = pending.filter(p => 
    (p.owner_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.tenant_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.property_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalSettledVal = logs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPendingVal = pending.reduce((acc, curr) => acc + (curr.owner_amount || 0), 0);
  const countPaid = logs.length;
  const countPending = pending.length;

  const exportCSV = () => {
    if (statusTab === "paid") {
      if (!filteredPaid.length) return;
      const headers = "Payout Reference ID,Owner Name,Bank Name,Account Number,Amount,Settled At,Status\n";
      const rows = filteredPaid.map(l => 
        `"${l.payout_id || 'N/A'}","${l.owner_name}","${l.bank_name}","${l.account_number}",${l.amount},"${l.created_at ? l.created_at.split('T')[0] : 'N/A'}","${l.status}"`
      ).join("\n");
      triggerDownload(headers + rows, "Settled_Payout_Logs.csv");
    } else {
      if (!filteredPending.length) return;
      const headers = "Razorpay Payment ID,Owner Name,Property,Owner Net Amount,Payment Date,Payout Status\n";
      const rows = filteredPending.map(p => 
        `"${p.razorpay_payment_id || 'N/A'}","${p.owner_name}","${p.property_name}",${p.owner_amount},"${p.payment_date ? p.payment_date.split('T')[0] : 'N/A'}","${p.payout_status}"`
      ).join("\n");
      triggerDownload(headers + rows, "Pending_Payout_Dues.csv");
    }
  };

  const triggerDownload = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <PageHeader
        title="Payout Processed Notification"
        subtitle="Gateway transfer logs, manual UPI payouts audit trails, and pending owner payout schedules."
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
              <Download className="w-3.5 h-3.5" /> Export Lists
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Settled payouts</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{fmt(totalSettledVal)}</h3>
            <p className="text-[9px] text-slate-400 mt-1">Transferred owner net amounts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Settled Transfers Count</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{countPaid} Settlements</h3>
            <p className="text-[9px] text-slate-400 mt-1">Cleared payouts history</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pending payout volume</p>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{fmt(totalPendingVal)}</h3>
            <p className="text-[9px] text-slate-400 mt-1">Awaiting bank transfers</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Settlements Count</p>
            <h3 className="text-xl font-bold text-purple-600 leading-tight">{countPending} Dues</h3>
            <p className="text-[9px] text-slate-400 mt-1">Rent payments locked for payout</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
        {/* Toggle & Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl self-start">
            {[
              { id: "paid", label: "Settled Payouts" },
              { id: "pending", label: "Pending Dues" }
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
              placeholder="Search Owner, Reference or Bank..."
              className="w-full bg-slate-50 border border-transparent rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-100 transition-all"
            />
          </div>
        </div>

        {/* Tab 1: Settled Payouts */}
        {statusTab === "paid" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference ID</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Details</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount Settled</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">Loading payout history...</td>
                  </tr>
                ) : filteredPaid.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">No settled payout notifications logged</td>
                  </tr>
                ) : filteredPaid.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-800">
                      <span className="font-mono text-slate-500">{row.payout_id || 'N/A'}</span>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-700">
                      {row.owner_name}
                    </td>
                    <td className="py-4 text-xs">
                      <p className="font-bold text-slate-700 leading-none flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-slate-400" />
                        {row.bank_name || 'UPI payout'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-none">{row.account_number ? `A/c: ${row.account_number}` : 'No Bank Data'}</p>
                    </td>
                    <td className="py-4 text-xs font-black text-emerald-600 text-right">{fmt(row.amount)}</td>
                    <td className="py-4 text-xs font-semibold text-slate-500">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Pending Dues */}
        {statusTab === "pending" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenant & Property</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount Pending</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collected Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">Loading pending payouts...</td>
                  </tr>
                ) : filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">No pending payout dispatches locked</td>
                  </tr>
                ) : filteredPending.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-800">
                      <span className="font-mono text-slate-500">{row.razorpay_payment_id || 'N/A'}</span>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-700">
                      {row.owner_name || row.owner_id}
                    </td>
                    <td className="py-4 text-xs">
                      <p className="font-bold text-slate-700 leading-none">{row.tenant_name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-none">{row.property_name}</p>
                    </td>
                    <td className="py-4 text-xs font-black text-rose-500 text-right">{fmt(row.owner_amount)}</td>
                    <td className="py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border",
                        row.payout_status === 'Failed' ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {row.payout_status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-semibold text-slate-500">
                      {row.payment_date ? new Date(row.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
