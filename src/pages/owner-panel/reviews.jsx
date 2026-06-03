import React from "react";
import OwnerLayout from "../../components/OwnerLayout";
import { Star, MessageSquare, User, Home, ThumbsUp, ThumbsDown } from "lucide-react";

export default function OwnerReviews() {
  const reviews = [
    { tenant: "Rahul Sharma", property: "Roomhy Residency", rating: 5, comment: "Excellent facilities and very helpful staff. The room was clean and well-maintained.", date: "2 days ago" },
    { tenant: "Priya Patel", property: "Blue Heights", rating: 4, comment: "Good experience overall, but the Wi-Fi could be faster in some areas.", date: "1 week ago" },
    { tenant: "Amit Verma", property: "Roomhy Residency", rating: 3, comment: "The room is good but the food menu needs more variety.", date: "2 weeks ago" },
  ];

  return (
    <OwnerLayout 
      title="Reviews"
      subtitle="See what your tenants are saying about your hostels."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ReviewStat label="Average Rating" value="4.6" icon={Star} color="text-amber-500" bg="bg-amber-50" />
        <ReviewStat label="Total Reviews" value="128" icon={MessageSquare} color="text-blue-600" bg="bg-blue-50" />
        <ReviewStat label="Positive Feedback" value="92%" icon={ThumbsUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="space-y-6">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                  {r.tenant[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{r.tenant}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{r.property}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={16} fill={idx < r.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6 italic">"{r.comment}"</p>
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{r.date}</span>
              <div className="flex gap-4">
                <button className="text-xs font-bold text-indigo-600 hover:underline">Reply</button>
                <button className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Flag</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </OwnerLayout>
  );
}

function ReviewStat({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <Icon size={24} fill={label === 'Average Rating' ? 'currentColor' : 'none'} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  );
}
