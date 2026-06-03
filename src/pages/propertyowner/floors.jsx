import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Layers, Plus, Edit3, Trash2, Eye, EyeOff, 
  Building, CheckCircle, BedDouble, UserPlus
} from "lucide-react";

export default function FloorsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [floors, setFloors] = useState([
    { id: "f1", name: "Ground Floor", code: "GF", totalRooms: 4, occupiedRooms: 3, totalBeds: 8, occupiedBeds: 6, status: "Active" },
    { id: "f2", name: "1st Floor", code: "FF", totalRooms: 6, occupiedRooms: 5, totalBeds: 12, occupiedBeds: 10, status: "Active" },
    { id: "f3", name: "2nd Floor", code: "SF", totalRooms: 5, occupiedRooms: 2, totalBeds: 10, occupiedBeds: 4, status: "Active" },
    { id: "f4", name: "3rd Floor", code: "TF", totalRooms: 4, occupiedRooms: 0, totalBeds: 8, occupiedBeds: 0, status: "Maintenance" }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorCode, setNewFloorCode] = useState("");

  const handleAddFloor = (e) => {
    e.preventDefault();
    if (!newFloorName || !newFloorCode) return;
    const newFloor = {
      id: "f" + (floors.length + 1),
      name: newFloorName,
      code: newFloorCode,
      totalRooms: 0,
      occupiedRooms: 0,
      totalBeds: 0,
      occupiedBeds: 0,
      status: "Active"
    };
    setFloors([...floors, newFloor]);
    setNewFloorName("");
    setNewFloorCode("");
    setShowAddModal(false);
  };

  const handleToggleStatus = (id) => {
    setFloors(prev => prev.map(f => f.id === id ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f));
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Floors Management" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Floors Management</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Configure floor layouts, count active rooms, and manage occupancy rates.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Add Floor
          </button>
        </div>
      </div>

      {/* Floors Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Floors</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">{floors.length} <span className="text-sm font-normal text-muted-foreground">Floors</span></h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Rooms</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">
            {floors.reduce((acc, f) => acc + f.totalRooms, 0)} <span className="text-sm font-normal text-muted-foreground">Rooms</span>
          </h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Bed Capacity</span>
          <h3 className="text-[28px] font-bold text-foreground mt-1">
            {floors.reduce((acc, f) => acc + f.totalBeds, 0)} <span className="text-sm font-normal text-muted-foreground">Beds</span>
          </h3>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft bg-blue-50/20">
          <span className="text-[12px] font-semibold text-blue-600 uppercase tracking-wider">Overall Occupancy</span>
          <h3 className="text-[28px] font-bold text-blue-600 mt-1">
            {Math.round((floors.reduce((acc, f) => acc + f.occupiedBeds, 0) / (floors.reduce((acc, f) => acc + f.totalBeds, 0) || 1)) * 100)}%
          </h3>
        </div>
      </div>

      {/* Floor List Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Floor Name</th>
                <th className="px-6 py-3.5 font-semibold">Floor Code</th>
                <th className="px-6 py-3.5 font-semibold">Rooms (Occupied / Total)</th>
                <th className="px-6 py-3.5 font-semibold">Beds (Occupied / Total)</th>
                <th className="px-6 py-3.5 font-semibold">Occupancy Rate</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {floors.map((floor) => {
                const occupancyRate = floor.totalBeds > 0 ? Math.round((floor.occupiedBeds / floor.totalBeds) * 100) : 0;
                return (
                  <tr key={floor.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                          <Layers size={16} />
                        </div>
                        <span className="font-semibold text-foreground">{floor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{floor.code}</td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {floor.occupiedRooms} / {floor.totalRooms}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {floor.occupiedBeds} / {floor.totalBeds}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${occupancyRate}%` }} />
                        </div>
                        <span className="font-bold text-[12px] text-foreground">{occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        floor.status === "Active" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {floor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleToggleStatus(floor.id)}
                        className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors"
                        title="Toggle Status"
                      >
                        {floor.status === "Active" ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button 
                        className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors"
                        title="Edit Floor"
                      >
                        <Edit3 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Floor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-serif text-[22px] text-foreground mb-4">Add New Floor</h3>
            <form onSubmit={handleAddFloor} className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Floor Name</label>
                <input 
                  type="text" 
                  value={newFloorName} 
                  onChange={(e) => setNewFloorName(e.target.value)}
                  placeholder="e.g. 4th Floor"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Floor Code</label>
                <input 
                  type="text" 
                  value={newFloorCode} 
                  onChange={(e) => setNewFloorCode(e.target.value)}
                  placeholder="e.g. 4F"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 rounded-xl border border-border text-xs font-bold hover:bg-muted"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  Create Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
