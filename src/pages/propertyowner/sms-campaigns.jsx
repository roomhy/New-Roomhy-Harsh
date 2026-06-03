import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Smartphone, Search, Send, CheckCircle2, 
  AlertCircle, ShieldCheck
} from "lucide-react";

export default function SMSCampaignsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [message, setMessage] = useState("");
  const [group, setGroup] = useState("All Active Tenants");
  const [success, setSuccess] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setMessage("");
    }, 2000);
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="SMS Communications" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">SMS Campaigns</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Send bulk SMS messages to residents and leads with DLT template validations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Composer */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
          <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Create New Campaign</h3>
          
          {success && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 size={16} /> SMS campaign dispatched successfully!
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Recipient Group</label>
              <select 
                value={group} 
                onChange={(e) => setGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
              >
                <option value="All Active Tenants">All Active Tenants (120 recipients)</option>
                <option value="Tenants with Pending Dues">Tenants with Pending Dues (18 recipients)</option>
                <option value="Registered Leads">Leads &amp; Enquiries (45 recipients)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">SMS Body Text</label>
              <textarea 
                rows={4}
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your SMS alert text (Max 160 chars for 1 credit)..."
                maxLength={160}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
              <span className="text-[11px] text-muted-foreground mt-1.5 block text-right">{message.length}/160 characters</span>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
              >
                Dispatch SMS Campaign <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* SMS Credits */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-800">4,500 SMS Credits Left</h4>
                <p className="text-[11.5px] text-muted-foreground">DLT ID: 140288219000188</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
