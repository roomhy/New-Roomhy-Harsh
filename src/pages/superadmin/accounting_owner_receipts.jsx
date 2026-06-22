import React, { useState, useEffect } from "react";
import { Search, Printer, FileText, RefreshCw } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function OwnerReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/owner/receipts");
      if (res.success) {
        setReceipts(res.receipts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handlePrint = (r) => {
    const win = window.open("", "_blank", "width=860,height=960");
    win.document.write(`<html><head><title>Owner Disbursement Receipt</title></head><body><h1>Owner Disbursement Receipt</h1><p>Owner: ${r.owner_name}</p><p>Property: ${r.property_name}</p><p>Total Collected: ₹${r.booking_amount}</p><p>Roomhy Commission: ₹${r.commission_amount}</p><p>Net Transferred: ₹${r.owner_amount}</p></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const filtered = receipts.filter(r => 
    r.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.property_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Owner Disbursement Receipts</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit trail for owner collections, commission deduction invoice reference</p>
         </div>
         <button onClick={loadReceipts} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Disbursement statements</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owner..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Owner Name</th>
                     <th className="pb-4">Property</th>
                     <th className="pb-4 text-center">Gross (₹)</th>
                     <th className="pb-4 text-center">Fee Deducted (₹)</th>
                     <th className="pb-4 text-center">Net Transferred (₹)</th>
                     <th className="pb-4 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">Loading statements...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400 font-bold">No statements found</td></tr>
                  ) : filtered.map((r, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-bold text-slate-800">{r.owner_name}</td>
                       <td className="py-3 font-medium text-slate-600">{r.property_name || "N/A"}</td>
                       <td className="py-3 text-center font-semibold text-slate-800">₹{r.booking_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-semibold text-rose-500">(-) ₹{r.commission_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center font-bold text-emerald-600">₹{r.owner_amount?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-right">
                          <button onClick={() => handlePrint(r)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 border border-slate-100 shadow-sm" title="Print Statement"><Printer className="w-3.5 h-3.5" /></button>
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
