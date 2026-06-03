import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  AlertTriangle, Search, ShieldCheck, Mail, Phone, 
  IndianRupee, Percent, Check
} from "lucide-react";

export default function LatePaymentsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [fines, setFines] = useState([
    { id: 1, name: "Rajesh Gupta", room: "102", dueDate: "05 May 2026", fineRate: 100, daysLate: 15, fineAmount: 1500, totalPayable: 10000 },
    { id: 2, name: "Deepak Chawla", room: "203", dueDate: "05 May 2026", fineRate: 100, daysLate: 15, fineAmount: 1500, totalPayable: 8500 }
  ]);

  const handleWaiveFine = (id) => {
    setFines(prev => prev.map(f => f.id === id ? { ...f, fineAmount: 0, totalPayable: f.totalPayable - f.fineAmount } : f));
  };

  const filteredFines = fines.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.room.includes(search)
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Late Fee Accruals" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Late Fees &amp; Fines</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage automatic late fee charges, grace periods, and manual penalty waivers.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search penalty accruals by name or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Fines Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Rent Due Date</th>
                <th className="px-6 py-3.5 font-semibold">Late Fee / Day</th>
                <th className="px-6 py-3.5 font-semibold">Days Accrued</th>
                <th className="px-6 py-3.5 font-semibold">Penalty Amount</th>
                <th className="px-6 py-3.5 font-semibold">Net Balance</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFines.map((f) => (
                <tr key={f.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{f.name}</td>
                  <td className="px-6 py-4 font-bold text-foreground">Room {f.room}</td>
                  <td className="px-6 py-4 text-muted-foreground">{f.dueDate}</td>
                  <td className="px-6 py-4 text-muted-foreground">₹{f.fineRate}</td>
                  <td className="px-6 py-4 text-rose-600 font-bold">{f.daysLate} Days Late</td>
                  <td className="px-6 py-4 font-bold text-rose-600">₹{f.fineAmount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">₹{f.totalPayable.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {f.fineAmount > 0 ? (
                      <button 
                        onClick={() => handleWaiveFine(f.id)}
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        Waive Penalty
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Waived
                      </span>
                    )}
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
