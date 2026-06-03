import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Plus, Search, CheckCircle2, ChevronRight, 
  Utensils, Sparkles, BookOpen
} from "lucide-react";

export default function DailyMenuPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [published, setPublished] = useState(false);
  const [meals, setMeals] = useState([
    { id: 1, type: "Breakfast", time: "07:30 AM - 09:30 AM", items: "Poha, Jalebi, Tea, Milk", status: "Published" },
    { id: 2, type: "Lunch", time: "12:30 PM - 02:30 PM", items: "Dal Fry, Aloo Gobhi, Tandoori Roti, Rice, Salad", status: "Published" },
    { id: 3, type: "Evening Snacks", time: "05:00 PM - 06:00 PM", items: "Samosa, Green Chutney, Tea", status: "Published" },
    { id: 4, type: "Dinner", time: "08:00 PM - 10:00 PM", items: "Paneer Butter Masala, Mix Veg, Butter Roti, Rice, Kheer", status: "Draft" }
  ]);

  const handlePublish = (id) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, status: "Published" } : m));
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Daily Kitchen Menu" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Daily Menu</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Publish today's kitchen menu items for resident breakfast, lunch, snacks, and dinner.</p>
        </div>
      </div>

      {/* Grid of Meals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meals.map((meal) => (
          <div key={meal.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Utensils size={20} />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                  meal.status === "Published" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}>
                  {meal.status}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{meal.type}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">{meal.time}</p>
                <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40">
                  {meal.items}
                </p>
              </div>
            </div>

            {meal.status === "Draft" && (
              <div className="border-t border-border/60 mt-6 pt-4 flex gap-2">
                <button 
                  onClick={() => handlePublish(meal.id)}
                  className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Publish Menu to App
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
