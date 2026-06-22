import React, { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function RevenueFees() {
  const [fixedFee, setFixedFee] = useState(500);
  const [perBedFee, setPerBedFee] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/revenue/fees");
      if (res.success) {
        setFixedFee(res.fixedFee || 500);
        setPerBedFee(res.perBedFee || 50);
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
      const res = await fetchJson("/api/superadmin/finance/revenue/fees", {
        method: "POST",
        body: { fixedFee, perBedFee }
      });
      if (res.success) {
        setMessage("Platform fees configurations saved successfully!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating configurations");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Platform Fee Configuration</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Onboarding Fixed Rates & Recurring Monthly Bed Usage Fees</p>
         </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         {loading ? (
           <div className="py-12 text-center text-slate-400 font-bold">Loading fees config...</div>
         ) : (
           <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fixed Onboarding Fee (₹)</label>
                 <input type="number" min={0} value={fixedFee} onChange={e => setFixedFee(parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                 <p className="text-[8.5px] text-slate-400 font-bold uppercase">Charged once during physical property listing verification workflow.</p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Per Bed Monthly Usage Fee (₹)</label>
                 <input type="number" min={0} value={perBedFee} onChange={e => setPerBedFee(parseInt(e.target.value))} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                 <p className="text-[8.5px] text-slate-400 font-bold uppercase">Charged monthly per occupied/unoccupied bed inventory slot.</p>
              </div>

              {message && <div className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-3 rounded-lg">{message}</div>}

              <button type="submit" disabled={saving} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                 <Save size={14} />
                 {saving ? "Saving..." : "Apply Configurations"}
              </button>
           </form>
         )}
      </div>
    </div>
  );
}
