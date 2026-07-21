import React, { useState, useMemo, useEffect } from "react";
import { fetchJson } from "../../utils/api";
import {
  Ticket, Search, Download, Filter, Eye, UserCheck, MessageSquare,
  AlertTriangle, CheckCircle, XCircle, Clock, ChevronRight,
  Building2, CreditCard, Calendar, User, FileText, X, Plus,
  ExternalLink, AlertCircle
} from "lucide-react";
import { PageHeader } from "../../components/superadmin/PageHeader";

const cn = (...c) => c.filter(Boolean).join(" ");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  Low:      { cls: "bg-slate-100 text-slate-500",   dot: "bg-slate-400"  },
  Medium:   { cls: "bg-amber-50 text-amber-600",    dot: "bg-amber-500"  },
  High:     { cls: "bg-orange-50 text-orange-600",  dot: "bg-orange-500" },
  Critical: { cls: "bg-red-50 text-red-600",        dot: "bg-red-500"    },
};
const STATUS_CFG = {
  "Open":                  { cls: "bg-blue-50 text-blue-600"    },
  "Assigned":              { cls: "bg-indigo-50 text-indigo-600"},
  "In Progress":           { cls: "bg-amber-50 text-amber-600"  },
  "Waiting For Response":  { cls: "bg-purple-50 text-purple-600"},
  "Resolved":              { cls: "bg-emerald-50 text-emerald-600"},
  "Closed":                { cls: "bg-slate-100 text-slate-500" },
};

function Badge({ label, cfg }) {
  return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold", cfg?.cls)}>{label}</span>;
}

function PriorityDot({ priority }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold", PRIORITY_CFG[priority]?.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", PRIORITY_CFG[priority]?.dot)}/>
      {priority}
    </span>
  );
}

// ─── TICKET DETAIL PANEL ─────────────────────────────────────────────────────
function TicketDetailPanel({ ticket, onClose, onUpdate, employees = [] }) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState(ticket.status);
  const [resNotes, setResNotes] = useState(ticket.resolution_notes || "");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-end p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[95vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-600">{ticket.ticket_id}</span>
              {ticket.sla_breached && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">SLA BREACHED</span>}
            </div>
            <h3 className="text-base font-black text-slate-900">{ticket.subject}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"><X size={18}/></button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-0 divide-x divide-slate-50">
            {/* LEFT: Info */}
            <div className="p-6 space-y-6">
              {/* Status change */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(STATUS_CFG).map(s => (
                    <button key={s} onClick={() => setStatus(s)} className={cn("text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all", status === s ? STATUS_CFG[s].cls + " border-current" : "border-slate-100 text-slate-400 hover:bg-slate-50")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticket Info */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticket Information</p>
                {[
                  ["Type", ticket.ticket_type],
                  ["Priority", ticket.priority],
                  ["Status", status],
                  ["Created", ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "—"],
                  ["Last Updated", ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : "—"],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">{l}</span>
                    <span className="text-slate-800 font-bold">{v}</span>
                  </div>
                ))}
              </div>

              {/* Raised By */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Raised By</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                    {ticket.raised_by_name?.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{ticket.raised_by_name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ticket.raised_by_role}</p>
                  </div>
                </div>
              </div>

              {/* Property / Booking Links */}
              {(ticket.property_name || ticket.booking_id || ticket.owner_name) && (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Linked Records</p>
                  {ticket.property_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold w-full text-left">
                      <Building2 size={12}/> {ticket.property_name}
                    </div>
                  )}
                  {ticket.booking_id && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold w-full text-left">
                      <Calendar size={12}/> Booking ID: {ticket.booking_id}
                    </div>
                  )}
                  {ticket.owner_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold w-full text-left">
                      <User size={12}/> Owner: {ticket.owner_name}
                    </div>
                  )}
                </div>
              )}

              {/* Resolution Input */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Resolution Notes</p>
                <textarea
                  value={resNotes}
                  onChange={e => setResNotes(e.target.value)}
                  placeholder="Enter ticket resolution notes here..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]"
                />
              </div>
            </div>

            {/* RIGHT: Timeline + Notes */}
            <div className="p-6 flex flex-col space-y-6">
              {/* Description */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>
              </div>

              {/* Activity Log */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Activity Log</p>
                <div className="space-y-2">
                  {ticket.activity_log?.map((a, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"/>
                      <div>
                        <p className="font-bold text-slate-700">{a.action}</p>
                        <p className="text-slate-400">{new Date(a.at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!ticket.activity_log || ticket.activity_log.length === 0) && (
                    <p className="text-xs text-slate-400">No activity yet.</p>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="flex flex-col flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Internal Notes <span className="text-slate-300">(Admin Only)</span></p>
                <div className="space-y-2 mb-3 flex-1">
                  {notes.map((n, i) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800">{n}</div>
                  ))}
                  {notes.length === 0 && <p className="text-xs text-slate-400">No internal notes.</p>}
                </div>
                <div className="flex gap-2 mt-auto">
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add an internal note..." className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs outline-none border border-slate-100 focus:ring-2 focus:ring-blue-100"/>
                  <button onClick={() => { if(note.trim()) { setNotes(p => [...p, note]); setNote(""); }}} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                    <Plus size={14}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={() => onUpdate(ticket._id, status, resNotes)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
            Save Changes
          </button>
          <button onClick={() => onUpdate(ticket._id, 'Resolved', resNotes)} className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all">
            Mark Resolved
          </button>
          <button onClick={() => onUpdate(ticket._id, 'Closed', resNotes)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
            Close Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OwnerComplaints() {
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [priorityF, setPriorityF] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [typeF, setTypeF] = useState("All");
  const [assignModal, setAssignModal] = useState(null);
  const [registerModal, setRegisterModal] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetchJson("/api/superadmin/support/tickets");
      if (res && res.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await fetchJson("/api/employees");
      if (res && res.success) {
        setEmployees(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  useEffect(() => {
    loadTickets();
    loadEmployees();
  }, []);

  // Filter ONLY Owner complaints / tickets
  const filtered = useMemo(() => tickets.filter(t => {
    const isOwnerTicket = t.ticket_type === "Owner Complaint" || t.raised_by_role === "property_owner" || t.raised_by_role === "owner";
    if (!isOwnerTicket) return false;

    const s = search.toLowerCase();
    const matchS = !search || 
      (t.ticket_id && t.ticket_id.toLowerCase().includes(s)) || 
      (t.raised_by_name && t.raised_by_name.toLowerCase().includes(s)) || 
      (t.subject && t.subject.toLowerCase().includes(s)) || 
      (t.property_name && t.property_name.toLowerCase().includes(s));
    const matchP = priorityF === "All" || t.priority === priorityF;
    const matchSt = statusF === "All" || t.status === statusF;
    const matchT = typeF === "All" || t.ticket_type === typeF;
    return matchS && matchP && matchSt && matchT;
  }), [tickets, search, priorityF, statusF, typeF]);

  const counts = useMemo(() => {
    const ownerTicketsList = tickets.filter(t => t.ticket_type === "Owner Complaint" || t.raised_by_role === "property_owner" || t.raised_by_role === "owner");
    const total = ownerTicketsList.length;
    return {
      total,
      open: ownerTicketsList.filter(t => t.status === "Open").length,
      inProgress: ownerTicketsList.filter(t => t.status === "In Progress").length,
      resolved: ownerTicketsList.filter(t => t.status === "Resolved").length,
      critical: ownerTicketsList.filter(t => t.priority === "Critical").length,
      breached: ownerTicketsList.filter(t => t.sla_breached).length,
    };
  }, [tickets]);

  const handleUpdate = async (id, newStatus, resolutionNotes = "") => {
    try {
      const res = await fetchJson(`/api/superadmin/support/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus, resolution_notes: resolutionNotes })
      });
      if (res && res.success) {
        setTickets(prev => prev.map(t => t._id === id ? res.ticket : t));
      }
    } catch (err) {
      console.error(err);
    }
    setSelected(null);
  };

  const handleAssign = async (id, empId, empName) => {
    try {
      const res = await fetchJson(`/api/superadmin/support/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify({ assigned_admin: empId, assigned_admin_name: empName, status: "Assigned" })
      });
      if (res && res.success) {
        setTickets(prev => prev.map(t => t._id === id ? res.ticket : t));
      }
    } catch (err) {
      console.error(err);
    }
    setAssignModal(null);
  };

  const handleExport = () => {
    const csv = [
      ["Ticket ID","Type","Raised By","Property","Booking","Priority","Status","Assigned","Created"],
      ...filtered.map(t => [t.ticket_id, t.ticket_type, t.raised_by_name, t.property_name||"", t.booking_id||"", t.priority, t.status, t.assigned_admin_name||"Unassigned", t.created_at])
    ].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="owner_complaints.csv"; a.click();
  };

  const handleRegister = async (form) => {
    try {
      const res = await fetchJson("/api/superadmin/support/tickets", {
        method: "POST",
        body: JSON.stringify({ ...form, ticket_type: "Owner Complaint", raised_by_role: "property_owner" })
      });
      if (res && res.success) {
        setRegisterModal(false);
        loadTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const RegisterComplaintModal = ({ onClose, onSubmit }) => {
    const [form, setForm] = useState({
      ticket_type: "Owner Complaint",
      raised_by_name: "",
      raised_by_role: "property_owner",
      property_name: "",
      booking_id: "",
      owner_name: "",
      subject: "",
      description: "",
      priority: "Medium",
      assigned_admin: "",
      assigned_admin_name: ""
    });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-slate-900">Register Owner Complaint</h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"><X size={18}/></button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                <select value={form.ticket_type} onChange={e => set("ticket_type", e.target.value)} className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 outline-none border border-slate-100">
                  {["Owner Complaint","Booking Dispute","Payment Issue","Property Issue","Other"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                <select value={form.priority} onChange={e => set("priority", e.target.value)} className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 outline-none border border-slate-100">
                  {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Raised By (Owner Name)</p>
                <input value={form.raised_by_name} onChange={e => set("raised_by_name", e.target.value)} placeholder="Name (optional)" className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs outline-none border border-slate-100 focus:ring-2 focus:ring-blue-100"/>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Property</p>
                <input value={form.property_name} onChange={e => set("property_name", e.target.value)} placeholder="Property name (optional)" className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs outline-none border border-slate-100 focus:ring-2 focus:ring-blue-100"/>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                <input value={form.booking_id} onChange={e => set("booking_id", e.target.value)} placeholder="BK-xxxx (optional)" className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs outline-none border border-slate-100 focus:ring-2 focus:ring-blue-100"/>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner loginId</p>
                <input value={form.owner_name} onChange={e => set("owner_name", e.target.value)} placeholder="Owner loginId (optional)" className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs outline-none border border-slate-100 focus:ring-2 focus:ring-blue-100"/>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assign To Employee (optional)</p>
              <select value={form.assigned_admin_name} onChange={e => {
                const selectedEmp = employees.find(emp => emp.name === e.target.value);
                setForm(p => ({
                  ...p,
                  assigned_admin: selectedEmp ? selectedEmp.loginId : "",
                  assigned_admin_name: e.target.value
                }));
              }} className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-600 outline-none border border-slate-100">
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp.name}>{emp.name} ({emp.loginId})</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject *</p>
              <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Complaint subject" className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs outline-none border border-slate-100 focus:ring-2 focus:ring-blue-100"/>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description *</p>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the complaint..." className="w-full bg-slate-50 rounded-xl px-3 py-2.5 text-xs outline-none border border-slate-100 focus:ring-2 focus:ring-blue-100 min-h-[90px]"/>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">Cancel</button>
            <button onClick={() => onSubmit(form)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">Register Complaint</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-40">
        Loading owners complaints...
      </div>
    );
  }

  const isNoData = filtered.length === 0;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-inter text-slate-900">
      <PageHeader
        title="Owners Complaints"
        subtitle="Manage all support tickets, complaints, and escalations raised by property owners."
        breadcrumbs={[{ label: "Support" }, { label: "Owners Complaints", active: true }]}
        actions={
          <>
            <button onClick={() => setRegisterModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm">
              <Plus size={14}/> Register Complaint
            </button>
            <button onClick={handleExport} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm">
              <Download size={14}/> Export
            </button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
        {[
          { label: "Total Tickets",  val: isNoData ? 0 : counts.total,     icon: Ticket,        color: "blue"   },
          { label: "Open",           val: isNoData ? 0 : counts.open,      icon: AlertCircle,   color: "blue"   },
          { label: "In Progress",    val: isNoData ? 0 : counts.inProgress,icon: Clock,         color: "amber"  },
          { label: "Resolved",       val: isNoData ? 0 : counts.resolved,  icon: CheckCircle,   color: "emerald"},
          { label: "Critical",       val: isNoData ? 0 : counts.critical,  icon: AlertTriangle, color: "red"    },
          { label: "SLA Breached",   val: isNoData ? 0 : counts.breached,  icon: XCircle,       color: "rose"   },
        ].map(c => (
          <div key={c.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[120px]">
            <div>
              <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center mb-2", `bg-${c.color}-50 text-${c.color}-600`)}>
                <c.icon size={14}/>
              </div>
              <p className="text-base font-black text-slate-900 leading-tight">{c.val}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
            </div>
            <p className="text-[8px] font-bold text-blue-500/80 uppercase tracking-wider mt-2">Source: Support</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-3 mt-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticket ID, name, property..." className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2.5 text-xs outline-none border-none focus:ring-2 focus:ring-blue-100"/>
        </div>
        <select value={priorityF} onChange={e => setPriorityF(e.target.value)} className="bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none border-none focus:ring-2 focus:ring-blue-100">
          <option value="All">All Priority</option>
          {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={statusF} onChange={e => setStatusF(e.target.value)} className="bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none border-none focus:ring-2 focus:ring-blue-100">
          <option value="All">All Status</option>
          {Object.keys(STATUS_CFG).map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={typeF} onChange={e => setTypeF(e.target.value)} className="bg-slate-50 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 outline-none border-none focus:ring-2 focus:ring-blue-100">
          <option value="All">All Types</option>
          {["Owner Complaint","Booking Dispute","Payment Issue","Property Issue","Other"].map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs font-bold text-slate-400 ml-auto">{filtered.length} tickets</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 text-left">Ticket</th>
                <th className="px-5 py-4 text-left">Type</th>
                <th className="px-5 py-4 text-left">Raised By</th>
                <th className="px-5 py-4 text-left">Property</th>
                <th className="px-5 py-4 text-left">Priority</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-left">Assigned</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">No Complaints Found</td></tr>
              ) : filtered.map(t => (
                <tr key={t._id} className={cn("hover:bg-slate-50/60 transition-colors", t.sla_breached && "bg-red-50/30")}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {t.sla_breached && <AlertTriangle size={12} className="text-red-500 shrink-0"/>}
                      <div>
                        <p className="font-mono font-bold text-blue-600 text-xs">{t.ticket_id}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{t.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{t.ticket_type}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] font-black shrink-0">
                        {t.raised_by_name?.split(" ").map(n=>n[0]).join("")}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{t.raised_by_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {t.property_name
                      ? <span className="text-xs text-slate-600 flex items-center gap-1"><Building2 size={11} className="text-slate-300"/>{t.property_name}</span>
                      : <span className="text-xs text-slate-300">—</span>
                    }
                  </td>
                  <td className="px-5 py-4"><PriorityDot priority={t.priority}/></td>
                  <td className="px-5 py-4"><Badge label={t.status} cfg={STATUS_CFG[t.status]}/></td>
                  <td className="px-5 py-4">
                    {t.assigned_admin_name
                      ? <span className="text-xs font-bold text-slate-700 flex items-center gap-1"><UserCheck size={11} className="text-emerald-500"/>{t.assigned_admin_name}</span>
                      : <button onClick={() => setAssignModal(t._id)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"><Plus size={11}/>Assign</button>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setSelected(t)} className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View"><Eye size={14}/></button>
                      {!t.assigned_admin_name && (
                        <button onClick={() => setAssignModal(t._id)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Assign"><UserCheck size={14}/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Panel */}
      {selected && <TicketDetailPanel ticket={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} employees={employees}/>}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setAssignModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 max-h-96 flex flex-col" onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-black text-slate-900 mb-4 shrink-0">Assign Employee</h4>
            <div className="space-y-2 overflow-y-auto flex-1">
              {employees.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No employees registered.</p>
              ) : (
                employees.map(emp => (
                  <button key={emp._id} onClick={() => handleAssign(assignModal, emp.loginId, emp.name)} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black shrink-0">
                      {emp.name?.split(" ").map(n=>n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight">{emp.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{emp.loginId} • {emp.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Complaint Modal */}
      {registerModal && <RegisterComplaintModal onClose={() => setRegisterModal(false)} onSubmit={handleRegister} />}
    </div>
  );
}
