import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  ShieldCheck, Search, Download, FileText, Mail, 
  Phone, IndianRupee, Layers
} from "lucide-react";

export default function SecurityDepositsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");

  const deposits = [
    { id: 1, name: "Amit Sharma", room: "101", required: 15000, paid: 15000, date: "15 Jan 2026", status: "Held in Trust" },
    { id: 2, name: "Vijay Kumar", room: "101", required: 15000, paid: 10000, date: "10 Feb 2026", status: "Partially Paid" },
    { id: 3, name: "Rajesh Gupta", room: "102", required: 15000, paid: 0, date: "01 Mar 2026", status: "Pending Payment" }
  ];

  const filteredDeposits = deposits.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.room.includes(search)
  );

  const totalHeld = deposits.reduce((acc, d) => acc + d.paid, 0);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Security Escrows" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Security Deposits</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage tenant security deposits, partial allocations, and trust balances.</p>
        </div>
      </div>

      {/* Escrow Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Escrow Capital Held</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">₹{totalHeld.toLocaleString("en-IN")}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider font-bold text-rose-600">Pending Escrow Collections</span>
          <h3 className="text-[28px] font-bold text-rose-600 mt-1">₹20,000</h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search security deposits by tenant name or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Required Deposit</th>
                <th className="px-6 py-3.5 font-semibold">Amount Paid</th>
                <th className="px-6 py-3.5 font-semibold">Deposit Date</th>
                <th className="px-6 py-3.5 font-semibold">Escrow Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDeposits.map((d) => (
                <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{d.name}</td>
                  <td className="px-6 py-4 font-bold text-foreground">Room {d.room}</td>
                  <td className="px-6 py-4 text-muted-foreground">₹{d.required.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{d.paid.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-muted-foreground">{d.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      d.status === "Held in Trust" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : d.status === "Partially Paid" 
                        ? "bg-amber-50 text-amber-600 border-amber-100" 
                        : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors">
                      <FileText size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
