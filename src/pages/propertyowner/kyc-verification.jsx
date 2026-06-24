import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerTenants, clearOwnerFetchCache } from "../../utils/propertyowner";
import { apiFetch } from "../../utils/api";
import { 
  UserCheck, Search, FileText, CheckCircle2, XCircle, 
  Clock, ShieldCheck, Eye, Download, AlertTriangle
} from "lucide-react";

export default function KycVerificationPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKycData = async () => {
    try {
      setLoading(true);
      const all = await fetchOwnerTenants(owner.loginId);
      const sorted = [...(all || [])].sort((a, b) => {
        if (a.kycStatus === "submitted" && b.kycStatus !== "submitted") return -1;
        if (a.kycStatus !== "submitted" && b.kycStatus === "submitted") return 1;
        return 0;
      });
      setTenants(sorted);
    } catch (err) {
      console.error("Error fetching KYC tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycData();
  }, [owner.loginId]);

  const handleApprove = async (tenantId) => {
    try {
      await apiFetch("/api/tenants/kyc/approve", {
        method: "POST",
        body: JSON.stringify({ tenantId })
      });
      clearOwnerFetchCache(owner.loginId);
      fetchKycData();
    } catch (err) {
      alert("Error approving KYC: " + err.message);
    }
  };

  const handleReject = async (tenantId) => {
    try {
      await apiFetch("/api/tenants/kyc/reject", {
        method: "POST",
        body: JSON.stringify({ tenantId })
      });
      clearOwnerFetchCache(owner.loginId);
      fetchKycData();
    } catch (err) {
      alert("Error rejecting KYC: " + err.message);
    }
  };

  const filteredKyc = tenants.filter(k => 
    (k.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (k.roomNo || k.room?.number || "").includes(search)
  );

  const getStatusLabel = (status) => {
    if (status === "verified") return "Verified";
    if (status === "submitted") return "Pending Verification";
    if (status === "rejected") return "Action Required";
    return "Pending Upload";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "submitted": return "bg-amber-50 text-amber-600 border-amber-100";
      case "rejected": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="KYC Validation" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">KYC Validation</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Verify national identity cards, student IDs, or corporate enrollment documents.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Tenant Name or Room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* KYC Verification Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Document Type</th>
                <th className="px-6 py-3.5 font-semibold">Document Reference</th>
                <th className="px-6 py-3.5 font-semibold">Last Updated</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Loading KYC validation list...</td>
                </tr>
              ) : filteredKyc.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No KYC entries found.</td>
                </tr>
              ) : (
                filteredKyc.map((k) => {
                  const docType = k.kyc?.idProof || "Aadhaar Card";
                  const docNo = k.kyc?.aadhaarNumber || k.kyc?.aadhar || "-";
                  const updated = k.kyc?.uploadedAt 
                    ? new Date(k.kyc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) 
                    : "-";
                  
                  const handleViewDocs = () => {
                    const files = [
                      k.kyc?.aadharFile,
                      k.kyc?.aadhaarFront,
                      k.kyc?.aadhaarBack,
                      k.kyc?.idProofFile,
                      k.kyc?.addressProofFile
                    ].filter(Boolean);
                    if (files.length > 0) {
                      files.forEach(f => window.open(f, "_blank"));
                    } else {
                      alert("No files uploaded for this tenant's KYC.");
                    }
                  };

                  return (
                    <tr key={k._id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{k.name}</td>
                      <td className="px-6 py-4 font-bold text-foreground">Room {k.roomNo || k.room?.number || "N/A"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{docType}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{docNo}</td>
                      <td className="px-6 py-4 text-muted-foreground">{updated}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(k.kycStatus)}`}>
                          {getStatusLabel(k.kycStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={handleViewDocs}
                          className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors" 
                          title="View Document File"
                        >
                          <Eye size={14} />
                        </button>
                        {k.kycStatus === "submitted" && (
                          <>
                            <button 
                              onClick={() => handleApprove(k._id)}
                              className="size-8 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 inline-flex items-center justify-center transition-colors"
                              title="Approve KYC"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleReject(k._id)}
                              className="size-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 inline-flex items-center justify-center transition-colors"
                              title="Reject / Request Re-upload"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
