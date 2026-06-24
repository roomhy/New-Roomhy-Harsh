import React, { useState, useMemo, useEffect } from "react";
import { fetchJson } from "../../utils/api";
import {
  Mail, MessageSquare, Search, Trash2, Clock, CheckCircle2,
  AlertCircle, Eye, RefreshCw, ChevronRight, X, ExternalLink,
  User, Calendar, Info
} from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const STATUS_CFG = {
  "Open": { cls: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500" },
  "In Progress": { cls: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
  "Resolved": { cls: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
  "Closed": { cls: "bg-slate-100 text-slate-500 border-slate-200", dot: "bg-slate-400" }
};

export default function WebsiteQueries() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/superadmin/support/tickets");
      if (res && res.success) {
        // Filter support tickets to show only website contact submissions
        const websiteQueries = (res.tickets || []).filter(
          t => t.raised_by_role === "website_user" || t.raised_by === "website_user"
        );
        setTickets(websiteQueries);
      }
    } catch (err) {
      console.error("Failed to load website queries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await fetchJson(`/api/superadmin/support/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      if (res && res.success) {
        setTickets(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
        if (selectedQuery && selectedQuery._id === id) {
          setSelectedQuery(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredQueries = useMemo(() => {
    const s = search.toLowerCase();
    return tickets.filter(t => {
      const matchSearch = !search ||
        (t.raised_by_name && t.raised_by_name.toLowerCase().includes(s)) ||
        (t.user_email && t.user_email.toLowerCase().includes(s)) ||
        (t.subject && t.subject.toLowerCase().includes(s)) ||
        (t.description && t.description.toLowerCase().includes(s));
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === "Open").length,
      inProgress: tickets.filter(t => t.status === "In Progress").length,
      resolved: tickets.filter(t => t.status === "Resolved" || t.status === "Closed").length
    };
  }, [tickets]);

  return (
    <div className="space-y-6 p-6 bg-[#F8FAFC] min-h-full">
      <PageHeader
        title="Website Contact Queries"
        subtitle="Manage inquiries, requests, and support messages sent via the Contact Us form."
        breadcrumbs={[{ label: "Support" }, { label: "Website Queries", active: true }]}
        actions={
          <button onClick={loadQueries} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh Queries
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Queries", val: stats.total, icon: Mail, color: "blue" },
          { label: "Open Queries", val: stats.open, icon: AlertCircle, color: "rose" },
          { label: "In Progress", val: stats.inProgress, icon: Clock, color: "amber" },
          { label: "Resolved", val: stats.resolved, icon: CheckCircle2, color: "emerald" }
        ].map(c => (
          <div key={c.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[100px]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</span>
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", `bg-${c.color}-50 text-${c.color}-600`)}>
                <c.icon size={14} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none mt-2">{c.val}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by sender name, email, subject, or message..."
            className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none border-none focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none border-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <span className="text-xs font-bold text-slate-400 ml-auto">{filteredQueries.length} matching messages</span>
      </div>

      {/* Table Listing */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">Sender</th>
                <th className="px-6 py-4 text-left">Subject</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Date Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
                      Scanning Website Messages...
                    </div>
                  </td>
                </tr>
              ) : filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-slate-400 font-bold">
                    No website queries found.
                  </td>
                </tr>
              ) : (
                filteredQueries.map(q => {
                  const statusCfg = STATUS_CFG[q.status] || STATUS_CFG.Open;
                  return (
                    <tr key={q._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                            {q.raised_by_name?.charAt(0).toUpperCase() || "W"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{q.raised_by_name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{q.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[250px]">{q.subject}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[350px]">{q.description}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border", statusCfg.cls)}>
                          <span className={cn("w-1 h-1 rounded-full", statusCfg.dot)} />
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-500 font-semibold">
                        {new Date(q.created_at || q.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedQuery(q)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Detail Slide-over / Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end p-4" onClick={() => setSelectedQuery(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Website Contact Enquiry</span>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedQuery.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sender Details */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <User size={12} /> Contact Information
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Name</span>
                    <span className="text-slate-800">{selectedQuery.raised_by_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Email</span>
                    <a href={`mailto:${selectedQuery.user_email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                      {selectedQuery.user_email} <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Submitted Date</span>
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      {new Date(selectedQuery.created_at || Date.now()).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare size={12} /> Message
                </p>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed font-semibold">
                  {selectedQuery.description}
                </div>
              </div>

              {/* Actions & Status */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Info size={12} /> Update Ticket Status
                </p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(STATUS_CFG).map(s => {
                    const cfg = STATUS_CFG[s];
                    const isCurrent = selectedQuery.status === s;
                    return (
                      <button
                        key={s}
                        disabled={updatingId !== null}
                        onClick={() => handleUpdateStatus(selectedQuery._id, s)}
                        className={cn(
                          "text-[10px] font-bold px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 disabled:opacity-50",
                          isCurrent
                            ? `${cfg.cls} border-current shadow-sm`
                            : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2 shrink-0">
              <button
                onClick={() => setSelectedQuery(null)}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-all"
              >
                Close Panel
              </button>
              {selectedQuery.status !== "Resolved" && selectedQuery.status !== "Closed" && (
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleUpdateStatus(selectedQuery._id, "Resolved")}
                  className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
