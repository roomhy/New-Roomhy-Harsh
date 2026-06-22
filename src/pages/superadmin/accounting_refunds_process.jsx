import React, { useState } from "react";
import { Save, AlertCircle } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function RefundsProcess() {
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState(500);
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetchJson("/api/superadmin/finance/refunds/process", {
        method: "POST",
        body: {
          bookingId,
          amount,
          method,
          upiId,
          user_name: userName,
          user_phone: userPhone
        }
      });
      if (res.success) {
        setMessage("Refund request raised successfully and queued for approval!");
        setBookingId("");
        setAmount(500);
        setUpiId("");
        setUserName("");
        setUserPhone("");
      } else {
        setMessage(res.message || "Failed to raise refund request");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error raising refund request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Initiate Refund Process</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Disburse security deposits, booking cancellation refunds and partial waivers</p>
         </div>
      </div>

      <div className="max-w-xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
               <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Booking Reference ID</label>
               <input value={bookingId} onChange={e => setBookingId(e.target.value)} required placeholder="e.g. B-1002" className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Refund Recipient Name</label>
                  <input value={userName} onChange={e => setUserName(e.target.value)} required placeholder="e.g. Rahul Kumar" className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Recipient Contact Phone</label>
                  <input value={userPhone} onChange={e => setUserPhone(e.target.value)} required placeholder="e.g. +91 9999988888" className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Refund Amount (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(parseInt(e.target.value))} required className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
               </div>
               <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Transfer Channel</label>
                  <select value={method} onChange={e => setMethod(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm">
                     <option value="upi">UPI Gateway</option>
                     <option value="bank">Bank Transfer (NEFT/IMPS)</option>
                  </select>
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Target UPI ID / Bank Details</label>
               <input value={upiId} onChange={e => setUpiId(e.target.value)} required placeholder="e.g. user@ybl or Bank Account Details" className="w-full bg-slate-50 border-none rounded-xl p-2.5 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
            </div>

            {message && <div className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-3 rounded-lg leading-normal">{message}</div>}

            <button type="submit" disabled={loading} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1">
               <Save size={14} />
               {loading ? "Registering Refund Request..." : "File Refund Claim"}
            </button>
         </form>
      </div>
    </div>
  );
}
