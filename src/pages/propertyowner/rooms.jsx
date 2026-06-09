import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Building2, ChevronDown, UploadCloud, Loader2, Wind, Table as TableIcon, Tv, Bath, LayoutTemplate, Refrigerator, DoorClosed, Armchair, Utensils, Microwave, Flame, Shirt, Video, Fan, Check, Edit2, Trash2, BedDouble, Home } from "lucide-react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getApiBase, getAuthHeader } from "../../utils/api";
import {
  assignTenant, clearOwnerFetchCache, clearOwnerRuntimeSession, createRoom, updateRoom, deleteRoom,
  fetchOwnerProperties, fetchOwnerRooms, fetchOwnerTenants, getOwnerRuntimeSession
} from "../../utils/propertyowner";

const cn = (...c) => c.filter(Boolean).join(" ");

const toLegacyBeds = (room) => {
  // If room.beds is already an array of {status, tenantId, tenantName} objects, use as-is
  if (Array.isArray(room?.beds) && room.beds.length && typeof room.beds[0] === 'object' && 'status' in room.beds[0]) {
    return room.beds;
  }
  const bedCount = Number(room?.beds || room?.capacity || room?.totalBeds || 0);
  return Array.from({ length: bedCount }, (_, i) => {
    const a = room?.bedAssignments?.[i] || room?.bedsInfo?.[i] || null;
    // tenantId can be an ObjectId object or a string
    const tid = a?.tenantId;
    const hasOccupant = !!(a && (a.tenantName || a.name || (tid && String(tid).length > 0 && String(tid) !== '[object Object]')));
    return hasOccupant
      ? { status: "occupied", tenantId: tid ? String(tid) : null, tenantName: a.tenantName || a.name || null }
      : { status: "available", tenantId: null, tenantName: null };
  }).concat(bedCount === 0 ? [{ status: "available", tenantId: null, tenantName: null }] : []);
};


const normalizeRoom = (room, ownerId) => {
  const number = room?.number || room?.roomNo || room?.title || "Room";
  return {
    ...room,
    id: room?.id || room?._id || `R-${Date.now()}`,
    _id: room?._id || room?.id || null,
    ownerLoginId: room?.ownerLoginId || ownerId,
    propertyId: room?.propertyId || room?.property?._id || "",
    propertyTitle: room?.propertyTitle || room?.property?.title || "",
    number, roomNo: number, title: number,
    type: room?.type || room?.roomType || "AC",
    rent: Number(room?.rent ?? room?.price ?? room?.roomRent ?? 0),
    gender: room?.gender || room?.roomGender || "",
    beds: toLegacyBeds(room),
  };
};

const readJson = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const writeJson = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const compressImage = (file, maxWidth = 1200, quality = 0.75) =>
  new Promise((resolve) => {
    if (!file.type.startsWith("image/")) { resolve(file); return; }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => resolve(file);
  });

export default function Rooms() {
  const [owner, setOwner] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const defaultRoomForm = { roomNo: "", unitType: "", floor: "", sharingType: "", roomRent: "", remarks: "", isAvailable: true, facilities: [], roomTypeFeatures: [], media: [], roomType: "AC", roomGender: "", roomBeds: 2, electricityUnitCost: 0, meterReadings: [] };
  const [roomForm, setRoomForm] = useState(defaultRoomForm);
  const [assignMode, setAssignMode] = useState("existing");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBedIndex, setSelectedBedIndex] = useState(null);
  const [selectedBedOccupied, setSelectedBedOccupied] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [newTenantForm, setNewTenantForm] = useState({ name: "", phone: "", email: "" });
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const [showFilter, setShowFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [propPages, setPropPages] = useState({});
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [floorFilter, setFloorFilter] = useState("all");
  const [sharingFilter, setSharingFilter] = useState("all");
  const ROOMS_PER_PAGE = 3;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentProperty = useMemo(() => properties[0] || null, [properties]);
  const currentPropertyDisplay = useMemo(() => {
    const title = currentProperty?.title || currentProperty?.name || owner?.propertyName || "";
    const loc = currentProperty?.city || currentProperty?.area || currentProperty?.locationCode || "";
    return title ? (loc ? `${title} (${loc})` : title) : "Loading…";
  }, [currentProperty, owner]);
  const currentPropertyLocation = useMemo(() => currentProperty?.city || currentProperty?.area || "", [currentProperty]);

  const mergeRooms = (ownerId, backendRooms) => {
    const local = readJson("roomhy_rooms", []);
    const seen = new Set();
    // Backend rooms first — they win deduplication (have fresh bedAssignments)
    // Local rooms only fill in any rooms not returned by backend
    return [...backendRooms, ...local]
      .map(r => normalizeRoom(r, ownerId))
      .filter(r => {
        const key = `${r.propertyId}:${r.number}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
  };

  const load = async (session, page = 1, limit = 3) => {
    setLoading(true);
    try {
      const [props, roomData, tList] = await Promise.all([
        fetchOwnerProperties(session.loginId),
        fetchOwnerRooms(session.loginId, page, limit),
        fetchOwnerTenants(session.loginId),
      ]);
      setProperties(props);
      setRooms(mergeRooms(session.loginId, roomData.rooms || []));
      setTenants(tList);
      const total = roomData.total || (roomData.rooms ? roomData.rooms.length : 0);
      setTotalRooms(total);
      setCurrentPage(page);
      setTotalPages(Math.ceil(total / limit));
    } catch (e) {
      setErrorMsg(e?.body || e?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const s = getOwnerRuntimeSession();
    if (!s?.loginId) { window.location.href = "/propertyowner/ownerlogin"; return; }
    setOwner(s);
    // Always bypass cache on mount so occupancy reflects the latest DB state
    clearOwnerFetchCache(s.loginId);
    const isMob = window.innerWidth < 1024;
    load(s, 1, isMob ? 100 : 3);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "add") {
      setRoomForm(defaultRoomForm);
      setRoomModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [window.location.search]);

  const openAssignModal = (room, bedIdx) => {
    const beds = toLegacyBeds(room);
    const bed = beds[bedIdx];
    const isOccupied = !!(bed?.status === "occupied" || bed?.tenantId);
    setSelectedRoom(room);
    setSelectedBedIndex(bedIdx);
    setSelectedBedOccupied(isOccupied);
    setSelectedTenantId("");
    setNewTenantForm({ name: "", phone: "", email: "" });
    setAssignMode("existing");
    setAssignModalOpen(true);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!owner?.loginId) return;
    
    const propId = currentProperty?._id || "";
    if (!propId && !roomForm._id) {
      setErrorMsg("Please wait for properties to load or add a property first.");
      return;
    }

    try {
      setErrorMsg("");
      const bedCount = Number(roomForm.roomBeds || 1);
      
      const payload = { 
        propertyId: propId, 
        title: roomForm.roomNo, 
        type: roomForm.roomType, 
        rent: Number(roomForm.roomRent || 0), 
        beds: bedCount, 
        gender: roomForm.roomGender, 
        ownerLoginId: owner.loginId,
        unitType: roomForm.unitType,
        floor: roomForm.floor,
        sharingType: roomForm.sharingType,
        remarks: roomForm.remarks,
        isAvailable: roomForm.isAvailable,
        facilities: roomForm.facilities,
        roomTypeFeatures: roomForm.roomTypeFeatures,
        media: roomForm.media,
        electricityUnitCost: Number(roomForm.electricityUnitCost || 0)
      };

      if (roomForm._id) {
        await updateRoom(roomForm._id, payload);
        setErrorMsg("");
        setRoomModalOpen(false);
        setRoomForm(defaultRoomForm);
        clearOwnerFetchCache(owner.loginId);
        await load(owner);
      } else {
        await createRoom(payload);
        setErrorMsg("");
        setRoomModalOpen(false);
        setRoomForm(defaultRoomForm);
        clearOwnerFetchCache(owner.loginId);
        await load(owner);
      }
    } catch (e) { setErrorMsg(e?.message || "Failed."); }
  };

  const handleEditRoom = (room) => {
    setRoomForm({
      ...defaultRoomForm,
      ...room,
      roomNo: room.number || room.roomNo || room.title || "",
      roomType: room.type || "AC",
      roomRent: room.rent || room.price || "",
      roomGender: room.gender || "",
      roomBeds: room.beds?.length || room.capacity || 2,
      electricityUnitCost: room.electricity?.unitCost || room.electricityUnitCost || 0,
      unitType: room.unitType || "",
      floor: room.floor || "",
      sharingType: room.sharingType || "",
      remarks: room.remarks || "",
      facilities: room.facilities || [],
      roomTypeFeatures: room.roomTypeFeatures || [],
      media: room.media || []
    });
    setRoomModalOpen(true);
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Are you sure you want to delete room ${room.number || room.title}?`)) return;
    try {
      setErrorMsg("");
      await deleteRoom(room._id || room.id);
      clearOwnerFetchCache(owner.loginId);
      await load(owner);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to delete room.");
    }
  };

  const handleAssignTenant = async (e) => {
    e.preventDefault();
    if (!owner?.loginId || !selectedRoom) return;
    if (isAssigning) return;
    
    if (!window.confirm(`Are you sure you want to assign this tenant to Room ${selectedRoom.number || selectedRoom.roomNo}, Bed ${Number(selectedBedIndex) + 1}?`)) {
      return;
    }

    try {
      setIsAssigning(true);
      setErrorMsg("");
      const roomNo = selectedRoom.number || selectedRoom.roomNo || "";
      const agreedRent = Number(selectedRoom.rent || 0);
      const moveInDate = new Date().toISOString().split("T")[0];
      
      const t = tenants.find(x => (x._id || x.id) === selectedTenantId);
      if (!t) { setErrorMsg("Select a tenant."); setIsAssigning(false); return; }
      
      const payload = { 
        name: t.name, 
        phone: t.phone, 
        email: t.email, 
        propertyId: currentProperty?._id || "", 
        roomNo, 
        bedNo: Number(selectedBedIndex) + 1, 
        moveInDate, 
        agreedRent, 
        ownerLoginId: owner.loginId 
      };

      await assignTenant(payload);
      setAssignModalOpen(false);
      clearOwnerFetchCache(owner.loginId);
      await load(owner);
    } catch (e) { 
      setErrorMsg(e?.body || e?.message || "Failed."); 
    } finally {
      setIsAssigning(false);
    }
  };

  // Group rooms by property
  const grouped = useMemo(() => {
    const g = {};
    const filteredRooms = rooms.filter(r => {
      // Show filter (vacant means has at least one vacant bed, occupied means has at least one occupied bed)
      if (showFilter === "vacant" && !r.beds.some(b => b.status === 'available')) return false;
      if (showFilter === "occupied" && !r.beds.some(b => b.status === 'occupied')) return false;
      // Floor filter
      if (floorFilter !== "all" && r.floor !== floorFilter) return false;
      // Sharing filter
      if (sharingFilter !== "all" && r.sharingType !== sharingFilter) return false;
      return true;
    });

    filteredRooms.forEach(r => {
      const k = r.propertyTitle || r.propertyId || "Your Property";
      if (!g[k]) g[k] = [];
      g[k].push(r);
    });
    return g;
  }, [rooms, showFilter, floorFilter, sharingFilter]);

  return (
    <PropertyOwnerLayout owner={owner} title="Rooms & Beds" rooms={rooms} loading={loading} onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }} contentClassName="max-w-7xl mx-auto">

      {/* Header */}
      {/* Stats Panel */}
      {/* Stats Panel */}
      <div className="flex overflow-x-auto snap-x gap-3 pb-3 mb-6 no-scrollbar scroll-smooth md:grid md:grid-cols-3 lg:grid-cols-6 md:pb-0">
        <div className="w-[38%] md:w-auto shrink-0 snap-start bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[90px] md:min-h-[120px] hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div className="mt-3">
            <h3 className="text-[22px] font-black text-slate-900 leading-tight">{rooms.length}</h3>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Total Rooms</p>
          </div>
        </div>
        <div className="w-[38%] md:w-auto shrink-0 snap-start bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[90px] md:min-h-[120px] hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BedDouble size={20} />
          </div>
          <div className="mt-3">
            <h3 className="text-[22px] font-black text-slate-900 leading-tight">{rooms.reduce((s,r)=> s+ (r.beds?.length||0),0)}</h3>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Total Beds</p>
          </div>
        </div>
        <div className="w-[38%] md:w-auto shrink-0 snap-start bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[90px] md:min-h-[120px] hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BedDouble size={20} />
          </div>
          <div className="mt-3">
            <h3 className="text-[22px] font-black text-slate-900 leading-tight">{rooms.reduce((s,r)=>s+ r.beds.filter(b=>b.status==='available').length,0)}</h3>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Vacant Beds</p>
          </div>
        </div>
        <div className="w-[38%] md:w-auto shrink-0 snap-start bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[90px] md:min-h-[120px] hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
            <BedDouble size={20} />
          </div>
          <div className="mt-3">
            <h3 className="text-[22px] font-black text-slate-900 leading-tight">{rooms.reduce((s,r)=>s+ r.beds.filter(b=>b.status==='occupied').length,0)}</h3>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Occupied Beds</p>
          </div>
        </div>
        <div className="w-[38%] md:w-auto shrink-0 snap-start bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[90px] md:min-h-[120px] hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Home size={20} />
          </div>
          <div className="mt-3">
            <h3 className="text-[22px] font-black text-slate-900 leading-tight">{rooms.filter(r=> r.beds.filter(b=>b.status==='available').length>0).length}</h3>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Vacant Rooms</p>
          </div>
        </div>
        <div className="w-[38%] md:w-auto shrink-0 snap-start bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[90px] md:min-h-[120px] hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div className="mt-3">
            <h3 className="text-[22px] font-black text-slate-900 leading-tight">{rooms.filter(r=> r.beds.filter(b=>b.status==='occupied').length>0).length}</h3>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Occupied Rooms</p>
          </div>
        </div>
      </div>
      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-muted-foreground">Show:</span>
            <select value={showFilter} onChange={e => setShowFilter(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1 text-[12px] outline-none focus:ring-1 focus:ring-primary">
              <option value="all">All Rooms</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-muted-foreground">Floor:</span>
            <select value={floorFilter} onChange={e => setFloorFilter(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1 text-[12px] outline-none focus:ring-1 focus:ring-primary max-w-[100px]">
              <option value="all">All Floors</option>
              {/* Dynamically generate floor options */}
              {Array.from(new Set(rooms.map(r=>r.floor).filter(Boolean))).map(f=>(
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-muted-foreground">Sharing:</span>
            <select value={sharingFilter} onChange={e => setSharingFilter(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1 text-[12px] outline-none focus:ring-1 focus:ring-primary max-w-[120px]">
              <option value="all">All Sharing</option>
              <option value="Single Sharing">Single</option>
              <option value="Double Sharing">Double</option>
              <option value="Triple Sharing">Triple</option>
              <option value="Four Sharing">Four</option>
              <option value="Private Room (No Sharing)">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card p-4 rounded-xl border border-border mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Room status colors */}
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="text-muted-foreground font-medium mr-1">Room Occupancy:</span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-emerald-250 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fully Vacant (0% Filled)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-250 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
              <span className="size-1.5 rounded-full bg-amber-500" /> Partially Occupied
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-teal-250 bg-teal-50/40 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 text-[11px] font-semibold">
              <span className="size-1.5 rounded-full bg-teal-500" /> Fully Occupied (100% Filled)
            </span>
          </div>
          {/* Bed status colors */}
          <div className="flex flex-wrap items-center gap-4 text-[12px]">
            <span className="text-muted-foreground font-medium">Bed Status:</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-primary/80" /> Occupied</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-warning/40" /> Reserved</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded border border-dashed border-border bg-card" /> Vacant</span>
          </div>
        </div>
      </div>

      {errorMsg && <div className="text-sm text-destructive mb-6 bg-destructive/10 p-4 rounded-xl">{errorMsg}</div>}

      <div className="space-y-7">
        {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="animate-spin text-primary mb-2" size={48} />
          <span className="text-sm text-muted-foreground">Loading rooms...</span>
        </div>
      ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 shadow-soft flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-muted/60 rounded-full flex items-center justify-center mb-3"><Building2 className="size-7 text-muted-foreground" /></div>
            <h3 className="font-serif text-[22px] text-foreground mb-1">No rooms yet</h3>
            <p className="text-[13.5px] text-muted-foreground mb-4">Add your first room to manage beds and tenants.</p>
            <button type="button" onClick={() => { setRoomForm(defaultRoomForm); setRoomModalOpen(true); }} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700"><Plus size={16}/> Add Room</button>
          </div>
          ) : (
            <>
              {Object.entries(grouped).map(([propTitle, allPropRooms]) => {
                const allBeds = allPropRooms.flatMap(r => toLegacyBeds(r));
                const pOcc = allBeds.filter(b => b.status==="occupied"||b.tenantId).length;
                const pTotal = allBeds.length;
                const pct = pTotal ? Math.round((pOcc/pTotal)*100) : 0;
                // Per-property pagination
                const propPage = propPages[propTitle] || 1;
                const propTotalPages = Math.max(1, Math.ceil(allPropRooms.length / ROOMS_PER_PAGE));
                const safePropPage = Math.min(propPage, propTotalPages);
                const propRooms = isMobile
                  ? allPropRooms
                  : allPropRooms.slice((safePropPage - 1) * ROOMS_PER_PAGE, safePropPage * ROOMS_PER_PAGE);
                const setPropertyPage = (p) => setPropPages(prev => ({ ...prev, [propTitle]: p }));
                return (
                  <section key={propTitle} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    {/* Property Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="font-semibold text-[17px] leading-tight text-slate-800">{propTitle}</h2>
                        <div className="text-[12px] text-slate-400 mt-0.5">
                          {currentPropertyLocation && `${currentPropertyLocation} · `}
                          {allPropRooms.length} rooms · {pOcc}/{pTotal} beds occupied
                        </div>
                      </div>
                      <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                        pct > 90 ? "bg-blue-50 text-blue-600" : pct > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      )}>{pct}% full</span>
                    </div>

                    {/* Room Cards Grid */}
                    <div className="flex overflow-x-auto snap-x gap-3 pb-3 no-scrollbar scroll-smooth md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {propRooms.map(room => {
                        const beds = toLegacyBeds(room);
                        const occupiedCount = beds.filter(b => b.status === "occupied" || b.tenantId).length;
                        const totalBeds = beds.length;

                        let headerClass, bodyClass, cardBorderClass, badgeClass, statusLabel, dotColor;

                        if (occupiedCount === 0) {
                          headerClass = "bg-emerald-50 text-emerald-700 border-b border-emerald-100";
                          bodyClass = "bg-white";
                          cardBorderClass = "border-emerald-200";
                          badgeClass = "bg-emerald-100 text-emerald-700";
                          statusLabel = "Vacant";
                          dotColor = "bg-emerald-500";
                        } else if (occupiedCount === totalBeds) {
                          headerClass = "bg-blue-50 text-blue-700 border-b border-blue-100";
                          bodyClass = "bg-white";
                          cardBorderClass = "border-blue-200";
                          badgeClass = "bg-blue-100 text-blue-700";
                          statusLabel = "Full";
                          dotColor = "bg-blue-500";
                        } else {
                          headerClass = "bg-amber-50 text-amber-700 border-b border-amber-100";
                          bodyClass = "bg-white";
                          cardBorderClass = "border-amber-200";
                          badgeClass = "bg-amber-100 text-amber-700";
                          statusLabel = `${occupiedCount}/${totalBeds} Beds`;
                          dotColor = "bg-amber-500";
                        }

                        return (
                          <div key={room._id||room.id} className={cn("group rounded-2xl p-4 border shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-all w-[85%] md:w-auto shrink-0 snap-start", cardBorderClass || "border-slate-200/60")}>
                            {/* Header Row */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 border shadow-inner", 
                                  occupiedCount === totalBeds ? "bg-blue-50 text-blue-600 border-blue-100/50" : 
                                  occupiedCount === 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : 
                                  "bg-amber-50 text-amber-600 border-amber-100/50"
                                )}>
                                  <BedDouble className="w-4 h-4" />
                                </div>
                                <div>
                                  <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Room {room.number||room.roomNo||room.title}</h3>
                                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                                    {room.gender||"Mixed"} • {room.type||"AC"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold", badgeClass)}>
                                  <span className={cn("size-1.5 rounded-full", dotColor)} />
                                  {statusLabel}
                                </span>
                                {/* Edit/Delete visible on hover for desktop */}
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity hidden md:flex mt-1">
                                  <button onClick={(e) => { e.stopPropagation(); handleEditRoom(room); }} className="p-1 opacity-60 hover:opacity-100"><Edit2 size={11}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room); }} className="p-1 opacity-60 hover:opacity-100 text-rose-500"><Trash2 size={11}/></button>
                                </div>
                              </div>
                            </div>

                            {/* Beds Grid */}
                            <div className="flex gap-1.5 py-1 mb-2">
                              {beds.map((bed, i) => {
                                const isOcc = bed.status==="occupied"||!!bed.tenantId;
                                return (
                                  <div key={i}
                                    onClick={() => openAssignModal(room, i)}
                                    title={isOcc ? `Occupied${bed.tenantName ? ` — ${bed.tenantName}` : ""}` : "Vacant — Click to assign"}
                                    className={cn("flex-1 h-8 rounded-lg grid place-items-center text-[10px] font-bold transition-colors cursor-pointer border",
                                      isOcc
                                        ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                                        : i===0 && beds.length>2
                                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200"
                                          : "bg-slate-50 border-slate-200 border-dashed text-slate-400 hover:bg-slate-100")}
                                  >
                                    {String.fromCharCode(65+i)}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/80 mt-2">
                              <div className="flex gap-4 mb-1">
                                <div>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rent</p>
                                   <p className="text-[13.5px] font-black text-slate-800 leading-none">₹{(room.rent||0).toLocaleString("en-IN")}<span className="text-[10px] text-slate-500 font-semibold">/bed</span></p>
                                </div>
                              </div>
                              <div className="flex items-center shrink-0">
                                <button type="button" onClick={() => {
                                  const firstVacant = beds.findIndex(b => !(b.status==="occupied"||b.tenantId));
                                  openAssignModal(room, firstVacant !== -1 ? firstVacant : 0);
                                }} className="h-7 px-3.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-700 flex items-center gap-1.5 hover:bg-blue-100 transition-colors text-[11px] font-bold">
                                  Manage
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Per-Property Pagination */}
                    {!isMobile && propTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="text-[12px] text-slate-400 font-medium">
                          Showing {(safePropPage-1)*ROOMS_PER_PAGE+1}–{Math.min(safePropPage*ROOMS_PER_PAGE, allPropRooms.length)} of {allPropRooms.length} rooms
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            disabled={safePropPage <= 1}
                            onClick={() => setPropertyPage(safePropPage - 1)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 text-[12px] font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            ←
                          </button>
                          {Array.from({ length: propTotalPages }, (_, i) => i + 1).map(p => (
                            <button
                              key={p}
                              onClick={() => setPropertyPage(p)}
                              className={cn("w-8 h-8 rounded-lg text-[12px] font-semibold transition-all",
                                p === safePropPage
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                              )}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            disabled={safePropPage >= propTotalPages}
                            onClick={() => setPropertyPage(safePropPage + 1)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 text-[12px] font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </>
          )}
        </div>

      {/* Add Room Modal */}
      <div className={cn("fixed inset-0 z-[100] flex items-center justify-center bg-black/70 transition-all", roomModalOpen?"opacity-100 pointer-events-auto":"opacity-0 pointer-events-none")}>
        <div className={cn("bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl flex flex-col transition-transform duration-300", roomModalOpen?"scale-100":"scale-95")}>
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <button type="button" onClick={() => setRoomModalOpen(false)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><X size={18}/></button>
            <h2 className="text-[18px] font-semibold text-foreground flex-1">{roomForm._id ? 'Edit Room' : 'Add Room Details'}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-180px)]">
            <form id="addRoomForm" onSubmit={handleCreateRoom} className="space-y-6">
              
              <div>
                <label className="block text-[13px] text-muted-foreground mb-1.5">Room Name <span className="text-destructive">*</span></label>
                <input required className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 transition-colors" placeholder="Ex. Room 001" value={roomForm.roomNo} onChange={e=>setRoomForm(p=>({...p,roomNo:e.target.value}))}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-muted-foreground mb-1.5">Unit Type</label>
                  <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-colors" value={roomForm.unitType} onChange={e=>setRoomForm(p=>({...p,unitType:e.target.value}))}>
                    <option value="">Select Unit Type</option>
                    <option value="Room">Room</option>
                    <option value="Bed">Bed</option>
                    <option value="PG">PG</option>
                    <option value="1RK">1RK</option>
                    <option value="2RK">2RK</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK">4BHK</option>
                    <option value="5BHK">5BHK</option>
                    <option value="Studio Apartment">Studio Apartment</option>
                    <option value="Apartment">Apartment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] text-muted-foreground mb-1.5">Select Floor</label>
                  <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-colors" value={roomForm.floor} onChange={e=>setRoomForm(p=>({...p,floor:e.target.value}))}>
                    <option value="">Select Floor</option>
                    <option value="Basement">Basement</option>
                    <option value="Ground Floor">Ground Floor</option>
                    {Array.from({length: 100}, (_, i) => i + 1).map(floor => (
                      <option key={floor} value={`${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`}>
                        {floor}{floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] text-muted-foreground mb-1.5">Sharing Type</label>
                  <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-colors" value={roomForm.sharingType} onChange={e=>setRoomForm(p=>({...p,sharingType:e.target.value}))}>
                    <option value="">Select Unit Sharing Type</option>
                    <option value="Single Sharing">Single Sharing</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple Sharing">Triple Sharing</option>
                    <option value="Four Sharing">Four Sharing</option>
                    <option value="Private Room (No Sharing)">Private Room (No Sharing)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] text-muted-foreground mb-1.5">Amount Per Bed</label>
                  <input type="number" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="0" value={roomForm.roomRent} onChange={e=>setRoomForm(p=>({...p,roomRent:e.target.value}))}/>
                </div>
              </div>

              <div>
                <label className="block text-[13px] text-muted-foreground mb-1.5">Room Remarks</label>
                <textarea className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 transition-colors min-h-[80px]" placeholder="Remarks" value={roomForm.remarks} onChange={e=>setRoomForm(p=>({...p,remarks:e.target.value}))}></textarea>
              </div>

              <div>
                <label className="block text-[13px] text-muted-foreground mb-2">Is this room available to rent <span className="text-destructive">*</span></label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-[14px] text-foreground cursor-pointer">
                    <input type="radio" name="isAvailable" checked={roomForm.isAvailable} onChange={() => setRoomForm(p=>({...p,isAvailable:true}))} className="w-4 h-4 text-primary focus:ring-primary accent-primary" /> Yes
                  </label>
                  <label className="flex items-center gap-2 text-[14px] text-foreground cursor-pointer">
                    <input type="radio" name="isAvailable" checked={!roomForm.isAvailable} onChange={() => setRoomForm(p=>({...p,isAvailable:false}))} className="w-4 h-4 text-primary focus:ring-primary accent-primary" /> No
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-semibold text-primary mb-4">Room Facilities</h3>
                <div className="mb-3">
                  <label className="text-[13px] text-muted-foreground">Facilities</label>
                </div>
                <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                  {[
                    {name: "AC", icon: Wind}, {name: "Table", icon: TableIcon}, {name: "TV", icon: Tv}, {name: "Washroom", icon: Bath},
                    {name: "Balcony", icon: LayoutTemplate}, {name: "Fridge", icon: Refrigerator}, {name: "Almirah", icon: DoorClosed}, {name: "Chair", icon: Armchair},
                    {name: "Food", icon: Utensils}, {name: "Microwave", icon: Microwave}, {name: "Geyser", icon: Flame}, {name: "Laundry", icon: Shirt},
                    {name: "CCTV", icon: Video}, {name: "Toilet", icon: Bath}, {name: "Cooler", icon: Fan}
                  ].map(fac => {
                    const isSelected = roomForm.facilities.includes(fac.name);
                    return (
                      <label key={fac.name} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="relative">
                          <input type="checkbox" className="peer sr-only" checked={isSelected} onChange={(e) => {
                            setRoomForm(p => ({
                              ...p, 
                              facilities: e.target.checked ? [...p.facilities, fac.name] : p.facilities.filter(f => f !== fac.name)
                            }));
                          }} />
                          <div className={cn("w-5 h-5 rounded border border-border flex items-center justify-center transition-colors absolute -left-6 top-1/2 -translate-y-1/2", isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-card group-hover:border-primary/50")}>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div className="flex flex-col items-center gap-1 pl-1">
                            <fac.icon size={22} className={cn("transition-colors", isSelected ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-[12px] font-medium transition-colors text-center leading-tight", isSelected ? "text-foreground" : "text-muted-foreground")}>{fac.name}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <div className="mb-4">
                  <label className="text-[13px] text-muted-foreground">Room Type</label>
                </div>
                <div className="grid grid-cols-3 gap-y-4 gap-x-4">
                  {["Corner Room", "Large Room", "Ventilation", "Furnished", "Unfurnished", "Semi-Furnished", "Female", "Male", "Non Attached", "Attached", "Hall", "Short Term", "Long Term"].map(rt => {
                    const isSelected = roomForm.roomTypeFeatures.includes(rt);
                    return (
                      <label key={rt} className="flex items-start gap-2 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5">
                          <input type="checkbox" className="peer sr-only" checked={isSelected} onChange={(e) => {
                            setRoomForm(p => ({
                              ...p, 
                              roomTypeFeatures: e.target.checked ? [...p.roomTypeFeatures, rt] : p.roomTypeFeatures.filter(f => f !== rt)
                            }));
                          }} />
                          <div className={cn("w-4 h-4 rounded border border-border flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-card group-hover:border-primary/50")}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                        <span className={cn("text-[13px] leading-tight transition-colors", isSelected ? "text-foreground" : "text-muted-foreground")}>{rt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 pb-4 border-t border-border">
                <h3 className="text-[14px] font-semibold text-primary mb-4">Electricity Meter</h3>
                <div>
                  <label className="block text-[13px] text-muted-foreground mb-1.5">Unit Cost (₹/Unit)</label>
                  <input type="number" step="0.01" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-[14px] text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="e.g., 8.50" value={roomForm.electricityUnitCost} onChange={e=>setRoomForm(p=>({...p,electricityUnitCost:Number(e.target.value)}))}/>
                  <p className="text-[11px] text-muted-foreground mt-1">Set the cost per unit. Staff will add readings later.</p>
                </div>
              </div>

              <div className="pt-2 pb-6">
                <h3 className="text-[14px] font-semibold text-primary mb-3">Room Media (Photos/Videos)</h3>
                <div className="mb-3">
                  {roomForm.media.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {roomForm.media.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img src={file.preview} alt={`media-${idx}`} className="w-full h-20 object-cover rounded-lg border border-border" />
                          <button type="button" onClick={() => setRoomForm(p => ({...p, media: p.media.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 p-1 bg-destructive text-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className={`w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all text-primary ${isUploadingMedia ? "border-primary/40 bg-primary/5 cursor-wait" : "border-border cursor-pointer hover:border-primary/50 hover:bg-muted/30"}`}>
                  <input type="file" multiple accept="image/*,video/*" onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    setIsUploadingMedia(true);
                    try {
                      const uploadPromises = files.map(async (file) => {
                        const compressed = await compressImage(file);
                        const formData = new FormData();
                        formData.append("image", compressed);
                        const base = getApiBase();
                        const res = await fetch(`${base}/api/upload`, {
                          method: "POST",
                          body: formData,
                          headers: getAuthHeader()
                        });

                        let data;
                        const contentType = res.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                          data = await res.json();
                        } else {
                          const text = await res.text();
                          throw new Error(text || `HTTP error ${res.status}`);
                        }

                        if (!res.ok) throw new Error(data.error || "Upload failed");
                        return { preview: data.url, url: data.url };
                      });
                      const uploadedFiles = await Promise.all(uploadPromises);
                      setRoomForm(p => ({...p, media: [...(p.media || []), ...uploadedFiles]}));
                    } catch (err) {
                      alert("Failed to upload media: " + err.message);
                    } finally {
                      setIsUploadingMedia(false);
                    }
                  }} className="sr-only" disabled={isUploadingMedia} />
                  {isUploadingMedia ? (
                    <>
                      <svg className="animate-spin size-7 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      <span className="text-[11px] font-medium text-center px-2 text-primary">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={28} />
                      <span className="text-[11px] font-medium text-center px-2">Upload photos/videos</span>
                    </>
                  )}
                </label>
              </div>

            </form>
          </div>
          
          <div className="p-4 border-t border-border bg-card">
            {errorMsg && <p className="text-[12px] text-destructive mb-3 px-1">{errorMsg}</p>}
            <button type="submit" form="addRoomForm" className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition-opacity shadow-sm">
              {roomForm._id ? 'Update Room' : 'Add Room'}
            </button>
          </div>
        </div>
      </div>

      {/* Assign Tenant Modal */}
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm transition-all", assignModalOpen?"opacity-100 pointer-events-auto":"opacity-0 pointer-events-none")}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-[18px] font-semibold text-foreground">
                {selectedBedOccupied ? "Bed Info" : "Assign Tenant"}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Room {selectedRoom?.number||selectedRoom?.roomNo} · Bed {selectedBedIndex!=null?selectedBedIndex+1:""}
                {selectedBedOccupied && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary">Occupied</span>
                )}
              </p>
            </div>
            <button onClick={() => setAssignModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X size={20}/></button>
          </div>

          {selectedBedOccupied ? (
            // Show occupied bed details — no reassignment allowed
            (() => {
              const bed = selectedRoom ? toLegacyBeds(selectedRoom)[selectedBedIndex] : null;
              const assignedTenant = tenants.find(t => (t._id||t.id) === bed?.tenantId) || null;
              return (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/8 border border-primary/20">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[16px]">
                      {(bed?.tenantName || assignedTenant?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{bed?.tenantName || assignedTenant?.name || "Tenant"}</p>
                      {assignedTenant?.phone && <p className="text-[12px] text-muted-foreground">{assignedTenant.phone}</p>}
                      {assignedTenant?.email && <p className="text-[11px] text-muted-foreground">{assignedTenant.email}</p>}
                    </div>
                  </div>
                  <p className="text-[12px] text-muted-foreground text-center">
                    This bed is currently occupied. To reassign, first move out the current tenant.
                  </p>
                  <button type="button" onClick={() => setAssignModalOpen(false)}
                    className="w-full h-10 rounded-lg bg-muted text-foreground text-[13px] font-medium hover:bg-muted/80">
                    Close
                  </button>
                </div>
              );
            })()
          ) : (
            // Show assign form for vacant bed
            <form onSubmit={handleAssignTenant} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Select Existing Tenant</label>
                <select required className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-[13.5px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" value={selectedTenantId} onChange={e=>setSelectedTenantId(e.target.value)}>
                  <option value="">-- Select Tenant --</option>
                  {tenants
                    .filter(t => {
                      // Exclude tenants already assigned to any bed in any room
                      const assignedIds = rooms.flatMap(r => toLegacyBeds(r).map(b => b.tenantId).filter(Boolean));
                      return !assignedIds.includes(t._id || t.id);
                    })
                    .map(t=><option key={t._id||t.id} value={t._id||t.id}>{t.name} ({t.phone})</option>)
                  }
                </select>
              </div>
              {errorMsg && <p className="text-[12px] text-destructive">{errorMsg}</p>}
              <button type="submit" disabled={isAssigning} className="w-full h-10 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 disabled:opacity-50">
                {isAssigning ? "Assigning..." : "Assign Tenant"}
              </button>
            </form>
          )}
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
