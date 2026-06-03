import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Clock, Search, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, ChevronRight
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function ShiftManagementPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState(null);

  React.useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const [data, empData] = await Promise.all([
        apiFetch(`/api/hr/shifts/${owner.loginId}`),
        apiFetch(`/api/employees`)
      ]);
      
      const empMap = {};
      if (empData && empData.data) {
        empData.data.forEach(e => empMap[e._id] = e.name);
      }

      const shiftGroups = {};
      
      (data.data || []).forEach(sh => {
         const key = sh.shiftName;
         if (!shiftGroups[key]) {
             shiftGroups[key] = {
                 id: key,
                 name: key,
                 hours: `${sh.startTime} - ${sh.endTime}`,
                 staffCount: 0,
                 staffMembers: [],
                 days: sh.days && sh.days.length > 0 ? `${sh.days[0].substring(0,3)} - ${sh.days[sh.days.length-1].substring(0,3)}` : "Mon - Sun"
             };
         }
         shiftGroups[key].staffCount++;
         shiftGroups[key].staffMembers.push(empMap[sh.employeeId] || "Unknown Staff");
      });
      
      setShifts(Object.values(shiftGroups));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Roster Management" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Shift Management</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Configure property roster, shift timings, weekly offs, and assign personnel to active shifts.</p>
        </div>
      </div>

      {/* Grid of Shifts */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading rosters...</div>
      ) : shifts.length === 0 ? (
        <div className="py-12 text-center text-slate-500">No shifts assigned to staff yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shifts.map((shift) => (
            <div 
              key={shift.id} 
              onClick={() => setSelectedShift(shift)}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {shift.days}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-[21px] font-bold text-foreground">{shift.name}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-0.5">{shift.hours}</p>
                </div>

                <div className="border-t border-border/60 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Staff Members Roster:</span>
                    <span className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4">{shift.staffCount} Members</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedShift && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif text-[20px] font-bold text-slate-900">{selectedShift.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedShift.hours} ({selectedShift.days})</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedShift(null); }} 
                className="text-slate-400 hover:text-slate-600 transition-colors text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-tight mb-3">Assigned Staff Members</h4>
              {selectedShift.staffMembers.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No staff members assigned to this shift.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedShift.staffMembers.map((member, idx) => (
                    <div key={`${member}-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors">
                      <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {member.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{member}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedShift(null); }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
