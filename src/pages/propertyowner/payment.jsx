import React, { useEffect, useState } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { Send, Plus, Search, Wallet, CheckCircle2, Clock, AlertTriangle, Phone, MessageCircle } from "lucide-react";
import {
  clearOwnerRuntimeSession,
  fetchOwnerTenants,
  getOwnerRuntimeSession
} from "../../utils/propertyowner";

const Pill = ({ tone = "muted", children }) => {
  const toneMap = {
    success: "bg-success/15 text-success-foreground",
    warning: "bg-warning/20 text-foreground",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-info/15 text-foreground",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11.5px] font-medium ${toneMap[tone] || toneMap.muted}`}>
      {children}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, tone = "default", hint }) => {
  const toneBg = {
    info: "bg-info/10",
    success: "bg-success/10",
    warning: "bg-warning/15",
    default: "bg-muted/60",
  };
  return (
    <div className={`rounded-2xl border border-border p-4 shadow-soft ${toneBg[tone] || toneBg.default}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12.5px] text-muted-foreground font-medium">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="font-serif text-[26px] leading-none text-foreground">{value}</div>
      {hint && <div className="text-[11.5px] text-muted-foreground mt-1.5">{hint}</div>}
    </div>
  );
};

export default function Payment() {
  const [owner, setOwner] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const session = getOwnerRuntimeSession();
    if (!session?.loginId) { window.location.href = "/propertyowner/ownerlogin"; return; }
    setOwner(session);
    fetchOwnerTenants(session.loginId).then(data => setTenants(data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const rows = tenants.map(t => {
    const due = t.dueAmount || t.dues || 0;
    // overdue = has dues AND either explicitly flagged OR last paid date is past due
    const isOverdue = due > 0 && (
      t.isOverdue === true ||
      t.overdue === true ||
      t.paymentStatus === "overdue" ||
      (t.dueDate && new Date(t.dueDate) < new Date())
    );
    const status = due === 0 ? "paid" : isOverdue ? "overdue" : "due";
    return { ...t, payStatus: status };
  });

  const counts = {
    all: rows.length,
    due: rows.filter(r => r.payStatus === "due").length,
    paid: rows.filter(r => r.payStatus === "paid").length,
    overdue: rows.filter(r => r.payStatus === "overdue").length,
  };

  const filtered = (tab === "all" ? rows : rows.filter(r => r.payStatus === tab))
    .filter(t => !debouncedSearch || (t.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()) || (t.roomNo || "").toLowerCase().includes(debouncedSearch.toLowerCase()));

  const totalExpected = tenants.reduce((s, t) => s + (t.agreedRent || t.rent || 0), 0);
  const totalCollected = rows.filter(r => r.payStatus === "paid").reduce((s, t) => s + (t.agreedRent || t.rent || 0), 0);
  const totalDue = rows.filter(r => r.payStatus === "due").reduce((s, t) => s + (t.dueAmount || t.dues || 0), 0);
  const totalOverdue = rows.filter(r => r.payStatus === "overdue").reduce((s, t) => s + (t.dueAmount || t.dues || 0), 0);

  const fmt = (n) => "₹" + (n || 0).toLocaleString("en-IN");
  const pctDone = totalExpected ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const statusConfig = {
    paid: { tone: "success", Icon: CheckCircle2 },
    due: { tone: "warning", Icon: Clock },
    overdue: { tone: "danger", Icon: AlertTriangle },
  };

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Rent Collection"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Rent collection</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">See who's paid, who's pending and send reminders — all in one click.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2">
          <button onClick={() => alert("Reminders sent successfully!")} className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40 transition-colors">
            <Send className="size-3.5" /> Send reminders ({counts.due + counts.overdue})
          </button>
          <button onClick={() => window.location.href = '/propertyowner/transactions'} className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity">
            <Plus className="size-4" /> Record payment
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Expected this month" value={fmt(totalExpected)} icon={Wallet} tone="info" />
        <StatCard label="Collected" value={fmt(totalCollected)} icon={CheckCircle2} tone="success" hint={`${pctDone}% done`} />
        <StatCard label="Due this week" value={fmt(totalDue)} icon={Clock} tone="warning" />
        <StatCard label="Overdue" value={fmt(totalOverdue)} icon={AlertTriangle} tone="default" />
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          {(["all", "due", "paid", "overdue"]).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={[
                "h-9 px-3.5 rounded-lg text-[12.5px] font-medium capitalize transition-colors",
                tab === k ? "bg-foreground text-background" : "bg-card border border-border hover:border-primary/40 text-muted-foreground"
              ].join(" ")}
            >
              {k} <span className="opacity-60 ml-0.5">{counts[k]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 rounded-lg bg-card border border-border text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>May 2025</option>
            <option>April 2025</option>
            <option>March 2025</option>
          </select>
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tenant"
              className="h-9 w-48 pl-8 pr-3 rounded-lg bg-card border border-border text-[12.5px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                <th className="px-4 py-3 text-left font-semibold">Property</th>
                <th className="px-4 py-3 text-left font-semibold">Month</th>
                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                <th className="px-4 py-3 text-left font-semibold">Due date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[13px] text-muted-foreground">No records found</td></tr>
              ) : filtered.map((t) => {
                const cfg = statusConfig[t.payStatus] || statusConfig.due;
                return (
                  <tr key={t._id || t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[14px] shrink-0">
                          {(t.name || "T").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{t.name || "—"}</div>
                          <div className="text-[11.5px] text-muted-foreground">Room {t.roomNo || "—"} / {t.bedNo || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.propertyName || (t.property && typeof t.property === "object" ? t.property.title || t.property.name : t.property) || "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground">May 2025</td>
                    <td className="px-4 py-3 font-medium text-foreground">{fmt(t.agreedRent || t.rent || 0)}</td>
                    <td className="px-4 py-3 text-muted-foreground">5 May</td>
                    <td className="px-4 py-3">
                      <Pill tone={cfg.tone}>
                        <cfg.Icon className="size-3" />
                        {t.payStatus}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {t.payStatus !== "paid" ? (
                          <>
                            <button title="WhatsApp" className="size-8 rounded-md hover:bg-muted grid place-items-center text-success transition-colors">
                              <MessageCircle className="size-3.5" />
                            </button>
                            <button title="Call" className="size-8 rounded-md hover:bg-muted grid place-items-center transition-colors">
                              <Phone className="size-3.5" />
                            </button>
                            <button className="h-8 px-3 rounded-md bg-foreground text-background text-[11.5px] font-medium hover:opacity-90 transition-opacity">
                              Mark paid
                            </button>
                          </>
                        ) : (
                          <span className="text-[11.5px] text-muted-foreground">Paid · UPI</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PropertyOwnerLayout>
  );
}
