import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Users, BedDouble, HelpCircle, ArrowRightLeft, Landmark, 
  ArrowUpRight, ArrowDownRight, BarChart2, ShieldAlert,
  Building, CheckCircle, Clock, AlertCircle, Filter, Calendar
} from "lucide-react";

export default function OccupancyOverviewPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [propertyFilter, setPropertyFilter] = useState("All");
  const [floorFilter, setFloorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Mock data for rooms and occupancy status
  const roomsData = [
    { id: "101", floor: "1st Floor", type: "Double Sharing", occupied: 2, capacity: 2, beds: [{ id: "101A", status: "occupied", tenant: "Amit Sharma" }, { id: "101B", status: "occupied", tenant: "Vijay Kumar" }] },
    { id: "102", floor: "1st Floor", type: "Single Sharing", occupied: 1, capacity: 1, beds: [{ id: "102A", status: "occupied", tenant: "Rajesh Gupta" }] },
    { id: "103", floor: "1st Floor", type: "Triple Sharing", occupied: 1, capacity: 3, beds: [{ id: "103A", status: "occupied", tenant: "Sanjay Dutt" }, { id: "103B", status: "vacant", tenant: null }, { id: "103C", status: "vacant", tenant: null }] },
    { id: "104", floor: "1st Floor", type: "Double Sharing", occupied: 0, capacity: 2, beds: [{ id: "104A", status: "vacant", tenant: null }, { id: "104B", status: "vacant", tenant: null }] },
    { id: "201", floor: "2nd Floor", type: "Double Sharing", occupied: 2, capacity: 2, beds: [{ id: "201A", status: "occupied", tenant: "Rahul Varma" }, { id: "201B", status: "occupied", tenant: "Karan Johar" }] },
    { id: "202", floor: "2nd Floor", type: "Single Sharing", occupied: 0, capacity: 1, beds: [{ id: "202A", status: "notice", tenant: "Rohan Mehra" }] },
    { id: "203", floor: "2nd Floor", type: "Double Sharing", occupied: 1, capacity: 2, beds: [{ id: "203A", status: "occupied", tenant: "Deepak Chawla" }, { id: "203B", status: "vacant", tenant: null }] },
    { id: "204", floor: "2nd Floor", type: "Triple Sharing", occupied: 2, capacity: 3, beds: [{ id: "204A", status: "occupied", tenant: "Ajay Devgn" }, { id: "204B", status: "occupied", tenant: "Salman Khan" }, { id: "204C", status: "vacant", tenant: null }] }
  ];

  const upcomingSchedules = [
    { id: 1, type: "check-in", tenant: "Pawan Kalyan", room: "104A", date: "Today, 11:00 AM", status: "Confirmed" },
    { id: 2, type: "check-out", tenant: "Rohan Mehra", room: "202A", date: "Tomorrow, 10:00 AM", status: "Pending Dues Clear" },
    { id: 3, type: "check-in", tenant: "Mahesh Babu", room: "103B", date: "22 May, 02:00 PM", status: "Pending Deposit" }
  ];

  const totalBeds = roomsData.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = roomsData.reduce((acc, r) => acc + r.occupied, 0);
  const vacantBeds = totalBeds - occupiedBeds;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  // Filters logic
  const filteredRooms = roomsData.filter(room => {
    const matchesFloor = floorFilter === "All" || room.floor === floorFilter;
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "Full" && room.occupied === room.capacity) ||
      (statusFilter === "Partial" && room.occupied > 0 && room.occupied < room.capacity) ||
      (statusFilter === "Empty" && room.occupied === 0);
    return matchesFloor && matchesStatus;
  });

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Occupancy Overview" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Occupancy Overview</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor real-time bed occupancy, room allocations, and check-in schedules.</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <BedDouble size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+3 This Week</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Bed Capacity</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">{totalBeds} <span className="text-sm font-normal text-muted-foreground">Beds</span></h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{occupancyRate}% Rate</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Occupied Beds</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">{occupiedBeds} <span className="text-sm font-normal text-emerald-600">Beds</span></h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">4 Pending Check-ins</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Vacant Beds</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">{vacantBeds} <span className="text-sm font-normal text-amber-600">Available</span></h3>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Users size={20} />
            </div>
            <span className="text-[11.5px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Active Rooms</span>
          </div>
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Rooms Count</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">{roomsData.length} <span className="text-sm font-normal text-muted-foreground">Rooms</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rooms Layout and Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-border">
              <h3 className="font-serif text-[20px] text-foreground">Interactive Bed Allocations</h3>
              <div className="flex flex-wrap items-center gap-2">
                {/* Floor Filter */}
                <select 
                  value={floorFilter} 
                  onChange={(e) => setFloorFilter(e.target.value)} 
                  className="px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="All">All Floors</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                </select>

                {/* Status Filter */}
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-muted/60 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="All">All Statuses</option>
                  <option value="Full">Fully Occupied</option>
                  <option value="Partial">Partially Occupied</option>
                  <option value="Empty">Fully Vacant</option>
                </select>
              </div>
            </div>

            {/* Graphical Rooms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredRooms.map((room) => (
                <div key={room.id} className="border border-border rounded-xl p-4 hover:border-primary/30 transition-all bg-muted/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-serif text-[17px] font-bold text-foreground">Room {room.id}</h4>
                      <p className="text-[11px] text-muted-foreground">{room.floor} • {room.type}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      room.occupied === room.capacity 
                        ? "bg-emerald-50 text-emerald-600" 
                        : room.occupied === 0 
                          ? "bg-slate-100 text-slate-500" 
                          : "bg-amber-50 text-amber-600"
                    }`}>
                      {room.occupied === room.capacity 
                        ? "Full" 
                        : room.occupied === 0 
                          ? "Vacant" 
                          : `${room.capacity - room.occupied} Left`}
                    </span>
                  </div>

                  {/* Bed list visual circles */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/60">
                    {room.beds.map((bed, idx) => (
                      <div key={bed.id} className="text-center">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-sm border ${
                          bed.status === "occupied" 
                            ? "bg-emerald-600 text-white border-emerald-700" 
                            : bed.status === "notice" 
                              ? "bg-amber-500 text-white border-amber-600 animate-pulse" 
                              : "bg-white text-slate-400 border-slate-200 hover:border-primary/40 hover:text-primary cursor-pointer"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-[9.5px] text-muted-foreground block mt-1 truncate max-w-full">
                          {bed.tenant || "Empty"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-serif text-[20px] text-foreground mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Check-in / Check-out Schedule
            </h3>
            
            <div className="space-y-4">
              {upcomingSchedules.map((schedule) => (
                <div key={schedule.id} className="p-3.5 border border-border rounded-xl bg-muted/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      schedule.type === "check-in" 
                        ? "bg-blue-50 text-blue-600" 
                        : "bg-rose-50 text-rose-600"
                    }`}>
                      {schedule.type === "check-in" ? "Check In" : "Check Out"}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">{schedule.date}</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-[13px] text-foreground">{schedule.tenant}</h5>
                    <p className="text-[11px] text-muted-foreground">Assigned Bed: <strong className="text-foreground">{schedule.room}</strong></p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold text-foreground">{schedule.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
            <h4 className="font-serif text-[18px] text-foreground mb-2">Need to assign a vacant bed?</h4>
            <p className="text-[12.5px] text-muted-foreground mb-4">Onboard a new tenant and allocate their room directly through the quick wizard.</p>
            <a 
              href="/propertyowner/tenantrec" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 transition-all"
            >
              Add Tenant Rec
            </a>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
