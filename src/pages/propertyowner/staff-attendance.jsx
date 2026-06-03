import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  CalendarCheck, Search, Check, X, 
  Clock, AlertCircle, Sparkles
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function StaffAttendancePage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch employees
      const empData = await apiFetch('/api/employees');
      const myStaff = (empData.data || []).filter(e => e.parentLoginId === owner.loginId);

      // Fetch today's attendance
      const attData = await apiFetch(`/api/hr/attendance/${owner.loginId}`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaysRecords = (attData.data || []).filter(a => {
        const d = new Date(a.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });

      const attMap = {};
      todaysRecords.forEach(a => {
        if (a.employeeId && a.employeeId._id) {
          attMap[a.employeeId._id] = a;
        } else {
          attMap[a.employeeId] = a;
        }
      });

      const merged = myStaff.map(s => {
        const record = attMap[s._id] || {};
        return {
          id: s._id,
          name: s.name,
          role: s.role,
          status: record.status || "Absent",
          inTime: record.checkIn || "--",
          outTime: record.checkOut || "--"
        };
      });

      setAttendance(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const inTime = newStatus === "Present" ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--";
      await apiFetch('/api/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: id,
          ownerLoginId: owner.loginId,
          date: new Date().toISOString(),
          status: newStatus,
          checkIn: inTime,
          checkOut: "--"
        })
      });

      setAttendance(prev => prev.map(a => a.id === id ? { 
        ...a, 
        status: newStatus,
        inTime: newStatus === "Present" && a.inTime === "--" ? inTime : a.inTime
      } : a));
    } catch (err) {
      console.error("Failed to update attendance", err);
    }
  };

  const filteredAttendance = attendance.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Staff Logs" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Staff Attendance</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor daily check-in timestamps, off-duty logs, and manual attendance corrections.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff members by name or role..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Staff Member</th>
                <th className="px-6 py-3.5 font-semibold">Role</th>
                <th className="px-6 py-3.5 font-semibold">In Time</th>
                <th className="px-6 py-3.5 font-semibold">Out Time</th>
                <th className="px-6 py-3.5 font-semibold">Attendance State</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading attendance...</td></tr>
              ) : filteredAttendance.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No staff found.</td></tr>
              ) : (
                filteredAttendance.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">{a.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{a.role}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{a.inTime}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{a.outTime}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        a.status === "Present" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {a.status !== "Present" ? (
                        <button 
                          onClick={() => handleToggleStatus(a.id, "Present")}
                          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Mark Present
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleToggleStatus(a.id, "Absent")}
                          className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                        >
                          Mark Absent
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
