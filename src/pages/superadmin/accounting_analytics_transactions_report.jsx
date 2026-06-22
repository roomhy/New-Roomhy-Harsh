import React, { useState, useEffect } from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AnalyticsTransactionsReport() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/analytics/transactions-report");
      if (res.success) {
        setTxs(res.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Razorpay Payment ID", "Tenant Name", "Property Name", "Gross Paid", "Commission Cut", "Owner Net", "Date Settled", "Status"];
    const rows = filtered.map(t => [
      t._id,
      t.razorpay_payment_id || "N/A",
      t.tenant_name || "N/A",
      t.property_name || "N/A",
      t.booking_amount || 0,
      t.commission_amount || 0,
      t.owner_amount || 0,
      new Date(t.payment_date).toLocaleDateString('en-IN'),
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Roomhy_Transactions_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = txs.filter(t => 
    t.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.property_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.razorpay_payment_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Audit Transaction Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">High fidelity search index & csv ledger exporter</p>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={handleExportCSV} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2">
               <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={loadData} className="p-2 rounded-xl bg-white text-slate-400 border border-slate-100 hover:text-blue-600 transition-all">
               <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
         </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Global records</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Transaction ID</th>
                     <th className="pb-4">Razorpay Payment ID</th>
                     <th className="pb-4">Tenant</th>
                     <th className="pb-4">Property</th>
                     <th className="pb-4 text-center">Gross (₹)</th>
                     <th className="pb-4 text-center">Fee Deducted (₹)</th>
                     <th className="pb-4 text-center">Net Owner Credit (₹)</th>
                     <th className="pb-4 text-center">Lifecycle Date</th>
                     <th className="pb-4 text-center">Gateway Status</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={9} className="py-12 text-center text-slate-400 font-bold">Loading records...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={9} className="py-12 text-center text-slate-400 font-bold">No transactions found</td></tr>
                  ) : filtered.map((t, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono text-[9px] text-slate-400 font-bold">{String(t._id).toUpperCase()}</td>
                       <td className="py-3 font-mono text-[9px] font-bold text-blue-600">{t.razorpay_payment_id || "Offline Cash"}</td>
                       <td className="py-3 font-bold text-slate-800">{t.tenant_name || "N/A"}</td>
                       <td className="py-3 font-medium text-slate-600">{t.property_name || "N/A"}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{t.booking_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-rose-500">₹{t.commission_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-emerald-600">₹{t.owner_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center text-slate-500 font-medium">{new Date(t.payment_date).toLocaleDateString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-100 uppercase">{t.status}</span>
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
