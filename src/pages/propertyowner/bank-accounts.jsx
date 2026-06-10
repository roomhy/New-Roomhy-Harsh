import React, { useEffect, useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { ownerApi } from "../../services/api";
import { Building, ShieldCheck, Eye, EyeOff, ExternalLink, Smartphone } from "lucide-react";

function maskAccount(num) {
  if (!num) return "—";
  const s = String(num);
  return "xxxxx" + s.slice(-4);
}

export default function BankAccountsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }

  const [bank, setBank]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFull, setShowFull] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    ownerApi.getOwner(owner.loginId)
      .then(data => {
        const bankInfo = {
          accountHolder: data.checkinAccountHolderName || data.accountHolderName || "",
          bankName:      data.checkinBankName      || data.bankName      || "",
          branchName:    data.checkinBranchName    || data.branchName    || "",
          accountNumber: data.checkinBankAccountNumber || data.accountNumber || "",
          ifscCode:      data.checkinIfscCode      || data.ifscCode      || "",
          upiId:         data.checkinUpiId         || data.upiId         || "",
          locked:        !!data.bankLockedByVisit,
        };
        setBank(bankInfo);
        setEditData({
          checkinAccountHolderName: bankInfo.accountHolder,
          checkinBankName: bankInfo.bankName,
          checkinBranchName: bankInfo.branchName,
          checkinBankAccountNumber: bankInfo.accountNumber,
          checkinIfscCode: bankInfo.ifscCode,
          checkinUpiId: bankInfo.upiId
        });
      })
      .catch(() => setBank(null))
      .finally(() => setLoading(false));
  }, [owner.loginId]);

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/owner-change-requests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerLoginId: owner.loginId,
          requestType: "bank_details",
          requestedChanges: editData
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Bank details submitted for Superadmin approval.");
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        alert(data.message || "Failed to submit request.");
      }
    } catch (err) {
      alert("Error submitting request.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const hasBank = bank && (bank.bankName || bank.accountNumber || bank.accountHolder);
  const hasUpi  = bank?.upiId;

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Settlements Bank Accounts"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Bank Accounts</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">
            Bank accounts linked to receive tenant rent settlements directly.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-border bg-card text-[12.5px] font-medium hover:border-primary/40 transition-colors self-start md:mt-2"
          >
            Edit Bank Details
          </button>
        )}
      </div>

      {successMsg && (
        <div className="max-w-2xl rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-700 text-xs font-bold flex items-center gap-2 mb-6 animate-in fade-in">
          <ShieldCheck size={16} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-[13px] text-muted-foreground py-10 text-center">Loading...</div>
      ) : !hasBank && !hasUpi ? (
        <div className="max-w-2xl bg-card border border-dashed border-border rounded-2xl p-10 text-center shadow-soft">
          <Building className="size-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground mb-1">No bank account linked</p>
          <p className="text-[12.5px] text-muted-foreground mb-4">Complete your KYC to link a bank account for rent settlements.</p>
          <a href="/propertyowner/kyc-verification"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-foreground text-background text-[12.5px] font-medium hover:opacity-90 transition-opacity">
            Complete KYC →
          </a>
        </div>
      ) : (
        <div className="max-w-2xl space-y-4">

          {/* Bank Account Card */}
          {hasBank && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/60">
                <h3 className="font-serif text-[18px] text-foreground">Linked Accounts</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  Primary Settlement
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Building size={20} />
                </div>
                <div className="flex-1 space-y-2.5">
                  <div>
                    <p className="text-[15px] font-bold text-foreground">
                      {bank.bankName || "Bank Account"}
                      {bank.accountHolder ? ` (${bank.accountHolder})` : ""}
                    </p>
                    {bank.branchName && (
                      <p className="text-[12px] text-muted-foreground mt-0.5">{bank.branchName} Branch</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1">
                    <div>
                      <p className="text-[10.5px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Account Number</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-mono font-semibold text-foreground">
                          {showFull ? bank.accountNumber : maskAccount(bank.accountNumber)}
                        </p>
                        {bank.accountNumber && (
                          <button onClick={() => setShowFull(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
                            {showFull ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10.5px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">IFSC Code</p>
                      <p className="text-[13px] font-mono font-semibold text-foreground">{bank.ifscCode || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {bank.locked && (
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-[11.5px] text-amber-600">
                  <ShieldCheck className="size-3.5 shrink-0" />
                  Bank details are locked by your KYC submission. Contact support to update.
                </div>
              )}
            </div>
          )}

          {/* UPI Card */}
          {hasUpi && !isEditing && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mt-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
                <h3 className="font-serif text-[18px] text-foreground">UPI</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                  Instant Transfer
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="size-11 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-[10.5px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">UPI ID</p>
                  <p className="text-[14px] font-semibold text-foreground">{bank.upiId}</p>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft mt-4">
              <h3 className="font-serif text-[18px] text-foreground border-b border-border/60 pb-3 mb-4">Edit Bank Details</h3>
              <form onSubmit={handleSaveBank} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-800 uppercase mb-2 block">Account Holder Name</label>
                    <input type="text" value={editData.checkinAccountHolderName} onChange={(e) => setEditData({...editData, checkinAccountHolderName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-800 uppercase mb-2 block">Bank Name</label>
                    <input type="text" value={editData.checkinBankName} onChange={(e) => setEditData({...editData, checkinBankName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-800 uppercase mb-2 block">Branch Name</label>
                    <input type="text" value={editData.checkinBranchName} onChange={(e) => setEditData({...editData, checkinBranchName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-800 uppercase mb-2 block">Account Number</label>
                    <input type="text" value={editData.checkinBankAccountNumber} onChange={(e) => setEditData({...editData, checkinBankAccountNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-800 uppercase mb-2 block">IFSC Code</label>
                    <input type="text" value={editData.checkinIfscCode} onChange={(e) => setEditData({...editData, checkinIfscCode: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-800 uppercase mb-2 block">UPI ID</label>
                    <input type="text" value={editData.checkinUpiId} onChange={(e) => setEditData({...editData, checkinUpiId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[11.5px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-200 transition-all" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-5 h-9 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={submitLoading} className="px-5 h-9 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2">
                    {submitLoading ? "Submitting..." : "Submit for Approval"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </PropertyOwnerLayout>
  );
}
