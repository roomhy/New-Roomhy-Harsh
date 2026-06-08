import React, { useEffect, useState, useCallback } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { Send, Plus, Search, Wallet, CheckCircle2, Clock, AlertTriangle, Phone, MessageCircle, RefreshCw } from "lucide-react";
import {
  clearOwnerRuntimeSession,
  fetchOwnerTenants,
  getOwnerRuntimeSession
} from "../../utils/propertyowner";
import {
  fetchRentDashboard,
  fetchInvoices,
  sendReminder,
  recordPayment,
  generateInvoices,
  fetchPenaltyConfigs,
  fetchMissingContacts,
} from "../../utils/rentCollectionApi";

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
  const toneBg = { info: "bg-info/10", success: "bg-success/10", warning: "bg-warning/15", default: "bg-muted/60" };
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

const PHASE_CONFIG = {
  1: { label: "Phase 1 · Reminder",       tone: "info" },
  2: { label: "Phase 2 · Minor Penalty",  tone: "warning" },
  3: { label: "Phase 3 · Final Notice",   tone: "danger" },
};

// Live penalty + phase calculation using current DB config (mirrors penaltyEngine.js).
function calcLivePenalties(inv, config) {
  if (!inv?.dueDate || !config) {
    return { phase: 1, totalPenalty: 0, totalDue: inv?.outstandingAmount || inv?.rentAmount || 0 };
  }
  const minorDay     = config.minorPenaltyDay ?? 7;
  const majorDay     = config.majorPenaltyDay ?? 12;
  const todayMs      = new Date(new Date().toDateString()).getTime();
  const dueMs        = new Date(new Date(inv.dueDate).toDateString()).getTime();
  const daysSinceDue = Math.round((todayMs - dueMs) / 86400000);
  const phase        = daysSinceDue < minorDay ? 1 : daysSinceDue < majorDay ? 2 : 3;
  const rentPaid     = inv.rentPaidAmount ?? inv.paidAmount ?? 0;
  const base         = Math.max(0, (inv.rentAmount || 0) - rentPaid);
  const daysInPhase2 = Math.max(0, Math.min(daysSinceDue + 1, majorDay) - minorDay);
  const daysInPhase3 = Math.max(0, daysSinceDue - majorDay + 1);

  let minorPenalty = 0;
  let majorPenalty = 0;

  if (phase >= 2 && config.minorPenalty?.enabled) {
    const mp = config.minorPenalty;
    if (mp.type === "percentage")  minorPenalty = Math.round(base * (mp.value / 100));
    else if (mp.type === "per_day") minorPenalty = Math.round((mp.value || 0) * daysInPhase2);
    else                            minorPenalty = mp.value || 0;
  }

  if (phase >= 3 && config.majorPenalty?.enabled) {
    const daysOverMajor = Math.max(0, daysSinceDue - majorDay);
    const mp = config.majorPenalty;
    if (mp.type === "percentage")        majorPenalty = Math.round(base * (mp.value / 100));
    else if (mp.type === "fixed")        majorPenalty = mp.value || 0;
    else if (mp.type === "per_day")      majorPenalty = Math.round((mp.value || 0) * daysInPhase3);
    else if (mp.type === "daily_fixed")  majorPenalty = (mp.value || 0) + daysOverMajor * (mp.incrementValue || 0);
    else if (mp.type === "weekly_fixed") majorPenalty = (mp.value || 0) + Math.floor(daysOverMajor / 7) * (mp.incrementValue || 0);
    if (mp.maxCap && majorPenalty > mp.maxCap) majorPenalty = mp.maxCap;
    majorPenalty = Math.round(majorPenalty);
  }

  const totalPenalty = minorPenalty + majorPenalty;
  const elec         = inv.electricityBill || 0;
  const totalDue     = base + totalPenalty + elec;
  return { phase, daysSinceDue, totalPenalty, totalDue };
}

const currentBillingMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function Payment() {
  const [owner, setOwner] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [penaltyConfig, setPenaltyConfig] = useState(null);
  const [missingContacts, setMissingContacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [remindingId, setRemindingId] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  const [genConfirmOpen, setGenConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async (session) => {
    if (!session?.loginId) return;
    setLoading(true);
    try {
      const [tenantsData, dashData, invData, configData, contactData] = await Promise.allSettled([
        fetchOwnerTenants(session.loginId),
        fetchRentDashboard(session._id || session.loginId),
        fetchInvoices({ ownerId: session._id || session.loginId, limit: 100 }),
        fetchPenaltyConfigs(session._id || session.loginId),
        fetchMissingContacts(),
      ]);
      if (tenantsData.status === "fulfilled") setTenants(tenantsData.value || []);
      if (dashData.status === "fulfilled")   setDashStats(dashData.value?.stats);
      if (invData.status === "fulfilled")    setInvoices(invData.value?.invoices || []);
      if (contactData.status === "fulfilled") setMissingContacts(contactData.value);
      if (configData.status === "fulfilled") {
        const cfg = configData.value;
        const g   = cfg?.globalDefaults || {};
        const c   = cfg?.configs?.[0]   || {};
        // Merge: owner-saved config wins over global defaults
        setPenaltyConfig({
          minorPenaltyDay: c.minorPenaltyDay ?? g.minorPenaltyDay ?? 7,
          majorPenaltyDay: c.majorPenaltyDay ?? g.majorPenaltyDay ?? 12,
          minorPenalty:    c.minorPenalty    ?? g.minorPenalty    ?? null,
          majorPenalty:    c.majorPenalty    ?? g.majorPenalty    ?? null,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = getOwnerRuntimeSession();
    if (!session?.loginId) { window.location.href = "/propertyowner/ownerlogin"; return; }
    setOwner(session);
    loadData(session);
  }, [loadData]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Active tenants with rent > 0 who haven't checked out — only these get invoices
  const invoiceableTenants = tenants.filter(t => (t.agreedRent || t.rent || 0) > 0 && !t.checkoutDate);
  const alreadyInvoicedCount = invoiceableTenants.filter(t =>
    invoices.some(i =>
      String(i.tenantId?._id || i.tenantId) === String(t._id || t.id) &&
      i.billingMonth === currentBillingMonth()
    )
  ).length;
  const toGenerateCount = invoiceableTenants.length - alreadyInvoicedCount;

  const billingMonthLabel = () => {
    const [yr, mo] = currentBillingMonth().split('-');
    return new Date(parseInt(yr), parseInt(mo) - 1).toLocaleString('en', { month: 'long' }) + ' ' + yr;
  };

  // Merge tenant list with invoice data; recalculate phase + charges live from current config
  const rows = tenants.map(t => {
    const inv = invoices.find(i =>
      String(i.tenantId?._id || i.tenantId) === String(t._id || t.id) &&
      i.billingMonth === currentBillingMonth()
    );
    // No invoice for this month — do not assume "paid"
    if (!inv) return { ...t, payStatus: "no-invoice", phase: 0, invoice: null, outstandingAmount: 0 };
    const liveCalc = calcLivePenalties(inv, penaltyConfig);
    const due   = liveCalc.totalDue;
    const phase = liveCalc.phase;
    const payStatus = inv.status === "PAID" || inv.status === "WAIVED" ? "paid"
      : inv.status === "PARTIAL" ? "partial"
      : due > 0 && phase >= 2 ? "overdue"
      : "due";
    return { ...t, payStatus, phase, invoice: inv, outstandingAmount: due };
  });

  // Live phase breakdown computed from rows (not stale dashStats.phase1/2/3)
  const livePhaseCounts = {
    phase1: rows.filter(r => r.payStatus !== "paid" && r.phase === 1).length,
    phase2: rows.filter(r => r.payStatus !== "paid" && r.phase === 2).length,
    phase3: rows.filter(r => r.payStatus !== "paid" && r.phase === 3).length,
  };

  const counts = {
    all:     rows.length,
    due:     rows.filter(r => r.payStatus === "due").length,
    partial: rows.filter(r => r.payStatus === "partial").length,
    paid:    rows.filter(r => r.payStatus === "paid").length,
    overdue: rows.filter(r => r.payStatus === "overdue").length,
  };

  const filtered = (tab === "all" ? rows : rows.filter(r => r.payStatus === tab))
    .filter(t =>
      !debouncedSearch ||
      (t.name || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (t.roomNo || "").toLowerCase().includes(debouncedSearch.toLowerCase())
    );

  const fmt = (n) => "₹" + (n || 0).toLocaleString("en-IN");
  const totalExpected  = dashStats ? dashStats.totalOutstanding + (dashStats.paid ? dashStats.totalOutstanding : 0) : tenants.reduce((s, t) => s + (t.agreedRent || t.rent || 0), 0);
  const totalCollected = dashStats ? 0 : rows.filter(r => r.payStatus === "paid").reduce((s, t) => s + (t.agreedRent || t.rent || 0), 0);
  const totalDue       = dashStats?.totalOutstanding || rows.filter(r => r.payStatus === "due").reduce((s, t) => s + (t.outstandingAmount || 0), 0);
  const totalPenalty   = dashStats?.totalPenalty || 0;
  const pctDone        = dashStats ? Math.round(((dashStats.paid || 0) / Math.max(1, (dashStats.total || 1))) * 100) : 0;

  const statusConfig = {
    paid:          { tone: "success", Icon: CheckCircle2 },
    partial:       { tone: "warning", Icon: Clock },
    due:           { tone: "warning", Icon: Clock },
    overdue:       { tone: "danger",  Icon: AlertTriangle },
    "no-invoice":  { tone: "muted",   Icon: Clock },
  };

  const handleSendAllReminders = async () => {
    const pending = filtered.filter(r => r.payStatus !== "paid" && r.invoice?._id);
    if (!pending.length) { showToast("No pending invoices to remind", "info"); return; }
    let sent = 0;
    for (const row of pending) {
      try {
        const tenantEmail = (!row.email || row.email === "-") ? "" : row.email;
        const result = await sendReminder(row.invoice._id, tenantEmail, row.name || "Tenant");
        if (result?.queued?.length) sent++;
      } catch (_) {}
    }
    showToast(`Reminders queued for ${sent} tenant(s)`);
  };

  const handleMarkPaid = async (row) => {
    if (!row.invoice?._id) { showToast("No invoice found for this tenant. Generate invoices first.", "error"); return; }
    setPayingId(row._id || row.id);
    try {
      await recordPayment(row.invoice._id, row.outstandingAmount || row.agreedRent || row.rent || 0, "cash");
      showToast(`Payment recorded for ${row.name}`);
      const session = getOwnerRuntimeSession();
      if (session) loadData(session);
    } catch (err) {
      showToast(err.message || "Failed to record payment", "error");
    } finally {
      setPayingId(null);
    }
  };

  const handleSendReminder = async (row) => {
    if (!row.invoice?._id) { showToast("No invoice yet. Generate invoices first.", "error"); return; }
    setRemindingId(row._id || row.id);
    try {
      // Treat "-" (normalizeTenant placeholder) as empty — don't pass fake addresses
      const tenantEmail = (!row.email || row.email === "-") ? "" : row.email;
      const result = await sendReminder(row.invoice._id, tenantEmail, row.name || "Tenant");
      if (result?.queued?.length) {
        showToast(`Reminder sent to ${row.name}`);
      } else {
        showToast(result?.message || "Reminder could not be sent — tenant may have no email on file.", "error");
      }
    } catch (err) {
      showToast(err.message || "Failed to send reminder", "error");
    } finally {
      setRemindingId(null);
    }
  };

  const handleGenerateInvoices = async () => {
    if (!owner?._id && !owner?.loginId) return;
    setGenConfirmOpen(false);
    setGeneratingInvoices(true);
    try {
      const tenantList = invoiceableTenants.map(t => ({
        tenantId:   t._id || t.id,
        propertyId: t.propertyId || t.property,
        unitId:     t.unitId || t.room,
        rentAmount: t.agreedRent || t.rent || 0,
      }));
      if (!tenantList.length) { showToast("No active tenants found", "info"); return; }
      const result = await generateInvoices(owner._id || owner.loginId, currentBillingMonth(), tenantList);
      if ((result.created || 0) === 0) {
        showToast(`All invoices already exist for ${billingMonthLabel()}`, "info");
      } else {
        const skipNote = result.skipped ? ` (${result.skipped} already existed)` : "";
        showToast(`Created ${result.created} invoice${result.created !== 1 ? "s" : ""} for ${billingMonthLabel()}${skipNote}`);
      }
      loadData(owner);
    } catch (err) {
      showToast(err.message || "Failed to generate invoices", "error");
    } finally {
      setGeneratingInvoices(false);
    }
  };

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Rent Collection"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-medium text-white transition-all ${toast.type === "error" ? "bg-destructive" : toast.type === "info" ? "bg-blue-500" : "bg-emerald-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Rent collection</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Phase-based tracking — reminders, penalties, and payments in one place.</p>
        </div>
        <div className="flex items-center gap-2 md:mt-2 flex-wrap">
          <button
            onClick={() => setGenConfirmOpen(true)}
            disabled={generatingInvoices}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40 transition-colors disabled:opacity-50"
          >
            {generatingInvoices ? <RefreshCw className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            {generatingInvoices ? "Generating..." : "Gen. invoices"}
          </button>
          <button
            onClick={handleSendAllReminders}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary/40 transition-colors"
          >
            <Send className="size-3.5" /> Send reminders ({counts.due + counts.overdue + counts.partial})
          </button>
          <button
            onClick={() => window.location.href = "/propertyowner/penalty-config"}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Penalty settings
          </button>
        </div>
      </div>

      {/* Phase legend — live counts from row data, not stale DB currentPhase */}
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <Pill tone="info">Phase 1 · Reminder: {livePhaseCounts.phase1}</Pill>
          <Pill tone="warning">Phase 2 · Minor Penalty: {livePhaseCounts.phase2}</Pill>
          <Pill tone="danger">Phase 3 · Final Notice: {livePhaseCounts.phase3}</Pill>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard label="Outstanding" value={fmt(totalDue)} icon={Wallet} tone="info" />
        <StatCard label="Pending tenants" value={counts.due + counts.overdue + counts.partial} icon={Clock} tone="warning" hint={`${pctDone}% collected`} />
        <StatCard label="Penalties accrued" value={fmt(totalPenalty)} icon={AlertTriangle} tone="default" />
        <StatCard label="Paid this month" value={counts.paid} icon={CheckCircle2} tone="success" />
      </div>

      {/* Missing-contact warning cards — only shown when there are gaps */}
      {missingContacts && (missingContacts.missingEmailCount > 0 || missingContacts.missingPhoneCount > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-amber-700 font-semibold uppercase tracking-wide">Missing Email</span>
              <AlertTriangle className="size-4 text-amber-500" />
            </div>
            <div className="font-serif text-[26px] leading-none text-amber-700">{missingContacts.missingEmailCount}</div>
            <div className="text-[11.5px] text-amber-600 mt-1.5">
              tenant{missingContacts.missingEmailCount !== 1 ? "s" : ""} won't receive email reminders
            </div>
            <button
              onClick={() => window.location.href = "/propertyowner/tenantrec"}
              className="mt-2.5 text-[11.5px] font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              Fix from Tenants page →
            </button>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-amber-700 font-semibold uppercase tracking-wide">Missing Phone</span>
              <Phone className="size-4 text-amber-500" />
            </div>
            <div className="font-serif text-[26px] leading-none text-amber-700">{missingContacts.missingPhoneCount}</div>
            <div className="text-[11.5px] text-amber-600 mt-1.5">
              tenant{missingContacts.missingPhoneCount !== 1 ? "s" : ""} unreachable by call or WhatsApp
            </div>
            <button
              onClick={() => window.location.href = "/propertyowner/tenantrec"}
              className="mt-2.5 text-[11.5px] font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              Fix from Tenants page →
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs + search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "due", "partial", "paid", "overdue"]).map((k) => (
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

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                <th className="px-4 py-3 text-left font-semibold">Property</th>
                <th className="px-4 py-3 text-left font-semibold">Rent</th>
                <th className="px-4 py-3 text-left font-semibold">Outstanding</th>
                <th className="px-4 py-3 text-left font-semibold">Phase</th>
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
                const phCfg = PHASE_CONFIG[t.phase];
                return (
                  <tr key={t._id || t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[14px] shrink-0">
                          {(t.name || "T").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{t.name || "—"}</div>
                          <div className="text-[11.5px] text-muted-foreground">Room {t.roomNo || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.propertyName || (t.property && typeof t.property === "object" ? t.property.title || t.property.name : t.property) || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{fmt(t.agreedRent || t.rent || 0)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{fmt(t.outstandingAmount)}</td>
                    <td className="px-4 py-3">
                      {phCfg ? (
                        <Pill tone={phCfg.tone}>{phCfg.label}</Pill>
                      ) : t.payStatus === "paid" ? (
                        <Pill tone="success">Paid</Pill>
                      ) : (
                        <span className="text-[11.5px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={cfg.tone}>
                        <cfg.Icon className="size-3" />
                        {t.payStatus}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {t.payStatus === "no-invoice" ? (
                          <span className="text-[11.5px] text-muted-foreground italic">No invoice</span>
                        ) : t.payStatus !== "paid" ? (
                          <>
                            <button
                              title="Send reminder"
                              disabled={remindingId === (t._id || t.id)}
                              onClick={() => handleSendReminder(t)}
                              className="size-8 rounded-md hover:bg-muted grid place-items-center text-blue-500 transition-colors disabled:opacity-40"
                            >
                              {remindingId === (t._id || t.id) ? <RefreshCw className="size-3.5 animate-spin" /> : <MessageCircle className="size-3.5" />}
                            </button>
                            <button title="Call" className="size-8 rounded-md hover:bg-muted grid place-items-center transition-colors">
                              <Phone className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleMarkPaid(t)}
                              disabled={payingId === (t._id || t.id)}
                              className="h-8 px-3 rounded-md bg-foreground text-background text-[11.5px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {payingId === (t._id || t.id) ? "..." : "Mark paid"}
                            </button>
                          </>
                        ) : (
                          <span className="text-[11.5px] text-muted-foreground">Paid</span>
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
      {/* Gen Invoice confirmation modal */}
      {genConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setGenConfirmOpen(false)}>
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-foreground text-[16px] mb-1">Generate invoices</h2>
            <p className="text-[13px] text-muted-foreground mb-4">
              Billing month: <span className="font-medium text-foreground">{billingMonthLabel()}</span>
            </p>
            <div className="bg-muted/60 rounded-xl p-3 mb-5 space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active tenants</span>
                <span className="font-medium">{invoiceableTenants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already invoiced</span>
                <span className="font-medium text-emerald-600">{alreadyInvoicedCount}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 mt-1">
                <span className="font-medium">To create</span>
                <span className={`font-semibold ${toGenerateCount === 0 ? "text-muted-foreground" : "text-primary"}`}>{toGenerateCount}</span>
              </div>
            </div>
            {toGenerateCount === 0 && (
              <p className="text-[12.5px] text-muted-foreground text-center mb-4">
                All invoices already exist for this month.
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setGenConfirmOpen(false)}
                className="flex-1 h-10 rounded-xl border border-border text-[13px] font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoices}
                disabled={generatingInvoices || toGenerateCount === 0}
                className="flex-1 h-10 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {generatingInvoices ? "Generating..." : `Generate ${toGenerateCount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </PropertyOwnerLayout>
  );
}
