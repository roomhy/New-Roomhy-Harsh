import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  FileSignature, Search, Send, CheckCircle2, 
  AlertCircle, ShieldCheck
} from "lucide-react";

export default function DigitalSignaturesPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [signs, setSigns] = useState([
    { id: 1, docName: "Rent Lease Agreement Block A", tenant: "Amit Sharma", status: "Signed" },
    { id: 2, docName: "Security Deposit Waiver Annexure", tenant: "Vijay Kumar", status: "Awaiting Signature" }
  ]);

  const handleRemind = (id) => {
    alert("Electronic signature reminder sent to resident!");
  };

  const filtered = signs.filter(s => 
    s.docName.toLowerCase().includes(search.toLowerCase()) || 
    s.tenant.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Electronic Signatures Portal" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Digital Signatures</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Send digital contracts to tenants for e-signatures via Aadhaar OTP or DocuSign API integrations.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or signatories..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Signs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileSignature size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  s.status === "Signed" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}>
                  {s.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground leading-tight">{s.docName}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-1">Signatory: <strong className="text-foreground">{s.tenant}</strong></p>
              </div>
            </div>

            {s.status !== "Signed" && (
              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                <button 
                  onClick={() => handleRemind(s.id)}
                  className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
                >
                  <Send size={14} /> Send SMS Reminder
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
