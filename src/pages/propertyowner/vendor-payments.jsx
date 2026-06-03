import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Briefcase, Search, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Phone, ArrowUpRight
} from "lucide-react";

export default function VendorPaymentsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState([
    { id: 1, name: "Gupta Dairy", service: "Milk & Dairy Supply", outstanding: 12000, lastPaid: "02 May 2026", phone: "+91 98765 11002" },
    { id: 2, name: "Sharma Laundry", service: "Bedding & Linen Wash", outstanding: 4500, lastPaid: "28 Apr 2026", phone: "+91 91234 55432" },
    { id: 3, name: "Reliable Security Group", service: "Security Guards (2)", outstanding: 28000, lastPaid: "01 May 2026", phone: "+91 99988 88776" }
  ]);

  const handlePayVendor = (id) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, outstanding: 0 } : v));
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Vendor Ledgers" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Vendor Payments</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage supplier invoices, security agency salaries, daily grocery tabs, and release payments.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by name or service type..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Vendors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((v) => (
          <div key={v.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  v.outstanding > 0 
                    ? "bg-rose-50 text-rose-600 border border-rose-100" 
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}>
                  {v.outstanding > 0 ? "Pending Invoice" : "Fully Settled"}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{v.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">{v.service}</p>
                <p className="text-[11.5px] text-muted-foreground mt-1 flex items-center gap-1"><Phone size={11} /> {v.phone}</p>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Settlement Date:</span>
                  <span className="font-medium text-foreground">{v.lastPaid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold text-rose-600">Outstanding Balance:</span>
                  <span className="font-bold text-rose-600">₹{v.outstanding.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {v.outstanding > 0 && (
              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                <button 
                  onClick={() => handlePayVendor(v.id)}
                  className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Release Payment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
