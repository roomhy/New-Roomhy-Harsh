import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Globe, Search, CheckCircle2, ArrowUpRight, 
  Settings, Eye, RefreshCw
} from "lucide-react";

export default function PropertyWebsitePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [domain, setDomain] = useState(`${owner?.propertyName?.toLowerCase().replace(/\s+/g, "-") || "my-stay"}.roomhy.com`);
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Microsite Settings" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Property Website</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Customize your public hostel booking landing page domain, brand logo, and room pricing.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Domain &amp; Hosting</h3>

        {success && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} /> Domain configuration updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Public URL Subdomain</label>
            <div className="flex">
              <input 
                type="text" 
                value={domain} 
                onChange={(e) => setDomain(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-l-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
              <span className="bg-muted border border-l-0 border-slate-100 rounded-r-xl px-4 flex items-center text-xs text-muted-foreground font-semibold">
                .roomhy.com
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border/60">
            <button 
              type="submit"
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
            >
              Save Configuration
            </button>
            <a 
              href={`https://${domain}`} 
              target="_blank" 
              rel="noreferrer"
              className="px-4 h-11 border border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              <Eye size={14} /> Preview Website <ArrowUpRight size={13} />
            </a>
          </div>
        </form>
      </div>
    </PropertyOwnerLayout>
  );
}
