import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { apiFetch } from "../../utils/api";
import { 
  FileImage, Search, Download, CheckCircle2, 
  ArrowUpRight, Image as ImageIcon, Loader2, Plus, Trash2
} from "lucide-react";

export default function BannersPostersPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [categoryVal, setCategoryVal] = useState("");
  const [sizeVal, setSizeVal] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  React.useEffect(() => {
    fetchAssets();
  }, [owner.loginId]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/marketing-assets/owner/${owner.loginId}`);
      if (res && res.success) {
        setAssets(res.assets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!nameVal || !categoryVal) return;
    setIsBusy(true);
    try {
      const res = await apiFetch("/api/marketing-assets", {
        method: "POST",
        body: JSON.stringify({
          ownerLoginId: owner.loginId,
          name: nameVal,
          category: categoryVal,
          size: sizeVal
        })
      });
      if (res && res.success) {
        setAssets([res.asset, ...assets]);
        setNameVal("");
        setCategoryVal("");
        setSizeVal("");
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this asset?")) return;
    try {
      const res = await apiFetch(`/api/marketing-assets/${id}`, { method: "DELETE" });
      if (res && res.success) {
        setAssets(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Printable Media Templates" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Banners &amp; Posters</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Download pre-designed WiFi password sheets, hostel guidelines flyers, and notice board printables.</p>
          <div className="flex items-center gap-2 md:mt-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Upload New Poster
          </button>
        </div>
      </div>
      </div>

      {/* Grid of Posters */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 flex flex-col items-center">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading assets...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No marketing assets found. Click "Upload New Poster" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset._id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {asset.size}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-[21px] font-bold text-foreground leading-tight">{asset.name}</h3>
                  <p className="text-[12.5px] text-muted-foreground mt-1">{asset.category}</p>
                </div>
              </div>

              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                <button className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5">
                  <Download size={14} /> Download
                </button>
                <button 
                  onClick={() => handleDelete(asset._id)}
                  className="size-10 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="font-serif text-[22px] text-foreground mb-4">Upload New Poster</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Asset Name</label>
                <input 
                  type="text" 
                  value={nameVal} 
                  onChange={(e) => setNameVal(e.target.value)}
                  placeholder="e.g. Eco Stay poster"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Category</label>
                <input 
                  type="text" 
                  value={categoryVal} 
                  onChange={(e) => setCategoryVal(e.target.value)}
                  placeholder="e.g. Corridors posters"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Format/Size</label>
                <input 
                  type="text" 
                  value={sizeVal} 
                  onChange={(e) => setSizeVal(e.target.value)}
                  placeholder="e.g. A3 Wall print"
                  className="w-full h-10 px-3 border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  disabled={isBusy}
                  className="flex-1 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isBusy ? "Uploading..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
