import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  CreditCard, Search, ToggleLeft, ToggleRight, ShieldCheck, 
  IndianRupee, ArrowUpRight, CheckCircle2, ChevronRight
} from "lucide-react";

export default function PaymentDashboardPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [razorpayActive, setRazorpayActive] = useState(true);
  const [upiActive, setUpiActive] = useState(true);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Gateway Settings" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Online Gateways</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Setup online payments via Razorpay, configure instant payouts, and toggle automated collections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Gateway 1: Razorpay */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              RP
            </div>
            <button onClick={() => setRazorpayActive(!razorpayActive)}>
              {razorpayActive ? (
                <ToggleRight size={38} className="text-emerald-600" />
              ) : (
                <ToggleLeft size={38} className="text-slate-300" />
              )}
            </button>
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">Razorpay Checkout</h3>
            <p className="text-[12px] text-muted-foreground mt-1">Accept Net Banking, Credit/Debit Cards, and mobile wallet payments.</p>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Gateway Surcharge:</span>
            <span className="font-bold text-slate-800">1.8% per transaction</span>
          </div>
        </div>

        {/* Gateway 2: UPI Instant Payout */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              UPI
            </div>
            <button onClick={() => setUpiActive(!upiActive)}>
              {upiActive ? (
                <ToggleRight size={38} className="text-emerald-600" />
              ) : (
                <ToggleLeft size={38} className="text-slate-300" />
              )}
            </button>
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">UPI Direct / QR Codes</h3>
            <p className="text-[12px] text-muted-foreground mt-1">Accept payments via PhonePe, GooglePay, or Paytm QR directly to your bank account.</p>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Gateway Surcharge:</span>
            <span className="font-bold text-emerald-600">0% Surcharge</span>
          </div>
        </div>
      </div>

      {/* Account Settings Status */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h3 className="font-serif text-[20px] text-foreground mb-4">Payout Account Verification</h3>
        <div className="flex items-center gap-4 border border-border p-4 rounded-xl bg-muted/20">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-[13.5px] font-bold text-slate-800">State Bank of India • XXXX8452</h4>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">Linked &amp; Verified for Instant Settlement payouts.</p>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
