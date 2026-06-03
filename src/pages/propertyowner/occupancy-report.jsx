import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  BarChart3, Search, Download, CheckCircle2, 
  TrendingUp, PieChart, Building2
} from "lucide-react";

export default function OccupancyReport() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const floorsBreakdown = [
    { floor: "Ground Floor", total: 20, occupied: 18, rate: "90%" },
    { floor: "1st Floor", total: 24, occupied: 22, rate: "91%" },
    { floor: "2nd Floor", total: 24, occupied: 18, rate: "75%" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Occupancy Reports" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Occupancy Reports</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Analyze bed occupancies breakdowns, check-in history timelines, and vacant room counts.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Bed Capacity</span>
          <h3 className="text-[28px] font-bold text-slate-900 mt-1">68 Beds</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Occupied Beds</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">58 Beds</h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Occupancy Rate</span>
          <h3 className="text-[28px] font-bold text-primary mt-1">85.2%</h3>
        </div>
      </div>

      {/* Floors list */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Floor Occupancy Breakdown</h3>
        <div className="space-y-4">
          {floorsBreakdown.map((f, idx) => (
            <div key={idx} className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">{f.floor}</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">{f.occupied} Occupied / {f.total} Total Beds</p>
              </div>
              <span className="font-bold text-primary text-[15px]">{f.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
