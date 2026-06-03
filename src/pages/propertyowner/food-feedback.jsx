import React, { useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { 
  Star, Search, CheckCircle2, MessageSquare, 
  Sparkles, ShieldCheck
} from "lucide-react";

export default function FoodFeedbackPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") { 
    window.location.href = "/propertyowner/ownerlogin"; 
    return null; 
  }

  const [search, setSearch] = useState("");
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, name: "Amit Sharma", room: "101", meal: "Breakfast (Poha)", rating: 5, comment: "Poha was warm and fresh. Excellent taste!" },
    { id: 2, name: "Vijay Kumar", room: "101", meal: "Lunch (Rajma Rice)", rating: 4, comment: "Rajma had good spice levels. A bit less salt would be great." },
    { id: 3, name: "Rohan Mehta", room: "104", meal: "Dinner (Paneer Butter Masala)", rating: 5, comment: "Paneer was super soft. Liked the kheer too." }
  ]);

  const filteredFeedbacks = feedbacks.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.meal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PropertyOwnerLayout 
      owner={owner} 
      title="Mess Feedback Reviews" 
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Food Feedback</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Track resident ratings for daily breakfast, lunch, and dinner taste satisfaction.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by resident name or meal..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Grid of Feedbacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeedbacks.map((f) => (
          <div key={f.id} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: f.rating }).map((_, idx) => (
                    <Star key={idx} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-[21px] font-bold text-foreground">{f.name}</h3>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">Room {f.room} • {f.meal}</p>
                <p className="text-[13px] text-slate-700 mt-3 font-medium bg-muted/40 p-3 rounded-xl border border-border/40">
                  "{f.comment}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PropertyOwnerLayout>
  );
}
