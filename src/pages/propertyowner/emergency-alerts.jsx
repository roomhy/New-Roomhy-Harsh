import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { fetchJson } from "../../utils/api";
import { 
  AlertOctagon, Search, Send, CheckCircle2, 
  Flame, ShieldAlert, Zap, AlertTriangle
} from "lucide-react";

export default function EmergencyAlertsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [alerts, setAlerts] = useState([]);
  const [dispatching, setDispatching] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);

  const triggerAlert = async (type) => {
    if (dispatching) return;
    setDispatching(type);
    setAlertStatus(null);
    try {
      const resp = await fetchJson("/api/emergency/send", {
        method: "POST",
        body: JSON.stringify({ ownerLoginId: owner.loginId, type })
      });
      const alertId = resp?.alertId || resp?.alert?.id || resp?.id;
      setAlerts((prev) => [{
        id: alertId || "—",
        type,
        target: "All Residents & Staff",
        date: new Date().toLocaleString(),
        status: "Dispatched"
      }, ...prev]);
      setAlertStatus({ kind: "success", message: `Emergency alert dispatched successfully${alertId ? ` · ID: ${alertId}` : ""}` });
      setTimeout(() => setAlertStatus(null), 4000);
    } catch (e) {
      setAlertStatus({ kind: "error", message: e?.message || "Failed to dispatch emergency alert. Please try again." });
      setTimeout(() => setAlertStatus(null), 5000);
    } finally {
      setDispatching(null);
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Safety Alarm dispatchers" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Emergency Alerts</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Instantly dispatch SMS and Push Notifications sirens to all tenants for urgent water outages, fire drills, or power grid repairs.</p>
        </div>
      </div>

      {alertStatus && (
        <div className={`rounded-xl border p-4 text-xs font-bold flex items-center gap-2 mb-6 ${
          alertStatus.kind === "success"
            ? "border-rose-100 bg-rose-50 text-rose-700 animate-bounce"
            : "border-destructive/20 bg-destructive/10 text-destructive"
        }`}>
          <AlertOctagon size={16} /> {alertStatus.message}
        </div>
      )}

      {/* Sirens grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/10 p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <Flame className="text-rose-600 size-8" />
            <h3 className="font-serif text-[18px] font-bold text-foreground">Fire Drill / Evacuation</h3>
            <p className="text-xs text-muted-foreground">Send safety guidelines, exit paths, and assembly point coordinates immediately.</p>
          </div>
          <button
            onClick={() => triggerAlert("Fire Drill Alert")}
            disabled={!!dispatching}
            className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {dispatching === "Fire Drill Alert" ? "Dispatching..." : "Dispatch Evacuation Alert"}
          </button>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/10 p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <Zap className="text-amber-600 size-8" />
            <h3 className="font-serif text-[18px] font-bold text-foreground">Power / Generator Repair</h3>
            <p className="text-xs text-muted-foreground">Broadcast scheduled electricity cuts or grid load maintenance schedules.</p>
          </div>
          <button
            onClick={() => triggerAlert("Scheduled Power Cut Notice")}
            disabled={!!dispatching}
            className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {dispatching === "Scheduled Power Cut Notice" ? "Dispatching..." : "Dispatch Power Notice"}
          </button>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/10 p-6 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <AlertTriangle className="text-blue-600 size-8" />
            <h3 className="font-serif text-[18px] font-bold text-foreground">Water Supply Shortage</h3>
            <p className="text-xs text-muted-foreground">Notify residents of tank pump issues or municipal supply restrictions.</p>
          </div>
          <button
            onClick={() => triggerAlert("Water Shortage Warning")}
            disabled={!!dispatching}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {dispatching === "Water Shortage Warning" ? "Dispatching..." : "Dispatch Water Alert"}
          </button>
        </div>
      </div>

      {/* Alert logs */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Dispatched Alerts Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Alert ID</th>
                <th className="px-6 py-3.5 font-semibold">Incident Type</th>
                <th className="px-6 py-3.5 font-semibold">Target Audience</th>
                <th className="px-6 py-3.5 font-semibold">Sent Timestamp</th>
                <th className="px-6 py-3.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((a) => (
                <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-foreground">{a.id}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{a.type}</td>
                  <td className="px-6 py-4 text-muted-foreground">{a.target}</td>
                  <td className="px-6 py-4 text-muted-foreground">{a.date}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                      {a.status}
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
