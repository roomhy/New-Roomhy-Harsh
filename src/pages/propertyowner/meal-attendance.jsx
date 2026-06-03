import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Users, Search, CheckCircle2, AlertCircle, 
  UtensilsCrossed, Calendar, Award
} from "lucide-react";

export default function MealAttendancePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("Breakfast");

  const scans = [
    { id: 1, name: "Amit Sharma", room: "101", slot: "Breakfast", time: "08:15 AM", status: "Scanned" },
    { id: 2, name: "Vijay Kumar", room: "101", slot: "Breakfast", time: "08:22 AM", status: "Scanned" },
    { id: 3, name: "Rohan Mehta", room: "104", slot: "Breakfast", time: "09:02 AM", status: "Scanned" }
  ];

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Mess Scans Tracker" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Meal Attendance</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track resident mess QR code scans, headcounts, and analyze food waste metrics.</p>
        </div>
      </div>

      {/* Toolbar / Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scans by resident name or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {(["Breakfast", "Lunch", "Dinner"]).map((slot) => (
            <button
              key={slot}
              onClick={() => setSlotFilter(slot)}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-colors border ${
                slotFilter === slot 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Scans Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Resident Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Meal Slot</th>
                <th className="px-6 py-3.5 font-semibold">Scan Timestamp</th>
                <th className="px-6 py-3.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground">{s.name}</td>
                  <td className="px-6 py-4 font-bold text-foreground">Room {s.room}</td>
                  <td className="px-6 py-4 text-muted-foreground">{s.slot}</td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">{s.time}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {s.status}
                    </span>
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
