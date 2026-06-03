import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Building, Plus, Trash2, CheckCircle2, 
  AlertCircle, ShieldCheck
} from "lucide-react";

export default function BankAccountsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [accounts, setAccounts] = useState([
    { id: 1, bankName: "HDFC Bank Limited", holder: "Akash Gupta", accountNo: "xxxxx9081", ifsc: "HDFC0000102", type: "Primary Settlement" }
  ]);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Settlements Bank Accounts" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Bank Accounts</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage corporate/savings bank accounts linked to receive tenant rents settlements directly.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Linked Accounts</h3>
        <div className="space-y-4">
          {accounts.map((a) => (
            <div key={a.id} className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Building size={20} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-slate-800">{a.bankName} ({a.holder})</h4>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">Acc: {a.accountNo} • IFSC: {a.ifsc}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {a.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
