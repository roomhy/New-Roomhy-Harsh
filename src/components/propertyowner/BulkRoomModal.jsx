import React, { useState } from "react";
import { X, Copy, Trash2, Plus, Building2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const cn = (...c) => c.filter(Boolean).join(" ");

export default function BulkRoomModal({ isOpen, onClose, propertyId, onSave, isSaving }) {
  const [startRoomNo, setStartRoomNo] = useState("");
  const [count, setCount] = useState("");
  const [floor, setFloor] = useState("");
  const [generatedRooms, setGeneratedRooms] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [globalType, setGlobalType] = useState("AC");
  const [globalRent, setGlobalRent] = useState("");
  const [globalBeds, setGlobalBeds] = useState("2");
  const [globalSharing, setGlobalSharing] = useState("Double Sharing");

  if (!isOpen) return null;

  const handleGenerate = () => {
    const sRoom = parseInt(startRoomNo);
    const numRooms = parseInt(count);
    if (isNaN(sRoom) || isNaN(numRooms) || numRooms <= 0 || numRooms > 100) {
      toast.error("Please enter valid start room number and count (max 100).");
      return;
    }
    
    const newRooms = Array.from({ length: numRooms }, (_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: String(sRoom + i),
      roomNo: String(sRoom + i),
      floor: floor,
      type: globalType,
      rent: globalRent,
      beds: globalBeds,
      sharingType: globalSharing,
      unitType: "Room",
      isAvailable: true
    }));
    
    setGeneratedRooms(newRooms);
    setHasGenerated(true);
  };

  const handleApplyToAll = () => {
    if (generatedRooms.length === 0) return;
    setGeneratedRooms(prev => prev.map(r => ({
      ...r,
      type: globalType,
      rent: globalRent,
      beds: globalBeds,
      sharingType: globalSharing
    })));
    toast.success("Settings applied to all staged rooms");
  };

  const handleUpdateRoom = (id, field, value) => {
    setGeneratedRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleDeleteRoom = (id) => {
    setGeneratedRooms(prev => prev.filter(r => r.id !== id));
  };

  const handleSave = () => {
    if (generatedRooms.length === 0) {
      toast.error("No rooms to save.");
      return;
    }
    // Validation
    for (const r of generatedRooms) {
      if (!r.title) {
        toast.error("Room number is required for all rows.");
        return;
      }
    }
    onSave(generatedRooms);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 transition-all p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Building2 size={16} />
          </div>
          <h2 className="text-[18px] font-bold text-slate-800 flex-1">Bulk Room Generator</h2>
          <button type="button" onClick={onClose} disabled={isSaving} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasGenerated ? (
            <div className="max-w-md mx-auto space-y-5">
              <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm mb-6 border border-blue-100">
                Generate multiple rooms at once. Enter a start number (e.g. 501) and count (e.g. 10) to generate rooms 501 to 510 instantly.
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Floor</label>
                <select 
                  value={floor} 
                  onChange={e => setFloor(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Floor (Optional)</option>
                  <option value="Ground Floor">Ground Floor</option>
                  {Array.from({length: 15}, (_, i) => i + 1).map(f => (
                    <option key={f} value={`${f}${f === 1 ? 'st' : f === 2 ? 'nd' : f === 3 ? 'rd' : 'th'} Floor`}>
                      {f}{f === 1 ? 'st' : f === 2 ? 'nd' : f === 3 ? 'rd' : 'th'} Floor
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Room No.</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 101"
                    value={startRoomNo}
                    onChange={e => setStartRoomNo(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Rooms to Create</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 10"
                    value={count}
                    onChange={e => setCount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-slate-800 transition-colors mt-4"
              >
                Generate Rooms Preview
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Global Settings */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Copy size={16} className="text-blue-600" />
                  Quick Apply to All Generated Rooms
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Room Type</label>
                    <select value={globalType} onChange={e=>setGlobalType(e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500">
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                      <option value="Cooler">Cooler</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Beds (Capacity)</label>
                    <input type="number" value={globalBeds} onChange={e=>setGlobalBeds(e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500"/>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Sharing Type</label>
                    <select value={globalSharing} onChange={e=>setGlobalSharing(e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500">
                      <option value="Single Sharing">Single</option>
                      <option value="Double Sharing">Double</option>
                      <option value="Triple Sharing">Triple</option>
                      <option value="Four Sharing">Four+</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Rent / Bed (₹)</label>
                    <input type="number" value={globalRent} onChange={e=>setGlobalRent(e.target.value)} className="w-full border rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-500" placeholder="e.g. 5000"/>
                  </div>
                  <div className="md:col-span-1">
                    <button onClick={handleApplyToAll} className="w-full bg-blue-600 text-white rounded-lg py-1.5 text-sm font-semibold hover:bg-blue-700 transition-colors h-[34px]">
                      Apply to All
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated Rooms Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700 w-24">Room No.</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 w-32">Type</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 w-24">Beds</th>
                      <th className="px-4 py-3 font-semibold text-slate-700">Sharing</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 w-32">Rent (₹)</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedRooms.map((r, i) => (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <input value={r.title} onChange={e=>handleUpdateRoom(r.id, 'title', e.target.value)} className="w-full border rounded px-2 py-1 bg-white font-bold" />
                        </td>
                        <td className="px-4 py-2">
                          <select value={r.type} onChange={e=>handleUpdateRoom(r.id, 'type', e.target.value)} className="w-full border rounded px-2 py-1 bg-white">
                            <option value="AC">AC</option>
                            <option value="Non-AC">Non-AC</option>
                            <option value="Cooler">Cooler</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" value={r.beds} onChange={e=>handleUpdateRoom(r.id, 'beds', e.target.value)} className="w-full border rounded px-2 py-1 bg-white text-center" />
                        </td>
                        <td className="px-4 py-2">
                          <select value={r.sharingType} onChange={e=>handleUpdateRoom(r.id, 'sharingType', e.target.value)} className="w-full border rounded px-2 py-1 bg-white">
                            <option value="Single Sharing">Single</option>
                            <option value="Double Sharing">Double</option>
                            <option value="Triple Sharing">Triple</option>
                            <option value="Four Sharing">Four+</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input type="number" value={r.rent} onChange={e=>handleUpdateRoom(r.id, 'rent', e.target.value)} className="w-full border rounded px-2 py-1 bg-white text-right" placeholder="0" />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={()=>handleDeleteRoom(r.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {generatedRooms.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-slate-500">All rooms deleted. Please go back and generate again.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            {hasGenerated && `${generatedRooms.length} rooms staged to be created.`}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                if(hasGenerated) { setHasGenerated(false); setGeneratedRooms([]); }
                else onClose();
              }} 
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              {hasGenerated ? "Back" : "Cancel"}
            </button>
            {hasGenerated && (
              <button 
                onClick={handleSave} 
                disabled={isSaving || generatedRooms.length === 0}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm shadow-blue-600/20"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Save {generatedRooms.length} Rooms
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
