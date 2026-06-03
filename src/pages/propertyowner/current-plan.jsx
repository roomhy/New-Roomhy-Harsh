import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  ShieldCheck, CheckCircle2, ArrowUpRight, 
  Sparkles, Calendar, Zap
} from "lucide-react";

export default function CurrentPlanPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Active Subscription Plan" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Current Plan</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage your property owner software license, active features tiers, and billing cycles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tier Details */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              Active Plan
            </span>
          </div>

          <div>
            <h3 className="font-serif text-[24px] font-bold text-foreground">Roomhy Gold Tier</h3>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">Premium multi-property management license.</p>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Fee:</span>
              <span className="font-bold text-slate-800">₹4,999 / month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Next Renewal:</span>
              <span className="font-bold text-slate-800">15 June 2026</span>
            </div>
          </div>
        </div>

        {/* Feature inclusions */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <h4 className="text-[14px] font-bold text-slate-800">Gold Features Activated</h4>
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" /> Unlimited properties and rooms
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" /> WhatsApp &amp; SMS Campaign tools
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" /> Advanced digital signature workflows
            </li>
          </ul>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
