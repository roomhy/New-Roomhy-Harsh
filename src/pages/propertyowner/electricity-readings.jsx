import React, { useEffect, useState } from "react";
import { X, Plus, Zap, RotateCw, Calendar, Edit2, Trash2 } from "lucide-react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { getApiBase, fetchJson } from "../../utils/api";
import { toast } from "react-hot-toast";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function ElectricityReadings() {
  const [owner, setOwner] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [readingForm, setReadingForm] = useState({
    billingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
    currentReading: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const s = getOwnerRuntimeSession();
    if (!s?.loginId) { window.location.href = "/propertyowner/ownerlogin"; return; }
    setOwner(s);
    loadRooms(s.loginId);
  }, []);

  const loadRooms = async (loginId) => {
    setLoading(true);
    try {
      const data = await fetchJson(`/api/electricity/owner/${loginId}`);
      if (data.success) {
        setRooms(data.data);
      } else {
        toast.error("Failed to load meter data");
      }
    } catch (e) {
      toast.error("Error loading meter data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReading = async (e) => {
    e.preventDefault();
    if (!selectedRoom || !readingForm.currentReading || !readingForm.billingMonth) {
      toast.error("Please fill all fields");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        propertyId: selectedRoom.propertyId,
        roomNo: selectedRoom.roomNo,
        billingMonth: readingForm.billingMonth,
        currentReading: Number(readingForm.currentReading)
      };

      const res = await fetch(`${getApiBase()}/api/electricity/update-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Reading saved successfully!");
        setModalOpen(false);
        // Refresh data
        loadRooms(owner.loginId);
        
        // Update selected room explicitly so UI refreshes without re-selecting
        if (selectedRoom) {
          const updatedRooms = await fetchJson(`/api/electricity/owner/${owner.loginId}`);
          if (updatedRooms.success) {
            const updatedRoom = updatedRooms.data.find(r => r.roomId === selectedRoom.roomId);
            if (updatedRoom) setSelectedRoom(updatedRoom);
          }
        }
      } else {
        toast.error(data.message || "Failed to save reading");
      }
    } catch (e) {
      toast.error("Error saving reading");
    } finally {
      setSaving(false);
    }
  };

  const handleEditReading = (reading) => {
    setReadingForm({
      billingMonth: reading.billingMonth,
      currentReading: reading.currentReading
    });
    setModalOpen(true);
  };

  const handleDeleteReading = async (reading) => {
    if (!window.confirm(`Are you sure you want to delete the reading for ${reading.billingMonth}?`)) return;
    try {
      const data = await fetchJson(`/api/electricity/${reading._id}`, {
        method: "DELETE"
      });
      if (data.success) {
        toast.success("Reading deleted successfully!");
        loadRooms(owner.loginId);
        
        if (selectedRoom) {
          const updatedRooms = await fetchJson(`/api/electricity/owner/${owner.loginId}`);
          if (updatedRooms.success) {
            const updatedRoom = updatedRooms.data.find(r => r.roomId === selectedRoom.roomId);
            if (updatedRoom) setSelectedRoom(updatedRoom);
          }
        }
      } else {
        toast.error(data.message || "Failed to delete reading");
      }
    } catch (e) {
      toast.error("Error deleting reading");
    }
  };

  return (
    <PropertyOwnerLayout owner={owner} title="Electricity Readings" onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground mb-2">Electricity Readings</h1>
            <p className="text-[13.5px] text-muted-foreground">Log monthly meter readings for rooms automatically.</p>
          </div>
          <button onClick={() => owner && loadRooms(owner.loginId)} className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-[13px] font-medium">
            <RotateCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Room List */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft h-fit">
            <h2 className="text-[16px] font-semibold text-foreground mb-4">Rooms</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded-lg" />)}
                </div>
              ) : rooms.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No rooms found</p>
              ) : (
                rooms.map(room => (
                  <button key={room.roomId} onClick={() => setSelectedRoom(room)} 
                    className={cn("w-full text-left p-3 rounded-lg text-[13px] font-medium transition-all",
                      selectedRoom?.roomId === room.roomId
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    <div>Room {room.roomNo || "-"}</div>
                    <div className="text-[11px] opacity-75">{room.propertyTitle}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Readings & Bill */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedRoom ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
                <Zap size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
                <p className="text-[14px] font-medium text-foreground mb-1">Select a room</p>
                <p className="text-[12px] text-muted-foreground">Choose a room to view or log their monthly reading</p>
              </div>
            ) : (
              <>
                {/* Bill Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-[11px] text-muted-foreground mb-1">Previous Reading</div>
                    <div className="text-[22px] font-bold text-foreground">{selectedRoom.latest ? selectedRoom.latest.currentReading : 0}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-[11px] text-muted-foreground mb-1">Unit Cost</div>
                    <div className="text-[22px] font-bold text-foreground">₹{selectedRoom.latest?.unitCost || selectedRoom.roomUnitCost || 0}</div>
                  </div>
                </div>

                {/* Add Reading Button */}
                <button onClick={() => setModalOpen(true)} 
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90">
                  <Plus size={16} /> Log Current Reading
                </button>

                {/* Readings List */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="text-[14px] font-semibold text-foreground mb-4">Reading History</h3>
                  {!selectedRoom.history || selectedRoom.history.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground text-center py-4">No readings recorded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRoom.history.map((reading) => (
                        <div key={reading._id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg border border-border">
                          <div className="flex-1 group">
                            <div className="flex items-center gap-3">
                              <div className="text-[13px] font-semibold text-foreground flex items-center gap-1">
                                <Calendar size={14}/> {reading.billingMonth}
                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity ml-2">
                                  <button onClick={() => handleEditReading(reading)} className="p-1 text-muted-foreground hover:text-primary"><Edit2 size={12}/></button>
                                  <button onClick={() => handleDeleteReading(reading)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={12}/></button>
                                </div>
                              </div>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1">
                              Previous: {reading.previousReading} | Current: {reading.currentReading}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Units Consumed: {reading.unitsConsumed}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[14px] font-bold text-destructive">
                              ₹{(reading.totalBill || (reading.unitsConsumed * (reading.unitCost || selectedRoom.roomUnitCost || 0))).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              @₹{reading.unitCost || selectedRoom.roomUnitCost || 0}/unit
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Reading Modal */}
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm transition-all", modalOpen?"opacity-100 pointer-events-auto":"opacity-0 pointer-events-none")}>
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-[18px] font-semibold text-foreground">Add/Edit Current Reading</h2>
            <button onClick={() => setModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"><X size={20}/></button>
          </div>
          <form onSubmit={handleAddReading} className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Billing Month <span className="text-destructive">*</span></label>
              <input type="month" required className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-[13.5px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" value={readingForm.billingMonth} onChange={e=>setReadingForm(p=>({...p,billingMonth:e.target.value}))}/>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Current Meter Reading <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" required className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-[13.5px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Enter current reading" value={readingForm.currentReading} onChange={e=>setReadingForm(p=>({...p,currentReading:e.target.value}))}/>
              <p className="text-[10px] text-muted-foreground mt-1">Previous reading ({selectedRoom?.latest ? selectedRoom.latest.currentReading : 0}) will be automatically subtracted to calculate bill.</p>
            </div>
            <button type="submit" disabled={saving} className="w-full h-10 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 mt-2">
              {saving ? "Saving..." : "Save Reading & Generate Bill"}
            </button>
          </form>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
