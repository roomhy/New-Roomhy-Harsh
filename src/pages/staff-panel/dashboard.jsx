import React from "react";
import StaffLayout from "../../components/StaffLayout";
import { 
  Users, 
  Home, 
  AlertCircle, 
  ClipboardList, 
  CheckCircle2,
  ArrowUpRight,
  ChevronRight,
  UserCheck,
  CreditCard,
  TrendingUp,
  Activity,
  Calendar,
  MoreVertical,
  ArrowRight
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = React.useState([
    { label: "New Check-ins", value: "0", desc: "Since 8:00 AM", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Pending KYC", value: "0", desc: "Awaiting approval", icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    { label: "Active Issues", value: "0", desc: "Urgent attention", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { label: "Rent Due", value: "₹0", desc: "Collected: ₹0", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  ]);
  const [feed, setFeed] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [activeCount, setActiveCount] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await fetch('/api/employees');
        const empData = await empRes.json();
        
        if (empData && empData.data && empData.data.length > 0) {
           const staffMember = empData.data[0];
           
           const [compRes, maintRes] = await Promise.all([
             fetch(`/api/complaints/owner/${staffMember.parentLoginId}`),
             fetch(`/api/maintenance/owner/${staffMember.parentLoginId}`)
           ]);
           
           const compData = await compRes.json();
           const maintData = await maintRes.json();
           
           let pendingCount = 0;
           const newFeed = [];

           if (compData && compData.complaints) {
               const assigned = compData.complaints.filter(c => 
                  c.assignedStaffId && 
                  (c.assignedStaffId === staffMember._id || c.assignedStaffId._id === staffMember._id)
               );
               assigned.forEach(c => {
                  if (c.status !== "Resolved") pendingCount++;
                  newFeed.push({
                     type: "Complaint",
                     name: c.tenantName || "Unknown",
                     room: c.roomNo || "N/A",
                     time: new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                     initials: (c.tenantName || "U").substring(0,2).toUpperCase(),
                     color: c.priority === "High" ? "bg-rose-600" : "bg-orange-500",
                     status: c.status
                  });
               });
           }

           if (maintData && maintData.tasks) {
               const assigned = maintData.tasks.filter(t => 
                  t.assignedStaffId && 
                  (t.assignedStaffId === staffMember._id || t.assignedStaffId._id === staffMember._id)
               );
               assigned.forEach(t => {
                  if (t.status !== "Completed") pendingCount++;
                  newFeed.push({
                     type: "Maintenance",
                     name: t.title,
                     room: "Property",
                     time: t.scheduledDate || "N/A",
                     initials: "MT",
                     color: "bg-blue-600",
                     status: t.status
                  });
               });
           }

           setActiveCount(pendingCount);
           setFeed(newFeed.slice(0, 5)); // show top 5

           setStats(prev => {
              const next = [...prev];
              next[2].value = pendingCount.toString();
              return next;
           });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <StaffLayout 
      title="Dashboard" 
      subtitle="Welcome! Here's what's happening at your hostel today."
    >
      <div className="space-y-10">
        {/* Refined Light Welcome Hero */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-50/50 border border-blue-100 p-10 text-slate-900 shadow-sm group">
           <div className="absolute top-0 right-0 p-20 opacity-[0.03] scale-150 rotate-12 transition-transform duration-1000 group-hover:scale-125 pointer-events-none">
              <Activity size={300} />
           </div>
           <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-200 px-4 py-1.5 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
                 <TrendingUp size={12} /> Systems Online
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight italic">
                 Everything's looking <span className="text-blue-600">excellent</span> today.
              </h1>
              <p className="text-slate-500 text-base font-medium mb-8 leading-relaxed max-w-lg">
                 You have {activeCount} high-priority tasks and complaints assigned to you right now. Stay productive!
              </p>
              <div className="flex flex-wrap gap-4">
                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-black text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200 flex items-center gap-2 group">
                    Start Shift Routine <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </button>
                 <button className="bg-white hover:bg-slate-50 text-slate-600 px-8 py-3.5 rounded-xl font-black text-xs transition-all border border-slate-200 shadow-sm">
                    View Shift Logs
                 </button>
              </div>
           </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden`}>
              <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110`}>
                <stat.icon size={16} />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">{stat.label}</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">{stat.value}</h3>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest italic shrink-0 ml-2">
                    {stat.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Real-time Feed Card */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter italic">Activity Feed</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Real-time Operations</p>
              </div>
              <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all border border-slate-100">
                <MoreVertical size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                 <div className="py-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Loading...</div>
              ) : feed.length === 0 ? (
                 <div className="py-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No assigned tasks right now</div>
              ) : feed.map((item, idx) => (
                 <FeedItem 
                   key={idx}
                   type={item.type}
                   name={item.name}
                   room={item.room}
                   time={item.time}
                   initials={item.initials}
                   color={item.color}
                   status={item.status}
                 />
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 font-black text-[8px] uppercase tracking-widest transition-all border border-slate-100 italic">
               Load Operational History
            </button>
          </div>

          {/* Refined Property Health Widget */}
          <div className="space-y-6">
             <div className="bg-white rounded-3xl border border-blue-50 p-6 shadow-sm relative overflow-hidden group">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 italic">Property Health Index</h3>
                <div className="flex justify-center mb-6">
                   <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                         <circle cx="64" cy="64" r="56" stroke="#f8fafc" strokeWidth="8" fill="transparent" />
                         <circle cx="64" cy="64" r="56" stroke="#2563eb" strokeWidth="8" fill="transparent" strokeDasharray="351.8" strokeDashoffset="35.1" strokeLinecap="round" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                         <span className="text-3xl font-black italic tracking-tighter text-slate-900">92</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">Excellent</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-3">
                   <HealthMetric label="Occupancy" value="98%" />
                   <HealthMetric label="Service" value="84%" />
                   <HealthMetric label="Maintenance" value="95%" />
                </div>
             </div>

             <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                   <Calendar size={14} className="text-blue-500" /> Operational Calendar
                </h4>
                <div className="space-y-3">
                   <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 border-l-4 border-l-blue-500">
                      <p className="text-[10px] font-black text-slate-900">Electricity Checkup</p>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider italic">04:00 PM • Today</p>
                   </div>
                   <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 border-l-4 border-l-indigo-400 opacity-60">
                      <p className="text-[10px] font-black text-slate-900">Food Supplier Meeting</p>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider italic">11:00 AM • Tomorrow</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}

function FeedItem({ type, name, room, time, initials, color, status }) {
   return (
      <div className="flex items-center justify-between group cursor-pointer">
         <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${color} p-0.5 border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-sm`}>
               {initials}
            </div>
            <div>
               <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{name}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type}</span>
               </div>
               <p className="text-xs font-bold text-slate-500 mt-1">Room {room} • <span className="text-slate-300 italic">{time}</span></p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border ${
               status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
               status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
               status === 'Urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
            }`}>{status}</span>
            <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
         </div>
      </div>
   );
}

function HealthMetric({ label, value }) {
   return (
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</span>
         <span className="text-sm font-black italic">{value}</span>
      </div>
   );
}
