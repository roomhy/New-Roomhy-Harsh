import React, { useState, useEffect } from "react";
import { Search, Printer, Eye, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";
import { fetchJson } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function InvoicesHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetchJson("/api/superadmin/finance/invoices/history");
      if (res.success) {
        setInvoices(res.invoices || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (inv) => {
    const win = window.open("", "_blank", "width=860,height=960");
    win.document.write(`<html><head><title>Invoice ${inv.invoiceNumber}</title></head><body><h1>Invoice Detail</h1><p>Invoice: ${inv.invoiceNumber}</p><p>Tenant: ${inv.tenantName}</p><p>Total Due: ₹${inv.totalDue}</p><p>Status: ${inv.status}</p></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filtered = invoices.filter(i => 
    i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    i.tenantName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-full">
      <div className="flex items-center justify-between">
         <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Invoice History Ledger</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Full database record of issued rent and utility invoices</p>
         </div>
         <button onClick={loadInvoices} className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-all">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
         </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-md">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Invoices archive</h3>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search serial..." className="bg-slate-50 border-none rounded-xl py-2 px-4 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" />
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                     <th className="pb-4">Invoice Serial</th>
                     <th className="pb-4">Tenant Name</th>
                     <th className="pb-4 text-center">Billing Month</th>
                     <th className="pb-4 text-center">Total Due</th>
                     <th className="pb-4 text-center">Due Date</th>
                     <th className="pb-4 text-center">Audit Status</th>
                     <th className="pb-4 text-right">Actions</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 font-bold">Loading ledger history...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400 font-bold">No invoices logged</td></tr>
                  ) : filtered.map((inv, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                       <td className="py-3 font-mono font-bold text-blue-600">{inv.invoiceNumber}</td>
                       <td className="py-3 font-bold text-slate-800">{inv.tenantName}</td>
                       <td className="py-3 text-center text-slate-500 font-semibold">{inv.billingMonth}</td>
                       <td className="py-3 text-center font-bold text-slate-800">₹{inv.totalDue?.toLocaleString('en-IN')}</td>
                       <td className="py-3 text-center text-slate-400 font-medium">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                       <td className="py-3 text-center">
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-lg border uppercase inline-flex items-center gap-1",
                            inv.status === 'PAID' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            inv.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                             {inv.status === 'PAID' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                             {inv.status}
                          </span>
                       </td>
                       <td className="py-3 text-right">
                          <button onClick={() => handlePrint(inv)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 border border-slate-100 shadow-sm" title="Print Invoice"><Printer className="w-3.5 h-3.5" /></button>
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
