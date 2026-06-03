import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Zap, CheckCircle2, ArrowUpRight, 
  Sparkles, Award
} from "lucide-react";

export default function UpgradePlanPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Pricing &amp; License Upgrades" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Upgrade Plan</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Unlock multi-property expansions, official WhatsApp automation integrations, and digital legal check-ins.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        {/* Silver */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-serif text-[24px] font-bold text-slate-800">Silver Plan</h3>
            <p className="text-[12.5px] text-muted-foreground">Perfect for single PGs or hostels starting online collections.</p>
            <h4 className="text-[32px] font-black text-slate-900">₹1,999<span className="text-xs font-normal text-muted-foreground">/month</span></h4>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Max 2 properties
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Auto rent invoice collection
              </li>
            </ul>
          </div>
          <button className="w-full h-11 border border-border hover:bg-muted text-slate-800 rounded-xl text-xs font-bold transition-all">
            Downgrade to Silver
          </button>
        </div>

        {/* Gold */}
        <div className="rounded-2xl border border-primary/40 bg-card p-6 shadow-soft space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-[9px] uppercase font-black px-3 py-1 rounded-bl-xl tracking-wider">
            Current Tier
          </div>
          <div className="space-y-4">
            <h3 className="font-serif text-[24px] font-bold text-slate-800">Gold Plan</h3>
            <p className="text-[12.5px] text-muted-foreground">Complete PG automation suites with SMS and digital templates.</p>
            <h4 className="text-[32px] font-black text-slate-900">₹4,999<span className="text-xs font-normal text-muted-foreground">/month</span></h4>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> Unlimited properties &amp; beds
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" /> WhatsApp &amp; SMS Broadcast campaigns
              </li>
            </ul>
          </div>
          <button className="w-full h-11 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all opacity-50 cursor-not-allowed" disabled>
            Already Subscribed
          </button>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
