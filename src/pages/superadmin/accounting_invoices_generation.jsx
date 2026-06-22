import React, { useState, useEffect } from "react";
import { Play, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function InvoicesGeneration() {
  const [loading, setLoading] = useState(false);
  const [billingMonth, setBillingMonth] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleTrigger = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);
    try {
      const res = await fetchJson("/api/superadmin/finance/invoices/generation", {
        method: "POST",
        body: { billingMonth }
      });
      if (res.success) {
        setSuccess(true);
        setMessage(res.message || "Bulk rent invoices generated successfully!");
      } else {
        setMessage(res.message || "Failed to trigger invoicing run");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error executing invoicing run request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Invoice Generation Manager</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manual invoicing runs & automated cron checks</p>
         </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <form onSubmit={handleTrigger} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} />
                  Target Billing Month
               </label>
               <input type="month" value={billingMonth} onChange={e => setBillingMonth(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
               <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-1">Rent invoices will be generated for all active tenants who do not have an active invoice for this month.</p>
            </div>

            {message && (
              <div className={`text-[10px] font-bold uppercase p-3 rounded-lg leading-normal ${success ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                 {message}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
               <Play size={14} className={loading ? "animate-spin" : ""} />
               {loading ? "Generating Invoices..." : "Trigger Monthly Invoicing"}
            </button>
         </form>
      </div>
    </div>
  );
}
