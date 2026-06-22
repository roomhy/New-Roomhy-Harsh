import React, { useState, useEffect } from "react";
import { RefreshCw, Calculator, FileText, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { fetchJson } from "../../utils/api";

export default function AnalyticsProfitLoss() {
  const [pl, setPl] = useState({ grossRevenue: 0, commissionRevenue: 0, outflowsRefunds: 0, netOperatingIncome: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/analytics/profit-loss");
      if (res.success) {
        setPl(res.profitLoss || { grossRevenue: 0, commissionRevenue: 0, outflowsRefunds: 0, netOperatingIncome: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profit & Loss Sheet</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Operating Statement & Net Yield Summaries</p>
         </div>
         <button onClick={loadData} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
         </button>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none flex items-center gap-2">
               <Calculator size={14} /> Fiscal Statement
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reconciled Live</span>
         </div>

         {loading ? (
           <div className="py-12 text-center text-slate-400 font-bold">Aggregating ledger statement...</div>
         ) : (
           <div className="space-y-4 font-medium text-xs text-slate-600">
              <div className="flex justify-between py-2 border-b border-slate-100">
                 <span>Gross Rent Collected</span>
                 <span className="font-bold text-slate-800 flex items-center gap-1">
                    <ArrowUpCircle size={12} className="text-emerald-500" />
                    ₹{pl.grossRevenue?.toLocaleString('en-IN')}.00
                 </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                 <span>Commission Fee Revenue (Roomhy Share)</span>
                 <span className="font-bold text-slate-850">₹{pl.commissionRevenue?.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                 <span>Outflows (Waivers, Security Deposit Refunds)</span>
                 <span className="font-bold text-rose-500 flex items-center gap-1">
                    <ArrowDownCircle size={12} className="text-rose-500" />
                    (-) ₹{pl.outflowsRefunds?.toLocaleString('en-IN')}.00
                 </span>
              </div>
              <div className="flex justify-between py-4 bg-slate-900 text-white rounded-xl px-4 mt-6">
                 <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Net Operating Yield</span>
                 <span className="text-sm font-bold text-emerald-400">₹{pl.netOperatingIncome?.toLocaleString('en-IN')}.00</span>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
