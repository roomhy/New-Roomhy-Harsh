import React, { useState, useEffect } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerTenants } from "../../utils/propertyowner";
import { apiFetch } from "../../utils/api";
import { 
  ShieldCheck, Search, Download, Upload, FileText, 
  CheckCircle2, AlertTriangle, Clock, Eye, XCircle
} from "lucide-react";

export default function PoliceVerificationPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPoliceData = async () => {
    try {
      setLoading(true);
      const all = await fetchOwnerTenants(owner.loginId);
      const sorted = [...(all || [])].sort((a, b) => {
        if (a.policeVerification?.status === "submitted" && b.policeVerification?.status !== "submitted") return -1;
        if (a.policeVerification?.status !== "submitted" && b.policeVerification?.status === "submitted") return 1;
        return 0;
      });
      setTenants(sorted);
    } catch (err) {
      console.error("Error fetching police verification tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoliceData();
  }, [owner.loginId]);

  const handleApprove = async (tenantId) => {
    try {
      await apiFetch("/api/tenants/police/approve", {
        method: "POST",
        body: JSON.stringify({ tenantId })
      });
      fetchPoliceData();
    } catch (err) {
      alert("Error approving police verification: " + err.message);
    }
  };

  const handleReject = async (tenantId) => {
    try {
      await apiFetch("/api/tenants/police/reject", {
        method: "POST",
        body: JSON.stringify({ tenantId })
      });
      fetchPoliceData();
    } catch (err) {
      alert("Error rejecting police verification: " + err.message);
    }
  };

  const filteredList = tenants.filter(item => 
    (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (item.roomNo || item.room?.number || "").includes(search)
  );

  const getStatusLabel = (status) => {
    if (status === "verified") return "Submitted to Station (Verified)";
    if (status === "submitted") return "Receipt Pending Verification";
    if (status === "rejected") return "Action Required / Rejected";
    return "Pending Receipt Upload";
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
      title="Police Verification Portal" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Police Verification</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage state police reporting forms, local authority submissions, and check-in receipts.</p>
        </div>
      </div>

      {/* Authority form downloads */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft mb-8">
        <h3 className="font-serif text-[20px] text-foreground mb-4">Authority Form Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { city: "Delhi NCR Police Form", size: "1.2 MB" },
            { city: "Karnataka / Bengaluru", size: "850 KB" },
            { city: "Maharashtra / Mumbai", size: "1.1 MB" },
            { city: "Haryana / Gurugram", size: "900 KB" }
          ].map((form, idx) => (
            <div key={idx} className="border border-border/80 rounded-xl p-4 flex justify-between items-center bg-muted/20">
              <div>
                <span className="text-[12px] font-bold text-foreground block">{form.city}</span>
                <span className="text-[11px] text-muted-foreground">{form.size} • PDF Format</span>
              </div>
              <button className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors">
                <Download size={14} />
              </button>
            </div>
          ))}
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

      {/* Verification List Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Verification State</th>
                <th className="px-6 py-3.5 font-semibold">Submission Date</th>
                <th className="px-6 py-3.5 font-semibold">Receipt Uploaded</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading police verification list...</td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No verification logs found.</td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const receiptUploaded = item.policeVerification?.receiptFile ? "Uploaded" : "Not Uploaded";
                  const dateVal = item.policeVerification?.submittedAt
                    ? new Date(item.policeVerification.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "—";

                  const handleViewReceipt = () => {
                    if (item.policeVerification?.receiptFile) {
                      window.open(item.policeVerification.receiptFile, "_blank");
                    } else {
                      alert("No receipt file uploaded for this tenant.");
                    }
                  };

                  return (
                    <tr key={item._id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{item.name}</td>
                      <td className="px-6 py-4 font-bold text-foreground">Room {item.roomNo || item.room?.number || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(item.policeVerification?.status)}`}>
                          {getStatusLabel(item.policeVerification?.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{dateVal}</td>
                      <td className="px-6 py-4 text-muted-foreground">{receiptUploaded}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={handleViewReceipt}
                          className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors"
                          title="View Receipt Document"
                        >
                          <Eye size={14} />
                        </button>
                        {item.policeVerification?.status === "submitted" && (
                          <>
                            <button 
                              onClick={() => handleApprove(item._id)}
                              className="size-8 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 inline-flex items-center justify-center transition-colors"
                              title="Approve Submission"
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleReject(item._id)}
                              className="size-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 inline-flex items-center justify-center transition-colors"
                              title="Reject Receipt"
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
