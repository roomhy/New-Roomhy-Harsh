import React from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Users, BarChart3, TrendingUp, Download, 
  ArrowUpRight, PieChart, ShieldCheck
} from "lucide-react";

export default function StaffReportsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const reports = [
    { name: "Ramesh Kumar", role: "Warden / Manager", tasks: "45/45 Resolved", score: "99.8%" },
    { name: "Sunil Dutt", role: "Electrician & Plumber", tasks: "32/35 Resolved", score: "91.4%" },
    { name: "Ravi Shankar", role: "Security Supervisor", tasks: "20/20 Shift logs", score: "100%" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Staff Performance Reports" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Staff Reports</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor warden shift logs, security gate checkpoints reports, and handyman task ratings.</p>
        </div>
      </div>

      {/* Grid Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Staff Name</th>
                <th className="px-6 py-3.5 font-semibold">Designated Role</th>
                <th className="px-6 py-3.5 font-semibold">Tasks Completed</th>
                <th className="px-6 py-3.5 font-semibold text-right">Performance Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((r, index) => (
                <tr key={index} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{r.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.role}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">{r.tasks}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
