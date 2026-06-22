import React, { useState, useEffect } from "react";
import { Search, Wallet, Send, RefreshCw, AlertCircle } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function PayoutsPending() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/pending");
      if (res.success) {
        setPending(res.pending || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedTx) return;
    setProcessing(true);
    setMessage("");
    try {
      const res = await fetchJson("/api/superadmin/finance/payouts/process", {
        method: "POST",
        body: {
          transactionId: selectedTx._id,
          manual: false,
          notes: "Payout approved and sent via admin dashboard"
        }
      });
      if (res.success) {
        setMessage("Payout processed successfully!");
        setSelectedTx(null);
        loadPending();
      } else {
        setMessage(res.message || "Failed to process payout");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error executing payout request");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const filtered = pending.filter(p => 
    p.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.property_name?.toLowerCase().includes(search.toLowerCase()) ||
    p._id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pending Payouts Queue</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Owner Disbursements Waiting Verification & Approval</p>
         </div>
         <button onClick={loadPending} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Disbursements Queue</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queue..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Transaction ID</th>
                     <th className="pb-4">Owner Name</th>
                     <th className="pb-4">Property</th>
                     <th className="pb-4 text-center">Gross Amt</th>
                     <th className="pb-4 text-center">Net Payout</th>
                     <th className="pb-4 text-center">Lifecycle Status</th>
                     <th className="pb-4 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 font-bold">Loading pending list...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 font-bold">No payouts pending in queue</td></tr>
                  ) : filtered.map((p, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono text-[10px] text-slate-500 font-bold">{String(p._id).slice(-8).toUpperCase()}</td>
                       <td className="py-3 font-bold text-slate-800">{p.owner_name || "N/A"}</td>
                       <td className="py-3 font-medium text-slate-600">{p.property_name || "N/A"}</td>
                       <td className="py-3 text-center font-bold text-slate-700">₹{p.booking_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-emerald-600">₹{p.owner_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-100 uppercase">{p.payout_status}</span>
                       </td>
                       <td className="py-3 text-right">
                          <button onClick={() => setSelectedTx(p)} className="bg-slate-850 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all inline-flex items-center gap-1.5">
                             <Send size={10} /> Transfer Payout
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Confirmation Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
              <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                 <AlertCircle className="text-amber-500 w-4 h-4" /> Confirm Bank Transfer Payout
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                 You are about to transfer a net payout of <strong className="text-slate-800">₹{selectedTx.owner_amount?.toLocaleString('en-IN')}</strong> to <strong className="text-slate-800">{selectedTx.owner_name}</strong> for property <strong>{selectedTx.property_name}</strong>.
              </p>
              
              {message && <div className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-3 rounded-lg leading-normal">{message}</div>}

              <div className="flex gap-3 pt-2">
                 <button onClick={() => setSelectedTx(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-[10px] font-bold uppercase hover:bg-slate-50 text-slate-500 transition-all">Cancel</button>
                 <button onClick={handleProcessPayout} disabled={processing} className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5">
                    {processing ? "Processing Transfer..." : "Approve Transfer"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
