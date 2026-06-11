import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../components/StaffLayout";
import {
  ClipboardList, CheckCircle, PlayCircle, Circle, XCircle,
  Clock, Calendar, Building2, Flag, AlertCircle, ChevronDown
} from "lucide-react";
import { getApiBase } from "../../utils/api";

const STATUS_CONFIG = {
  Pending:       { color: "bg-amber-100 text-amber-700 border-amber-200",     icon: Circle },
  "In Progress": { color: "bg-blue-100 text-blue-700 border-blue-200",        icon: PlayCircle },
  Completed:     { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  Cancelled:     { color: "bg-slate-100 text-slate-500 border-slate-200",     icon: XCircle },
};
const PRIORITY_CONFIG = {
  Low:    { color: "text-slate-500", bg: "bg-slate-100" },
  Medium: { color: "text-amber-600", bg: "bg-amber-50" },
  High:   { color: "text-orange-600", bg: "bg-orange-50" },
  Urgent: { color: "text-rose-600", bg: "bg-rose-50" },
};

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
    const empRaw = sessionStorage.getItem("employee_session") || localStorage.getItem("employee_session");
    if (empRaw) return JSON.parse(empRaw);
  } catch (_) {}
  return null;
}

export default function StaffTasksPage() {
  const staff = getStaffSession();
  const staffLoginId = staff?.loginId || staff?.login_id || staff?.staffId || "";

  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedTask, setExpandedTask] = useState(null);
  const [updating, setUpdating]         = useState(null);
  const [stats, setStats]               = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });
  const [msg, setMsg] = useState("");

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  const fetchTasks = useCallback(async () => {
    if (!staffLoginId) return;
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/tasks?assignedStaffLoginId=${staffLoginId}`);
      const data = await res.json();
      const allTasks = data?.data || [];
      setTasks(allTasks);
      setStats({
        total: allTasks.length,
        pending: allTasks.filter(t => t.status === "Pending").length,
        inProgress: allTasks.filter(t => t.status === "In Progress").length,
        completed: allTasks.filter(t => t.status === "Completed").length,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [staffLoginId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusUpdate = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      const res = await fetch(`${getApiBase()}/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        setStats(prev => {
          const updated = { ...prev };
          // rough recalc
          return { ...updated };
        });
        showMsg(`Task marked as "${newStatus}" ✓`);
      }
    } catch (_) { showMsg("Failed to update status"); }
    finally { setUpdating(null); }
  };

  const filtered = tasks.filter(t => statusFilter === "All" || t.status === statusFilter);

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";

  return (
    <StaffLayout title="My Tasks" subtitle="View and update tasks assigned to you">
      <div className="space-y-6 max-w-3xl">

        {/* Toast */}
        {msg && (
          <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-sm font-bold flex items-center gap-2">
            <CheckCircle size={16} /> {msg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "from-slate-600 to-slate-700" },
            { label: "Pending", value: stats.pending, color: "from-amber-400 to-amber-500" },
            { label: "In Progress", value: stats.inProgress, color: "from-blue-500 to-indigo-500" },
            { label: "Completed", value: stats.completed, color: "from-emerald-500 to-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                <ClipboardList size={14} className="text-white" />
              </div>
              <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["All", "Pending", "In Progress", "Completed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${statusFilter === s ? "bg-blue-600 border-blue-600 text-white shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">Loading tasks...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center shadow-sm">
            <ClipboardList size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="font-black text-slate-400">No tasks found</p>
            <p className="text-xs text-slate-300 mt-1">Tasks assigned to you will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(task => {
              const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
              const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;
              const StatusIcon = sc.icon;
              const overdue = isOverdue(task);
              const isExpanded = expandedTask === task._id;

              return (
                <div key={task._id}
                  className={`bg-white rounded-2xl border shadow-sm transition-all ${overdue ? "border-rose-200 bg-rose-50/20" : "border-slate-100"}`}>
                  <div
                    className="flex items-center justify-between p-5 cursor-pointer"
                    onClick={() => setExpandedTask(isExpanded ? null : task._id)}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <StatusIcon size={18} className={task.status === "Completed" ? "text-emerald-500" : task.status === "In Progress" ? "text-blue-500" : "text-amber-500"} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-black text-[14px] leading-tight ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {task.title}
                          </h3>
                          {overdue && <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">Overdue</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${sc.color}`}>{task.status}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${pc.bg} ${pc.color}`}><Flag size={8} className="inline mr-0.5" />{task.priority}</span>
                          {task.category && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{task.category}</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 shrink-0 ml-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                      {task.description && (
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{task.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {task.propertyName && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <Building2 size={12} className="text-slate-400" /> {task.propertyName}
                          </div>
                        )}
                        {task.roomNo && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="text-slate-400 font-bold">Room</span> {task.roomNo}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className={`flex items-center gap-2 text-xs font-medium ${overdue ? "text-rose-600" : "text-slate-500"}`}>
                            <Calendar size={12} /> Due: {new Date(task.dueDate).toLocaleDateString("en-IN")}
                          </div>
                        )}
                        {task.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <Clock size={12} /> Assigned: {new Date(task.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        )}
                      </div>

                      {/* Update Status */}
                      {task.status !== "Completed" && task.status !== "Cancelled" && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
                          <div className="flex gap-2 flex-wrap">
                            {task.status === "Pending" && (
                              <button
                                onClick={() => handleStatusUpdate(task._id, "In Progress")}
                                disabled={updating === task._id}
                                className="px-4 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 disabled:opacity-60"
                              >
                                {updating === task._id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlayCircle size={13} />}
                                Start Working
                              </button>
                            )}
                            {(task.status === "Pending" || task.status === "In Progress") && (
                              <button
                                onClick={() => handleStatusUpdate(task._id, "Completed")}
                                disabled={updating === task._id}
                                className="px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 disabled:opacity-60"
                              >
                                {updating === task._id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={13} />}
                                Mark as Completed
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {task.status === "Completed" && task.completedAt && (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl font-bold">
                          <CheckCircle size={13} /> Completed on {new Date(task.completedAt).toLocaleDateString("en-IN")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
