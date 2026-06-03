import React from "react";
import StaffLayout from "../../components/StaffLayout";
import { CheckCircle2, Circle, Clock, ClipboardList, Plus, MoreVertical } from "lucide-react";

export default function StaffTasks() {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // We will just use the first employee to simulate a logged-in staff for now.
        const empRes = await fetch('/api/employees');
        const empData = await empRes.json();
        
        if (empData && empData.data && empData.data.length > 0) {
           const staffMember = empData.data[0]; // Simulated logged-in staff
           const maintRes = await fetch(`/api/maintenance/owner/${staffMember.parentLoginId}`);
           const maintData = await maintRes.json();
           
           if (maintData && maintData.tasks) {
               const assigned = maintData.tasks.filter(t => 
                  t.assignedStaffId && 
                  (t.assignedStaffId === staffMember._id || t.assignedStaffId._id === staffMember._id)
               );
               setTasks(assigned.map(t => ({
                   id: t._id,
                   title: t.title,
                   time: t.scheduledDate || "N/A",
                   status: t.status,
                   category: t.frequency || "Maintenance"
               })));
           }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <StaffLayout title="Daily Tasks">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Task List</h3>
          <p className="text-sm text-slate-500">Track and manage ground operations tasks.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6">
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-6 text-sm text-slate-500">Loading your tasks...</div>
          ) : tasks.length === 0 ? (
             <div className="text-center py-6 text-sm text-slate-500">No tasks assigned to you right now.</div>
          ) : tasks.map((task, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 rounded-2xl transition-all group">
              <div className="flex items-center gap-4">
                <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  task.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-200 text-slate-300'
                }`}>
                  {task.status === 'Completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>
                <div>
                  <h4 className={`font-bold text-sm ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12}/> {task.time}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{task.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                  task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                  task.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>{task.status}</span>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}
