import React, { useState, useEffect } from "react";
import SharedShell from "../../components/SharedShell";
import { useSuperadminLogin } from "./useSuperadminLogin";
import { CheckCircle, XCircle, Search, Clock, FileText } from "lucide-react";

export default function OwnerRequestsPage() {
  const adminLoginId = useSuperadminLogin();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const statusParam = filter !== "All" ? `?status=${filter}` : "";
      const res = await fetch(`/api/owner-change-requests${statusParam}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminLoginId) fetchRequests();
  }, [adminLoginId, filter]);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request?")) return;
    try {
      const res = await fetch(`/api/owner-change-requests/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ superadminLoginId: adminLoginId })
      });
      const data = await res.json();
      if (data.success) {
        alert("Request approved and changes applied successfully.");
        fetchRequests();
      } else {
        alert(data.message || "Failed to approve request");
      }
    } catch (err) {
      alert("Error approving request");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    if (reason === null) return;
    try {
      const res = await fetch(`/api/owner-change-requests/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ superadminLoginId: adminLoginId, reason })
      });
      const data = await res.json();
      if (data.success) {
        alert("Request rejected.");
        fetchRequests();
      } else {
        alert(data.message || "Failed to reject request");
      }
    } catch (err) {
      alert("Error rejecting request");
    }
  };

  if (!adminLoginId) return null;

  return (
    <SharedShell title="Owner Change Requests">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Owner Change Requests</h1>
          <p className="text-sm text-slate-500 font-medium">Review and approve property owner profile and bank detail updates.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["Pending", "Approved", "Rejected", "All"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === status ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Owner ID</th>
                <th className="px-6 py-4">Request Type</th>
                <th className="px-6 py-4">Requested Changes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm font-medium text-slate-400">Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm font-medium text-slate-400">No {filter.toLowerCase()} requests found.</td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{req.ownerLoginId}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${req.requestType === 'bank_details' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                        {req.requestType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600 max-w-xs truncate" title={JSON.stringify(req.requestedChanges, null, 2)}>
                      {Object.keys(req.requestedChanges || {}).map(k => `${k}: ${req.requestedChanges[k]}`).join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {req.status === "Pending" ? (
                        <>
                          <button onClick={() => handleApprove(req._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Approve">
                            <CheckCircle size={18} />
                          </button>
                          <button onClick={() => handleReject(req._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Reject">
                            <XCircle size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SharedShell>
  );
}
