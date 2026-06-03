const fs = require('fs');

const empPath = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/employee/visit.jsx';
const saPath = 'e:/Roomhy-Website/Roohmy-Frontend/src/pages/superadmin/visit.jsx';

const empCode = fs.readFileSync(empPath, 'utf8');
const saCode = fs.readFileSync(saPath, 'utf8');

// Extract stat card component from superadmin
const statCardStr = saCode.substring(saCode.indexOf('function StatCardHorizontal'));

// Build the new UI string
const newUi = `
          <div className="p-6 space-y-6 min-h-full max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Visit Reports</h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Submit new property visits for approval</p>
              </div>
              <div className="flex items-center gap-3">
                  <button onClick={openModal} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-slate-800/10 hover:bg-slate-900 transition-all flex items-center gap-2">
                    <i data-lucide="plus" className="w-3.5 h-3.5"></i> Add New Visit
                  </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCardHorizontal label="Total Visits" value={stats.total} trend="This Month" up icon={<i data-lucide="clipboard-check" className="w-5 h-5"/>} color="blue" />
              <StatCardHorizontal label="Average Time" value="24m" trend="Per Visit" up icon={<i data-lucide="clock" className="w-5 h-5"/>} color="indigo" />
              <StatCardHorizontal label="Approved Visits" value={stats.approved} trend="Verified" up icon={<i data-lucide="check-circle-2" className="w-5 h-5"/>} color="emerald" />
              <StatCardHorizontal label="Photos Uploaded" value={stats.photosCount} trend="Total Media" up icon={<i data-lucide="camera" className="w-5 h-5"/>} color="amber" />
            </div>

            {/* Main Ledger Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest leading-none">All Visit Reports</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative group w-48">
                        <i data-lucide="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                        <input 
                          value={search} onChange={e => setSearch(e.target.value)}
                          placeholder="Search visits..." 
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-9 pr-3 text-[10px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                        />
                    </div>
                    <button onClick={loadVisits} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
                        <i data-lucide="refresh-cw" className={\`w-3.5 h-3.5 \${loading ? 'animate-spin' : ''}\`} />
                    </button>
                  </div>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-[8px] font-bold uppercase border-b border-slate-50">
                          <th className="pb-4">Visit ID</th>
                          <th className="pb-4">Property Details</th>
                          <th className="pb-4 text-center">Staff Details</th>
                          <th className="pb-4 text-center">Cleanliness</th>
                          <th className="pb-4 text-center">Photos</th>
                          <th className="pb-4 text-center">Status</th>
                          <th className="pb-4 text-center">Add Prop</th>
                          <th className="pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                          <tr><td colSpan="8" className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Loading Visit Reports...</p>
                          </td></tr>
                        ) : filteredVisits.map((v, i) => {
                          const alreadyAdded = addedVisitIds.has(v.visitId || v._id);
                          return (
                          <tr key={i} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                              <td className="py-3">
                                <p className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shadow-sm inline-block">#{String(v._id || "").substring(0, 6) || "ERR"}</p>
                                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60 leading-none">{new Date(v.submittedAt || Date.now()).toLocaleDateString()}</p>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 shrink-0">
                                      <i data-lucide="building-2" className="w-4.5 h-4.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-bold text-slate-800 leading-none truncate max-w-[150px]">{v.propertyName || v.propertyInfo?.name || "Unknown Property"}</p>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 opacity-60 leading-none truncate">
                                          {v.propertyType || v.propertyInfo?.propertyType || "Property"} • {v.area || v.propertyInfo?.area || "Area"}
                                      </p>
                                    </div>
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <p className="text-[10px] font-bold text-slate-700 leading-none">{v.staffName || v.submittedBy || "System Admin"}</p>
                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60 leading-none">ID: {v.staffId || v.submittedById || "ADMIN"}</p>
                              </td>
                              <td className="py-3 text-center">
                                <div className="inline-flex flex-col items-center bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg shadow-sm">
                                    <div className="flex text-amber-400 text-[8px] gap-0.5">
                                      {[...Array(5)].map((_, idx) => (
                                          <i key={idx} data-lucide="star" className={\`w-2 h-2 \${idx < (v.cleanlinessRating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}\`} />
                                      ))}
                                    </div>
                                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">{v.cleanlinessRating || 0}/5 Rating</p>
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <div className="flex items-center justify-center -space-x-2.5">
                                    {(v.photos || []).slice(0, 2).map((img, idx) => (
                                      <div key={idx} className="w-8 h-8 rounded-xl border-2 border-white bg-slate-100 overflow-hidden shadow-sm transition-transform group-hover:scale-105 hover:z-20 relative">
                                          <img src={img} className="w-full h-full object-cover" alt="" />
                                      </div>
                                    ))}
                                    {(v.photos || []).length > 2 && (
                                      <div className="w-8 h-8 rounded-xl border-2 border-white bg-slate-800 text-white flex items-center justify-center text-[8px] font-bold shadow-sm z-10 transition-transform group-hover:scale-105">
                                          +{(v.photos || []).length - 2}
                                        </div>
                                    )}
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <span className={\`text-[7px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider shadow-sm \${
                                    v.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                }\`}>
                                    {v.status || "Submitted"}
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                {alreadyAdded ? (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg whitespace-nowrap shadow-sm">
                                    ✓ Added
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => openAddProperty(v)}
                                    className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded-lg transition shadow-sm whitespace-nowrap"
                                  >
                                    + Prop
                                  </button>
                                )}
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    <button onClick={() => viewMap(v)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 transition-all border border-slate-100 shadow-sm"><i data-lucide="map" className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => deleteVisit(v)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-100 shadow-sm"><i data-lucide="trash" className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => openEditModal(v)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"><i data-lucide="edit-3" className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                          </tr>
                        )})}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
`;

// Extract the top part of the employee component
let newEmpCode = empCode;

// Inject missing states: search, filteredVisits, stats
const stateInjectionPoint = newEmpCode.indexOf('const rows = useMemo');
const stateInjection = `
  const [search, setSearch] = useState("");

  const filteredVisits = useMemo(() => {
    const q = search.toLowerCase();
    return visits.filter(v => {
      const propName = (v.propertyName || v.propertyInfo?.name || "").toLowerCase();
      const staffName = (v.staffName || v.submittedBy || "").toLowerCase();
      return propName.includes(q) || staffName.includes(q);
    });
  }, [visits, search]);

  const stats = useMemo(() => {
    const total = visits.length;
    const approved = visits.filter(v => v.status === "approved").length;
    const photosCount = visits.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);
    return { total, approved, pending: total - approved, photosCount };
  }, [visits]);
`;
newEmpCode = newEmpCode.substring(0, stateInjectionPoint) + stateInjection + newEmpCode.substring(stateInjectionPoint);

// Replace the return block body
const mainStart = newEmpCode.indexOf('<main className="flex-1 overflow-y-auto p-8">');
const mainEnd = newEmpCode.indexOf('</main>');
if (mainStart !== -1 && mainEnd !== -1) {
  newEmpCode = newEmpCode.substring(0, mainStart) + newUi + newEmpCode.substring(mainEnd + '</main>'.length);
}

// Add the StatCardHorizontal function at the bottom
// Replace lucide imports with standard lucide-react if needed, but employee/visit.jsx uses <i data-lucide="..."> which is fine!
// I changed the icons in the newUI to use data-lucide instead of React components so we don't need imports.
const statCardLucide = `
function StatCardHorizontal({ label, value, trend, up, icon, color }) {
  const bgColors = { 
    blue: "bg-blue-50 text-blue-600 border-blue-100", 
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100" 
  };
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-start gap-3 group hover:translate-y-[-2px] transition-all">
      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-105 \${bgColors[color]}\`}>
         {icon}
      </div>
      <div className="min-w-0">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none truncate">{label}</p>
         <p className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-2">{value}</p>
         <div className={\`flex items-center gap-1 text-[7px] font-bold uppercase \${up ? "text-emerald-600" : "text-rose-600"}\`}>
            {up ? <i data-lucide="arrow-up-right" className="w-2.5 h-2.5" /> : <i data-lucide="arrow-down-right" className="w-2.5 h-2.5" />}
            {trend}
         </div>
      </div>
    </div>
  );
}
`;

newEmpCode = newEmpCode + '\\n\\n' + statCardLucide;

fs.writeFileSync(empPath, newEmpCode);
console.log('Successfully updated employee/visit.jsx UI!');
