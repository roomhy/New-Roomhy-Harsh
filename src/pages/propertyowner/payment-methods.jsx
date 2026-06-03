import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  CreditCard, Plus, Trash2, CheckCircle2, 
  AlertCircle, ShieldCheck
} from "lucide-react";

export default function PaymentMethodsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [cards, setCards] = useState([
    { id: 1, type: "Visa", last4: "4242", expiry: "12/28", primary: true }
  ]);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Autopay Settings" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Payment Methods</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage your credit/debit cards linked for automated recurring subscription license collections.</p>
        </div>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Linked Card Details */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Linked Cards</h3>
          <div className="space-y-4">
            {cards.map((c) => (
              <div key={c.id} className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-slate-800">{c.type} Ending in {c.last4}</h4>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">Expires: {c.expiry}</p>
                  </div>
                </div>
                {c.primary && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
