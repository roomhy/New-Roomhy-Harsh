import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  BedDouble, Search, Filter, Plus, Edit3, Trash2, 
  CheckCircle, Clock, AlertTriangle, ArrowUpDown
} from "lucide-react";

export default function BedsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [beds, setBeds] = useState([
    { id: "B-101A", room: "101", floor: "1st Floor", type: "Double Sharing", tenant: "Amit Sharma", price: 8500, status: "Occupied" },
    { id: "B-101B", room: "101", floor: "1st Floor", type: "Double Sharing", tenant: "Vijay Kumar", price: 8500, status: "Occupied" },
    { id: "B-102A", room: "102", floor: "1st Floor", type: "Single Sharing", tenant: "Rajesh Gupta", price: 12000, status: "Occupied" },
    { id: "B-103A", room: "103", floor: "1st Floor", type: "Triple Sharing", tenant: "Sanjay Dutt", price: 7000, status: "Occupied" },
    { id: "B-103B", room: "103", floor: "1st Floor", type: "Triple Sharing", tenant: null, price: 7000, status: "Vacant" },
    { id: "B-103C", room: "103", floor: "1st Floor", type: "Triple Sharing", tenant: null, price: 7000, status: "Vacant" },
    { id: "B-201A", room: "201", floor: "2nd Floor", type: "Double Sharing", tenant: "Rahul Varma", price: 8500, status: "Occupied" },
    { id: "B-201B", room: "201", floor: "2nd Floor", type: "Double Sharing", tenant: "Karan Johar", price: 8500, status: "Occupied" },
    { id: "B-202A", room: "202", floor: "2nd Floor", type: "Single Sharing", tenant: "Rohan Mehra", price: 12000, status: "On Notice" }
  ]);

  const counts = {
    total: beds.length,
    occupied: beds.filter(b => b.status === "Occupied").length,
    vacant: beds.filter(b => b.status === "Vacant").length,
    notice: beds.filter(b => b.status === "On Notice").length
  };

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = !search || 
      (bed.room || "").includes(search) || 
      (bed.tenant || "").toLowerCase().includes(search.toLowerCase()) ||
      (bed.id || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || bed.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Occupied": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Vacant": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Bed Allocations" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Bed Allocations</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage bed inventory, individual sharing prices, and occupancy states.</p>
        </div>
      </div>

      {/* Bed Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Beds</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">{counts.total} <span className="text-sm font-normal text-muted-foreground">Beds</span></h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Occupied Beds</span>
          <h3 className="text-[28px] font-bold text-emerald-600 mt-1">{counts.occupied} <span className="text-sm font-normal text-muted-foreground">Allocated</span></h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Vacant Beds</span>
          <h3 className="text-[28px] font-bold text-blue-600 mt-1">{counts.vacant} <span className="text-sm font-normal text-muted-foreground">Available</span></h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">On Notice</span>
          <h3 className="text-[28px] font-bold text-amber-600 mt-1">{counts.notice} <span className="text-sm font-normal text-muted-foreground">Moving out</span></h3>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Room Number, Bed ID, or Tenant Name..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Occupied", "Vacant", "On Notice"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all border ${
                filterStatus === status 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-white border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bed List Grid */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Bed ID</th>
                <th className="px-6 py-3.5 font-semibold">Room & Floor</th>
                <th className="px-6 py-3.5 font-semibold">Sharing Configuration</th>
                <th className="px-6 py-3.5 font-semibold">Current Tenant</th>
                <th className="px-6 py-3.5 font-semibold">Monthly Charges</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBeds.map((bed) => (
                <tr key={bed.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        <BedDouble size={14} />
                      </div>
                      <span className="font-semibold text-foreground">{bed.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">Room {bed.room}</div>
                    <div className="text-[11px] text-muted-foreground">{bed.floor}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{bed.type}</td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {bed.tenant || <span className="text-muted-foreground italic font-normal">No occupant</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    ₹{bed.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(bed.status)}`}>
                      {bed.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors"
                      title="Edit Bed"
                    >
                      <Edit3 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
