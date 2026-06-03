import React, { useState, useEffect } from "react";
import { Ticket, Clock, History, CheckCircle2, AlertCircle, ChevronRight, TrendingUp, Calendar, Search, Filter, Download, MoreVertical, Building, Eye, Trash2, X } from "lucide-react";
import { fetchJson } from "../../utils/api";
import toast from "react-hot-toast";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function OwnerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetchJson("/api/complaints?type=Owner");
      if (response.success) {
        setComplaints(response.complaints || []);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetchJson(`/api/complaints/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      if (response.success) {
        toast.success("Status updated successfully");
        fetchComplaints();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteComplaint = async (id) => {
    try {
      const response = await fetchJson(`/api/complaints/${id}`, {
        method: "DELETE"
      });
      if (response.success) {
        toast.success("Complaint deleted successfully");
        setDeleteConfirmId(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error("Failed to delete complaint");
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === "All") return true;
    return c.status === filter;
  });

  const stats = [
    { label: "Total Complaints", val: complaints.length, icon: Ticket, c: "blue" },
    { label: "Open", val: complaints.filter(c => c.status === "Open").length, icon: Clock, c: "rose" },
    { label: "In Progress", val: complaints.filter(c => c.status === "In Progress").length, icon: History, c: "amber" },
    { label: "Resolved", val: complaints.filter(c => c.status === "Resolved").length, icon: CheckCircle2, c: "emerald" },
  ];

  const iconColors = { 
    blue: "text-blue-600 bg-blue-50", 
    emerald: "text-emerald-500 bg-emerald-50", 
    amber: "text-amber-500 bg-amber-50", 
    rose: "text-rose-500 bg-rose-50" 
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-inter text-slate-900">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <Building size={20} />
            </div>
            Owners Complaints
          </h1>
          <p className="text-xs text-slate-400 mt-1 ml-13">Manage and track all complaints raised by property owners.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchComplaints} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
            <History size={14} /> Refresh
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconColors[s.c])}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-2xl font-black text-slate-900">{s.val}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header/Filter */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search owner complaints..." 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none w-64"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
              {["All", "Open", "In Progress", "Resolved"].map(s => (
                <button 
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                    filter === s ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600">
            <Filter size={14} /> More Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 py-4 text-left">Owner Info</th>
                <th className="px-6 py-4 text-left">Property Details</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Priority</th>
                <th className="px-6 py-4 text-left">Created On</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-xs font-medium">Loading complaints...</td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-xs font-medium">No complaints found.</td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-[10px]">
                          {c.tenantName?.[0] || 'O'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{c.tenantName || 'Owner'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{c.tenantPhone || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">{c.property}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider">{c.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={c.status} 
                        onChange={(e) => updateStatus(c._id, e.target.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider outline-none cursor-pointer",
                          c.status === "Open" ? "bg-rose-50 text-rose-600" : 
                          c.status === "In Progress" ? "bg-amber-50 text-amber-600" : 
                          "bg-emerald-50 text-emerald-600"
                        )}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold flex items-center gap-1.5",
                        c.priority === "High" ? "text-rose-500" : c.priority === "Medium" ? "text-amber-500" : "text-slate-400"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                          c.priority === "High" ? "bg-rose-500" : c.priority === "Medium" ? "bg-amber-500" : "bg-slate-400"
                        )} />
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] text-slate-300 font-medium">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedComplaint(c)}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(c._id)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors shadow-sm"
                          title="Delete Ticket"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Building size={16} className="text-emerald-600" /> Owner Ticket Details
              </h3>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-lg shadow-sm">
                  {selectedComplaint.tenantName?.[0] || 'O'}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{selectedComplaint.tenantName || 'Owner'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedComplaint.tenantPhone || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Property</p>
                  <p className="text-xs font-bold text-slate-700">{selectedComplaint.property}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px] font-black uppercase tracking-wider">{selectedComplaint.category}</span>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
                    selectedComplaint.priority === "High" ? "bg-rose-50 text-rose-600" : selectedComplaint.priority === "Medium" ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400"
                  )}>
                    {selectedComplaint.priority}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Description</p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[100px]">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedComplaint.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-bold text-slate-300 pt-4 uppercase tracking-[0.2em]">
                <p>Created: {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                <p>Ticket ID: #{selectedComplaint._id.substring(18)}</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Delete Complaint?</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">This action cannot be undone. Are you sure you want to proceed?</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteComplaint(deleteConfirmId)}
                className="px-4 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
