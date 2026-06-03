import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(" ");

const COLORS = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  yellow: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-rose-50 text-rose-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export function StatCard({ label, value, delta, trend = "neutral", icon: Icon, iconColor = "blue", loading }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col transition-all hover:translate-y-[-4px] hover:shadow-md group">
      <div className="flex items-start gap-4">
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm", COLORS[iconColor])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
          {loading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <div className="text-2xl font-black text-slate-900 tracking-tight truncate">{value}</div>
          )}
          {delta && !loading && (
            <div className={cn(
              "text-[10px] mt-1.5 flex items-center gap-1 font-bold uppercase tracking-tight",
              trend === "up" && "text-emerald-600",
              trend === "down" && "text-rose-600",
              trend === "neutral" && "text-slate-400"
            )}>
              {trend === "up" && <ArrowUp className="h-3 w-3" />}
              {trend === "down" && <ArrowDown className="h-3 w-3" />}
              {delta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
