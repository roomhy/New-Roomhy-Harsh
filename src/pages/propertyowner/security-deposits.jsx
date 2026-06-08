import React, { useState, useEffect, useMemo } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession, fetchOwnerTenants } from "../../utils/propertyowner";
import { ShieldCheck, Search, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

const fmt = (n) => "₹" + (n || 0).toLocaleString("en-IN");

function depositStatus(paid, required) {
  if (!required || required === 0) return { label: "N/A",             tone: "muted" };
  if (paid >= required)            return { label: "Held in Trust",   tone: "success" };
  if (paid > 0)                    return { label: "Partially Paid",  tone: "warning" };
  return                                  { label: "Pending Payment", tone: "danger" };
}

const toneClasses = {
  success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  warning: "bg-amber-50 text-amber-600 border-amber-100",
  danger:  "bg-rose-50 text-rose-600 border-rose-100",
  muted:   "bg-muted text-muted-foreground border-border",
};

export default function SecurityDepositsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }

  const [tenants, setTenants]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    fetchOwnerTenants(owner.loginId)
      .then(data => setTenants(Array.isArray(data) ? data : []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, [owner.loginId]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Only active tenants (no checkout) who have a deposit configured
  const deposits = useMemo(() => {
    return tenants
      .filter(t => !t.checkoutDate)
      .map(t => ({
        _id:      t._id || t.id,
        name:     t.name || "—",
        roomNo:   t.roomNo || t.room || "—",
        required: t.securityDepositTotal || 0,
        paid:     t.securityDepositPaid  || 0,
        balance:  t.securityDepositBalance ?? Math.max(0, (t.securityDepositTotal || 0) - (t.securityDepositPaid || 0)),
        joinDate: t.joinDate || t.checkInDate || t.createdAt || "",
        phone:    t.phone || "",
        email:    t.email || "",
      }));
  }, [tenants]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return deposits;
    return deposits.filter(d =>
      d.name.toLowerCase().includes(q) ||
      String(d.roomNo).toLowerCase().includes(q)
    );
  }, [deposits, debouncedSearch]);

  const totalHeld    = deposits.reduce((s, d) => s + d.paid, 0);
  const totalPending = deposits.reduce((s, d) => s + d.balance, 0);

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Security Deposits"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Security Deposits</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Manage tenant security deposits, partial allocations, and trust balances.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Total Held</span>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <div className="font-serif text-[28px] leading-none text-foreground">{fmt(totalHeld)}</div>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-rose-600 uppercase tracking-wider">Pending Collection</span>
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <div className="font-serif text-[28px] leading-none text-rose-600">{fmt(totalPending)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Active Tenants</span>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </div>
          <div className="font-serif text-[28px] leading-none text-foreground">{deposits.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tenant name or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Tenant</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Required</th>
                <th className="px-6 py-3.5 font-semibold">Paid</th>
                <th className="px-6 py-3.5 font-semibold">Balance Due</th>
                <th className="px-6 py-3.5 font-semibold">Join Date</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <ShieldCheck className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[13px] text-muted-foreground">No deposit records found.</p>
                  </td>
                </tr>
              ) : filtered.map((d) => {
                const st = depositStatus(d.paid, d.required);
                return (
                  <tr key={d._id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{d.name}</div>
                      {d.phone && <div className="text-[11.5px] text-muted-foreground">{d.phone}</div>}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">Room {d.roomNo}</td>
                    <td className="px-6 py-4 text-muted-foreground">{d.required > 0 ? fmt(d.required) : <span className="italic text-muted-foreground/60">Not set</span>}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{fmt(d.paid)}</td>
                    <td className="px-6 py-4 font-semibold text-rose-600">{d.balance > 0 ? fmt(d.balance) : <span className="text-emerald-600">—</span>}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {d.joinDate ? new Date(d.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${toneClasses[st.tone]}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-border bg-muted/30 flex justify-between items-center">
            <span className="text-[12px] text-muted-foreground">{filtered.length} tenant{filtered.length !== 1 ? "s" : ""}</span>
            <span className="text-[12px] font-semibold text-foreground">Total held: {fmt(totalHeld)}</span>
          </div>
        )}
      </div>
    </PropertyOwnerLayout>
  );
}
