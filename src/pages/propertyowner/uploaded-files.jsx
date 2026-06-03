import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  FileText, Search, Download, Trash2, 
  CheckCircle2, AlertCircle, Plus
} from "lucide-react";

export default function UploadedFilesPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([
    { id: 1, name: "broken_pipe_washroom.jpg", size: "1.2 MB", date: "18 May 2026", uploader: "Sunil Dutt (Staff)" },
    { id: 2, name: "grocery_bill_may.pdf", size: "480 KB", date: "15 May 2026", uploader: "Ramesh Kumar (Warden)" }
  ]);

  const handleDelete = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const filtered = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.uploader.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Warden Uploads Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Uploaded Files</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Access recent service tickets media uploads, grocery receipts snaps, and other warden attachments.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search uploaded attachments by filename..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((f) => (
          <div key={f.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="text-[11px] font-mono text-slate-500">{f.size}</span>
              </div>

              <div>
                <h3 className="font-serif text-[18px] font-bold text-foreground truncate">{f.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Uploaded by: <strong className="text-foreground">{f.uploader}</strong></p>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">Date: {f.date}</p>
              </div>
            </div>

            <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
              <button 
                onClick={() => handleDelete(f.id)}
                className="flex-1 h-10 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-all"
              >
                Delete File
              </button>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
