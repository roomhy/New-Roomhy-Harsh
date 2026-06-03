import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Users, Search, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Phone
} from "lucide-react";

export default function VendorListPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState([
    { id: 1, name: "Daily Fresh Farm", contact: "Rajendra Prasadh", phone: "+91 99887 76655", category: "Vegetables & Dairy", status: "Active" },
    { id: 2, name: "Aggarwal Wholesale Grocers", contact: "Amit Aggarwal", phone: "+91 91234 55432", category: "Grains & Groceries", status: "Active" },
    { id: 3, name: "HP Gas Cylinder Agency", contact: "Sunil Dutt", phone: "+91 99988 88776", category: "LPG Cylinders", status: "Active" }
  ]);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Supply Partners" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Kitchen Vendors</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage relationships, contacts directory, and service categories of kitchen food supply vendors.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors by company name or supply type..."
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
                  <Users size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {v.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{v.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">{v.category}</p>
                <p className="text-[11.5px] text-muted-foreground mt-1 flex items-center gap-1"><Phone size={11} /> {v.phone}</p>
              </div>

              <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contact Person:</span>
                  <span className="font-bold text-slate-800">{v.contact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
