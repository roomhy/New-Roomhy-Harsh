import React, { useState, useEffect } from "react";
import { Save, Bell, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function AutomationPaymentAlerts() {
  const [paymentSuccessTemplate, setPaymentSuccessTemplate] = useState("");
  const [paymentFailureTemplate, setPaymentFailureTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/automation/settings");
      if (res.success) {
        setPaymentSuccessTemplate(res.paymentSuccessTemplate || "");
        setPaymentFailureTemplate(res.paymentFailureTemplate || "");
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
      const res = await fetchJson("/api/superadmin/finance/automation/settings", {
        method: "POST",
        body: { paymentSuccessTemplate, paymentFailureTemplate }
      });
      if (res.success) {
        setMessage("Payment notification templates saved successfully!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating configurations");
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Transactional Payment Alerts</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure success and failure message templates for tenant payments</p>
         </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         {loading ? (
           <div className="py-12 text-center text-slate-400 font-bold">Loading configurations...</div>
         ) : (
           <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Success Message Template</label>
                 <textarea rows={3} value={paymentSuccessTemplate} onChange={e => setPaymentSuccessTemplate(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                 <p className="text-[8px] text-slate-400 font-bold uppercase">Placeholders: <strong className="text-slate-600">{`{tenantName}`}</strong>, <strong className="text-slate-600">{`{amount}`}</strong>.</p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Failure Message Template</label>
                 <textarea rows={3} value={paymentFailureTemplate} onChange={e => setPaymentFailureTemplate(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                 <p className="text-[8px] text-slate-400 font-bold uppercase">Placeholders: <strong className="text-slate-600">{`{tenantName}`}</strong>, <strong className="text-slate-600">{`{amount}`}</strong>.</p>
              </div>

              {message && <div className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-3 rounded-lg">{message}</div>}

              <button type="submit" disabled={saving} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                 <Save size={14} />
                 {saving ? "Saving templates..." : "Apply Configurations"}
              </button>
           </form>
         )}
      </div>
    </div>
  );
}
