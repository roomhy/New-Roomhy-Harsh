import React, { useState, useEffect } from "react";
import { Save, RefreshCw, Percent } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function RevenueCommission() {
  const [commissionPercentage, setCommissionPercentage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadCommission = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/revenue/commission");
      if (res.success) {
        setCommissionPercentage(res.commissionPercentage || 10);
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
      const res = await fetchJson("/api/superadmin/finance/revenue/commission", {
        method: "POST",
        body: { commissionPercentage }
      });
      if (res.success) {
        setMessage("Global commission rate saved successfully!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating commission rate");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadCommission();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Booking Commission Setup</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Global Cut Percentage configuration on Partner Rents</p>
         </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         {loading ? (
           <div className="py-12 text-center text-slate-400 font-bold">Loading commission rate...</div>
         ) : (
           <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Percent size={12} />
                    Global Commission Rate (%)
                 </label>
                 <input type="number" min={0} max={100} value={commissionPercentage} onChange={e => setCommissionPercentage(parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                 <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-1">Deducted from the gross rent paid by the tenant before owner wallet transfer.</p>
              </div>

              {message && <div className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-3 rounded-lg">{message}</div>}

              <button type="submit" disabled={saving} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                 <Save size={14} />
                 {saving ? "Saving Commission..." : "Apply Configurations"}
              </button>
           </form>
         )}
      </div>
    </div>
  );
}
