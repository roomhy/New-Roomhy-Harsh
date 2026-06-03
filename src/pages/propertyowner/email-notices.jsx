import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Mail, Search, Send, CheckCircle2, 
  AlertCircle, ShieldCheck
} from "lucide-react";

export default function EmailNoticesPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState("All Active Tenants");
  const [success, setSuccess] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSubject("");
      setMessage("");
    }, 2000);
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Email Notifications" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Email Notices</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Send official formal notices, lease agreement renewals updates, and fee receipt PDFs via email.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Composer */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
          <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Create New Email Notice</h3>
          
          {success && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 size={16} /> Email notice broadcasted successfully!
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Recipient Group</label>
                <select 
                  value={group} 
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
                >
                  <option value="All Active Tenants">All Active Tenants (120 recipients)</option>
                  <option value="Tenants with Pending Dues">Tenants with Pending Dues (18 recipients)</option>
                  <option value="Staff Members Group">Staff Members Group (12 recipients)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Email Subject Line</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Curfew hours changes or lift maintenance notice"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Email Rich Body Content</label>
              <textarea 
                rows={6}
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your official announcement content here..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
              >
                Send Email Broadcast <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Server check */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-800">SMTP Server Verified</h4>
                <p className="text-[11.5px] text-muted-foreground">Connected with secure SSL port 465.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
