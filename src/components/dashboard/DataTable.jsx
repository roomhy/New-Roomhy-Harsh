import React from "react";

export function DataTable({ columns, data, emptyText = "No data" }) {
  return (
    <div className="overflow-x-auto -mx-6">
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground border-b border-border bg-muted/30">
          <tr>
            {columns.map((c, i) => (
              <th key={c.key} className={`text-left py-3 font-medium ${i === 0 ? "pl-6" : ""} ${i === columns.length - 1 ? "pr-6" : ""} ${c.className || ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-10 text-muted-foreground">{emptyText}</td></tr>
          ) : data.map((row, ri) => (
            <tr key={ri} className="hover:bg-muted/30 transition-colors">
              {columns.map((c, i) => (
                <td key={c.key} className={`py-3 ${i === 0 ? "pl-6" : ""} ${i === columns.length - 1 ? "pr-6" : ""} ${c.className || ""}`}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Active: "bg-success-soft text-success",
    Approved: "bg-success-soft text-success",
    Completed: "bg-success-soft text-success",
    Paid: "bg-success-soft text-success",
    Enabled: "bg-success-soft text-success",
    Live: "bg-success-soft text-success",
    Resolved: "bg-success-soft text-success",
    Pending: "bg-warning-soft text-warning",
    Processing: "bg-warning-soft text-warning",
    Sandbox: "bg-warning-soft text-warning",
    Inactive: "bg-muted text-muted-foreground",
    Disabled: "bg-muted text-muted-foreground",
    Expired: "bg-muted text-muted-foreground",
    Flagged: "bg-destructive/10 text-destructive",
    Refunded: "bg-destructive/10 text-destructive",
    Failed: "bg-destructive/10 text-destructive",
    Overdue: "bg-destructive/10 text-destructive",
    Rejected: "bg-destructive/10 text-destructive",
    Cancelled: "bg-destructive/10 text-destructive",
    Banned: "bg-destructive/10 text-destructive",
    Draft: "bg-info-soft text-info",
    Premium: "bg-brand-purple-soft text-brand-purple",
    Featured: "bg-brand-purple-soft text-brand-purple",
  };
  return <span className={`badge-soft ${map[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
}

export function TableToolbar({ search = true, searchPlaceholder = "Search...", filters = [], right }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {search && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder={searchPlaceholder} className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      )}
      {filters.map((f, i) => (
        <button key={i} className="h-10 px-3 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted">
          <span className="text-muted-foreground">{f.label}:</span>
          <span className="font-medium">{f.value}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      ))}
      <div className="flex-1" />
      {right}
    </div>
  );
}
