import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { fetchJson } from "../../utils/api";
import { 
  Settings, Save, Clock, IndianRupee, ShieldAlert, 
  Coffee, Zap, ShieldCheck
} from "lucide-react";

export default function PropertySettingsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [checkoutTime, setCheckoutTime] = useState("10:00 AM");
  const [checkinTime, setCheckinTime] = useState("11:00 AM");
  const [fineGracePeriod, setFineGracePeriod] = useState(5);
  const [fineAmount, setFineAmount] = useState(100);
  const [curfewTime, setCurfewTime] = useState("11:00 PM");
  const [electricityUnitRate, setElectricityUnitRate] = useState(12);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchJson(`/api/owners/${owner.loginId}`);
        if (data?.settings) {
          setCheckoutTime(data.settings.checkoutTime || "10:00 AM");
          setCheckinTime(data.settings.checkinTime || "11:00 AM");
          setFineGracePeriod(data.settings.fineGracePeriod !== undefined ? data.settings.fineGracePeriod : 5);
          setFineAmount(data.settings.fineAmount !== undefined ? data.settings.fineAmount : 100);
          setCurfewTime(data.settings.curfewTime || "11:00 PM");
          setElectricityUnitRate(data.settings.electricityUnitRate !== undefined ? data.settings.electricityUnitRate : 12);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to load settings from server.");
      } finally {
        setLoading(false);
      }
    }
    if (owner?.loginId) {
      loadSettings();
    }
  }, [owner?.loginId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setIsSaved(false);
      const payload = {
        settings: {
          checkoutTime,
          checkinTime,
          fineGracePeriod: Number(fineGracePeriod),
          fineAmount: Number(fineAmount),
          curfewTime,
          electricityUnitRate: Number(electricityUnitRate)
        }
      };
      await fetchJson(`/api/owners/${owner.loginId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings to server.");
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Property Rules" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Property Rules</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Configure check-in timings, curfews, penalty parameters, and utility calculations.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 p-4 text-rose-700 text-xs font-bold flex items-center gap-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Check-in / Check-out timing */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3 mb-2 pb-4 border-b border-border">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-serif text-[18px] text-foreground font-bold">Standard Timing Rules</h3>
                <p className="text-[12px] text-muted-foreground">Adjust default checkin/checkout slots.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Standard Check-In Time</label>
                <input 
                  type="text" 
                  value={checkinTime} 
                  onChange={(e) => setCheckinTime(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Standard Check-Out Time</label>
                <input 
                  type="text" 
                  value={checkoutTime} 
                  onChange={(e) => setCheckoutTime(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Late Payment Fine Rule */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3 mb-2 pb-4 border-b border-border">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <div>
                <h3 className="font-serif text-[18px] text-foreground font-bold">Late Payment Parameters</h3>
                <p className="text-[12px] text-muted-foreground">Grace periods and automatic fine calculations.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Grace Period (Days)</label>
                <input 
                  type="number" 
                  value={fineGracePeriod} 
                  onChange={(e) => setFineGracePeriod(parseInt(e.target.value))}
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Fine Surcharge (₹ / Day)</label>
                <input 
                  type="number" 
                  value={fineAmount} 
                  onChange={(e) => setFineAmount(parseInt(e.target.value))}
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Curfew Timings */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3 mb-2 pb-4 border-b border-border">
              <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="font-serif text-[18px] text-foreground font-bold">Curfew & Gate Access</h3>
                <p className="text-[12px] text-muted-foreground">Adjust security locking hours.</p>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 block mb-1">Gate Curfew Lock Timing</label>
              <input 
                type="text" 
                value={curfewTime} 
                onChange={(e) => setCurfewTime(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Card 4: Electricity Utility Billing */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3 mb-2 pb-4 border-b border-border">
              <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-serif text-[18px] text-foreground font-bold">Utility Costs Surcharges</h3>
                <p className="text-[12px] text-muted-foreground">Electricity unit base multiplication values.</p>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-slate-700 block mb-1">Electricity Price (₹ / Unit)</label>
              <input 
                type="number" 
                value={electricityUnitRate} 
                onChange={(e) => setElectricityUnitRate(parseInt(e.target.value))}
                className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit"
            className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
          >
            <Save size={16} /> Save Changes
          </button>
          {isSaved && (
            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 animate-fade-in">
              <ShieldCheck size={16} /> Configuration saved successfully!
            </span>
          )}
        </div>
      </form>
      )}
    </PropertyOwnerLayout>
  );
}
