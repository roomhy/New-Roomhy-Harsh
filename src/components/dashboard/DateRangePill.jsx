import React from "react";
import { Calendar } from "lucide-react";

export function DateRangePill({ value }) {
  return (
    <button className="h-11 px-4 rounded-xl border border-border bg-card flex items-center gap-2 text-sm text-foreground hover:bg-muted">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      {value}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}
