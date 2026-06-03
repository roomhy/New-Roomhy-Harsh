import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  FileCheck, Search, Download, CheckCircle2, 
  Eye, ShieldCheck, XCircle
} from "lucide-react";

export default function StaffDocumentsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [docs, setDocs] = useState([
    { id: 1, name: "Ramesh Kumar", type: "Aadhaar Card", number: "xxxx-xxxx-9011", status: "Verified" },
    { id: 2, name: "Sunil Dutt", type: "Electrician license certificate", number: "EL-9012-B", status: "Pending Verification" }
  ]);

  const handleVerify = (id) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: "Verified" } : d));
  };

  const filtered = docs.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Staff Verification Files" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Staff Documents</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Audit uploaded identity cards, training certifications, and police clearance details for staff members.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff documents by name..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Docs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => (
          <div key={d.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileCheck size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  d.status === "Verified" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}>
                  {d.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{d.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">{d.type} • {d.number}</p>
              </div>
            </div>

            {d.status !== "Verified" && (
              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                <button 
                  onClick={() => handleVerify(d.id)}
                  className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Approve Staff Document
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
