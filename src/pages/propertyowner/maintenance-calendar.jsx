import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Calendar, Clock, CheckCircle2, ChevronRight, 
  MapPin, User, ChevronLeft, Plus
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function MaintenanceCalendarPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await apiFetch(`/api/maintenance/owner/${owner.loginId}`);
        if (data && data.tasks) {
          const upcoming = data.tasks
            .filter(t => t.status !== "Completed")
            .map(t => ({
              id: t._id,
              title: t.title,
              date: t.scheduledDate || "TBD",
              time: "10:00 AM", // default since time isn't stored separately
              staff: t.assignedStaffName || t.staff || "Unassigned",
              status: t.status
            }));
          setRoutines(upcoming);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [owner.loginId]);

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Routines Calendar" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Maintenance Calendar</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Plan and track periodic repairs, safety tests, and housekeeping routines.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button onClick={() => alert("Add Event functionality coming soon...")} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity">
            <Plus className="size-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar View Mock */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-soft">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-[20px] text-foreground">{currentMonth}</h3>
            <div className="flex gap-2">
              <button className="p-2 border border-border rounded-xl hover:bg-muted/50">
                <ChevronLeft size={16} />
              </button>
              <button className="p-2 border border-border rounded-xl hover:bg-muted/50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground uppercase border-b border-border/60 pb-3 mb-3">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasRoutine = day === 22 || day === 25;
              return (
                <div 
                  key={i} 
                  className={`h-16 rounded-xl border flex flex-col justify-between p-2 transition-all ${
                    hasRoutine 
                      ? "border-blue-200 bg-blue-50/20" 
                      : "border-border/40 hover:bg-muted/20"
                  }`}
                >
                  <span className={`text-xs font-bold ${hasRoutine ? "text-blue-600" : "text-slate-500"}`}>{day}</span>
                  {hasRoutine && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 self-center mb-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-6">
            <h3 className="font-serif text-[18px] text-foreground">Upcoming Routines</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Loading schedule...</div>
              ) : routines.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No upcoming routines.</div>
              ) : routines.map((item, idx) => (
                <div key={item.id} className="border border-border p-4 rounded-xl space-y-3 bg-muted/10">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[13px] font-bold text-slate-800 leading-snug">{item.title}</h4>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{item.status}</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><Clock size={12} /> {item.date}</p>
                    <p className="flex items-center gap-1.5"><User size={12} /> {item.staff}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
