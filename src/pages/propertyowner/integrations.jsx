import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Puzzle, CheckCircle2, AlertCircle, ToggleLeft, 
  ToggleRight, Globe
} from "lucide-react";

export default function IntegrationsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [integrations, setIntegrations] = useState([
    { id: 1, name: "WhatsApp Business API", desc: "Automate rent notifications directly on WhatsApp chat channels.", connected: true },
    { id: 2, name: "Tally Accounting Sync", desc: "Push income/expense transaction lines directly to Tally ledger systems.", connected: false }
  ]);

  const handleToggle = (id) => {
    setIntegrations(prev => prev.map(item => item.id === id ? { ...item, connected: !item.connected } : item));
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Third-party Connectors" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Integrations</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Sync your PG ledger databases with Tally, QuickBooks, SMS pathways, and smartlocks gateways.</p>
        </div>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Puzzle size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  item.connected 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {item.connected ? "Connected" : "Not connected"}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground leading-tight">{item.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-1.5">{item.desc}</p>
              </div>
            </div>

            <div className="border-t border-border/60 mt-6 pt-4 flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Enable Integration:</span>
              <button onClick={() => handleToggle(item.id)}>
                {item.connected ? (
                  <ToggleRight size={38} className="text-emerald-600" />
                ) : (
                  <ToggleLeft size={38} className="text-slate-300" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
