import React, { useEffect, useState } from "react";
import { fetchJson } from "../../utils/api";
import {
  ShieldCheck, CheckCircle2, XCircle, Clock, User, Building2, Hash, CalendarClock, Loader2,
} from "lucide-react";

// Public visitor-pass verification page. Opened when the pass QR is scanned by
// any phone camera / QR app. URL: /visitor-verify?token=<qrToken>
export default function VisitorVerify() {
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  // Prefer the clean path form (/visitor-verify/<token>); fall back to ?token=
  const token =
    typeof window !== "undefined"
      ? (window.location.pathname.match(/\/visitor-verify\/([^/?#]+)/)?.[1] ||
         new URLSearchParams(window.location.search).get("token") ||
         "")
      : "";

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) {
        setState({ loading: false, data: null, error: "No pass token provided." });
        return;
      }
      try {
        const res = await fetchJson(`/api/visitors/verify/${encodeURIComponent(token)}`);
        if (alive) setState({ loading: false, data: res, error: "" });
      } catch (err) {
        if (alive) setState({ loading: false, data: null, error: err?.message || "Could not verify this pass." });
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const fmt = (v) =>
    v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

  const { loading, data, error } = state
  const valid = data?.valid === true;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f5f3ff 0%,#eef1f8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#6D3DF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 style={{ width: "18px", height: "18px", color: "#fff" }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.01em" }}>
            <span style={{ color: "#1e1b4b" }}>ROOMHY</span><span style={{ color: "#6D3DF5" }}>.com</span>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "22px", border: "1px solid #e7e3f3", boxShadow: "0 20px 50px -20px rgba(30,27,75,0.30)", overflow: "hidden" }}>
          {/* Status header */}
          {loading ? (
            <div style={{ padding: "48px 28px", textAlign: "center" }}>
              <Loader2 style={{ width: "34px", height: "34px", color: "#6D3DF5", margin: "0 auto", animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: "14px", color: "#64748b", fontSize: "14px" }}>Verifying visitor pass…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            <>
              <div style={{ padding: "30px 28px 24px", textAlign: "center", background: valid ? "linear-gradient(150deg,#059669 0%,#047857 100%)" : "linear-gradient(150deg,#475569 0%,#334155 100%)" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  {valid
                    ? <CheckCircle2 style={{ width: "36px", height: "36px", color: "#fff" }} />
                    : (data?.status === "Rejected" ? <XCircle style={{ width: "36px", height: "36px", color: "#fff" }} /> : <Clock style={{ width: "36px", height: "36px", color: "#fff" }} />)}
                </div>
                <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: 800, marginTop: "14px" }}>
                  {valid ? "Approved ✅" : (data?.status === "Rejected" ? "Not Valid" : (error ? "Verification Failed" : "Not Yet Valid"))}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", marginTop: "6px" }}>
                  {valid ? "Approved by Owner" : (data?.message || error || "This visitor pass could not be verified.")}
                </p>
              </div>

              {/* Details (only for valid/approved passes) */}
              {valid && (
                <div style={{ padding: "8px 24px 24px" }}>
                  {[
                    { Icon: ShieldCheck,   label: "Status",        value: "Approved" },
                    { Icon: User,          label: data.approverLabel === "Designated Warden" ? "Approved By (Warden)" : "Approved By", value: data.approvedBy || data.approverLabel || "Owner" },
                    { Icon: Hash,          label: "Pass ID",       value: data.passId, mono: true },
                    { Icon: User,          label: "Visitor Name",  value: data.visitorName },
                    { Icon: Building2,     label: "Tenant Name",   value: data.tenantName },
                    { Icon: Building2,     label: "Property",      value: data.propertyName },
                    { Icon: User,          label: "Owner",         value: data.ownerName },
                    { Icon: CalendarClock, label: "Approved On",   value: fmt(data.approvedAt) },
                    { Icon: Clock,         label: "Expected Entry", value: fmt(data.expectedEntryTime) },
                  ].filter((r) => r.value).map(({ Icon, label, value, mono }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 4px", borderBottom: "1px solid #f1f2f6" }}>
                      <Icon style={{ width: "17px", height: "17px", color: "#a39ccb", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: "12.5px", color: "#94a3b8" }}>{label}</span>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b", fontFamily: mono ? "monospace" : "inherit" }}>{value || "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "11.5px", marginTop: "16px" }}>
          Roomhy secure visitor verification
        </p>
      </div>
    </div>
  );
}
