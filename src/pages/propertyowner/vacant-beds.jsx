import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { useNavigate } from "react-router-dom";
import { 
  BedDouble, Search, Filter, Plus, ArrowRight, CheckCircle, 
  IndianRupee, Compass, Layers, Building
} from "lucide-react";

export default function VacantBedsPage() {
  const owner = getOwnerRuntimeSession();
  const navigate = useNavigate();

  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [sharingFilter, setSharingFilter] = useState("All");

  const vacantBedsData = [
    { id: "B-103B", room: "103", floor: "1st Floor", type: "Triple Sharing", price: 7000, property: "Silver Heights PG" },
    { id: "B-103C", room: "103", floor: "1st Floor", type: "Triple Sharing", price: 7000, property: "Silver Heights PG" },
    { id: "B-104A", room: "104", floor: "1st Floor", type: "Double Sharing", price: 8500, property: "Silver Heights PG" },
    { id: "B-104B", room: "104", floor: "1st Floor", type: "Double Sharing", price: 8500, property: "Silver Heights PG" },
    { id: "B-203B", room: "203", floor: "2nd Floor", type: "Double Sharing", price: 8500, property: "Silver Heights PG" },
    { id: "B-204C", room: "204", floor: "2nd Floor", type: "Triple Sharing", price: 7000, property: "Silver Heights PG" }
  ];

  const filteredBeds = vacantBedsData.filter(bed => {
    const matchesSearch = !search || 
      (bed.room || "").includes(search) || 
      (bed.id || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesSharing = sharingFilter === "All" || bed.type.includes(sharingFilter);
    
    return matchesSearch && matchesSharing;
  });

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Vacant Beds" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Vacant Beds Registry</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Real-time inventory of unallocated beds available for immediate check-in.</p>
        </div>
      </div>

      {/* Grid of Vacant Beds */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Room Number or Bed ID..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Single", "Double", "Triple"].map((sharing) => (
            <button
              key={sharing}
              onClick={() => setSharingFilter(sharing)}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all border ${
                sharingFilter === sharing 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-white border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {sharing} Sharing
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeds.map((bed) => (
          <div key={bed.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <BedDouble size={20} />
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Available
                </span>
              </div>

              <div className="space-y-1.5 mb-6">
                <h3 className="font-serif text-[22px] text-foreground font-bold">Bed {bed.id}</h3>
                <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <Layers size={14} className="text-muted-foreground/60" /> Room {bed.room} • {bed.floor}
                </p>
                <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <Compass size={14} className="text-muted-foreground/60" /> {bed.type}
                </p>
                <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                  <Building size={14} className="text-muted-foreground/60" /> {bed.property}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sharing Cost</span>
                <p className="text-[18px] font-bold text-foreground">₹{bed.price.toLocaleString("en-IN")}<span className="text-[12px] font-normal text-muted-foreground">/mo</span></p>
              </div>
              <button 
                onClick={() => navigate("/propertyowner/tenantrec")}
                className="inline-flex items-center gap-1.5 px-4.5 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 transition-all"
              >
                Book Bed <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
