import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  FileText, Search, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, Copy
} from "lucide-react";

export default function CommunicationTemplatesPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [templates, setTemplates] = useState([
    { id: 1, name: "Rent Collection Notice", channel: "WhatsApp / SMS", content: "Dear {tenant_name}, your rent of ₹{rent_amount} for Room {room_number} is due. Please settle via the Roomhy portal link: {portal_link}. Thank you!" },
    { id: 2, name: "Welcome Onboarding Guide", channel: "Email", content: "Hi {tenant_name}, welcome to Roohmy stays! Your digital check-in is complete. Room keys can be collected from the warden: {warden_phone}." },
    { id: 3, name: "Maintenance Resolution Update", channel: "WhatsApp", content: "Hi {tenant_name}, ticket #{ticket_id} regarding '{complaint_type}' has been resolved. Please share your feedback on the app. Thank you!" }
  ]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.channel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Saved Messaged Layouts" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Message Templates</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Save reusable layouts with custom brackets variables keys (e.g. resident name, room number).</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by label or channel type..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {t.channel}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{t.name}</h3>
                <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40 font-mono text-[11.5px] leading-relaxed">
                  {t.content}
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
              <button 
                onClick={() => handleCopy(t.id, t.content)}
                className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Copy size={14} /> {copiedId === t.id ? "Copied!" : "Copy Text"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
