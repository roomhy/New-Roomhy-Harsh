import React, { useState, useEffect } from "react";
import { Save, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function InvoicesNumbering() {
  const [invoicePrefix, setInvoicePrefix] = useState("RHY-");
  const [invoiceCounter, setInvoiceCounter] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadNumbering = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/invoices/generation");
      if (res.success) {
        setInvoicePrefix(res.invoicePrefix || "RHY-");
        setInvoiceCounter(res.invoiceCounter || 1000);
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
      const res = await fetchJson("/api/superadmin/finance/invoices/numbering", {
        method: "POST",
        body: { invoicePrefix, invoiceCounter }
      });
      if (res.success) {
        setMessage("Invoice numbering format saved successfully!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating prefix config");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadNumbering();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Invoice Sequencer Setup</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure serial prefix coding formats and numbering sequences</p>
         </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         {loading ? (
           <div className="py-12 text-center text-slate-400 font-bold">Loading sequencing configurations...</div>
         ) : (
           <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Serial Prefix Code</label>
                 <input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} required placeholder="e.g. RHY-" className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                 <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-1">Appended to the front of all generated invoices (e.g. RHY-1001).</p>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initial Running Counter Sequence</label>
                 <input type="number" min={0} value={invoiceCounter} onChange={e => setInvoiceCounter(parseInt(e.target.value))} required className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
                 <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-1">The sequential numeric index for next invoices to build from.</p>
              </div>

              {message && <div className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-3 rounded-lg">{message}</div>}

              <button type="submit" disabled={saving} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                 <Save size={14} />
                 {saving ? "Updating sequencer..." : "Apply Configurations"}
              </button>
           </form>
         )}
      </div>
    </div>
  );
}
