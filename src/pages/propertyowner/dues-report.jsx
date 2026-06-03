import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  AlertCircle, Search, Mail, Phone, MessageSquare, 
  Send, CheckCircle, IndianRupee
} from "lucide-react";

export default function DuesReportPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [dues, setDues] = useState([
    { id: 1, name: "Rajesh Gupta", room: "102", bed: "A", month: "May 2026", amount: 8500, daysOverdue: 15, phone: "+91 99887 76655" },
    { id: 2, name: "Deepak Chawla", room: "203", bed: "A", month: "May 2026", amount: 7000, daysOverdue: 15, phone: "+91 93456 78901" },
    { id: 3, name: "Ishan Kishan", room: "103", bed: "B", month: "April 2026", amount: 5000, daysOverdue: 45, phone: "+91 95432 00998" }
  ]);

  const handleSendReminder = (name) => {
    // Notify trigger
  };

  const filteredDues = dues.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.room.includes(search)
  );

  const totalOutstanding = dues.reduce((acc, d) => acc + d.amount, 0);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Outstanding Dues" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Outstanding Dues</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor outstanding balances, track aging schedules, and trigger automatic reminders.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Outstanding Dues</span>
          <h3 className="text-[28px] font-bold text-rose-600 mt-1">₹{totalOutstanding.toLocaleString("en-IN")}</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Defaulter Residents</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">{dues.length} <span className="text-sm font-normal text-muted-foreground">Tenants</span></h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Avg. Days Delinquent</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">25 <span className="text-sm font-normal text-muted-foreground">Days</span></h3>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search outstanding dues by name or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Dues Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room & Bed</th>
                <th className="px-6 py-3.5 font-semibold">Billing Month</th>
                <th className="px-6 py-3.5 font-semibold">Dues Amount</th>
                <th className="px-6 py-3.5 font-semibold">Aging Days</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDues.map((d) => (
                <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{d.name}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">Room {d.room}</div>
                    <div className="text-[11px] text-muted-foreground">Bed {d.bed}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{d.month}</td>
                  <td className="px-6 py-4 font-bold text-rose-600">₹{d.amount.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      d.daysOverdue > 30 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {d.daysOverdue} Days Overdue
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleSendReminder(d.name)}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                    >
                      <Send size={12} /> Send Alert
                    </button>
                    <button className="h-8 px-3 border border-border rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground">
                      Record Cash
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
