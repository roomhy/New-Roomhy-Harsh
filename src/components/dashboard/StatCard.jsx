import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

const COLORS = {
  blue: "bg-info-soft text-info",
  green: "bg-success-soft text-success",
  yellow: "bg-warning-soft text-warning",
  purple: "bg-brand-purple-soft text-brand-purple",
  red: "bg-destructive/10 text-destructive",
  cyan: "bg-cyan-100 text-cyan-600",
  orange: "bg-orange-100 text-orange-600",
};

export function StatCard({ label, value, delta, trend = "neutral", icon: Icon, iconColor = "blue" }) {
  return (
    <div className="stat-card">
      <div className="flex items-start gap-4">
        <div className={`icon-bubble ${COLORS[iconColor]}`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground mb-1">{label}</div>
          <div className="text-2xl font-bold text-foreground truncate">{value}</div>
          {delta && (
            <div className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
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
