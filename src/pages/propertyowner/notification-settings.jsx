import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Bell, CheckCircle2, AlertCircle, ToggleLeft, 
  ToggleRight, Save
} from "lucide-react";

export default function NotificationSettingsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [whatsappReminders, setWhatsappReminders] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Alert Preference Controls" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Notification Settings</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Configure automated SMS rent reminder dispatches, WhatsApp verification alerts, and email notices.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Alert Preferences</h3>

        {success && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} /> Notification preferences updated!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">Auto WhatsApp Rent Reminders</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Send billing links to residents automatically on the 1st of every month.</p>
              </div>
              <button type="button" onClick={() => setWhatsappReminders(!whatsappReminders)}>
                {whatsappReminders ? (
                  <ToggleRight size={38} className="text-emerald-600" />
                ) : (
                  <ToggleLeft size={38} className="text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex justify-between items-center border border-border p-4 rounded-xl bg-muted/20">
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800">SMS Transaction Receipts</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Send a short transaction SMS on every rent payment confirmation.</p>
              </div>
              <button type="button" onClick={() => setSmsReceipts(!smsReceipts)}>
                {smsReceipts ? (
                  <ToggleRight size={38} className="text-emerald-600" />
                ) : (
                  <ToggleLeft size={38} className="text-slate-300" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button 
              type="submit"
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
            >
              <Save size={14} /> Save Alert Rules
            </button>
          </div>
        </form>
      </div>
    </PropertyOwnerLayout>
  );
}
