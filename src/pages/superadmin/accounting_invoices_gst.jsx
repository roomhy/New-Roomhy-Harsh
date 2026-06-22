import React, { useState, useEffect } from "react";
import { Search, Scale, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function InvoicesGst() {
  const [gstReport, setGstReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadGst = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/invoices/gst");
      if (res.success) {
        setGstReport(res.gstReport || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGst();
  }, []);

  const filtered = gstReport.filter(r => 
    r.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">GST Compliance Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tax Audit breakdown for Roomhy commission receipts (CGST 9% + SGST 9%)</p>
         </div>
         <button onClick={loadGst} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Compliance ledger</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ledger..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Tax Invoice No</th>
                     <th className="pb-4">Owner Name</th>
                     <th className="pb-4 text-center">Gross (₹)</th>
                     <th className="pb-4 text-center">Commission (₹)</th>
                     <th className="pb-4 text-center">CGST 9% (₹)</th>
                     <th className="pb-4 text-center">SGST 9% (₹)</th>
                     <th className="pb-4 text-center">Total Tax (₹)</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 font-bold">Loading GST report...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 font-bold">No tax transactions registered</td></tr>
                  ) : filtered.map((r, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono font-bold text-blue-600">{r.invoiceNumber}</td>
                       <td className="py-3 font-bold text-slate-800">{r.owner_name}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{r.gross_collection?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-slate-700">₹{r.commission?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center text-rose-500 font-medium">₹{r.cgst_9?.toFixed(2)}</td>
                       <td className="py-3 text-center text-rose-500 font-medium">₹{r.sgst_9?.toFixed(2)}</td>
                       <td className="py-3 text-center font-bold text-slate-800 bg-slate-50">₹{r.total_tax?.toFixed(2)}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
