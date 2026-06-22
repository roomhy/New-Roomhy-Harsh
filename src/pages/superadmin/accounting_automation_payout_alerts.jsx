import React, { useState, useEffect } from "react";
import { Search, BellRing, RefreshCw, AlertCircle } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AutomationPayoutAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/failed");
      if (res.success) {
        setAlerts(res.failed || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payout Exception Alerts</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time system alerts on bank transfer rejections and payout exceptions</p>
         </div>
         <button onClick={loadAlerts} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-6">Exception log queue</h3>

         <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-bold">Checking alert status...</div>
            ) : alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold">System clean. No payout exceptions logged.</div>
            ) : alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-red-150 bg-red-50/40 hover:bg-red-50/70 transition-all shadow-sm">
                 <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                    <BellRing size={16} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Payout Failed for {a.owner_name}</h5>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase mt-0.5">Reference Transaction: {String(a.transaction_id).toUpperCase()}</p>
                    <p className="text-xs text-rose-600 font-semibold mt-2 bg-white px-3 py-2 rounded-lg border border-red-100 inline-block leading-snug">
                       Reason: {a.error_message || "IMPS transaction rejected by partner bank"}
                    </p>
                 </div>
                 <span className="text-[8px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg shrink-0 uppercase tracking-wider">CRITICAL exception</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
