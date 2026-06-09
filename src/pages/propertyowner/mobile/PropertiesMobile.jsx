import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Building2, BedDouble, Wifi, MapPin, Search, Plus, Star, Check, 
  Tv, Wind, Zap, Edit, Eye, ShieldCheck, Home, X, Mail, ChevronRight,
  Flame, Dumbbell, Coffee, Trash2, Edit3, Trash, Settings2
} from "lucide-react";
import { fetchOwnerProperties, fetchOwnerRooms } from "../../../utils/propertyowner";

const Pill = ({ tone = "muted", children }) => {
  const toneMap = {
    primary: "bg-blue-55 text-blue-600 border border-blue-100",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border border-amber-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100",
    muted: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${toneMap[tone] || toneMap.muted}`}>
      {children}
    </span>
  );
};

export default function PropertiesMobile({ owner, defaultTab = "all" }) {
  const location = useLocation();

  // Dynamic active tab determination
  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    if (location.pathname.includes('/rooms')) return "rooms";
    return "all";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Selected details
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Fetch properties and rooms
  useEffect(() => {
    if (owner?.loginId) {
      setLoading(true);
      Promise.all([
        fetchOwnerProperties(owner.loginId),
        fetchOwnerRooms(owner.loginId)
      ]).then(([propsData, roomsData]) => {
        setProperties(propsData || []);
        setRooms(roomsData.rooms || []);
      }).catch(err => console.error("Error fetching data:", err))
        .finally(() => setLoading(false));
    }
  }, [owner?.loginId]);

  // Tab configurations
  const tabs = [
    { id: "all", label: "Properties", count: properties.length },
    { id: "rooms", label: "Rooms", count: rooms.length },
  ];

  // Filters & Search logic
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const pType = String(p.type || p.category || "").toLowerCase();
      const matchFilter = filter === "All" || pType === filter.toLowerCase() || pType.includes(filter.toLowerCase());
      const matchSearch = !search || (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) || (p.city || "").toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [properties, filter, search]);

  // Static/Interactive mock amenities state
  const [amenities, setAmenities] = useState([
    { id: 1, name: "High-Speed WiFi", icon: Wifi, billing: "Free", rooms: 15, active: true },
    { id: 2, name: "Air Conditioning", icon: Wind, billing: "₹1,500/month", rooms: 8, active: true },
    { id: 3, name: "Geyser & Hot Water", icon: Flame, billing: "Free", rooms: 15, active: true },
    { id: 4, name: "Power Backup", icon: ShieldCheck, billing: "Free", rooms: 15, active: true },
    { id: 5, name: "Professional Gym", icon: Dumbbell, billing: "₹500/month", rooms: 4, active: false },
    { id: 6, name: "Daily Meal Plan", icon: Coffee, billing: "₹3,000/month", rooms: 12, active: true }
  ]);

  return (
    <div className="w-full bg-white min-h-screen pb-12">
      {/* Dynamic Tab Bar */}
      <div className="sticky top-[108px] z-30 bg-white border-b border-slate-100 pt-2 shrink-0">
        <div className="flex items-center gap-1.5 px-3 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                  : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
              }`}
            >
              {tab.label}
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering based on Active Tab */}
      <div className="px-3 mt-4">
        {activeTab === "all" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full h-9 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="h-9 px-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
              >
                <option value="All">All Types</option>
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Flat">Flat</option>
              </select>
            </div>

            {/* Properties List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="bg-slate-50 h-32 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-10">
                <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">No properties found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProperties.map(p => {
                  const occupied = p.occupiedBeds ?? p.tenantCount ?? 0;
                  const total = p.bedCount ?? p.totalBeds ?? p.roomCount ?? 1;
                  const occ = Math.round((occupied / Math.max(total, 1)) * 100);
                  const displayImage = p.image || (p.images && p.images.length > 0 ? p.images[0] : null);

                  return (
                    <div 
                      key={p._id} 
                      onClick={() => setSelectedProperty(p)}
                      className="bg-white rounded-2xl border border-slate-150 p-3.5 shadow-sm hover:shadow-md transition-all flex gap-3.5"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                        {displayImage ? (
                          <img src={displayImage} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Home size={22} />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-emerald-500 text-[8px] font-black text-white px-1 py-0.5 rounded shadow-sm">
                          {occ}%
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-[13px] font-extrabold text-slate-900 truncate leading-tight">{p.title || p.name}</h4>
                            {p.rating && (
                              <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                {p.rating} <Star size={8} className="fill-amber-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5 truncate">
                            <MapPin size={10} className="text-slate-400" /> {p.city || p.locality || "Indore"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 mt-1">
                          <span className="text-[12px] font-black text-slate-900">₹{(p.rent || p.monthlyRent || 0).toLocaleString()}/mo</span>
                          <span className="text-[9px] font-bold text-slate-500">{occupied}/{total} Beds Occupied</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === "rooms" && (
          <div className="space-y-4">
            {/* Rooms overview stats */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Rooms</span>
                <span className="text-lg font-black text-slate-800">{rooms.length}</span>
              </div>
              <div className="text-center border-l border-slate-200">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Vacant Beds</span>
                <span className="text-lg font-black text-emerald-600">
                  {rooms.reduce((s, r) => s + (Array.isArray(r.beds) ? r.beds.filter(b => b.status === 'available').length : 1), 0)}
                </span>
              </div>
            </div>

            {/* Rooms List */}
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="bg-slate-50 h-16 rounded-xl" />
                <div className="bg-slate-50 h-16 rounded-xl" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-10">
                <BedDouble size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">No rooms configured</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rooms.map(room => {
                  const beds = Array.isArray(room.beds) ? room.beds : [];
                  const vacantCount = beds.filter(b => b.status === 'available').length;
                  return (
                    <div key={room._id || room.id} className="bg-white rounded-xl border border-slate-150 p-3 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">Room {room.number || room.title}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{room.type || "AC"} · {room.gender || "Unisex"}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Pill tone={vacantCount > 0 ? "success" : "muted"}>
                          {vacantCount > 0 ? `${vacantCount} Vacant` : "Full"}
                        </Pill>
                        <span className="text-xs font-bold text-slate-900">₹{(room.rent || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Property Details Modal (Mobile Sheet) */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white rounded-t-[2rem] w-full max-h-[85vh] overflow-y-auto p-5 pb-8 relative shadow-2xl flex flex-col">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" onClick={() => setSelectedProperty(null)} />
            
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">{selectedProperty.title || selectedProperty.name}</h3>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{selectedProperty.type || "PG"} restriction: {selectedProperty.gender || "Any"}</span>
              </div>
              <button onClick={() => setSelectedProperty(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {selectedProperty.image ? (
                <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-40 object-cover rounded-xl border border-slate-150" />
              ) : (
                <div className="w-full h-40 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-100">
                  <Home size={32} className="text-slate-300" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase block">Monthly Rent</span>
                  <span className="font-bold text-slate-800">₹{(selectedProperty.rent || selectedProperty.monthlyRent || 0).toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase block">Location</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedProperty.city || "Indore"}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Description</span>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProperty.description || "Premium accommodation with modern amenities, comfortable rooms, and convenient accessibility to transit hubs."}
                </p>
              </div>
            </div>
            
            <div className="mt-5">
              <button 
                onClick={() => setSelectedProperty(null)} 
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
