import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Calendar, Clock, CheckCircle2, ChevronRight, 
  Utensils, Sparkles
} from "lucide-react";

export default function WeeklyMenuPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [activeDay, setActiveDay] = useState("Monday");

  const weeklyData = {
    Monday: { breakfast: "Poha, Jalebi", lunch: "Dal Fry, Aloo Gobhi, Rice, Roti", dinner: "Paneer Butter Masala, Mix Veg" },
    Tuesday: { breakfast: "Aloo Paratha, Curd", lunch: "Rajma, Jeera Rice, Roti, Salad", dinner: "Egg Curry / Malai Kofta, Dal Tadka" },
    Wednesday: { breakfast: "Idli, Sambar, Coconut Chutney", lunch: "Kadi Pakoda, Rice, Bhindi Fry, Roti", dinner: "Chicken Masala / Shahi Paneer, Roti" },
    Thursday: { breakfast: "Chole Bhature", lunch: "Black Chana Dal, Mix Veg, Rice, Roti", dinner: "Mushroom Masala, Yellow Dal" },
    Friday: { breakfast: "Veg Cutlet, Toast, Tea", lunch: "Dal Makhani, Gobi Masala, Rice, Roti", dinner: "Kadhai Paneer, Veg Pulao, Roti" },
    Saturday: { breakfast: "Pav Bhaji", lunch: "Alu Paratha, Curd, Rice, Dal Fry", dinner: "Special Veg Biryani, Raita" },
    Sunday: { breakfast: "Poori Alu Sabji, Halwa", lunch: "Spl Chicken Curry / Kadhai Paneer, Jeera Rice", dinner: "Alu Shimla Mirch, Dal Moong" }
  };

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Weekly Kitchen Menu" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Weekly Menu</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage and edit the weekly recurring meal rotation menu schedules.</p>
        </div>
      </div>

      {/* Week Day Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border/60 pb-4">
        {Object.keys(weeklyData).map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 h-9 rounded-xl text-xs font-bold transition-all border ${
              activeDay === day 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Current Day Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">Breakfast</h3>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">07:30 AM - 09:30 AM</p>
            <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40">
              {weeklyData[activeDay].breakfast}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">Lunch</h3>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">12:30 PM - 02:30 PM</p>
            <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40">
              {weeklyData[activeDay].lunch}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
          <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="font-serif text-[20px] font-bold text-foreground">Dinner</h3>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">08:00 PM - 10:00 PM</p>
            <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40">
              {weeklyData[activeDay].dinner}
            </p>
          </div>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
