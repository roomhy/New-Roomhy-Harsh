import React, { useState, useEffect } from "react";
import { 
  Building2, Users, Shield, Clock, Search, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Filter, Globe, MapPin, Zap, Sheet, Trash2, 
  ChevronRight, Phone, Mail, User, Image as ImageIcon,
  Activity, Home, CheckCircle2, XCircle, Wallet,
  ArrowUpCircle, ArrowDownCircle, RotateCcw, Plus,
  Download, Eye, CreditCard, LayoutGrid, RefreshCw,
  Calculator, Receipt, FileText
} from "lucide-react";
import { fetchJson } from "../../utils/api";
import useSEO from "../../hooks/useSEO";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Transactions() {
  const [activeTab, setActiveTab] = useState("payments"); // "payments" | "commissions" | "payouts"
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commissionEarned: 0,
    ownerEarnings: 0,
    pendingPayouts: 0,
    paidPayouts: 0,
    walletBalance: 0,
    totalTransactions: 0
  });
  const [payments, setPayments] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Financial Ledger - Roomhy Super Admin",
    description: "Audit-ready financial ledger tracking Razorpay payments, platform commissions, and owner payouts.",
    canonical: "https://roomhy.com/superadmin/accounting/transactions"
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
        setPayments(txRes.payments || []);
        setCommissions(txRes.commissions || []);
        setPayouts(txRes.payouts || []);
      }
    } catch (error) {
      console.error("Error loading ledger data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    if (activeTab === "payments") {
      return payments.filter(p => 
        p.razorpay_payment_id?.toLowerCase().includes(query) ||
        p.booking_id?.toLowerCase().includes(query) ||
        p.tenant_name?.toLowerCase().includes(query) ||
        p.property_name?.toLowerCase().includes(query)
      );
    } else if (activeTab === "commissions") {
      return commissions.filter(c => 
        c.razorpay_payment_id?.toLowerCase().includes(query) ||
        c.booking_id?.toLowerCase().includes(query)
      );
    } else {
      return payouts.filter(py => 
        py.razorpay_payment_id?.toLowerCase().includes(query) ||
        py.owner_id?.toLowerCase().includes(query) ||
        py.owner_name?.toLowerCase().includes(query)
      );
    }
  };

  const currentData = getFilteredData();

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      {/* Header Area */}
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Financial Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Transaction History & Audit-Ready Fiscal Flows</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="bg-white text-slate-400 border border-slate-100 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
               <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
         </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardHorizontal 
          label="Total Volume Received" 
          value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`} 
          trend="Gross Collections" 
          up 
          icon={Wallet} 
          color="blue" 
        />
        <StatCardHorizontal 
          label="Commissions Earned" 
          value={`₹${(stats.commissionEarned || 0).toLocaleString('en-IN')}`} 
          trend="Platform Split" 
          up 
          icon={ArrowDownCircle} 
          color="emerald" 
        />
        <StatCardHorizontal 
          label="Payouts Completed" 
          value={`₹${(stats.paidPayouts || 0).toLocaleString('en-IN')}`} 
          trend="Disbursed Split" 
          up 
          icon={ArrowUpCircle} 
          color="amber" 
        />
        <StatCardHorizontal 
          label="Wallet Balance" 
          value={`₹${(stats.walletBalance || 0).toLocaleString('en-IN')}`} 
          trend="Net Funds Held" 
          up 
          icon={Zap} 
          color="indigo" 
        />
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
         {/* Tab Headers and Filter Actions */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-50 pb-4">
            <div className="flex items-center gap-2">
               <button
                  onClick={() => setActiveTab("payments")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                    activeTab === "payments" ? "bg-blue-600 text-white shadow-md shadow-blue-500/10" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
               >
                  Payments / Receipts
               </button>
               <button
                  onClick={() => setActiveTab("commissions")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                    activeTab === "commissions" ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
               >
                  Commission Splits
               </button>
               <button
                  onClick={() => setActiveTab("payouts")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                    activeTab === "payouts" ? "bg-amber-600 text-white shadow-md shadow-amber-500/10" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  )}
               >
                  Owner Payouts
               </button>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="relative group w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    placeholder="Search by ID, Name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                  />
               </div>
            </div>
         </div>

         {loading ? (
           <div className="py-12 flex flex-col items-center justify-center gap-3">
             <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading dynamic fiscal records...</p>
           </div>
         ) : currentData.length === 0 ? (
           <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500">No Data Available</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Check settings or verify payments collection</p>
           </div>
         ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                       <th className="pb-4">TXN Identity</th>
                       {activeTab === "payments" && (
                         <>
                           <th className="pb-4">Tenant</th>
                           <th className="pb-4">Property</th>
                           <th className="pb-4 text-center">Amount (₹)</th>
                           <th className="pb-4 text-center">Payout Status</th>
                         </>
                       )}
                       {activeTab === "commissions" && (
                         <>
                           <th className="pb-4">Booking ID</th>
                           <th className="pb-4 text-center">Booking Amt (₹)</th>
                           <th className="pb-4 text-center">Comm %</th>
                           <th className="pb-4 text-center">Comm Amt (₹)</th>
                           <th className="pb-4 text-center">Owner Split (₹)</th>
                         </>
                       )}
                       {activeTab === "payouts" && (
                         <>
                           <th className="pb-4">Owner Name</th>
                           <th className="pb-4">Owner ID</th>
                           <th className="pb-4 text-center">Amount (₹)</th>
                           <th className="pb-4 text-center">Payout Status</th>
                           <th className="pb-4">Payout Ref</th>
                        </>
                       )}
                       <th className="pb-4 text-right">Payment Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {currentData.map((item, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                         <td className="py-4">
                            <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                               {item.razorpay_payment_id || 'N/A'}
                            </span>
                         </td>
                         
                         {/* Payments Tab Specific */}
                         {activeTab === "payments" && (
                           <>
                             <td className="py-4">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight">{item.tenant_name}</p>
                             </td>
                             <td className="py-4">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[200px]">{item.property_name}</p>
                             </td>
                             <td className="py-4 text-center">
                                <p className="text-[11px] font-bold text-slate-800">₹{item.amount?.toLocaleString('en-IN')}</p>
                             </td>
                             <td className="py-4 text-center">
                                <span className={cn(
                                   "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                                   item.payout_status === "Paid" || item.payout_status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                   item.payout_status === "Initiated" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                   "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                   {item.payout_status || 'Pending'}
                                </span>
                             </td>
                           </>
                         )}

                         {/* Commissions Tab Specific */}
                         {activeTab === "commissions" && (
                           <>
                             <td className="py-4">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight font-mono">{item.booking_id?.slice(-8)}</p>
                             </td>
                             <td className="py-4 text-center">
                                <p className="text-[11px] font-bold text-slate-800">₹{item.booking_amount?.toLocaleString('en-IN')}</p>
                             </td>
                             <td className="py-4 text-center">
                                <p className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg inline-block border border-indigo-100">{item.commission_percentage}%</p>
                             </td>
                             <td className="py-4 text-center">
                                <p className="text-[11px] font-bold text-emerald-600">₹{item.commission_amount?.toLocaleString('en-IN')}</p>
                             </td>
                             <td className="py-4 text-center">
                                <p className="text-[11px] font-bold text-slate-700">₹{item.owner_amount?.toLocaleString('en-IN')}</p>
                             </td>
                           </>
                         )}

                         {/* Payouts Tab Specific */}
                         {activeTab === "payouts" && (
                           <>
                             <td className="py-4">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight">{item.owner_name}</p>
                             </td>
                             <td className="py-4">
                                <p className="text-[11px] font-mono font-bold text-slate-500">{item.owner_id}</p>
                             </td>
                             <td className="py-4 text-center">
                                <p className="text-[11px] font-bold text-slate-800">₹{item.owner_amount?.toLocaleString('en-IN')}</p>
                             </td>
                             <td className="py-4 text-center">
                                <span className={cn(
                                   "text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm",
                                   item.payout_status === "Paid" || item.payout_status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                   "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                   {item.payout_status || 'Pending'}
                                </span>
                             </td>
                             <td className="py-4">
                                <p className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{item.payout_reference || 'N/A'}</p>
                             </td>
                           </>
                         )}

                         <td className="py-4 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date || item.payout_date || 'N/A'}</p>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}
      </div>
    </div>
  );
}

function StatCardHorizontal({ label, value, trend, up, icon: Icon, color }) {
  const bgColors = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100" 
  };
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105", bgColors[color])}>
         <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">{label}</p>
         <p className="text-sm font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</p>
         <div className={cn(
           "flex items-center gap-1 text-[7px] font-bold uppercase",
           up ? "text-emerald-600" : "text-rose-600"
         )}>
            {up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {trend}
         </div>
      </div>
    </div>
  );
}
