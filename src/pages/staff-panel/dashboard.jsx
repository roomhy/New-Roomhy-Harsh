import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../components/StaffLayout";
import {
  UserCheck, ClipboardList, AlertCircle, Calendar,
  CheckCircle2, Clock, Building2, LogIn, LogOut,
  Bell, ChevronRight, Loader2, Users, Home, Activity
} from "lucide-react";

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
    const empRaw = sessionStorage.getItem("employee_session") || localStorage.getItem("employee_session");
    if (empRaw) return JSON.parse(empRaw);
  } catch (_) {}
  return null;
}

export default function StaffDashboard() {
  const staff = getStaffSession();
  const staffLoginId = staff?.loginId || staff?.login_id || staff?.staffId || "";
  const staffName = staff?.name || "Staff Member";
  const staffRole = staff?.role || "Staff";

  // Auth guard — no session → redirect to login
  useEffect(() => {
    if (!staffLoginId) {
      window.location.href = "/staff/login";
    }
  }, [staffLoginId]);

  if (!staffLoginId) return null;

  const [todayAtt, setTodayAtt]   = useState(null);
  const [tasks, setTasks]         = useState({ pending: 0, inProgress: 0, total: 0 });
  const [complaints, setComplaints] = useState({ open: 0, total: 0 });
  const [loading, setLoading]     = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [recentTasks, setRecentTasks] = useState([]);
  const [msg, setMsg] = useState("");

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000); };

  const fetchDashboard = useCallback(async () => {
    if (!staffLoginId) return;
    setLoading(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      const [attRes, tasksRes] = await Promise.allSettled([
        fetch(`/api/hr/my-attendance/${staffLoginId}?month=${month}&year=${year}`),
        fetch(`/api/tasks?assignedStaffLoginId=${staffLoginId}`),
      ]);

      // Attendance
      if (attRes.status === "fulfilled") {
        const data = await attRes.value.json();
        const records = data?.data || [];
        const todayStr = today.toISOString().split("T")[0];
        const rec = records.find(r => r.date && new Date(r.date).toISOString().split("T")[0] === todayStr);
        setTodayAtt(rec || null);
      }

      // Tasks
      if (tasksRes.status === "fulfilled") {
        const data = await tasksRes.value.json();
        const allTasks = data?.data || [];
        setTasks({
          total: allTasks.length,
          pending: allTasks.filter(t => t.status === "Pending").length,
          inProgress: allTasks.filter(t => t.status === "In Progress").length,
        });
        setRecentTasks(allTasks.slice(0, 3));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [staffLoginId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleCheckIn = async () => {
    if (!staffLoginId) return;
    setCheckInLoading(true);
    try {
      const res = await fetch("/api/hr/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffLoginId }),
      });
      const data = await res.json();
      if (data.success) {
        setTodayAtt(data.data);
        showMsg(`Checked in at ${data.checkInTime} ✓`);
      }
    } catch (_) { showMsg("Check-in failed"); }
    finally { setCheckInLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!staffLoginId) return;
    setCheckOutLoading(true);
    try {
      const res = await fetch("/api/hr/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffLoginId }),
      });
      const data = await res.json();
      if (data.success) {
        setTodayAtt(data.data);
        showMsg(`Checked out at ${data.checkOutTime} ✓`);
      }
    } catch (_) { showMsg("Check-out failed"); }
    finally { setCheckOutLoading(false); }
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const PRIORITY_COLORS = {
    Urgent: "text-rose-600 bg-rose-50 border-rose-200",
    High: "text-orange-600 bg-orange-50 border-orange-200",
    Medium: "text-amber-600 bg-amber-50 border-amber-200",
    Low: "text-slate-500 bg-slate-100 border-slate-200",
  };

  return (
    <StaffLayout title="Dashboard" subtitle={`Welcome back, ${staffName}`}>
      <div className="space-y-6 max-w-3xl">

        {/* Toast */}
        {msg && (
          <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={16} /> {msg}
          </div>
        )}

        {/* Greeting + Check In/Out Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/25">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">{greeting}</p>
              <h2 className="text-2xl font-black mt-0.5 leading-tight">{staffName}</h2>
              <p className="text-blue-200 text-sm font-medium mt-0.5">
                {staffRole} {staffLoginId && <span className="font-mono text-blue-300">· {staffLoginId}</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{timeStr}</p>
              <p className="text-blue-200 text-xs font-medium mt-0.5">{now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
            </div>
          </div>

          {/* Attendance status */}
          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-blue-200" />
            </div>
          ) : (
            <>
              {todayAtt && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Check In", value: todayAtt.checkIn || "—", icon: LogIn },
                    { label: "Check Out", value: todayAtt.checkOut || "Pending", icon: LogOut },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon size={11} className="text-blue-200" />
                        <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{label}</p>
                      </div>
                      <p className="text-lg font-black">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={checkInLoading || !!todayAtt?.checkIn}
                  className="flex-1 h-11 bg-white text-blue-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 shadow-lg"
                >
                  {checkInLoading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
                  {todayAtt?.checkIn ? "Checked In ✓" : "Check In"}
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={checkOutLoading || !todayAtt?.checkIn || !!todayAtt?.checkOut}
                  className="flex-1 h-11 bg-white/20 text-white border border-white/30 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  {checkOutLoading ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                  {todayAtt?.checkOut ? "Checked Out ✓" : "Check Out"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Pending Tasks", value: tasks.pending, sub: `${tasks.total} total`, icon: ClipboardList, color: "from-amber-400 to-orange-500", href: "/staff/tasks" },
            { label: "In Progress", value: tasks.inProgress, sub: "tasks active now", icon: Activity, color: "from-blue-500 to-indigo-500", href: "/staff/tasks" },
            { label: "Today's Status", value: todayAtt?.status || "Not Marked", sub: todayAtt?.checkIn ? `In: ${todayAtt.checkIn}` : "Tap to check in", icon: UserCheck, color: "from-emerald-500 to-teal-500", href: "/staff/attendance" },
            { label: "This Month", value: `${now.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`, sub: "Attendance month", icon: Calendar, color: "from-violet-500 to-purple-600", href: "/staff/attendance" },
          ].map(({ label, value, sub, icon: Icon, color, href }) => (
            <a key={label} href={href}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group shadow-sm block">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-xl font-black text-slate-900 leading-tight truncate">{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
              <p className="text-[10px] text-slate-300 font-medium mt-0.5">{sub}</p>
            </a>
          ))}
        </div>

        {/* Recent Tasks */}
        {recentTasks.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <ClipboardList size={16} className="text-blue-500" /> My Recent Tasks
              </h3>
              <a href="/staff/tasks" className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline">
                View All <ChevronRight size={13} />
              </a>
            </div>
            <div className="divide-y divide-slate-50">
              {recentTasks.map(task => (
                <div key={task._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === "Completed" ? "bg-emerald-500" : task.status === "In Progress" ? "bg-blue-500" : "bg-amber-500"}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`font-black text-[13px] truncate ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {task.propertyName && <span className="text-[10px] text-slate-400 font-medium">{task.propertyName}</span>}
                      {task.dueDate && (
                        <span className={`text-[10px] font-bold ${new Date(task.dueDate) < new Date() && task.status !== "Completed" ? "text-rose-500" : "text-slate-400"}`}>
                          · Due {new Date(task.dueDate).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${PRIORITY_COLORS[task.priority] || "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-black text-slate-800 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Attendance", icon: Calendar, href: "/staff/attendance", color: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100" },
              { label: "My Tasks", icon: ClipboardList, href: "/staff/tasks", color: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100" },
              { label: "Complaints", icon: AlertCircle, href: "/staff/complaints", color: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100" },
              { label: "Tenants", icon: Users, href: "/staff/tenants", color: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100" },
              { label: "Rooms", icon: Home, href: "/staff/rooms", color: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" },
              { label: "Visitors", icon: UserCheck, href: "/staff/visitors", color: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100" },
            ].map(({ label, icon: Icon, href, color }) => (
              <a key={label} href={href}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${color}`}>
                <Icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
