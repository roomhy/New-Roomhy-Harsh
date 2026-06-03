import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Wifi, Flame, Tv, Wind, ShieldCheck, Dumbbell, Coffee, 
  Trash2, Plus, Edit3, CheckCircle2, AlertCircle
} from "lucide-react";

export default function AmenitiesPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [amenities, setAmenities] = useState([
    { id: 1, name: "High-Speed WiFi", icon: Wifi, billing: "Free", rooms: 15, active: true },
    { id: 2, name: "Air Conditioning", icon: Wind, billing: "₹1,500/month", rooms: 8, active: true },
    { id: 3, name: "Geyser & Hot Water", icon: Flame, billing: "Free", rooms: 15, active: true },
    { id: 4, name: "Power Backup (UPS)", icon: ShieldCheck, billing: "Free", rooms: 15, active: true },
    { id: 5, name: "Professional Gym", icon: Dumbbell, billing: "₹500/month", rooms: 4, active: false },
    { id: 6, name: "Daily Meal Plan", icon: Coffee, billing: "₹3,000/month", rooms: 12, active: true }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newBilling, setNewBilling] = useState("Free");

  const handleAddOrEditAmenity = (e) => {
    e.preventDefault();
    if (!newName) return;
    
    if (isEditMode) {
      setAmenities(prev => prev.map(a => a.id === editId ? { ...a, name: newName, billing: newBilling } : a));
    } else {
      const newAmenity = {
        id: amenities.length > 0 ? Math.max(...amenities.map(a => a.id)) + 1 : 1,
        name: newName,
        icon: Wifi,
        billing: newBilling,
        rooms: 0,
        active: true
      };
      setAmenities([...amenities, newAmenity]);
    }
    setNewName("");
    setNewBilling("Free");
    setShowAddModal(false);
    setIsEditMode(false);
    setEditId(null);
  };

  const handleDeleteAmenity = (id) => {
    if (window.confirm("Are you sure you want to delete this amenity?")) {
      setAmenities(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleOpenEdit = (amenity) => {
    setNewName(amenity.name);
    setNewBilling(amenity.billing);
    setEditId(amenity.id);
    setIsEditMode(true);
    setShowAddModal(true);
  };

  const handleToggleActive = (id) => {
    setAmenities(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Amenities Configurator" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Amenities Configurator</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Define facility options, monthly sub-billing surcharges, and tenant usage metrics.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button 
            onClick={() => {
              setNewName("");
              setNewBilling("Free");
              setIsEditMode(false);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Add Amenity
          </button>
        </div>
      </div>

      {/* Grid of Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => {
          const IconComponent = amenity.icon;
          return (
            <div 
              key={amenity.id} 
              className={`rounded-2xl border bg-card p-6 shadow-soft transition-all ${
                amenity.active ? "border-border" : "border-border/40 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <IconComponent size={20} />
                </div>
                <button 
                  onClick={() => handleToggleActive(amenity.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    amenity.active 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {amenity.active ? "Active" : "Disabled"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-[19px] font-bold text-foreground">{amenity.name}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-1">Currently used in <strong className="text-foreground">{amenity.rooms} Rooms</strong></p>
                </div>

                <div className="border-t border-border/60 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Billing Cost</span>
                    <span className="font-bold text-[14px] text-foreground">{amenity.billing}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEdit(amenity)} className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary inline-flex items-center justify-center transition-colors" title="Edit">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDeleteAmenity(amenity.id)} className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive inline-flex items-center justify-center transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Amenity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-serif text-[22px] text-foreground mb-4">{isEditMode ? "Edit Amenity" : "Add New Amenity"}</h3>
            <form onSubmit={handleAddOrEditAmenity} className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Amenity Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Laundry Service"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Monthly Cost</label>
                <input 
                  type="text" 
                  value={newBilling} 
                  onChange={(e) => setNewBilling(e.target.value)}
                  placeholder="e.g. Free or ₹500/month"
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
                  {isEditMode ? "Save Changes" : "Add Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
