import React, { useState, useEffect, useCallback } from "react";
import StaffLayout from "../../components/StaffLayout";
import { Search, Home, Bed, Loader2, RefreshCw, Users, AlertCircle } from "lucide-react";
import { getApiBase } from "../../utils/api";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

const STATUS_CONFIG = {
  Occupied:    { cls: "bg-blue-600 text-white", dot: "bg-blue-600" },
  Available:   { cls: "bg-emerald-500 text-white", dot: "bg-emerald-500" },
  Maintenance: { cls: "bg-rose-500 text-white", dot: "bg-rose-500" },
  Vacant:      { cls: "bg-emerald-500 text-white", dot: "bg-emerald-500" },
};

export default function StaffRooms() {
  const staff = getStaffSession();
  const parentLoginId = staff?.parentLoginId || "";

  const [allRooms, setAllRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!parentLoginId) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      // Fetch properties to get property IDs
      const propRes = await fetch(`${getApiBase()}/api/properties?ownerLoginId=${parentLoginId}`);
      const propData = await propRes.json();
      const properties = Array.isArray(propData) ? propData : (propData?.properties || propData?.data || []);

      // Fetch rooms for each property
      let rooms = [];
      for (const prop of properties) {
        const propId = prop._id || prop.id;
        if (!propId) continue;
        try {
          const rRes = await fetch(`${getApiBase()}/api/rooms?property=${propId}`);
          const rData = await rRes.json();
          const propRooms = (Array.isArray(rData) ? rData : (rData?.rooms || rData?.data || [])).map(r => ({
            ...r,
            propertyTitle: prop.title || "",
          }));
          rooms = [...rooms, ...propRooms];
        } catch (_) {}
      }

      // Also fetch tenants for occupancy info
      const tRes = await fetch(`${getApiBase()}/api/tenants/owner/${parentLoginId}`);
      const tData = await tRes.json();
      const tenantList = tData?.tenants || tData?.data || (Array.isArray(tData) ? tData : []);
      setTenants(tenantList.filter(t => !t.isDeleted && t.status !== "inactive"));
      setAllRooms(rooms);
    } catch (e) {
      setError("Failed to load rooms. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [parentLoginId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build room → tenant map from bedAssignments + tenants list
  const roomTenantMap = {};
  tenants.forEach(t => {
    if (t.roomNo) {
      if (!roomTenantMap[t.roomNo]) roomTenantMap[t.roomNo] = [];
      roomTenantMap[t.roomNo].push(t.name);
    }
  });

  // Enrich rooms with occupancy
  const enriched = allRooms.map(r => {
    const roomNum = r.title || r.number || r.roomNo || "";
    const beds = r.beds || r.capacity || 1;
    const assigned = roomTenantMap[roomNum]?.length || 0;
    let status = "Available";
    if (assigned > 0 && assigned >= beds) status = "Occupied";
    else if (assigned > 0) status = "Occupied";
    if (r.status === "maintenance" || r.maintenanceMode) status = "Maintenance";
    return { ...r, _roomNum: roomNum, _status: status, _tenants: roomTenantMap[roomNum] || [], _beds: beds, _assigned: assigned };
  });

  const tabs = ["All", "Occupied", "Available", "Maintenance"];
  const counts = {
    All: enriched.length,
    Occupied: enriched.filter(r => r._status === "Occupied").length,
    Available: enriched.filter(r => r._status === "Available").length,
    Maintenance: enriched.filter(r => r._status === "Maintenance").length,
  };

  const filtered = enriched.filter(r => {
    const matchFilter = filter === "All" || r._status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (r._roomNum || "").toLowerCase().includes(q) || (r.type || r.roomType || "").toLowerCase().includes(q) || r._tenants.some(n => n.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  return (
    <StaffLayout title="Room Inventory" subtitle="Room occupancy and availability status">
      <div className="space-y-6">

        {/* Filter Tabs + Search */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest",
                  filter === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                {tab}
                <span className={cn("px-1.5 py-0.5 rounded-md text-[8px] font-black", filter === tab ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500")}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-100 w-full md:w-[280px] shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
              <Search size={14} className="text-slate-400" />
              <input type="text" placeholder="Search room or tenant..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:text-slate-400" />
            </div>
            <button onClick={fetchData} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
              <RefreshCw size={14} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span className="text-sm font-bold">Loading rooms...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3">
            <AlertCircle size={16} />{error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-20 text-center">
            <Home size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm">
              {search || filter !== "All" ? "No rooms match your filter" : "No rooms found for this property"}
            </p>
          </div>
        )}

        {/* Room Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((room) => {
              const sc = STATUS_CONFIG[room._status] || STATUS_CONFIG.Available;
              return (
                <div key={room._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-110", sc.cls)}>
                      <Home size={18} />
                    </div>
                    <span className={cn("w-2 h-2 rounded-full mt-1.5", sc.dot)} />
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Room {room._roomNum || "—"}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {room.type || room.roomType || room.propertyTitle || "—"}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                      <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        room._status === "Occupied" ? "bg-blue-50 text-blue-600 border-blue-100" :
                        room._status === "Available" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-rose-50 text-rose-600 border-rose-100")}>
                        {room._status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rent</span>
                      <span className="text-[10px] font-black text-slate-700">₹{room.rent || room.monthlyRent || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beds</span>
                      <span className="text-[10px] font-black text-slate-700">{room._assigned}/{room._beds} occupied</span>
                    </div>
                  </div>

                  {room._tenants.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tenants</p>
                      <div className="space-y-0.5">
                        {room._tenants.slice(0, 3).map((name, i) => (
                          <p key={i} className="text-[10px] font-bold text-slate-700 truncate flex items-center gap-1.5">
                            <Users size={8} className="text-blue-400" />{name}
                          </p>
                        ))}
                        {room._tenants.length > 3 && (
                          <p className="text-[9px] text-slate-400 font-bold">+{room._tenants.length - 3} more</p>
                        )}
                      </div>
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
