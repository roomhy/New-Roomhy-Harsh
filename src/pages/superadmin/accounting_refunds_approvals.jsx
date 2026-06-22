import React, { useState, useEffect } from "react";
import { Search, ShieldAlert, Check, X, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function RefundsApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actingId, setActingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/refunds/approvals");
      if (res.success) {
        setApprovals(res.approvals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, approve) => {
    setActingId(id);
    setMessage("");
    try {
      const res = await fetchJson("/api/superadmin/finance/refunds/approve", {
        method: "POST",
        body: {
          refundId: id,
          approve,
          notes: approve ? "Refund approved and processed by Administrator" : "Refund rejected by Administrator"
        }
      });
      if (res.success) {
        setMessage(`Refund request successfully ${approve ? "approved" : "rejected"}!`);
        loadApprovals();
      }
    } catch (err) {
      console.error(err);
      setMessage("Error processing refund approval");
    } finally {
      setActingId(null);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const filtered = approvals.filter(a => 
    a.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.booking_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Refund Approval Queue</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verify and Authorize Outgoing Refund Claims & Security Deposits</p>
         </div>
         <button onClick={loadApprovals} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      {message && <div className="text-[10px] font-bold text-blue-600 bg-blue-50 p-3 rounded-lg leading-normal uppercase max-w-xl">{message}</div>}

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Pending Approvals</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queue..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Booking Ref</th>
                     <th className="pb-4">Recipient Name</th>
                     <th className="pb-4 text-center">UPI / Target Info</th>
                     <th className="pb-4 text-center">Refund Claim (₹)</th>
                     <th className="pb-4 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">Loading approvals queue...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400 font-bold">No refund approvals pending</td></tr>
                  ) : filtered.map((a, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono font-bold text-blue-600">{a.booking_id}</td>
                       <td className="py-3 font-bold text-slate-800">
                          <p>{a.user_name}</p>
                          <p className="text-[8px] text-slate-400 mt-0.5">{a.user_phone}</p>
                       </td>
                       <td className="py-3 text-center text-slate-500 font-semibold">{a.upi_id || "N/A"}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{a.refund_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                             <button disabled={actingId === a._id} onClick={() => handleAction(a._id, true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded-lg transition-all" title="Approve"><Check size={14} /></button>
                             <button disabled={actingId === a._id} onClick={() => handleAction(a._id, false)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-1.5 rounded-lg transition-all" title="Reject"><X size={14} /></button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
