import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  FileText, Search, Download, ShieldCheck, 
  ToggleLeft, ToggleRight, Percent
} from "lucide-react";

export default function GstTaxPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [autoTax, setAutoTax] = useState(true);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Taxation Compliance" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">GST &amp; Tax Compliance</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage GSTIN settings, HRA receipt generations for residents, and quarterly tax statements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: GSTIN Details */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Active GSTIN</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">07AAAAA1111A1Z1</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Linked under property owner organization profile.</p>
          </div>
        </div>

        {/* Card 2: HRA Requests */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">HRA Receipt Requests</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">3 Pending</span>
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">HRA Receipts</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Tenants requesting rental receipts for tax declarations.</p>
          </div>
        </div>

        {/* Card 3: Tax Invoicing Toggle */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Auto Tax Invoice</span>
            <button onClick={() => setAutoTax(!autoTax)}>
              {autoTax ? (
                <ToggleRight size={38} className="text-emerald-600" />
              ) : (
                <ToggleLeft size={38} className="text-slate-300" />
              )}
            </button>
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">Automatic GST Calculation</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Attach 18% GST (CGST/SGST) automatically on messy food charges.</p>
          </div>
        </div>
      </div>

      {/* GST Filings List */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-serif text-[20px] text-foreground mb-4">GST Filing History</h3>
        <div className="space-y-4">
          {[
            { quarter: "Q4 FY 2025-26", amount: 15400, status: "Filed Successfully", date: "15 Apr 2026" },
            { quarter: "Q3 FY 2025-26", amount: 14200, status: "Filed Successfully", date: "12 Jan 2026" }
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">{item.quarter}</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">Filing Date: {item.date}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 block">₹{item.amount.toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-bold text-emerald-600">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
