import React, { useState } from "react";
import toast from "react-hot-toast";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import {
  FileText, Download, CheckCircle2,
  Eye, ShieldCheck, IndianRupee, Loader2
} from "lucide-react";

export default function InvoicesPage() {
  const [downloading, setDownloading] = useState({});

  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }

  const items = [
    { name: "Roomhy Gold Software Subscription (May)", invoiceNo: "INV-2026-9081", date: "15 May 2026", amount: 4999 },
    { name: "Roomhy Gold Software Subscription (April)", invoiceNo: "INV-2026-8022", date: "15 April 2026", amount: 4999 }
  ];

  const downloadInvoice = async (invoiceNo) => {
    setDownloading(prev => ({ ...prev, [invoiceNo]: true }));
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceNo)}/pdf`);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || "Failed to download invoice. Please try again.");
    } finally {
      setDownloading(prev => ({ ...prev, [invoiceNo]: false }));
    }
  };

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Software Tax Invoices"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Tax Invoices</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Download business tax invoices with GSTIN compliance breakdown numbers.</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Invoice No</th>
                <th className="px-6 py-3.5 font-semibold">Description</th>
                <th className="px-6 py-3.5 font-semibold">Billing Date</th>
                <th className="px-6 py-3.5 font-semibold">Total Amount</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((i, index) => (
                <tr key={index} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-foreground">{i.invoiceNo}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{i.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{i.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-850">₹{i.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => downloadInvoice(i.invoiceNo)}
                      disabled={!!downloading[i.invoiceNo]}
                      title="Download PDF"
                      className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloading[i.invoiceNo]
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Download size={14} />
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
