import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Download, Calendar, FileText, CheckCircle2, 
  Info, Loader2, ArrowRight
} from "lucide-react";

export default function DownloadStatementsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [statementType, setStatementType] = useState("all-transactions");
  const [format, setFormat] = useState("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Statement compilation complete! Your download will begin shortly.");
    }, 1500);
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Accounting Statements Export" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Export Statements</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Export customized ledger accounts, tenant rent rolls, and cash flow sheets.</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-soft space-y-6">
        <h3 className="font-serif text-[20px] text-foreground border-b border-border/60 pb-3">Export Configuration</h3>
        
        <form onSubmit={handleDownload} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Statement Ledger Type</label>
              <select 
                value={statementType} 
                onChange={(e) => setStatementType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
              >
                <option value="all-transactions">All Transactions Ledger</option>
                <option value="rent-collections">Rent Collections Roll</option>
                <option value="expense-ledger">Expense &amp; Maintenance Log</option>
                <option value="escrow-deposits">Security Escrows &amp; Deposits</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">File Format</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all cursor-pointer"
              >
                <option value="pdf">Acrobat PDF (.pdf)</option>
                <option value="csv">Comma Separated Values (.csv)</option>
                <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-800 uppercase mb-3 block tracking-tight">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/60">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling Statement...
                </>
              ) : (
                <>
                  Generate &amp; Download <Download className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </PropertyOwnerLayout>
  );
}
