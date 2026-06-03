import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Globe, CheckCircle2, AlertCircle, Save 
} from "lucide-react";

export default function LanguageSettingsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [lang, setLang] = useState("English");
  const [success, setSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Language Preferences" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Language Settings</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Customize translation outputs for the landlord admin dashboard and tenant application portal.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Translation Options</h3>

        {success && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} /> Language settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Active Portal Language</label>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
            >
              <option value="English">English (United States)</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button 
              type="submit"
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
            >
              <Save size={14} /> Update Language Preference
            </button>
          </div>
        </form>
      </div>
    </PropertyOwnerLayout>
  );
}
