import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Building2, Search, Download, CheckCircle2, 
  ArrowUpRight, FileText
} from "lucide-react";

export default function PropertyDocumentsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [docs, setDocs] = useState([
    { id: 1, name: "Fire Safety NOC Certificate", expiry: "31 Dec 2026", status: "Active" },
    { id: 2, name: "Municipal Trade License", expiry: "31 March 2027", status: "Active" },
    { id: 3, name: "GST Compliance Registration copy", expiry: "Lifetime validity", status: "Active" }
  ]);

  const handleDownload = (docName) => {
    const element = document.createElement("a");
    const file = new Blob([
      `Roomhy Legal Document Archive\n===========================\n\nDocument: ${docName}\nOwner ID: ${owner.loginId}\nStatus: Verified & Active\nGenerated on: ${new Date().toLocaleDateString()}`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Property Legal Archives" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Property Documents</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Keep safe track of Fire safety NOCs, trade licenses, building blueprints, and electricity supply papers.</p>
        </div>
      </div>

      {/* Grid of Docs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((d) => (
          <div key={d.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {d.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground leading-tight">{d.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-1">Expiry Date: <strong className="text-foreground">{d.expiry}</strong></p>
              </div>
            </div>

            <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
              <button 
                onClick={() => handleDownload(d.name)}
                className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Download size={14} /> Download File Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
