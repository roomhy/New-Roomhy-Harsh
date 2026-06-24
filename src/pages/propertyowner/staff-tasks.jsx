import React, { useState, useEffect, useCallback } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerProperties } from "../../utils/propertyowner";
import {
  ClipboardList, Plus, Search, CheckCircle2, Clock, AlertCircle,
  X, Trash2, ChevronDown, Building2, User, Calendar, Flag,
  Circle, PlayCircle, CheckCircle, XCircle, Filter
} from "lucide-react";
import { apiFetch } from "../../utils/api";

const STATUS_CONFIG = {
  Pending:     { color: "bg-amber-100 text-amber-700 border-amber-200",    dot: "bg-amber-500",   icon: Circle },
  "In Progress": { color: "bg-blue-100 text-blue-700 border-blue-200",   dot: "bg-blue-500",    icon: PlayCircle },
  Completed:   { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle },
  Cancelled:   { color: "bg-slate-100 text-slate-500 border-slate-200",  dot: "bg-slate-400",   icon: XCircle },
};
const PRIORITY_CONFIG = {
  Low:    { color: "text-slate-500", bg: "bg-slate-100" },
  Medium: { color: "text-amber-600", bg: "bg-amber-50" },
  High:   { color: "text-orange-600", bg: "bg-orange-50" },
  Urgent: { color: "text-rose-600", bg: "bg-rose-50" },
};
const CATEGORIES = ["Maintenance", "Cleaning", "KYC", "Rent", "Complaint", "Inspection", "Other"];

export default function StaffTasksPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }

  const [tasks, setTasks]           = useState([]);
  const [staff, setStaff]           = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats]           = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });

  const [form, setForm] = useState({
    title: "", description: "", category: "Other", priority: "Medium",
    assignedStaffId: "", assignedStaffName: "", assignedStaffLoginId: "",
    propertyId: "", propertyName: "", roomNo: "", dueDate: "",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, staffRes, propsRes, statsRes] = await Promise.allSettled([
        apiFetch(`/api/tasks?ownerLoginId=${owner.loginId}`),
        apiFetch(`/api/employees?parentLoginId=${owner.loginId}&isActive=true`),
        fetchOwnerProperties(owner.loginId, true),
        apiFetch(`/api/tasks/stats/${owner.loginId}`),
      ]);
      setTasks(tasksRes.status === "fulfilled" ? tasksRes.value?.data || [] : []);
      setStaff(staffRes.status === "fulfilled" ? staffRes.value?.data || [] : []);
      setProperties(propsRes.status === "fulfilled" ? (Array.isArray(propsRes.value) ? propsRes.value : propsRes.value?.properties || propsRes.value?.data || []) : []);
      const s = statsRes.status === "fulfilled" ? statsRes.value?.data : {};
      setStats({ total: s.total || 0, pending: s.pending || 0, inProgress: s.inProgress || 0, completed: s.completed || 0 });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [owner.loginId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ ...form, ownerLoginId: owner.loginId, createdBy: owner.loginId }),
      });
      if (!res?.data) throw new Error(res?.error || "Failed to create task");
      setTasks(prev => [res.data, ...prev]);
      setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }));
      setShowForm(false);
      setForm({ title: "", description: "", category: "Other", priority: "Medium", assignedStaffId: "", assignedStaffName: "", assignedStaffLoginId: "", propertyId: "", propertyName: "", roomNo: "", dueDate: "" });
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await apiFetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res?.data) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) { alert("Failed to update: " + err.message); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) { alert("Delete failed: " + err.message); }
  };

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.assignedStaffName?.toLowerCase().includes(q) || t.propertyName?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400";

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Staff Tasks"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Assign, track, and complete staff tasks across all properties</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={15} /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks", value: stats.total, color: "from-blue-500 to-blue-600", icon: ClipboardList },
          { label: "Pending", value: stats.pending, color: "from-amber-400 to-amber-500", icon: Clock },
          { label: "In Progress", value: stats.inProgress, color: "from-blue-400 to-indigo-500", icon: PlayCircle },
          { label: "Completed", value: stats.completed, color: "from-emerald-400 to-emerald-600", icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="relative bg-white rounded-2xl border border-slate-100 p-5 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-[0.06] -translate-y-6 translate-x-6 group-hover:scale-125 transition-transform duration-500`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks by title, staff, or property..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-400">
          {["All", "Pending", "In Progress", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-blue-400">
          {["All", "Low", "Medium", "High", "Urgent"].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100">
          <ClipboardList size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="font-black text-slate-400">No tasks found</p>
          <p className="text-xs text-slate-300 mt-1">Create your first task for the team</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-6 h-9 bg-blue-600 text-white rounded-xl text-xs font-black">
            + Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
            const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
            const StatusIcon = sc.icon;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";

            return (
              <div key={task._id} className={`bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all group ${isOverdue ? "border-rose-200 bg-rose-50/30" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${sc.dot}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-black text-slate-900 text-[14px] leading-tight">{task.title}</h3>
                        {isOverdue && <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>}
                      </div>
                      {task.description && <p className="text-xs text-slate-500 font-medium mb-2 line-clamp-1">{task.description}</p>}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sc.color}`}>{task.status}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${pc.bg} ${pc.color}`}>
                          <Flag size={8} className="inline mr-0.5" />{task.priority}
                        </span>
                        {task.category && <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{task.category}</span>}
                        {task.assignedStaffName && (
                          <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                            <User size={9} /> {task.assignedStaffName}
                          </span>
                        )}
                        {task.propertyName && (
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Building2 size={9} /> {task.propertyName}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue ? "text-rose-600" : "text-slate-400"}`}>
                            <Calendar size={9} /> {new Date(task.dueDate).toLocaleDateString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}
                      className="text-[11px] font-black border border-slate-200 rounded-lg px-2 py-1 outline-none bg-white hover:border-blue-300 transition-all cursor-pointer"
                    >
                      {["Pending", "In Progress", "Completed", "Cancelled"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">Create New Task</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Task Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Fix AC in Room 102" className={inputCls} required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Task details..." rows={2} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className={inputCls}>
                    {["Low", "Medium", "High", "Urgent"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Assign To Staff</label>
                <select value={form.assignedStaffId} onChange={e => {
                  const s = staff.find(x => String(x._id) === e.target.value);
                  setForm(f => ({ ...f, assignedStaffId: e.target.value, assignedStaffName: s?.name || "", assignedStaffLoginId: s?.loginId || "" }));
                }} className={inputCls}>
                  <option value="">— Select Staff —</option>
                  {staff.map(s => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Property</label>
                  <select value={form.propertyId} onChange={e => {
                    const p = properties.find(x => String(x._id || x.id) === e.target.value);
                    setForm(f => ({ ...f, propertyId: e.target.value, propertyName: p?.title || p?.name || "" }));
                  }} className={inputCls}>
                    <option value="">— Select Property —</option>
                    {properties.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.title || p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Room No.</label>
                  <input type="text" value={form.roomNo} onChange={e => setForm(f => ({ ...f, roomNo: e.target.value }))}
                    placeholder="e.g. 102" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 h-11 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
