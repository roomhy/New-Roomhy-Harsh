import React, { useState, useEffect } from "react";
import { Clock, Save, Shield, Calendar, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function PayoutsCycle() {
  const [cycle, setCycle] = useState("weekly");
  const [gracePeriodDays, setGracePeriodDays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/cycle");
      if (res.success) {
        setCycle(res.payoutCycle || "weekly");
        setGracePeriodDays(res.gracePeriodDays || 3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/cycle", {
        method: "POST",
        body: { cycle, gracePeriodDays }
      });
      if (res.success) {
        setMessage("Payout cycle configuration updated successfully!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payout Cycle Configuration</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Settlement Calendar Frequency & Grace Thresholds</p>
         </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         {loading ? (
           <div className="py-12 text-center text-slate-400 font-bold">Loading cycle settings...</div>
         ) : (
           <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settlement Interval Mode</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setCycle("weekly")} className={`py-4 rounded-xl border-2 text-xs font-bold uppercase transition-all ${cycle === "weekly" ? "border-blue-600 bg-blue-50/50 text-blue-700" : "border-slate-100 hover:bg-slate-50 text-slate-500"}`}>Weekly Cycle</button>
                    <button type="button" onClick={() => setCycle("monthly")} className={`py-4 rounded-xl border-2 text-xs font-bold uppercase transition-all ${cycle === "monthly" ? "border-blue-600 bg-blue-50/50 text-blue-700" : "border-slate-100 hover:bg-slate-50 text-slate-500"}`}>Monthly Cycle</button>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grace Period Threshold (Days)</label>
                 <input type="number" min={1} max={15} value={gracePeriodDays} onChange={e => setGracePeriodDays(parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
              </div>

              {message && <div className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-3 rounded-lg">{message}</div>}

              <button type="submit" disabled={saving} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                 <Save size={14} />
                 {saving ? "Saving Configuration..." : "Apply Configurations"}
              </button>
           </form>
         )}
      </div>
    </div>
  );
}
