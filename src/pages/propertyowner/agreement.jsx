import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  FileText, Search, Download, CheckCircle2, 
  ArrowUpRight, Eye, ShieldCheck
} from "lucide-react";

export default function Agreement() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const items = [
    { name: "Amit Sharma", room: "101", start: "01 Jan 2026", end: "31 Dec 2026", status: "Signed & Active" },
    { name: "Vijay Kumar", room: "101", start: "15 Jan 2026", end: "14 Dec 2026", status: "Signed & Active" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Tenant Rental Agreements" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Rental Agreements</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor e-signed rental agreements, renewal timelines, and stamps paper compliance.</p>
        </div>
      </div>

      {/* Agreements Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Resident Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Lease Period</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((i, index) => (
                <tr key={index} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{i.name}</td>
                  <td className="px-6 py-4 font-bold text-foreground">Room {i.room}</td>
                  <td className="px-6 py-4 text-muted-foreground">{i.start} - {i.end}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {i.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors">
                      <Eye size={14} />
                    </button>
                    <button className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors">
                      <Download size={14} />
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
