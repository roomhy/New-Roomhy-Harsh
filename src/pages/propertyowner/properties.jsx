import React, { useEffect, useState } from "react";
import { fetchJson, getApiBase, getAuthHeader } from "../../utils/api";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { requireOwnerSession } from "../../utils/ownerSession";
import { fetchOwnerProperties } from "../../utils/propertyowner";
import {
  Plus, MapPin, BedDouble, IndianRupee, ArrowRight, Search, Star, Check, Tv, Wifi, Wind, Zap, Edit, Eye, ShieldCheck, Home, X, Mail
} from "lucide-react";

const Pill = ({ tone = "muted", children }) => {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success-foreground",
    warning: "bg-warning/20 text-foreground",
    info: "bg-info/15 text-foreground",
    danger: "bg-destructive/15 text-destructive",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${toneMap[tone] || toneMap.muted}`}>
      {children}
    </span>
  );
};

export default function Properties() {
  const [owner, setOwner] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [viewProperty, setViewProperty] = useState(null);
  const [editProperty, setEditProperty] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editRequestMsg, setEditRequestMsg] = useState("");
  const [requestSending, setRequestSending] = useState(false);
  const [requestResult, setRequestResult] = useState(null);

  const handleEditClick = (p) => {
    setEditProperty(p);
    setEditFormData({
      title: p.title || p.name || "",
      rent: p.rent || p.monthlyRent || "",
      discount: p.discount || 0,
      city: p.city || "",
      locality: p.locality || "",
      address: p.address || "",
      type: p.type || p.propertyType || "PG",
      gender: p.gender || "any",
      status: p.status || "active",
      isLiveOnWebsite: p.isLiveOnWebsite || false,
      latitude: p.latitude || "",
      longitude: p.longitude || "",
      landmark: p.landmark || "",
      description: p.description || "",
      images: p.images || p.professionalPhotos || [p.image].filter(Boolean) || [],
      propertyViews: p.propertyViews || [{ label: "Main", images: [] }]
    });
    setEditRequestMsg("");
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePropertyImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
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
        return data.url;
      });
      const urls = await Promise.all(uploadPromises);
      setEditFormData(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch (err) {
      alert("Failed to upload image: " + err.message);
    }
  };

  const handleViewUpload = async (e, viewIndex) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const uploadedUrls = [];
    for (const file of files) {
      const data = new FormData();
      data.append("image", file);
      try {
        const base = getApiBase();
        const res = await fetch(`${base}/api/upload`, { 
          method: "POST", 
          body: data,
          headers: getAuthHeader()
        });
        
        let json;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          json = await res.json();
        } else {
          const text = await res.text();
          throw new Error(text || `HTTP error ${res.status}`);
        }
        
        if (res.ok && json.url) {
          uploadedUrls.push(json.url);
        } else {
          console.error("Upload failed", json?.error || "Empty response");
        }
      } catch (err) { console.error(err); }
    }
    setEditFormData(prev => {
      const newViews = [...(prev.propertyViews || [])];
      newViews[viewIndex] = {
         ...newViews[viewIndex],
         images: [...(newViews[viewIndex].images || []), ...uploadedUrls]
      };
      return { ...prev, propertyViews: newViews };
    });
  };

  const addCustomView = () => {
    setEditFormData(prev => ({
      ...prev,
      propertyViews: [...(prev.propertyViews || []), { label: "New Category", images: [] }]
    }));
  };

  const handleEditRequest = async () => {
    if (!editProperty) return;
    setRequestSending(true);
    setRequestResult(null);
    try {
      await fetchJson("/api/notifications", {
        method: "POST",
        body: JSON.stringify({
          toRole: "superadmin",
          from: owner?.name || owner?.loginId || "Property Owner",
          type: "edit_request",
          meta: {
            propertyId: editProperty._id,
            propertyName: editProperty.title || editProperty.name,
            ownerLoginId: owner?.loginId,
            message: editRequestMsg,
            updatedData: editFormData
          }
        })
      });
      setRequestResult({ success: true, message: "Edit request sent to Superadmin successfully!" });
      setTimeout(() => {
        setEditProperty(null);
        setEditRequestMsg("");
        setEditFormData({});
        setRequestResult(null);
      }, 2000);
    } catch (err) {
      setRequestResult({ success: false, message: err?.body || err?.message || "Failed to send request" });
    } finally {
      setRequestSending(false);
    }
  };

  useEffect(() => {
    const session = requireOwnerSession();
    if (!session) return;
    setOwner(session);
    const load = async () => {
      try {
        const props = await fetchOwnerProperties(session.loginId);
        setProperties(props);
      } catch (err) {
        setErrorMsg(err?.body || err?.message || "Failed to load properties.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filters = ["All", "PG", "Hostel", "Flat"];
  const filtered = properties.filter(p => {
    const pType = String(p.type || p.propertyType || p.category || "").toLowerCase();
    const matchFilter = filter === "All" || pType === filter.toLowerCase() || pType.includes(filter.toLowerCase());
    const matchSearch = !search || (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) || (p.city || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const formatPropertyValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (Array.isArray(val)) {
      return val.map(item => {
        if (typeof item === 'object' && item !== null) {
          return item.name || item.title || item.label || Object.values(item).filter(v => typeof v === 'string').join(' ') || JSON.stringify(item);
        }
        return String(item);
      }).join(', ');
    }
    if (typeof val === 'object' && val !== null) {
      return Object.entries(val)
        .filter(([_, v]) => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0))
        .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v}`)
        .join(', ');
    }
    return String(val);
  };

  return (
    <PropertyOwnerLayout owner={owner} title="Properties" onLogout={() => { window.location.href = "/propertyowner/ownerlogin"; }}>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Your properties</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage all your PGs, hostels and flats from one place.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <a href="/propertyowner/add-property" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity">
            <Plus className="size-4" /> Add property
          </a>
        </div>
      </div>

      {errorMsg && <div className="text-sm text-destructive mb-4 bg-destructive/10 px-4 py-3 rounded-lg">{errorMsg}</div>}

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or city…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          {filters.map((f, i) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                "h-10 px-3.5 rounded-lg text-[12.5px] font-medium border transition-colors",
                filter === f ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:border-primary/40 text-muted-foreground"
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft animate-pulse">
              <div className="h-40 bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-2 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 shadow-soft flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mb-4">
            <BedDouble className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-[22px] text-foreground mb-1">No properties found</h3>
          <p className="text-[13.5px] text-muted-foreground mb-4">Add your first property to get started.</p>
          <a href="/propertyowner/add-property" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90">
            <Plus className="size-4" /> Add property
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((p) => {
            const occupied = p.occupiedBeds ?? p.tenantCount ?? 0;
            const total = p.totalBeds ?? p.roomCount ?? 1;
            const occ = Math.round((occupied / Math.max(total, 1)) * 100);
            const actualRent = p.monthlyRent || p.rent || 0;
            const discountAmount = p.discount || 0;
            const hasDiscount = discountAmount > 0;
            const originalPrice = hasDiscount ? (actualRent + discountAmount) : actualRent;
            const discountPercent = hasDiscount ? Math.round((discountAmount / originalPrice) * 100) : 0;
            
            const amenities = p.amenities && p.amenities.length > 0 ? p.amenities : [];
            
            const displayImage = p.image || (p.images && p.images.length > 0 ? p.images[0] : null) || (p.professionalPhotos && p.professionalPhotos.length > 0 ? p.professionalPhotos[0] : null);

            return (
              <div
                key={p._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all border border-border hover:border-primary/30 overflow-hidden md:h-[185px] cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Image Section */}
                  <div className="w-full md:w-[280px] h-48 md:h-full flex-shrink-0 relative border-b md:border-b-0 md:border-r border-border">
                    <div className="w-full h-full overflow-hidden relative">
                      {displayImage ? (
                        <img 
                          src={displayImage} 
                          alt={p.title || p.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                          <Home className="size-10 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-foreground/80 text-background text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </div>
                    </div>
                  </div>

                  {/* Main Info Section */}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                         <h3 className="text-[19px] font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                           {p.title || p.name || "Property"}
                         </h3>
                         {p.rating && (
                           <div className="bg-success/90 text-success-foreground px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-bold shadow-sm shrink-0">
                             {p.rating} <Star className="w-3 h-3 fill-current" />
                           </div>
                         )}
                      </div>
                      
                      <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.city || p.area || "Indore"}
                      </p>
                      
                      {/* Amenities Row */}
                      {amenities.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground font-medium py-1">
                          {amenities.slice(0, 4).map((amn, i) => (
                            <div key={i} className="flex items-center gap-1.5 shrink-0">
                              <Check className="w-3 h-3" />
                              <span>{typeof amn === 'string' ? amn : amn.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                          {p.gender || "Any"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {p.type || "PG"}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                          Premium
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom Status */}
                    <div className="mt-4 md:mt-auto pt-3 border-t border-border/60">
                      <div className="flex items-center justify-between text-[11.5px] font-semibold text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Occupancy: {occ}%</div>
                          <div className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" /> {occupied}/{total} beds</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions Section */}
                  <div className="w-full md:w-[220px] flex flex-col justify-between border-t md:border-t-0 md:border-l border-border p-4 bg-muted/20 shrink-0">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-2">
                        {hasDiscount && (
                          <span className="text-[13px] text-muted-foreground line-through font-medium">₹{originalPrice.toLocaleString()}</span>
                        )}
                        <div className="text-[22px] font-black text-foreground tracking-tight">₹{actualRent.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        {hasDiscount && (
                          <div className="text-[11px] font-bold text-success bg-success/15 px-1.5 py-0.5 rounded">{discountPercent}% off</div>
                        )}
                        <p className="text-[10px] text-muted-foreground font-medium">+ taxes & fees</p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full mt-4 md:mt-0">
                      <button 
                        onClick={() => setViewProperty(p)}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 border border-border text-foreground font-bold rounded-lg hover:bg-muted text-[11px] transition-all bg-card"
                      >
                        <Eye className="size-3.5" /> View
                      </button>
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-foreground text-background font-bold rounded-lg text-[11px] hover:opacity-90 transition-all shadow-sm"
                      >
                        <Edit className="size-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mt-5 text-[12.5px] text-muted-foreground">
          Total: <span className="font-medium text-foreground">{filtered.length} properties</span>
        </div>
      )}

      {/* View Property Modal */}
      {viewProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold font-serif">{viewProperty.title || viewProperty.name}</h2>
              <button onClick={() => setViewProperty(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {viewProperty.image || (viewProperty.images && viewProperty.images.length > 0) ? (
                <img src={viewProperty.image || viewProperty.images[0]} alt="Property" className="w-full h-64 object-cover rounded-xl" />
              ) : (
                <div className="w-full h-64 bg-muted flex items-center justify-center rounded-xl">
                  <Home className="size-16 text-muted-foreground/30" />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
                {Object.entries(viewProperty)
                  .filter(([k, v]) => {
                    if (['_id', 'id', '__v', 'owner', 'ownerLoginId', 'images', 'image', 'professionalPhotos', 'createdAt', 'updatedAt'].includes(k)) return false;
                    if (v === null || v === undefined || v === '') return false;
                    if (Array.isArray(v) && v.length === 0) return false;
                    if (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length === 0) return false;
                    if (formatPropertyValue(v) === '') return false;
                    return true;
                  })
                  .map(([k, v]) => (
                    <div key={k} className="space-y-1">
                      <span className="text-muted-foreground capitalize font-medium">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="font-medium bg-muted/20 p-2.5 rounded-lg border border-border/50 text-foreground break-words max-h-32 overflow-y-auto">
                        {formatPropertyValue(v) || 'N/A'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
              <button onClick={() => setViewProperty(null)} className="px-5 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {editProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-background/80 backdrop-blur border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Edit className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif leading-none">Edit Property</h2>
                  <p className="text-xs text-muted-foreground mt-1">Changes require Superadmin approval</p>
                </div>
              </div>
              <button onClick={() => setEditProperty(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="size-5" />
              </button>
            </div>
             <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Property Name</label>
                      <input type="text" name="title" value={editFormData.title} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Rent Amount</label>
                      <input type="number" name="rent" value={editFormData.rent} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Property Type</label>
                      <select name="type" value={editFormData.type} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="PG">PG</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Flat">Flat</option>
                        <option value="Room">Room</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Discount (₹)</label>
                      <input type="number" name="discount" value={editFormData.discount} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Gender Restriction</label>
                      <select name="gender" value={editFormData.gender} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="any">Any / Unisex</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">City</label>
                      <input type="text" name="city" value={editFormData.city} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Locality / Area</label>
                      <input type="text" name="locality" value={editFormData.locality} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Address</label>
                      <input type="text" name="address" value={editFormData.address} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Landmark</label>
                      <input type="text" name="landmark" value={editFormData.landmark} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Latitude</label>
                      <input type="number" step="any" name="latitude" value={editFormData.latitude} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Longitude</label>
                      <input type="number" step="any" name="longitude" value={editFormData.longitude} onChange={handleEditFormChange} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                      <label className="flex items-center gap-2 text-sm font-medium">
                         <input type="checkbox" name="isLiveOnWebsite" checked={editFormData.isLiveOnWebsite} onChange={(e) => setEditFormData(p => ({...p, isLiveOnWebsite: e.target.checked}))} className="rounded border-border text-primary focus:ring-primary" />
                         Live on Website (Subject to Approval)
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Description</label>
                      <textarea name="description" value={editFormData.description} onChange={handleEditFormChange} rows={3} className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Images (Main, Front, Room Views)</label>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {(editFormData.images || []).map((imgUrl, i) => (
                           <div key={i} className="relative group">
                             <img src={imgUrl} alt={`img-${i}`} className="w-16 h-16 object-cover rounded-lg border border-border" />
                             <button type="button" onClick={() => setEditFormData(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                               <X className="size-3" />
                             </button>
                           </div>
                        ))}
                      </div>
                      <input type="file" multiple accept="image/*" onChange={handlePropertyImageUpload} className="w-full p-2 rounded-lg border border-dashed border-border/60 bg-muted/30 text-sm focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                    </div>

                    <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium">Categorized Property Images</label>
                        <button type="button" onClick={addCustomView} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                          <Plus className="size-3" /> Add Category
                        </button>
                      </div>

                      {(editFormData.propertyViews || []).map((pv, index) => (
                        <div key={index} className="bg-muted/20 rounded-xl p-4 border border-border relative mb-4">
                          <button type="button" onClick={() => setEditFormData(prev => ({...prev, propertyViews: prev.propertyViews.filter((_, i) => i !== index)}))} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive p-1">
                             <X className="size-4" />
                          </button>
                          <div className="mb-3 w-3/4">
                             <input 
                               value={pv.label} 
                               onChange={(e) => {
                                 setEditFormData(prev => {
                                   const newViews = [...prev.propertyViews];
                                   newViews[index] = { ...newViews[index], label: e.target.value };
                                   return { ...prev, propertyViews: newViews };
                                 });
                               }}
                               placeholder="e.g. Main, Room, Interior, Building"
                               className="w-full bg-transparent border-b border-border focus:border-primary text-sm font-semibold uppercase tracking-wider outline-none py-1 transition-colors"
                             />
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                             {(pv.images || []).map((img, i) => (
                                <div key={i} className="relative group/img">
                                   <img src={img} className="w-16 h-16 object-cover rounded-lg border border-border" alt="" />
                                   <button type="button" onClick={() => {
                                     setEditFormData(prev => {
                                       const newViews = [...prev.propertyViews];
                                       newViews[index].images = newViews[index].images.filter((_, imgI) => imgI !== i);
                                       return { ...prev, propertyViews: newViews };
                                     });
                                   }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity">
                                      <X className="size-3" />
                                   </button>
                                </div>
                             ))}
                             <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleViewUpload(e, index)} />
                                <Plus className="size-5 text-muted-foreground" />
                             </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-1.5">Reason for Edit (Optional)</label>
                    <textarea 
                      value={editRequestMsg}
                      onChange={(e) => setEditRequestMsg(e.target.value)}
                      placeholder="Why are you making these changes?"
                      className="w-full p-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      rows={2}
                    ></textarea>
                  </div>
                  
                  {requestResult && (
                    <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${requestResult.success ? 'bg-success/10 text-success-foreground' : 'bg-destructive/10 text-destructive'}`}>
                      {requestResult.success ? <Check className="size-4 shrink-0 mt-0.5" /> : <X className="size-4 shrink-0 mt-0.5" />}
                      <p>{requestResult.message}</p>
                    </div>
                  )}
                </div>
             </div>
             
             <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  onClick={() => setEditProperty(null)} 
                  disabled={requestSending}
                  className="px-5 py-2 hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEditRequest}
                  disabled={requestSending || requestResult?.success}
                  className="px-5 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                >
                  {requestSending ? "Sending..." : "Submit Edit Request"} <Mail className="size-4" />
                </button>
             </div>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
