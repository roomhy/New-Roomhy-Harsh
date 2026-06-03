import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Gift, Search, CheckCircle2, Award, 
  ArrowUpRight, IndianRupee, HelpCircle
} from "lucide-react";

export default function ReferralProgramPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [referrals, setReferrals] = useState([
    { id: 1, referrer: "Amit Sharma", referee: "Suraj Rawat", date: "15 May 2026", status: "Claimed", reward: 500 }
  ]);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Referral Program" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Referral Program</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Offer rent cashbacks and discounts incentives to existing tenants for referring roommates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings */}
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
          <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Program Configuration</h3>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">Referrer Bonus Cash</h4>
                <p className="text-muted-foreground mt-0.5">Credited to existing resident's next invoice.</p>
              </div>
              <span className="font-bold text-primary text-[15px]">₹500</span>
            </div>
            <div className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">New Move-in Discount</h4>
                <p className="text-muted-foreground mt-0.5">Credited to referred tenant's onboarding token.</p>
              </div>
              <span className="font-bold text-primary text-[15px]">₹500</span>
            </div>
          </div>
        </div>

        {/* Ledger */}
        <div className="lg:col-span-6 bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
          <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Successful Referrals</h3>
          <div className="space-y-4">
            {referrals.map((r) => (
              <div key={r.id} className="flex justify-between items-center border border-border p-4 rounded-xl">
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-800">{r.referrer} referred {r.referee}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Claimed on: {r.date}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                  +₹{r.reward}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
