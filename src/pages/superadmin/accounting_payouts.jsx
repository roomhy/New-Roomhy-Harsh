import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, Send, CreditCard, RefreshCw, AlertCircle
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Payouts() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commissionEarned: 0,
    ownerEarnings: 0,
    pendingPayouts: 0,
    paidPayouts: 0,
    walletBalance: 0,
    totalTransactions: 0
  });
  const [payoutsList, setPayoutsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State for processing payout
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    account_holder: "",
    account_number: "",
    ifsc_code: "",
    bank_name: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useSEO({
    title: "Settlement Hub - Roomhy Super Admin",
    description: "Manage owner payouts, process transfers and audit settlements dynamically.",
    canonical: "https://roomhy.com/superadmin/accounting_payouts"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetchJson("/api/superadmin/revenue/stats");
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      const txRes = await fetchJson("/api/superadmin/revenue/transactions");
      if (txRes.success) {
        setPayoutsList(txRes.payouts || []);
      }
    } catch (error) {
      console.error("Error loading payout data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenTransferModal = (payout) => {
    setSelectedPayout(payout);
    setErrorMsg("");
    setBankDetails({
      account_holder: payout.bank_details?.account_holder || payout.owner_name || "",
      account_number: payout.bank_details?.account_number || "",
      ifsc_code: payout.bank_details?.ifsc_code || "",
      bank_name: payout.bank_details?.bank_name || ""
    });
  };

  const handleProcessTransfer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        account_holder: bankDetails.account_holder,
        account_number: bankDetails.account_number,
        ifsc_code: bankDetails.ifsc_code,
        bank_name: bankDetails.bank_name,
        initiated_by: "superadmin"
      };
      const res = await fetchJson(`/api/superadmin/revenue/payout/${selectedPayout.id}/transfer`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.success) {
        setSelectedPayout(null);
        loadData();
      } else {
        setErrorMsg(res.message || "Failed to process transfer.");
      }
    } catch (error) {
      console.error("Error transferring payout:", error);
      setErrorMsg(error.message || "Failed to process transfer.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayouts = payoutsList.filter(p => 
    p.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.owner_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.razorpay_payment_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Settlement Hub</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Owner Disbursement Lifecycle & Automated Settlement Audits</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
               <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal 
          label="Total Money Received" 
          value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`} 
          trend="Gross Received" 
          up 
          icon={Send} 
          color="purple" 
          source="Payments"
        />
        <StatCardHorizontal 
          label="Completed Owner Payouts" 
          value={`₹${(stats.paidPayouts || 0).toLocaleString('en-IN')}`} 
          trend="Total Settled" 
          up 
          icon={Zap} 
          color="blue" 
          source="Payments"
        />
        <StatCardHorizontal 
          label="Pending Owner Payouts" 
          value={`₹${(stats.pendingPayouts || 0).toLocaleString('en-IN')}`} 
          trend="To Be Settled" 
          up={false} 
          icon={Wallet} 
          color="rose" 
          source="Payments"
        />
        <StatCardHorizontal 
          label="Current Wallet Balance" 
          value={`₹${(stats.walletBalance || 0).toLocaleString('en-IN')}`} 
          trend="Formula: Received - Settled" 
          up 
          icon={CreditCard} 
          color="emerald" 
          source="Payments + Payouts"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">Settlement Registry</h3>
               <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Source: Payments + Payouts</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    placeholder="Search owner..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                  />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            {filteredPayouts.length === 0 ? (
               <div className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50/50 rounded-xl">
                  No Data Available
               </div>
            ) : (
               <table className="w-full text-left text-[11px] font-semibold text-slate-700">
                  <thead>
                     <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                        <th className="pb-4">PO Identity</th>
                        <th className="pb-4">Owner Name</th>
                        <th className="pb-4 text-center">Move-In Date</th>
                        <th className="pb-4 text-center">Settlement Account</th>
                        <th className="pb-4 text-center">Disbursed (₹)</th>
                        <th className="pb-4 text-center">Reference</th>
                        <th className="pb-4 text-center">Audit Status</th>
                        <th className="pb-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredPayouts.map((p, i) => (
                       <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                          <td className="py-3">
                             <span className="text-[9px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 shadow-sm">
                                {p.id ? p.id.substring(p.id.length - 8).toUpperCase() : 'N/A'}
                             </span>
                          </td>
                          <td className="py-3">
                             <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight">{p.owner_name}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {p.owner_id}</p>
                             </div>
                          </td>
                          <td className="py-3 text-center">
                             {p.moveInDate ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[9.5px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {new Date(p.moveInDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                  {p.payout_status !== "Paid" && new Date(p.moveInDate) <= new Date() && (
                                    <span className="text-[7.5px] font-bold text-rose-600 uppercase tracking-wider animate-pulse">
                                      Due for transfer
                                    </span>
                                  )}
                                </div>
                             ) : (
                                <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">Not Set</span>
                             )}
                          </td>
                          <td className="py-3 text-center">
                             {p.bank_details?.account_number ? (
                                <>
                                  <p className="text-[10px] font-bold text-slate-700 leading-none">{p.bank_details.bank_name}</p>
                                  <p className="text-[8px] text-slate-400 mt-1">A/C: ****{p.bank_details.account_number.slice(-4)}</p>
                                </>
                             ) : (
                                <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Incomplete</span>
                             )}
                          </td>
                          <td className="py-3 text-center font-black text-slate-800">
                             ₹{(p.owner_amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 text-center font-mono text-[10px]">
                             {p.payout_reference || 'N/A'}
                          </td>
                          <td className="py-3 text-center">
                             <span className={cn(
                                "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                                p.payout_status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                             )}>
                                {p.payout_status === "Paid" ? "Completed" : "Pending"}
                             </span>
                          </td>
                          <td className="py-3 text-right">
                             {p.payout_status !== "Paid" && (
                                <button 
                                  onClick={() => handleOpenTransferModal(p)}
                                  className="px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-[9px] font-bold uppercase tracking-wider"
                                >
                                   Process
                                </button>
                             )}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>

      {/* Transfer Settlement Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl relative">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                   <CreditCard size={20} />
                </div>
                <div>
                   <h3 className="text-base font-bold text-slate-900">Process Settlement</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Disburse Owner Share</p>
                </div>
             </div>
             
             {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-[11px] text-rose-600 font-bold">
                   <AlertCircle size={14} className="shrink-0 mt-0.5" />
                   <span>{errorMsg}</span>
                </div>
             )}

             <form onSubmit={handleProcessTransfer} className="space-y-4">
                <div>
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Owner Name</label>
                   <input type="text" disabled value={selectedPayout.owner_name} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 outline-none" />
                </div>
                <div>
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Transfer Amount (Owner Share)</label>
                   <input type="text" disabled value={`₹ ${(selectedPayout.owner_amount || 0).toLocaleString('en-IN')}`} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 outline-none" />
                </div>

                <div className="border-t border-slate-100 pt-4">
                   <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-3">Settlement Bank Details</p>
                   <div className="space-y-3">
                      <div>
                         <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Account Holder Name</label>
                         <input 
                           type="text" 
                           required 
                           value={bankDetails.account_holder} 
                           onChange={e => setBankDetails({...bankDetails, account_holder: e.target.value})}
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-purple-500" 
                         />
                      </div>
                      <div>
                         <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Bank Account Number</label>
                         <input 
                           type="text" 
                           required 
                           value={bankDetails.account_number} 
                           onChange={e => setBankDetails({...bankDetails, account_number: e.target.value})}
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-800 outline-none focus:border-purple-500" 
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">IFSC Code</label>
                            <input 
                              type="text" 
                              required 
                              value={bankDetails.ifsc_code} 
                              onChange={e => setBankDetails({...bankDetails, ifsc_code: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-800 outline-none focus:border-purple-500" 
                            />
                         </div>
                         <div>
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Bank Name</label>
                            <input 
                              type="text" 
                              required 
                              value={bankDetails.bank_name} 
                              onChange={e => setBankDetails({...bankDetails, bank_name: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-purple-500" 
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3 mt-6">
                   <button 
                     type="button" 
                     onClick={() => setSelectedPayout(null)}
                     className="flex-1 border border-slate-200 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                   >
                      Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={submitting}
                     className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-700 transition-all disabled:opacity-50"
                   >
                      {submitting ? "Processing..." : "Confirm Payout"}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color, source }) {
  const bgColors = { 
    purple: "bg-purple-50 text-purple-600 border-purple-100", 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    rose: "bg-rose-50 text-rose-600 border-rose-100" 
  };
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105", bgColors[color])}>
         <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">{label}</p>
         <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</p>
         <div className="flex items-center justify-between">
           <span className="text-[7px] font-bold uppercase text-slate-400">
             {trend}
           </span>
           {source && (
             <span className="text-[7px] font-bold uppercase text-blue-500/80">
               Source: {source}
             </span>
           )}
         </div>
      </div>
    </div>
  );
}
