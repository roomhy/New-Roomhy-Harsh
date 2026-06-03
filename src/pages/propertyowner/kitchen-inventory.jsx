import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  ClipboardList, Search, Plus, Trash2, Edit3, 
  CheckCircle2, AlertCircle, ShoppingCart
} from "lucide-react";

export default function KitchenInventoryPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [inventory, setInventory] = useState([
    { id: 1, item: "Basmati Rice", category: "Grains", stock: 120, unit: "KG", status: "In Stock" },
    { id: 2, item: "Amul Butter", category: "Dairy", stock: 8, unit: "KG", status: "Low Stock" },
    { id: 3, item: "Refined Sunflower Oil", category: "Groceries", stock: 45, unit: "Litre", status: "In Stock" }
  ]);

  const handleRestock = (id) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: item.stock + 50, status: "In Stock" } : item));
  };

  const filteredInventory = inventory.filter(item => 
    item.item.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Kitchen Rations Ledger" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Kitchen Inventory</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Monitor dry rations stocks, milk packets, grocery items, and set low stock reorder thresholds.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search kitchen stocks by item name or category..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ClipboardList size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  item.status === "In Stock" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                }`}>
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{item.item}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">{item.category}</p>
              </div>

              <div className="border-t border-border/60 pt-4 flex justify-between items-center text-xs text-muted-foreground">
                <span>Available Quantity:</span>
                <span className="font-bold text-slate-800">{item.stock} {item.unit}</span>
              </div>
            </div>

            <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
              <button 
                onClick={() => handleRestock(item.id)}
                className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5"
              >
                <ShoppingCart size={14} /> Quick Restock (+50)
              </button>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
