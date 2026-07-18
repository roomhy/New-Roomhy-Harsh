import React, { useState } from "react";
import StaffLayout from "../../components/StaffLayout";
import { QrCode, Search, CheckCircle2, XCircle, Clock, User, Phone, Calendar } from "lucide-react";
import { useStaffVisitorPasses, useUpdateStaffVisitorPass } from "../../hooks/useStaffLists";

function getStaffSession() {
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) return JSON.parse(raw);
    const empRaw = sessionStorage.getItem("employee_session") || localStorage.getItem("employee_session");
    if (empRaw) return JSON.parse(empRaw);
  } catch (_) {}
  return null;
}

const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function StaffVisitorPasses() {
  const staff = getStaffSession();
  // A Designated Warden is a staff member assigned to an owner via parentLoginId.
  const parentLoginId = staff?.parentLoginId || "";

  const [search, setSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { data: passes = [], isLoading: loading } = useStaffVisitorPasses(parentLoginId);
  const updatePass = useUpdateStaffVisitorPass(parentLoginId);

  const act = async (id, action) => {
    setErrorMsg("");
    try {
      const data = await updatePass.mutateAsync({
        id,
        action,
        approver: staff,
      });
      if (!data?.success || !data?.visitor) {
        setErrorMsg(data?.message || "Action failed.");
      }
    } catch (err) {
      setErrorMsg(err?.message || "You are not authorized for this request.");
    }
  };

  const q = search.trim().toLowerCase();
  const matches = (p) =>
    !q ||
    (p.name || "").toLowerCase().includes(q) ||
    (p.hostName || "").toLowerCase().includes(q) ||
    (p.passId || "").toLowerCase().includes(q);

  const pending = passes.filter((p) => p.status === "Pending" && matches(p));
  const approved = passes.filter((p) => p.status === "Approved" && matches(p));

  return (
    <StaffLayout title="Visitor Pass Requests" subtitle="Review and approve visitor passes for your assigned property.">
      {!parentLoginId && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3">
          Your account isn’t linked to an owner yet. Ask your owner to assign you as staff.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by visitor, resident or Pass ID..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-slate-400"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3">{errorMsg}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500">Loading visitor pass requests...</div>
      ) : (
        <div className="space-y-10">
          {/* Pending */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-[15px] font-bold text-slate-800">Pending Approval</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">{pending.length}</span>
            </div>
            {pending.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-slate-400 rounded-2xl border border-dashed border-slate-200">No pending visitor pass requests.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pending.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-100">Pending</span>
                      </div>
                      <div>
                        <h3 className="text-[19px] font-bold text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" /> {p.name}
                        </h3>
                        <p className="text-[12.5px] text-slate-500 mt-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {p.phone}</p>
                        <p className="text-[12.5px] text-slate-500 mt-1">Resident: <strong className="text-slate-800">{p.hostName} (Room {p.hostRoom})</strong></p>
                        <p className="text-[12.5px] text-slate-500 mt-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {fmtDateTime(p.expectedEntryTime)}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 mt-6 pt-4 flex gap-2">
                      <button
                        onClick={() => act(p._id, "approve")}
                        disabled={updatePass.isPending}
                        className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => act(p._id, "reject")}
                        disabled={updatePass.isPending}
                        className="flex-1 h-10 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Approved */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h2 className="text-[15px] font-bold text-slate-800">Approved Passes</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">{approved.length}</span>
            </div>
            {approved.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-slate-400 rounded-2xl border border-dashed border-slate-200">No approved passes yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approved.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-100">Approved</span>
                    </div>
                    <div className="mt-4">
                      <span className="text-[11px] font-mono font-bold text-slate-400 block mb-1">{p.passId || "—"}</span>
                      <h3 className="text-[19px] font-bold text-slate-900">{p.name}</h3>
                      <p className="text-[12.5px] text-slate-500 mt-0.5">Invited by: <strong className="text-slate-800">{p.hostName} (Room {p.hostRoom})</strong></p>
                    </div>
                    <div className="border-t border-slate-100 mt-4 pt-4 space-y-1.5 text-xs text-slate-500">
                      <div className="flex justify-between"><span>Approved by:</span><span className="font-bold text-slate-800">{p.approvedBy || "—"}{p.approvedByRole === "warden" ? " (Warden)" : ""}</span></div>
                      <div className="flex justify-between"><span>Approved on:</span><span className="font-bold text-slate-800">{fmtDateTime(p.approvedAt)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </StaffLayout>
  );
}
