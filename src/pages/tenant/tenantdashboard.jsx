import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHtmlPage } from "../../utils/htmlPage";
import { fetchJson, getApiBase } from "../../utils/api";

// ─── Razorpay loader ───────────────────────────────────────────────────────────
const ensureRazorpayLoaded = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") { reject(new Error("Window is not available.")); return; }
    if (window.Razorpay) { resolve(true); return; }
    const existing = document.querySelector('script[data-roomhy-razorpay="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.roomhyRazorpay = "1";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay."));
    document.body.appendChild(script);
  });

// ─── PDF library loader (jsPDF + html2canvas) ─────────────────────────────────
const ensurePdfLibsLoaded = () =>
  new Promise((resolve, reject) => {
    if (window.jspdf && window.html2canvas) { resolve(true); return; }
    const loadScript = (src) =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
        const s = document.createElement("script");
        s.src = src;
        s.onload = res;
        s.onerror = () => rej(new Error(`Failed to load ${src}`));
        document.body.appendChild(s);
      });
    Promise.all([
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
    ])
      .then(() => resolve(true))
      .catch(reject);
  });

// ─── LocalStorage helpers ──────────────────────────────────────────────────────
const readTenantUser = () => {
  try { return JSON.parse(localStorage.getItem("tenant_user") || localStorage.getItem("user") || "null"); }
  catch { return null; }
};
const readLocalTenants = () => {
  try { return JSON.parse(localStorage.getItem("roomhy_tenants") || "[]"); }
  catch { return []; }
};
const writeLocalTenants = (list) => localStorage.setItem("roomhy_tenants", JSON.stringify(list));
const upsertTenantRecord = (record) => {
  if (!record?.loginId) return;
  const list = readLocalTenants();
  const key = String(record.loginId).toUpperCase();
  const idx = list.findIndex((i) => String(i.loginId || "").toUpperCase() === key);
  if (idx >= 0) list[idx] = { ...list[idx], ...record };
  else list.push(record);
  writeLocalTenants(list);
};

// ─── Formatters ───────────────────────────────────────────────────────────────
const formatCurrency = (v) => `₹ ${Number(v || 0).toLocaleString("en-IN")}`;
const formatDate = (v, withTime = false) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString(
    "en-IN",
    withTime
      ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "short", year: "numeric" }
  );
};
const paymentMethodLabel = (m) =>
  ({ razorpay: "Online (Razorpay)", cash: "Cash", bank_transfer: "Bank Transfer", other: "Other" }[
    String(m || "").toLowerCase()
  ] || "Unknown");

// ─── Receipt HTML template (rendered off-screen, captured by html2canvas) ─────
function ReceiptTemplate({ receiptRef, tenant, tenantUser, rentItem, loginId, propertyName, roomInfo }) {
  const paid = ["paid", "completed"].includes(String(rentItem?.paymentStatus || "").toLowerCase());
  const receiptNo = rentItem?._id
    ? `RMH-${String(rentItem._id).slice(-8).toUpperCase()}`
    : `RMH-${Date.now()}`;
  const paidAmount = rentItem?.paidAmount || rentItem?.totalDue || rentItem?.rentAmount || 0;
  const payDate = rentItem?.paymentDate || rentItem?.updatedAt || rentItem?.createdAt;

  return (
    <div
      ref={receiptRef}
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: "794px",         // A4 width at 96dpi
        minHeight: "600px",
        background: "#ffffff",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "14px",
        color: "#1e293b",
        padding: "0",
        margin: "0",
        zIndex: -1,
      }}
    >
      {/* Header bar */}
      <div style={{ background: "linear-gradient(135deg,#1d4ed8 0%,#7c3aed 100%)", padding: "32px 40px 24px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>Roomhy</div>
            <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>Property Management Platform</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "13px", opacity: 0.8 }}>Receipt No.</div>
            <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "1px" }}>{receiptNo}</div>
            <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "4px" }}>
              {formatDate(payDate, true)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: "20px", display: "inline-block", background: paid ? "#22c55e" : "#f59e0b", color: "#fff", borderRadius: "999px", padding: "4px 18px", fontWeight: 700, fontSize: "13px", letterSpacing: "0.5px" }}>
          {paid ? "✓ PAID" : "PENDING"}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "32px 40px" }}>
        {/* Tenant + Property info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Tenant Details</div>
            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>{tenantUser?.name || tenant?.name || "Tenant"}</div>
            <div style={{ color: "#475569", fontSize: "13px" }}>{tenantUser?.email || tenant?.email || "-"}</div>
            <div style={{ color: "#475569", fontSize: "13px", marginTop: "2px" }}>{tenantUser?.phone || tenant?.phone || "-"}</div>
            <div style={{ marginTop: "10px", display: "inline-block", background: "#eff6ff", color: "#2563eb", borderRadius: "6px", padding: "2px 10px", fontSize: "12px", fontWeight: 700, fontFamily: "monospace" }}>
              ID: {loginId}
            </div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Property Details</div>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>{propertyName}</div>
            <div style={{ color: "#475569", fontSize: "13px" }}>{roomInfo}</div>
            {tenant?.moveInDate && (
              <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "6px" }}>
                Move-in: {formatDate(tenant.moveInDate)}
              </div>
            )}
          </div>
        </div>

        {/* Payment summary table */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "28px" }}>
          <div style={{ background: "#1e293b", color: "#fff", padding: "12px 20px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <span>Description</span><span style={{ textAlign: "center" }}>Period</span><span style={{ textAlign: "center" }}>Method</span><span style={{ textAlign: "right" }}>Amount</span>
          </div>
          <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>Monthly Rent</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                {rentItem?.collectionMonth || formatDate(payDate)?.split(" ").slice(1).join(" ")}
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: "13px", color: "#64748b" }}>
              {rentItem?.collectionMonth || "-"}
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: "6px", padding: "2px 8px", fontSize: "12px", fontWeight: 600 }}>
                {paymentMethodLabel(rentItem?.paymentMethod)}
              </span>
            </div>
            <div style={{ textAlign: "right", fontWeight: 700, fontSize: "16px", color: "#2563eb" }}>
              {formatCurrency(paidAmount)}
            </div>
          </div>
          {/* Total row */}
          <div style={{ borderTop: "2px solid #e2e8f0", background: "#f8fafc", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "15px" }}>Total Paid</span>
            <span style={{ fontWeight: 800, fontSize: "22px", color: "#16a34a" }}>{formatCurrency(paidAmount)}</span>
          </div>
        </div>

        {/* Transaction ID if available */}
        {(rentItem?.razorpay_payment_id || rentItem?.transactionId) && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 20px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#166534", fontWeight: 600 }}>Transaction ID:</span>
            <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#166534" }}>
              {rentItem?.razorpay_payment_id || rentItem?.transactionId}
            </span>
          </div>
        )}

        {/* Footer note */}
        <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            This is a computer-generated receipt. No signature required.
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>
            Generated: {formatDate(new Date().toISOString(), true)}
          </div>
        </div>
        <div style={{ marginTop: "8px", fontSize: "11px", color: "#cbd5e1", textAlign: "center" }}>
          Roomhy Property Management • support@roomhy.com • www.roomhy.com
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Tenantdashboard() {
  useHtmlPage({
    title: "Roomhy - Tenant Dashboard",
    bodyClass: "text-slate-800",
    htmlAttrs: { lang: "en" },
    metas: [
      { charset: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    ],
    links: [
      { href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap", rel: "stylesheet" },
      { rel: "stylesheet", href: "/tenant/assets/css/tenantdashboard.css" },
    ],
    scripts: [{ src: "https://cdn.tailwindcss.com" }, { src: "https://unpkg.com/lucide@latest" }],
    inlineScripts: [],
  });

  const apiBase = useMemo(() => getApiBase(), []);
  const [tenantUser] = useState(() => readTenantUser());
  const [tenant, setTenant] = useState(null);
  const [rent, setRent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [genericModal, setGenericModal] = useState(null);
  const [cashPanelOpen, setCashPanelOpen] = useState(false);
  const [cashOtp, setCashOtp] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [documentViewer, setDocumentViewer] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Gate Management State
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  
  const [visitorGuestName, setVisitorGuestName] = useState("");
  const [visitorGuestPhone, setVisitorGuestPhone] = useState("");
  const [visitorDate, setVisitorDate] = useState("");
  
  const [leaveDepartureDate, setLeaveDepartureDate] = useState("");
  const [leaveReturnDate, setLeaveReturnDate] = useState("");
  const [gateLeaveReason, setGateLeaveReason] = useState("");

  // Complaints State
  const [complaintCategory, setComplaintCategory] = useState("Plumbing");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintPriority, setComplaintPriority] = useState("Low");
  const [complaintStatusMsg, setComplaintStatusMsg] = useState("");
  const [complaintBusy, setComplaintBusy] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);

  // Visitor Pass State
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorExpectedTime, setVisitorExpectedTime] = useState("");
  const [visitorMsg, setVisitorMsg] = useState("");
  const [myVisitors, setMyVisitors] = useState([]);

  // Leave Request State
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveMsg, setLeaveMsg] = useState("");
  const [myLeaves, setMyLeaves] = useState([]);

  // Ledger state
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerBalance, setLedgerBalance] = useState(0);
  const [loadingLedger, setLoadingLedger] = useState(false);

  // KYC state
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState("");
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState("");
  const [addressProofUrl, setAddressProofUrl] = useState("");
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const [kycMsg, setKycMsg] = useState("");

  // Police Verification state
  const [policeReceiptUrl, setPoliceReceiptUrl] = useState("");
  const [uploadingPolice, setUploadingPolice] = useState(false);
  const [policeMsg, setPoliceMsg] = useState("");

  // Move-out state
  const [moveoutDate, setMoveoutDate] = useState("");
  const [moveoutReason, setMoveoutReason] = useState("");
  const [submittingMoveout, setSubmittingMoveout] = useState(false);
  const [moveoutMsg, setMoveoutMsg] = useState("");

  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState("Amenities");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // PDF state
  const [pdfBusy, setPdfBusy] = useState(false);
  const [activeReceiptItem, setActiveReceiptItem] = useState(null);
  const receiptRef = useRef(null);

  const loginId = String(tenantUser?.loginId || "").toUpperCase();
  const propertyName = tenant?.propertyTitle || tenant?.property?.title || tenant?.property?.name || "Roomhy Property";
  const roomInfo = tenant ? `Room ${tenant.roomNo || "-"}${tenant.bedNo ? ` (${tenant.bedNo})` : ""}` : "Room -";
  const rentAmount = Number(rent?.totalDue || rent?.rentAmount || tenant?.agreedRent || 0);
  const paymentStatus = String(rent?.paymentStatus || "pending").toLowerCase();
  const isPaid = paymentStatus === "paid" || paymentStatus === "completed";
  const statusLabel = isPaid ? "Paid" : paymentStatus === "overdue" ? "Overdue" : "Unpaid";

  const docs = useMemo(() => {
    const items = [
      {
        key: "agreement",
        title: "Rental Agreement",
        subtitle: tenant?.agreementSignedAt
          ? `Signed on ${formatDate(tenant.agreementSignedAt)}`
          : "Agreement available in tenant records",
        icon: "file-text",
        accent: "purple",
        actionLabel: "View Agreement",
        onView: () => {
          setDocumentViewer({
            title: "Rental Agreement",
            type: "agreement",
            body: (
              <div className="space-y-4 text-sm text-slate-600">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Agreement Status</p>
                  <p className="font-semibold text-slate-900">
                    {tenant?.agreementSignedAt ? `Signed on ${formatDate(tenant.agreementSignedAt)}` : "Not signed yet"}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tenant</p>
                    <p className="font-semibold text-slate-900">{tenantUser?.name || tenant?.name || "Tenant"}</p>
                    <p>{tenantUser?.email || tenant?.email || "-"}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Property</p>
                    <p className="font-semibold text-slate-900">{propertyName}</p>
                    <p>{roomInfo}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-purple-100 bg-purple-50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-2">Agreement Summary</p>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Monthly rent: {formatCurrency(tenant?.agreedRent || tenant?.rentAmount || rentAmount)}</li>
                    <li>Move-in date: {formatDate(tenant?.moveInDate)}</li>
                    <li>Status: {tenant?.agreementSignedAt ? "Completed" : "Pending signature"}</li>
                  </ul>
                </div>
              </div>
            )
          });
        }
      },
    ];
    const latestPaid = history.find((item) =>
      ["paid", "completed"].includes(String(item.paymentStatus || "").toLowerCase())
    );
    if (latestPaid) {
      items.push({
        key: "receipt",
        title: `${latestPaid.collectionMonth || "Current"} Rent Receipt`,
        subtitle: `Paid via ${paymentMethodLabel(latestPaid.paymentMethod)}`,
        icon: "receipt",
        accent: "green",
        rentItem: latestPaid,
        downloadable: true,
        actionLabel: "View Bill",
        onView: () => {
          setDocumentViewer({
            title: "Rent Receipt",
            type: "receipt",
            body: (
              <div className="space-y-4 text-sm text-slate-600">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Receipt Details</p>
                  <p className="font-semibold text-slate-900">{latestPaid.collectionMonth || "Current"} Rent Receipt</p>
                  <p>{formatDate(latestPaid.paymentDate || latestPaid.updatedAt || latestPaid.createdAt, true)}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Payment Method</p>
                    <p className="font-semibold text-slate-900">{paymentMethodLabel(latestPaid.paymentMethod)}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Paid Amount</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(latestPaid.paidAmount || latestPaid.totalDue || latestPaid.rentAmount)}</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-green-100 bg-green-50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-2">Receipt Status</p>
                  <p className="font-semibold text-slate-900">Paid</p>
                  <p className="mt-1 text-slate-600">You can preview the bill here and download the PDF if needed.</p>
                </div>
              </div>
            )
          });
        }
      });
    }
    return items;
  }, [history, tenant, tenantUser, propertyName, roomInfo, rentAmount]);

  // File upload helper
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${apiBase}/api/upload-file`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error || errData?.message || "File upload failed.");
    }
    const data = await response.json();
    return data.url;
  };

  // Submit KYC handler
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!aadhaarNumber) { setKycMsg("Aadhaar Number is required."); return; }
    setUploadingKyc(true);
    setKycMsg("Uploading files and submitting KYC...");
    try {
      let frontUrl = aadhaarFrontUrl;
      let backUrl = aadhaarBackUrl;
      let addressUrl = addressProofUrl;

      const frontInput = document.getElementById("kyc-aadhaar-front");
      const backInput = document.getElementById("kyc-aadhaar-back");
      const addressInput = document.getElementById("kyc-address-proof");

      if (frontInput?.files?.[0]) {
        frontUrl = await uploadFile(frontInput.files[0]);
        setAadhaarFrontUrl(frontUrl);
      }
      if (backInput?.files?.[0]) {
        backUrl = await uploadFile(backInput.files[0]);
        setAadhaarBackUrl(backUrl);
      }
      if (addressInput?.files?.[0]) {
        addressUrl = await uploadFile(addressInput.files[0]);
        setAddressProofUrl(addressUrl);
      }

      const res = await fetchJson("/api/tenants/kyc/submit", {
        method: "POST",
        body: JSON.stringify({
          tenantLoginId: loginId,
          aadhaarNumber,
          panNumber,
          aadhaarFront: frontUrl,
          aadhaarBack: backUrl,
          addressProofFile: addressUrl,
        }),
      });

      if (res?.success) {
        setKycMsg("KYC documents submitted successfully!");
        await loadTenant();
      } else {
        setKycMsg("Submission failed: " + (res?.message || "Unknown error"));
      }
    } catch (err) {
      setKycMsg("Error submitting KYC: " + err.message);
    } finally {
      setUploadingKyc(false);
    }
  };

  // Submit Police handler
  const handlePoliceSubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById("police-receipt-file");
    if (!fileInput?.files?.[0] && !policeReceiptUrl) {
      setPoliceMsg("Please select a file to upload.");
      return;
    }
    setUploadingPolice(true);
    setPoliceMsg("Uploading receipt file...");
    try {
      let fileUrl = policeReceiptUrl;
      if (fileInput?.files?.[0]) {
        fileUrl = await uploadFile(fileInput.files[0]);
        setPoliceReceiptUrl(fileUrl);
      }
      const res = await fetchJson("/api/tenants/police/submit", {
        method: "POST",
        body: JSON.stringify({
          tenantLoginId: loginId,
          receiptFile: fileUrl,
        }),
      });
      if (res?.success) {
        setPoliceMsg("Police verification receipt uploaded successfully!");
        await loadTenant();
      } else {
        setPoliceMsg("Submission failed: " + (res?.message || "Unknown error"));
      }
    } catch (err) {
      setPoliceMsg("Error uploading verification: " + err.message);
    } finally {
      setUploadingPolice(false);
    }
  };

  // Submit Moveout handler
  const handleMoveoutSubmit = async (e) => {
    e.preventDefault();
    if (!moveoutDate) { setMoveoutMsg("Please select a move-out date."); return; }
    if (!moveoutReason) { setMoveoutMsg("Please state your reason for moving out."); return; }
    setSubmittingMoveout(true);
    setMoveoutMsg("Submitting move-out notice...");
    try {
      const res = await fetchJson("/api/tenants/moveout", {
        method: "POST",
        body: JSON.stringify({
          tenantLoginId: loginId,
          requestedDate: moveoutDate,
          reason: moveoutReason,
        }),
      });
      if (res?.success) {
        setMoveoutMsg("Move-out notice submitted successfully!");
        await loadTenant();
      } else {
        setMoveoutMsg("Submission failed: " + (res?.message || "Unknown error"));
      }
    } catch (err) {
      setMoveoutMsg("Error submitting notice: " + err.message);
    } finally {
      setSubmittingMoveout(false);
    }
  };

  // Submit Feedback handler
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComments.trim()) { setFeedbackMsg("Comments are required."); return; }
    setSubmittingFeedback(true);
    setFeedbackMsg("Submitting feedback...");
    try {
      const res = await fetchJson("/api/tenants/feedback", {
        method: "POST",
        body: JSON.stringify({
          tenantLoginId: loginId,
          category: feedbackCategory,
          rating: feedbackRating,
          comments: feedbackComments,
        }),
      });
      if (res?.success) {
        setFeedbackMsg("Thank you! Your feedback has been recorded.");
        setFeedbackComments("");
        setFeedbackRating(5);
      } else {
        setFeedbackMsg("Submission failed: " + (res?.message || "Unknown error"));
      }
    } catch (err) {
      setFeedbackMsg("Error submitting feedback: " + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // ─── Data fetchers ───────────────────────────────────────────────────────────
  const loadTenant = async () => {
    if (!loginId) { window.location.href = "/tenant/tenantlogin"; return null; }
    const localTenant = readLocalTenants().find((i) => String(i.loginId || "").toUpperCase() === loginId);
    if (localTenant) {
      setTenant(localTenant);
      if (localTenant.kyc?.aadhaarNumber) setAadhaarNumber(localTenant.kyc.aadhaarNumber);
      if (localTenant.kyc?.panNumber) setPanNumber(localTenant.kyc.panNumber || "");
      if (localTenant.kyc?.aadhaarFront) setAadhaarFrontUrl(localTenant.kyc.aadhaarFront);
      if (localTenant.kyc?.aadhaarBack) setAadhaarBackUrl(localTenant.kyc.aadhaarBack);
      if (localTenant.kyc?.addressProofFile) setAddressProofUrl(localTenant.kyc.addressProofFile);
      if (localTenant.policeVerification?.receiptFile) setPoliceReceiptUrl(localTenant.policeVerification.receiptFile);
    }
    try {
      const data = await fetchJson("/api/tenants");
      const list = data?.tenants || data || [];
      const match = list.find((i) => String(i.loginId || "").toUpperCase() === loginId);
      if (match) {
        upsertTenantRecord(match);
        setTenant(match);
        if (match.kyc?.aadhaarNumber) setAadhaarNumber(match.kyc.aadhaarNumber);
        if (match.kyc?.panNumber) setPanNumber(match.kyc.panNumber || "");
        if (match.kyc?.aadhaarFront) setAadhaarFrontUrl(match.kyc.aadhaarFront);
        if (match.kyc?.aadhaarBack) setAadhaarBackUrl(match.kyc.aadhaarBack);
        if (match.kyc?.addressProofFile) setAddressProofUrl(match.kyc.addressProofFile);
        if (match.policeVerification?.receiptFile) setPoliceReceiptUrl(match.policeVerification.receiptFile);
        return match;
      }
      if (localTenant) return localTenant;
      throw new Error("Tenant profile not found.");
    } catch (err) {
      if (localTenant) return localTenant;
      throw err;
    }
  };

  const loadRents = async () => {
    if (!loginId) return [];
    const data = await fetchJson(`/api/rents/tenant/${encodeURIComponent(loginId)}?limit=15`);
    const rents = data?.rents || [];
    setHistory(rents);
    setRent(rents[0] || null);
    return rents;
  };

  const loadLedger = async () => {
    if (!loginId) return;
    setLoadingLedger(true);
    try {
      const data = await fetchJson(`/api/tenants/ledger/${encodeURIComponent(loginId)}`);
      if (data?.success) {
        setLedgerEntries(data.ledger || []);
        setLedgerBalance(data.finalBalance || 0);
      }
    } catch (err) {
      console.error("Failed to load tenant ledger:", err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const tData = await loadTenant();
      await loadRents();
      if (tData) {
        await loadLedger();
      }
    }
    catch (err) { setErrorMsg(err?.body || err?.message || "Failed to load tenant dashboard."); }
    finally { setLoading(false); }
  };

  useEffect(() => { refreshDashboard(); }, []);

  useEffect(() => {
    if (window?.lucide) window.lucide.createIcons();
  }, [tenant, rent, history, payOpen, userMenuOpen, genericModal, cashPanelOpen, pdfBusy, activeTab]);

  useEffect(() => {
    const page = document.querySelector(".html-page");
    const shell = page?.closest(".shared-shell");
    if (!shell) return;
    const sidebar = shell.querySelector(".shared-sidebar");
    const header = shell.querySelector(".shared-header");
    const content = shell.querySelector(".shared-content");
    if (sidebar) sidebar.remove();
    if (header) header.remove();
    if (content) { content.style.padding = "0"; content.style.minHeight = "100vh"; }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pay") === "online") setPayOpen(true);
    if (params.get("pay") === "cash") { setPayOpen(true); setCashPanelOpen(true); }
  }, []);

  // ─── PDF Download ────────────────────────────────────────────────────────────
  const downloadReceiptPdf = async (rentItem) => {
    if (pdfBusy) return;
    setPdfBusy(true);
    setActiveReceiptItem(rentItem);

    // Wait a tick for the hidden receipt DOM to render
    await new Promise((r) => setTimeout(r, 120));

    try {
      await ensurePdfLibsLoaded();

      const el = receiptRef.current;
      if (!el) throw new Error("Receipt template not mounted.");

      // Temporarily make visible for html2canvas
      el.style.left = "-9999px";
      el.style.position = "fixed";

      const canvas = await window.html2canvas(el, {
        scale: 2,             // Retina quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const receiptNo = rentItem?._id
        ? `RMH-${String(rentItem._id).slice(-8).toUpperCase()}`
        : `RMH-${Date.now()}`;
      pdf.save(`Roomhy_Receipt_${receiptNo}.pdf`);

    } catch (err) {
      alert("Receipt download failed: " + (err?.message || "Unknown error"));
    } finally {
      setPdfBusy(false);
      setActiveReceiptItem(null);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const openGenericModal = (title, body, footer = null) => setGenericModal({ title, body, footer });
  const closeDocumentViewer = () => setDocumentViewer(null);

  const clearSession = () => {
    try { localStorage.removeItem("tenant_user"); localStorage.removeItem("user"); } catch {}
    window.location.href = "/tenant/tenantlogin";
  };

  const syncPaymentState = async () => {
    await loadRents();
    localStorage.setItem("roomhy_payment_updated", String(Date.now()));
    window.dispatchEvent(new Event("paymentUpdated"));
  };

  // ─── Payment handlers ─────────────────────────────────────────────────────────
  const handleOnlinePayment = async () => {
    if (!tenantUser || rentAmount <= 0) { setActionMsg("Invalid rent amount."); return; }
    setActionBusy(true);
    setActionMsg("");
    try {
      const orderResponse = await fetch(`${apiBase}/api/rents/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: rentAmount,
          tenantId: loginId,
          rentId: rent?._id,
          description: "Monthly Rent Payment",
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData?.success)
        throw new Error(orderData?.error || orderData?.message || "Failed to create payment order.");

      await ensureRazorpayLoaded();
      const razorpay = new window.Razorpay({
        key: orderData.key,
        amount: rentAmount * 100,
        currency: "INR",
        name: "Roomhy",
        description: "Monthly Rent Payment",
        order_id: orderData.order?.id,
        prefill: {
          name: tenantUser?.name || tenant?.name || "Tenant",
          email: tenantUser?.email || tenant?.email || "",
          contact: tenantUser?.phone || tenant?.phone || "",
        },
        notes: { tenantId: loginId, rentMonth: new Date().toISOString().slice(0, 7) },
        handler: async (response) => {
          try {
            const verifyResult = await fetchJson("/api/rents/verify-payment", {
              method: "POST",
              body: JSON.stringify({
                tenantId: loginId,
                rentId: rent?._id,
                paidAmount: rentAmount,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            await syncPaymentState();
            setPayOpen(false);

            // Get fresh rent item (with payment id) for the receipt
            const freshRents = await fetchJson(`/api/rents/tenant/${encodeURIComponent(loginId)}?limit=1`).catch(() => null);
            const freshRentItem = freshRents?.rents?.[0] || {
              ...rent,
              paidAmount: rentAmount,
              paymentMethod: "razorpay",
              razorpay_payment_id: response.razorpay_payment_id,
              paymentStatus: "paid",
            };

            openGenericModal(
              "Payment Confirmation",
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i data-lucide="check-circle" className="w-8 h-8 text-green-600"></i>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Payment Successful!</h4>
                <p className="text-sm text-slate-600 mb-6">
                  Your rent payment has been recorded and confirmed.
                </p>
                <button
                  onClick={() => downloadReceiptPdf(freshRentItem)}
                  disabled={pdfBusy}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60"
                >
                  <i data-lucide="download" className="w-4 h-4"></i>
                  {pdfBusy ? "Generating PDF..." : "Download Receipt (PDF)"}
                </button>
              </div>
            );
          } catch (err) {
            setActionMsg(err?.body || err?.message || "Payment record failed.");
          }
        },
        modal: { ondismiss: () => setActionMsg("Payment cancelled.") },
        theme: { color: "#2563eb" },
      });
      razorpay.open();
    } catch (err) {
      setActionMsg(err?.body || err?.message || "Failed to initiate payment.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!tenant) return;
    setComplaintBusy(true);
    setComplaintStatusMsg("Submitting complaint...");
    try {
      await fetchJson("/api/complaints", {
        method: "POST",
        body: JSON.stringify({
          tenantId: tenant._id,
          tenantLoginId: tenant.loginId,
          tenantName: tenantUser?.name || tenant.name,
          tenantPhone: tenantUser?.phone || tenant.phone,
          tenantEmail: tenantUser?.email || tenant.email,
          property: tenant.propertyTitle || tenant.property?.title,
          propertyId: tenant.propertyId || tenant.property?._id,
          roomNo: tenant.roomNo,
          bedNo: tenant.bedNo,
          category: complaintCategory,
          description: complaintDesc,
          priority: complaintPriority,
          status: "Open"
        })
      });
      setComplaintStatusMsg("Complaint submitted successfully! The owner has been notified.");
      setComplaintDesc("");
      fetchMyComplaints();
    } catch (err) {
      setComplaintStatusMsg(err?.body || err?.message || "Failed to submit complaint.");
    } finally {
      setComplaintBusy(false);
    }
  };

  const fetchMyComplaints = async () => {
    if (!tenant) return;
    try {
      const data = await fetchJson(`/api/complaints/tenant/${tenant._id}`);
      if (data && data.complaints) {
        setMyComplaints(data.complaints);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    }
  };

  const fetchMyVisitors = async () => {
    if (!tenant) return;
    try {
      const data = await fetchJson(`/api/visitors/tenant/${tenant.loginId}`);
      if (data && data.visitors) {
        setMyVisitors(data.visitors);
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    }
  };

  const fetchMyLeaves = async () => {
    if (!tenant) return;
    try {
      const data = await fetchJson(`/api/leaves/tenant/${tenant.loginId}`);
      if (data && data.leaves) {
        setMyLeaves(data.leaves);
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    }
  };

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    if (!tenant) return;
    setComplaintBusy(true);
    setVisitorMsg("Submitting visitor pass request...");
    try {
      await fetchJson("/api/visitors", {
        method: "POST",
        body: JSON.stringify({
          tenantLoginId: tenant.loginId,
          ownerLoginId: tenant.ownerLoginId,
          visitorName,
          visitorPhone,
          expectedEntryTime: visitorExpectedTime,
          status: "Pre-approved"
        })
      });
      setVisitorMsg("Visitor Pass Pre-approved!");
      setVisitorName("");
      setVisitorPhone("");
      setVisitorExpectedTime("");
      fetchMyVisitors();
    } catch (err) {
      setVisitorMsg(err?.body || err?.message || "Failed to create visitor pass.");
    } finally {
      setComplaintBusy(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!tenant) return;
    setComplaintBusy(true);
    setLeaveMsg("Submitting leave request...");
    try {
      await fetchJson("/api/leaves", {
        method: "POST",
        body: JSON.stringify({
          tenantLoginId: tenant.loginId,
          ownerLoginId: tenant.ownerLoginId,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason
        })
      });
      setLeaveMsg("Leave request submitted successfully!");
      setLeaveStartDate("");
      setLeaveEndDate("");
      setLeaveReason("");
      fetchMyLeaves();
    } catch (err) {
      setLeaveMsg(err?.body || err?.message || "Failed to submit leave request.");
    } finally {
      setComplaintBusy(false);
    }
  };

  useEffect(() => {
    if (tenant) {
      if (activeTab === "complaints") fetchMyComplaints();
      if (activeTab === "visitor") fetchMyVisitors();
      if (activeTab === "leave") fetchMyLeaves();
    }
  }, [activeTab, tenant]);

  const handleCashRequest = async () => {
    if (!tenant) { setActionMsg("Tenant data not found."); return; }
    setActionBusy(true);
    setActionMsg("Sending cash request to owner...");
    setCashPanelOpen(true);
    try {
      const result = await fetchJson("/api/rents/cash/request", {
        method: "POST",
        body: JSON.stringify({
          tenantLoginId: loginId,
          ownerLoginId: tenant.ownerLoginId,
          amount: rentAmount,
          propertyName,
          roomNumber: tenant.roomNo || "",
          tenantName: tenantUser?.name || tenant.name || "",
          tenantEmail: tenantUser?.email || tenant.email || "",
          tenantPhone: tenantUser?.phone || tenant.phone || "",
        }),
      });
      setRent(result?.rent || rent);
      setActionMsg("Cash request sent. Ask owner to click Received. OTP will come to your email.");
      await syncPaymentState();
    } catch (err) {
      setActionMsg(err?.body || err?.message || "Cash request failed.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleCashOtpVerify = async () => {
    if (!cashOtp.trim()) { setActionMsg("Enter OTP."); return; }
    setActionBusy(true);
    setActionMsg("Verifying OTP...");
    try {
      await fetchJson("/api/rents/cash/verify-otp", {
        method: "POST",
        body: JSON.stringify({ tenantLoginId: loginId, otp: cashOtp.trim() }),
      });
      await syncPaymentState();
      setPayOpen(false);
      setCashOtp("");
      setCashPanelOpen(false);

      // Build a cash receipt item
      const cashRentItem = history[0] || {
        ...rent,
        paidAmount: rentAmount,
        paymentMethod: "cash",
        paymentStatus: "paid",
        paymentDate: new Date().toISOString(),
      };

      openGenericModal(
        "Payment Confirmation",
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="check-circle" className="w-8 h-8 text-green-600"></i>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Cash Payment Verified</h4>
          <p className="text-sm text-slate-600 mb-6">Your cash payment has been marked as paid.</p>
          <button
            onClick={() => downloadReceiptPdf(cashRentItem)}
            disabled={pdfBusy}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60"
          >
            <i data-lucide="download" className="w-4 h-4"></i>
            {pdfBusy ? "Generating PDF..." : "Download Receipt (PDF)"}
          </button>
        </div>
      );
    } catch (err) {
      setActionMsg(err?.body || err?.message || "OTP verification failed.");
    } finally {
      setActionBusy(false);
    }
  };

  const activityRows = history.length > 0 ? history : [];

  const handleCreateVisitorPass = async (e) => {
    e.preventDefault();
    if (!visitorGuestName || !visitorGuestPhone || !visitorDate) return setActionMsg("Please fill all fields.");
    setActionBusy(true);
    setActionMsg("Generating pass...");
    try {
      const res = await fetchJson("/api/tenant-gate/visitor-pass", {
        method: "POST",
        body: JSON.stringify({
          tenantId: tenant._id,
          guestName: visitorGuestName,
          guestPhone: visitorGuestPhone,
          expectedDate: visitorDate
        }),
      });
      setVisitorModalOpen(false);
      openGenericModal("Visitor Pass Generated", <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg"><p className="font-bold text-orange-900">Pass Code: {res.pass.passCode}</p><p className="text-sm text-orange-700">Share this code with your guest.</p></div>);
    } catch (err) {
      setActionMsg(err?.message || "Failed to generate pass.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleCreateLeaveRequest = async (e) => {
    e.preventDefault();
    if (!leaveDepartureDate || !leaveReturnDate || !gateLeaveReason) return setActionMsg("Please fill all fields.");
    setActionBusy(true);
    setActionMsg("Submitting leave request...");
    try {
      await fetchJson("/api/tenant-gate/leave-request", {
        method: "POST",
        body: JSON.stringify({
          tenantId: tenant._id,
          departureDate: leaveDepartureDate,
          returnDate: leaveReturnDate,
          reason: gateLeaveReason
        }),
      });
      setLeaveModalOpen(false);
      openGenericModal("Leave Request Submitted", <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg"><p className="text-indigo-900 font-medium">Your request has been sent to the property manager.</p></div>);
    } catch (err) {
      setActionMsg(err?.message || "Failed to submit request.");
    } finally {
      setActionBusy(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="html-page">
      {/* Hidden receipt template — rendered off-screen for pdf capture */}
      {activeReceiptItem && (
        <ReceiptTemplate
          receiptRef={receiptRef}
          tenant={tenant}
          tenantUser={tenantUser}
          rentItem={activeReceiptItem}
          loginId={loginId}
          propertyName={propertyName}
          roomInfo={roomInfo}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0f172a] flex-shrink-0 hidden md:flex flex-col transition-all duration-300">
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="bg-purple-600 p-2 rounded-lg mr-3">
              <i data-lucide="home" className="w-5 h-5 text-white"></i>
            </div>
            <div>
              <img src="/website/images/whitelogo.jpeg" alt="Roomhy Logo" className="h-16 w-auto" />
              <p className="text-[10px] text-slate-400 font-medium tracking-wider">TENANT PORTAL</p>
            </div>
          </div>
          <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="home" className="w-5 h-5 mr-3"></i> Dashboard
            </button>

            <button
              onClick={() => setActiveTab("ledger")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "ledger"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="receipt" className="w-5 h-5 mr-3"></i> Tenant Ledger
            </button>

            <button
              onClick={() => setActiveTab("kyc")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "kyc"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="shield-check" className="w-5 h-5 mr-3"></i> KYC Verification
            </button>

            <button
              onClick={() => setActiveTab("police")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "police"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="shield" className="w-5 h-5 mr-3"></i> Police Verification
            </button>

            <button
              onClick={() => setActiveTab("moveout")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "moveout"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="log-out" className="w-5 h-5 mr-3"></i> Move-out Notice
            </button>

            <button
              onClick={() => setActiveTab("feedback")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "feedback"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="star" className="w-5 h-5 mr-3"></i> Feedback & Review
            </button>

            <div className="sidebar-section-title px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">Gate Management</div>

            <button
              onClick={() => setActiveTab("visitor")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "visitor"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="user-plus" className="w-5 h-5 mr-3"></i> Visitor Pass
            </button>
            <button
              onClick={() => setActiveTab("leave")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "leave"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="calendar-off" className="w-5 h-5 mr-3"></i> Leave Request
            </button>

            <div className="sidebar-section-title px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">Help & Requests</div>

            <button
              onClick={() => setActiveTab("complaints")}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                activeTab === "complaints"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <i data-lucide="flag" className="w-5 h-5 mr-3"></i> Lodge Complaint
            </button>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={clearSession}
              className="flex items-center text-slate-400 hover:text-white w-full px-4 py-2 text-sm font-medium transition-colors text-left"
            >
              <i data-lucide="log-out" className="w-5 h-5 mr-3"></i> Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <header className="bg-white h-16 flex items-center justify-between px-6 border-b border-slate-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === "dashboard" && "Tenant Dashboard"}
              {activeTab === "ledger" && "Resident Ledger Statement"}
              {activeTab === "kyc" && "KYC Document Verification"}
              {activeTab === "police" && "Police Station Verification Receipt"}
              {activeTab === "moveout" && "Submit Exit Move-out Notice"}
              {activeTab === "feedback" && "Submit Reviews & Feedback"}
              {activeTab === "visitor" && "Request Visitor Pass"}
              {activeTab === "leave" && "Submit Leave Request"}
            </h2>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
            {errorMsg ? <div className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-200">{errorMsg}</div> : null}

            {/* TAB 1: DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Welcome */}
                <div>
                  <h2 className="text-4xl font-bold text-slate-900">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {(tenantUser?.name || tenant?.name || "Tenant").split(" ")[0]}
                    </span>
                  </h2>
                  <p className="text-slate-500 mt-2">Here's your rental summary and account overview</p>
                </div>

                {/* Rent Banner */}
                <div className="rent-banner p-8 rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                  <div className="relative z-10 grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-2 text-blue-100 mb-3">
                        <i data-lucide="receipt" className="w-5 h-5"></i>
                        <span className="font-semibold text-sm uppercase tracking-wide">Monthly Rent Payment</span>
                      </div>
                      <div className="mb-6">
                        <p className="text-sm text-blue-100 mb-2">Amount Due</p>
                        <h1 className="text-6xl font-bold text-white">
                          {loading ? "₹ --" : formatCurrency(isPaid ? 0 : rentAmount)}
                        </h1>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur">
                          Due: 5th of Month
                        </span>
                        <span className={`px-4 py-2 text-white rounded-full text-sm font-bold flex items-center gap-1 ${isPaid ? "bg-green-500" : paymentStatus === "overdue" ? "bg-red-500" : "bg-amber-500"}`}>
                          <i data-lucide={isPaid ? "check-circle" : "alert-circle"} className="w-4 h-4"></i>{" "}
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-start md:items-end gap-6">
                      <div className="text-white/90 text-sm space-y-2">
                        <p><strong>Property:</strong> {propertyName}</p>
                        <p><strong>Room:</strong> {roomInfo}</p>
                        <p><strong>Login ID:</strong> <span className="font-mono">{loginId || "--"}</span></p>
                      </div>
                      <button
                        onClick={() => setPayOpen(true)}
                        className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold shadow-lg transition-all hover:shadow-2xl hover:scale-105 flex items-center gap-2 w-full md:w-auto justify-center"
                      >
                        <i data-lucide="credit-card" className="w-5 h-5"></i> Pay Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <button onClick={() => setActiveTab("complaints")} className="dashboard-card p-6 flex flex-col cursor-pointer group text-left">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 transition">
                      <i data-lucide="flag" className="w-6 h-6 text-red-600"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Lodge Complaint</h3>
                    <p className="text-sm text-slate-500">Report maintenance or other issues</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Open <i data-lucide="arrow-right" className="w-4 h-4"></i>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("kyc")}
                    className="dashboard-card p-6 flex flex-col cursor-pointer group text-left"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                      <i data-lucide="shield-check" className="w-6 h-6 text-purple-600"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">KYC Documents</h3>
                    <p className="text-sm text-slate-500">Access rental agreements and identity files</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Upload <i data-lucide="arrow-right" className="w-4 h-4"></i>
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      openGenericModal(
                        "Emergency Contacts",
                        <div className="space-y-3">
                          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="font-bold text-red-700 text-sm">Property Manager</p>
                            <p className="text-lg font-bold text-red-900 mt-1">+91 98765 43210</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="font-medium text-slate-700 text-sm">Local Police</p>
                            <p className="text-lg font-bold text-slate-900 mt-1">100</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="font-medium text-slate-700 text-sm">Ambulance</p>
                            <p className="text-lg font-bold text-slate-900 mt-1">108</p>
                          </div>
                        </div>
                      )
                    }
                    className="dashboard-card p-6 flex flex-col cursor-pointer group text-left"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
                      <i data-lucide="phone-call" className="w-6 h-6 text-green-600"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Emergency Contacts</h3>
                    <p className="text-sm text-slate-500">Quick access to important contacts</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Show <i data-lucide="arrow-right" className="w-4 h-4"></i>
                    </div>
                  </button>
                  <button onClick={() => setVisitorModalOpen(true)} className="dashboard-card p-6 flex flex-col cursor-pointer group text-left">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition">
                      <i data-lucide="user-plus" className="w-6 h-6 text-orange-600"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Visitor Pass</h3>
                    <p className="text-sm text-slate-500">Generate pass for your guests</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Create <i data-lucide="arrow-right" className="w-4 h-4"></i>
                    </div>
                  </button>
                  <button onClick={() => setLeaveModalOpen(true)} className="dashboard-card p-6 flex flex-col cursor-pointer group text-left">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
                      <i data-lucide="calendar-off" className="w-6 h-6 text-indigo-600"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Leave Request</h3>
                    <p className="text-sm text-slate-500">Submit exit details for holidays</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Submit <i data-lucide="arrow-right" className="w-4 h-4"></i>
                    </div>
                  </button>
                </div>

                {/* Current Stay */}
                <div className="dashboard-card p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i data-lucide="home" className="w-6 h-6 text-blue-600"></i>
                    </div>
                    Your Current Stay
                  </h3>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Property</p>
                      <p className="text-lg font-bold text-slate-900">{propertyName}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">Room Details</p>
                      <p className="text-lg font-bold text-blue-900">{roomInfo}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-100">
                      <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-2">Login ID</p>
                      <p className="text-lg font-bold text-purple-900 font-mono">{loginId || "--"}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-100">
                      <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-2">Move-In Date</p>
                      <p className="text-lg font-bold text-orange-900">{formatDate(tenant?.moveInDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div id="documents" className="dashboard-card p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i data-lucide="folder-open" className="w-6 h-6 text-purple-600"></i>
                    </div>
                    Documents & Bills
                  </h3>
                  <div className="space-y-3">
                    {docs.map((doc) => (
                      <div
                        key={doc.key}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.accent === "green" ? "bg-green-100" : "bg-purple-100"}`}>
                            <i data-lucide={doc.icon} className={`w-5 h-5 ${doc.accent === "green" ? "text-green-600" : "text-purple-600"}`}></i>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{doc.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{doc.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={doc.onView}
                            className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition"
                          >
                            <i data-lucide="eye" className="w-3 h-3"></i>
                            {doc.actionLabel || "View"}
                          </button>
                          {doc.downloadable ? (
                            <button
                              onClick={() => downloadReceiptPdf(doc.rentItem)}
                              disabled={pdfBusy}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
                            >
                              <i data-lucide="download" className="w-3 h-3"></i>
                              {pdfBusy ? "Generating..." : "Download PDF"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div id="activity" className="dashboard-card p-8 pb-12">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i data-lucide="activity" className="w-6 h-6 text-blue-600"></i>
                    </div>
                    Activity Timeline
                  </h3>
                  <div className="space-y-6">
                    {activityRows.length === 0 ? (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                            <i data-lucide="clock-3" className="w-5 h-5 text-slate-500"></i>
                          </div>
                        </div>
                        <div className="pt-1">
                          <p className="font-semibold text-slate-900">No payment activity yet</p>
                          <p className="text-sm text-slate-500 mt-1">Your rent payments will appear here.</p>
                        </div>
                      </div>
                    ) : (
                      activityRows.map((item, index) => {
                        const paid = ["paid", "completed"].includes(String(item.paymentStatus || "").toLowerCase());
                        return (
                          <div key={item._id || `${item.collectionMonth}-${index}`} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md ${paid ? "bg-green-100" : "bg-amber-100"}`}>
                                <i data-lucide={paid ? "check-circle" : "clock-3"} className={`w-5 h-5 ${paid ? "text-green-600" : "text-amber-600"}`}></i>
                              </div>
                              {index < activityRows.length - 1 ? (
                                <div className="w-0.5 h-12 bg-slate-200 mt-2"></div>
                              ) : null}
                            </div>
                            <div className="pt-1 flex-1">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {paid ? "Rent Paid Successfully" : "Rent Payment Pending"}
                                  </p>
                                  <p className="text-sm text-slate-500 mt-1">
                                    {formatDate(item.paymentDate || item.updatedAt || item.createdAt, true)} •{" "}
                                    {formatCurrency(item.paidAmount || item.totalDue || item.rentAmount)} •{" "}
                                    {paymentMethodLabel(item.paymentMethod)}
                                  </p>
                                </div>
                                {paid && (
                                  <button
                                    onClick={() => downloadReceiptPdf(item)}
                                    disabled={pdfBusy}
                                    title="Download Receipt"
                                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                  >
                                    <i data-lucide="download" className="w-3 h-3"></i>
                                    {pdfBusy ? "..." : "Receipt"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LEDGER */}
            {activeTab === "ledger" && (
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Tenant Ledger Statement</h2>
                    <p className="text-slate-500 mt-1">Complete logs of all monthly rent charges, payments, and owner adjustments.</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl transition"
                  >
                    <i data-lucide="printer" className="w-4 h-4"></i> Print Statement
                  </button>
                </div>

                {/* Ledger Balance Card */}
                <div className={`p-6 rounded-2xl border ${
                  ledgerBalance > 0 
                    ? "bg-rose-50 border-rose-200" 
                    : ledgerBalance < 0 
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Balance</p>
                      <h3 className={`text-4xl font-extrabold mt-1 ${
                        ledgerBalance > 0 ? "text-rose-600" : ledgerBalance < 0 ? "text-emerald-600" : "text-slate-700"
                      }`}>
                        {formatCurrency(ledgerBalance)}
                      </h3>
                      <p className="text-sm text-slate-600 mt-2">
                        {ledgerBalance > 0 
                          ? "You have outstanding rent or other dues. Please clear them as soon as possible." 
                          : ledgerBalance < 0 
                          ? "You have an advance credit balance on your ledger."
                          : "Your account balance is fully settled."
                        }
                      </p>
                    </div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      ledgerBalance > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                    }`}>
                      <i data-lucide={ledgerBalance > 0 ? "alert-circle" : "check-circle"} className="w-8 h-8"></i>
                    </div>
                  </div>
                </div>

                {/* Ledger Entries Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    {loadingLedger ? (
                      <div className="p-8 text-center text-slate-500">Loading ledger statement...</div>
                    ) : ledgerEntries.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">No ledger transactions found.</div>
                    ) : (
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider border-b border-slate-200">
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Transaction Details</th>
                            <th className="px-6 py-4 font-semibold text-right">Debit (+)</th>
                            <th className="px-6 py-4 font-semibold text-right">Credit (-)</th>
                            <th className="px-6 py-4 font-semibold text-right">Running Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ledgerEntries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{entry.date}</td>
                              <td className="px-6 py-4 font-medium text-slate-800">{entry.details}</td>
                              <td className="px-6 py-4 text-right text-rose-600 whitespace-nowrap">
                                {entry.debit > 0 ? `+ ₹${entry.debit.toLocaleString()}` : "—"}
                              </td>
                              <td className="px-6 py-4 text-right text-emerald-600 whitespace-nowrap">
                                {entry.credit > 0 ? `- ₹${entry.credit.toLocaleString()}` : "—"}
                              </td>
                              <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${
                                entry.balance > 0 ? "text-rose-600" : entry.balance < 0 ? "text-emerald-600" : "text-slate-600"
                              }`}>
                                {formatCurrency(entry.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: KYC */}
            {activeTab === "kyc" && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">KYC Verification</h2>
                  <p className="text-slate-500 mt-1">Submit your identity cards and documentation to complete compliance check.</p>
                </div>

                {/* Status banner */}
                <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                  tenant?.kycStatus === "verified"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : tenant?.kycStatus === "submitted"
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : tenant?.kycStatus === "rejected"
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  <div className="pt-0.5">
                    <i data-lucide={
                      tenant?.kycStatus === "verified" ? "check-circle" :
                      tenant?.kycStatus === "submitted" ? "clock-3" :
                      tenant?.kycStatus === "rejected" ? "alert-triangle" : "file-warning"
                    } className="w-6 h-6"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {tenant?.kycStatus === "verified" && "KYC Approved & Verified"}
                      {tenant?.kycStatus === "submitted" && "KYC Verification Under Review"}
                      {tenant?.kycStatus === "rejected" && "KYC Rejected - Action Required"}
                      {(!tenant?.kycStatus || tenant?.kycStatus === "pending") && "KYC Pending Upload"}
                    </h4>
                    <p className="text-sm mt-1 opacity-90">
                      {tenant?.kycStatus === "verified" && "Your identity proof check is completed. No further action is required."}
                      {tenant?.kycStatus === "submitted" && "Your documents are uploaded successfully. Owner is reviewing them. Please check back later."}
                      {tenant?.kycStatus === "rejected" && "Your documents did not meet verification criteria. Please check details and re-upload."}
                      {(!tenant?.kycStatus || tenant?.kycStatus === "pending") && "Please enter your Aadhaar & PAN details and upload clear photo scans to enable your stay agreement."}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <form onSubmit={handleKycSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aadhaar Number *</label>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          disabled={tenant?.kycStatus === "verified" || tenant?.kycStatus === "submitted"}
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                          placeholder="12-digit Aadhaar Number"
                          className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">PAN Number (Optional)</label>
                        <input
                          type="text"
                          maxLength={10}
                          disabled={tenant?.kycStatus === "verified" || tenant?.kycStatus === "submitted"}
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          placeholder="10-digit Alphanumeric PAN"
                          className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Aadhaar Front Scan *</label>
                        {aadhaarFrontUrl && (
                          <a href={aadhaarFrontUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-2 font-medium">
                            <i data-lucide="eye" className="w-3.5 h-3.5"></i> View Uploaded Front
                          </a>
                        )}
                        <input
                          type="file"
                          id="kyc-aadhaar-front"
                          accept="image/*,application/pdf"
                          disabled={tenant?.kycStatus === "verified" || tenant?.kycStatus === "submitted"}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Aadhaar Back Scan *</label>
                        {aadhaarBackUrl && (
                          <a href={aadhaarBackUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-2 font-medium">
                            <i data-lucide="eye" className="w-3.5 h-3.5"></i> View Uploaded Back
                          </a>
                        )}
                        <input
                          type="file"
                          id="kyc-aadhaar-back"
                          accept="image/*,application/pdf"
                          disabled={tenant?.kycStatus === "verified" || tenant?.kycStatus === "submitted"}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Address Proof (Electricity Bill, etc)</label>
                        {addressProofUrl && (
                          <a href={addressProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline mb-2 font-medium">
                            <i data-lucide="eye" className="w-3.5 h-3.5"></i> View Uploaded Proof
                          </a>
                        )}
                        <input
                          type="file"
                          id="kyc-address-proof"
                          accept="image/*,application/pdf"
                          disabled={tenant?.kycStatus === "verified" || tenant?.kycStatus === "submitted"}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                      </div>
                    </div>

                    {kycMsg && (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700">
                        {kycMsg}
                      </div>
                    )}

                    {(tenant?.kycStatus !== "verified" && tenant?.kycStatus !== "submitted") && (
                      <button
                        type="submit"
                        disabled={uploadingKyc}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i data-lucide="upload" className="w-5 h-5"></i>
                        {uploadingKyc ? "Uploading and submitting..." : "Submit KYC Documents"}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: POLICE */}
            {activeTab === "police" && (
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Police Verification</h2>
                  <p className="text-slate-500 mt-1">Submit your local station verification receipt file below.</p>
                </div>

                {/* Status banner */}
                <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                  tenant?.policeVerification?.status === "verified"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : tenant?.policeVerification?.status === "submitted"
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : tenant?.policeVerification?.status === "rejected"
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  <div className="pt-0.5">
                    <i data-lucide={
                      tenant?.policeVerification?.status === "verified" ? "check-circle" :
                      tenant?.policeVerification?.status === "submitted" ? "clock-3" :
                      tenant?.policeVerification?.status === "rejected" ? "alert-triangle" : "file-warning"
                    } className="w-6 h-6"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">
                      {tenant?.policeVerification?.status === "verified" && "Police Verification Stamped & Approved"}
                      {tenant?.policeVerification?.status === "submitted" && "Verification Receipt Pending Review"}
                      {tenant?.policeVerification?.status === "rejected" && "Verification Rejected - Re-submit Receipt"}
                      {(!tenant?.policeVerification?.status || tenant?.policeVerification?.status === "pending") && "Verification Receipt Required"}
                    </h4>
                    <p className="text-sm mt-1 opacity-90">
                      {tenant?.policeVerification?.status === "verified" && "Your local police reporting has been confirmed and fully registered."}
                      {tenant?.policeVerification?.status === "submitted" && "Receipt scan uploaded. Waiting for owner to confirm verification check."}
                      {tenant?.policeVerification?.status === "rejected" && "Uploaded receipt was invalid. Please upload the official stamped receipt again."}
                      {(!tenant?.policeVerification?.status || tenant?.policeVerification?.status === "pending") && "Please get the police tenant registration form stamped by your local station, scan it, and upload the receipt scan."}
                    </p>
                  </div>
                </div>

                {/* Download section */}
                <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 text-lg mb-3">Download Verification Templates</h3>
                  <p className="text-xs text-slate-600 mb-4">Select and print your state's template, fill it out, and submit to the local police station.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { city: "Delhi NCR Police Form", size: "1.2 MB" },
                      { city: "Karnataka / Bengaluru", size: "850 KB" },
                      { city: "Maharashtra / Mumbai", size: "1.1 MB" },
                      { city: "Haryana / Gurugram", size: "900 KB" }
                    ].map((form, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{form.city}</span>
                          <span className="text-[10px] text-slate-400">{form.size} • PDF Template</span>
                        </div>
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert("Template downloading initiated..."); }}
                          className="mt-3 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition"
                        >
                          <i data-lucide="download" className="w-3 h-3"></i> Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload scan */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <form onSubmit={handlePoliceSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Police Station Receipt Scan *</label>
                      <p className="text-xs text-slate-500">Provide a high-quality scan/photo of the stamped registration copy.</p>
                      
                      {policeReceiptUrl && (
                        <div className="pt-2">
                          <a href={policeReceiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium">
                            <i data-lucide="eye" className="w-3.5 h-3.5"></i> View Uploaded Receipt
                          </a>
                        </div>
                      )}

                      <div className="pt-2">
                        <input
                          type="file"
                          id="police-receipt-file"
                          accept="image/*,application/pdf"
                          disabled={tenant?.policeVerification?.status === "verified" || tenant?.policeVerification?.status === "submitted"}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                      </div>
                    </div>

                    {policeMsg && (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700">
                        {policeMsg}
                      </div>
                    )}

                    {(tenant?.policeVerification?.status !== "verified" && tenant?.policeVerification?.status !== "submitted") && (
                      <button
                        type="submit"
                        disabled={uploadingPolice}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i data-lucide="upload" className="w-5 h-5"></i>
                        {uploadingPolice ? "Uploading receipt..." : "Submit Receipt Form"}
                      </button>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* TAB 5: MOVEOUT */}
            {activeTab === "moveout" && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Move-out Request</h2>
                  <p className="text-slate-500 mt-1">Submit your checkout notice to the property management team.</p>
                </div>

                {/* Status-based views */}
                {tenant?.moveoutRequest?.status === "pending" && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-blue-900 space-y-4 shadow-sm">
                    <div className="flex gap-3 items-start">
                      <i data-lucide="clock" className="w-6 h-6 text-blue-600 mt-0.5"></i>
                      <div>
                        <h4 className="font-bold text-lg">Exit Notice Pending Review</h4>
                        <p className="text-sm mt-1 opacity-90">
                          Your checkout notice is submitted and is pending clearance approval from the property owner.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-blue-100 space-y-2 text-sm text-slate-700">
                      <p><strong>Notice Submitted On:</strong> {formatDate(tenant.moveoutRequest.submittedAt)}</p>
                      <p><strong>Requested Checkout Date:</strong> {formatDate(tenant.moveoutRequest.requestedDate)}</p>
                      <p><strong>Exit Reason:</strong> {tenant.moveoutRequest.reason}</p>
                    </div>
                  </div>
                )}

                {tenant?.moveoutRequest?.status === "approved" && (
                  <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-emerald-950 space-y-4 shadow-sm">
                    <div className="flex gap-3 items-start">
                      <i data-lucide="check-circle" className="w-6 h-6 text-emerald-600 mt-0.5"></i>
                      <div>
                        <h4 className="font-bold text-lg text-emerald-900">Exit Cleared & Approved</h4>
                        <p className="text-sm mt-1 opacity-90">
                          Your move-out check has been completed and approved by the owner. Your checkout details are:
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-4 border border-emerald-100 space-y-2.5 text-sm text-slate-800">
                      <p><strong>Final Checkout Date:</strong> {formatDate(tenant.moveoutRequest.requestedDate)}</p>
                      <p><strong>Outstanding Dues:</strong> {formatCurrency(tenant.moveoutRequest.duesAtMoveout)}</p>
                      <p><strong>Deposit Refund:</strong> {formatCurrency(tenant.moveoutRequest.refundAmount)}</p>
                      <p className="flex items-center gap-1.5">
                        <strong>Refund Status:</strong> 
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          tenant.moveoutRequest.refundStatus === "cleared" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {tenant.moveoutRequest.refundStatus === "cleared" ? "Refund Handed Over" : "Refund Pending"}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {tenant?.moveoutRequest?.status === "rejected" && (
                  <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-rose-800 mb-6 flex items-start gap-4">
                    <div className="pt-0.5">
                      <i data-lucide="x-circle" className="w-6 h-6 text-rose-600"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Exit Notice Rejected</h4>
                      <p className="text-sm mt-1 opacity-90">
                        Your checkout notice was rejected by the owner. Please contact your property manager to resolve.
                      </p>
                    </div>
                  </div>
                )}

                {(!tenant?.moveoutRequest || tenant?.moveoutRequest?.status === "none" || tenant?.moveoutRequest?.status === "rejected") && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <form onSubmit={handleMoveoutSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Intended Exit Date *</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split("T")[0]}
                          value={moveoutDate}
                          onChange={(e) => setMoveoutDate(e.target.value)}
                          className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Reason for Moving Out *</label>
                        <textarea
                          required
                          rows={4}
                          value={moveoutReason}
                          onChange={(e) => setMoveoutReason(e.target.value)}
                          placeholder="State why you are checkout (e.g. course end, workplace relocation, etc.)"
                          className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        ></textarea>
                      </div>

                      {moveoutMsg && (
                        <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700">
                          {moveoutMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submittingMoveout}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i data-lucide="send" className="w-5 h-5"></i>
                        {submittingMoveout ? "Submitting Notice..." : "Submit Exit Notice"}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: FEEDBACK */}
            {activeTab === "feedback" && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Feedback & Ratings</h2>
                  <p className="text-slate-500 mt-1">Submit rating reviews of services, food quality, hygiene, and room experience.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Rating Category *</label>
                        <select
                          value={feedbackCategory}
                          onChange={(e) => setFeedbackCategory(e.target.value)}
                          className="w-full h-12 px-4 border border-slate-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                        >
                          <option value="Amenities">Amenities & Facilities</option>
                          <option value="Food">Food & Mess Catering</option>
                          <option value="Cleanliness">Cleanliness & Hygiene</option>
                          <option value="Staff">Staff & Warden Response</option>
                          <option value="Other">Other Services</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Star Rating *</label>
                        <div className="flex items-center gap-1.5 h-12">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="focus:outline-none transition-transform active:scale-95"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={star <= feedbackRating ? "#eab308" : "none"}
                                stroke={star <= feedbackRating ? "#eab308" : "#cbd5e1"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-8 h-8 cursor-pointer"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </button>
                          ))}
                          <span className="text-sm font-bold text-slate-700 ml-2">({feedbackRating} / 5 Stars)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Comments & Suggestions *</label>
                      <textarea
                        required
                        rows={4}
                        value={feedbackComments}
                        onChange={(e) => setFeedbackComments(e.target.value)}
                        placeholder="Detail your suggestions or complaints (e.g. Wi-Fi speed, cleaning schedule, food quality...)"
                        className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      ></textarea>
                    </div>

                    {feedbackMsg && (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700">
                        {feedbackMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <i data-lucide="star" className="w-5 h-5"></i>
                      {submittingFeedback ? "Submitting review..." : "Submit Feedback"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: COMPLAINTS */}
            {activeTab === "complaints" && (
              <div className="max-w-5xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Complaints & Requests</h2>
                  <p className="text-slate-500 mt-1">Lodge a complaint or maintenance request, and track its status.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column: Form */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">New Request</h3>
                    <form onSubmit={handleComplaintSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Category</label>
                        <select 
                          value={complaintCategory} 
                          onChange={(e) => setComplaintCategory(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Appliances">Appliances</option>
                          <option value="Cleaning">Cleaning</option>
                          <option value="Internet">Internet</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Priority</label>
                        <select 
                          value={complaintPriority} 
                          onChange={(e) => setComplaintPriority(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Description</label>
                        <textarea
                          required
                          rows={4}
                          value={complaintDesc}
                          onChange={(e) => setComplaintDesc(e.target.value)}
                          placeholder="Describe the issue in detail..."
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        ></textarea>
                      </div>

                      {complaintStatusMsg && (
                        <div className={`p-3 rounded-xl text-sm ${complaintStatusMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                          {complaintStatusMsg}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={complaintBusy}
                        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i data-lucide="flag" className="w-5 h-5"></i>
                        {complaintBusy ? "Submitting..." : "Submit Complaint"}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: History */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">My Requests History</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                      {myComplaints.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <i data-lucide="inbox" className="w-10 h-10 mx-auto mb-3 opacity-40"></i>
                          <p>No complaints raised yet.</p>
                        </div>
                      ) : (
                        myComplaints.map(c => (
                          <div key={c._id} className="p-4 border rounded-xl border-slate-200 hover:border-purple-300 transition-colors bg-slate-50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-800 text-sm">{c.category || "Complaint"}</span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                c.status === "Resolved" ? "bg-green-100 text-green-700" : 
                                c.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {c.status || "Open"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">{c.description}</p>
                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span>Priority: {c.priority || "Low"}</span>
                              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VISITOR PASS */}
            {activeTab === "visitor" && (
              <div className="max-w-5xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Request Visitor Pass</h2>
                  <p className="text-slate-500 mt-1">Pre-approve your guests for easy entry at the security gate.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">New Visitor</h3>
                    <form onSubmit={handleVisitorSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Visitor Name *</label>
                        <input
                          type="text"
                          required
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={visitorPhone}
                          onChange={(e) => setVisitorPhone(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Expected Entry Time *</label>
                        <input
                          type="datetime-local"
                          required
                          value={visitorExpectedTime}
                          onChange={(e) => setVisitorExpectedTime(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      {visitorMsg && (
                        <div className="p-3 rounded-xl text-sm bg-blue-50 text-blue-700">
                          {visitorMsg}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={complaintBusy}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i data-lucide="user-plus" className="w-5 h-5"></i>
                        {complaintBusy ? "Generating Pass..." : "Generate Pass"}
                      </button>
                    </form>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[500px]">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">My Visitors History</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                      {myVisitors.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <p>No visitor passes created yet.</p>
                        </div>
                      ) : (
                        myVisitors.map(v => (
                          <div key={v._id} className="p-4 border rounded-xl border-slate-200 bg-slate-50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-800 text-sm">{v.visitorName}</span>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                {v.status || "Pre-approved"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-1">Phone: {v.visitorPhone}</p>
                            <p className="text-xs text-slate-600 mb-1">Expected: {new Date(v.expectedEntryTime).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LEAVE REQUEST */}
            {activeTab === "leave" && (
              <div className="max-w-5xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Leave Requests</h2>
                  <p className="text-slate-500 mt-1">Submit your long-term absence or holiday leave dates.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">New Leave Application</h3>
                    <form onSubmit={handleLeaveSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Start Date *</label>
                        <input
                          type="date"
                          required
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Return Date *</label>
                        <input
                          type="date"
                          required
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Reason *</label>
                        <textarea
                          required
                          rows={3}
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          placeholder="e.g. Going home for holidays"
                          className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        ></textarea>
                      </div>
                      {leaveMsg && (
                        <div className="p-3 rounded-xl text-sm bg-blue-50 text-blue-700">
                          {leaveMsg}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={complaintBusy}
                        className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i data-lucide="calendar-off" className="w-5 h-5"></i>
                        {complaintBusy ? "Submitting..." : "Submit Leave"}
                      </button>
                    </form>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[500px]">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">My Leaves History</h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                      {myLeaves.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <p>No leave requests found.</p>
                        </div>
                      ) : (
                        myLeaves.map(l => (
                          <div key={l._id} className="p-4 border rounded-xl border-slate-200 bg-slate-50">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-800 text-sm">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</span>
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                                l.status === "Approved" ? "bg-green-100 text-green-700" :
                                l.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                              }`}>
                                {l.status || "Pending"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mb-1">Reason: {l.reason}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Pay Modal */}
      {payOpen ? (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setPayOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Make Payment</h3>
              <button onClick={() => setPayOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i data-lucide="x"></i>
              </button>
            </div>
            <div className="text-center mb-8">
              <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Total Payable</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{formatCurrency(rentAmount)}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleOnlinePayment}
                disabled={actionBusy || isPaid}
                className="w-full p-4 border border-slate-200 rounded-xl flex items-center hover:border-blue-600 hover:bg-blue-50 transition group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i data-lucide="credit-card" className="w-5 h-5 mr-4 text-blue-600"></i>
                <div className="text-left">
                  <span className="font-semibold text-slate-700">Pay Online</span>
                  <p className="text-xs text-slate-500">Cards • UPI • Wallets • Netbanking</p>
                </div>
              </button>
              <button
                onClick={handleCashRequest}
                disabled={actionBusy || isPaid}
                className="w-full p-4 border border-slate-200 rounded-xl flex items-center hover:border-amber-500 hover:bg-amber-50 transition group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i data-lucide="hand-coins" className="w-5 h-5 mr-4 text-amber-600"></i>
                <div className="text-left">
                  <span className="font-semibold text-slate-700">Pay by Cash</span>
                  <p className="text-xs text-slate-500">Request owner collection and verify OTP</p>
                </div>
              </button>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm">
                <p className="font-semibold text-green-800">Secure Payment</p>
                <p className="text-xs text-green-700">Your payment is encrypted and secure</p>
              </div>
              <div className={`${cashPanelOpen ? "" : "hidden"} p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-3`}>
                <p className="text-xs text-amber-800">
                  Owner should click <strong>Received</strong> in owner payment panel. Then OTP will be sent to your email.
                </p>
                <input
                  value={cashOtp}
                  onChange={(e) => setCashOtp(e.target.value)}
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  className="w-full p-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
                <button
                  onClick={handleCashOtpVerify}
                  disabled={actionBusy}
                  className="w-full bg-amber-600 text-white font-semibold py-2 rounded-lg hover:bg-amber-700 text-sm disabled:opacity-60"
                >
                  Verify OTP and Mark Paid
                </button>
                <p className="text-xs text-amber-900">{actionMsg}</p>
              </div>
              {!cashPanelOpen && actionMsg ? <p className="text-xs text-slate-600">{actionMsg}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Gate Management Modals */}
      {visitorModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setVisitorModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setVisitorModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><i data-lucide="x" className="w-5 h-5"></i></button>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Generate Visitor Pass</h3>
            <form onSubmit={handleCreateVisitorPass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Guest Name *</label>
                <input type="text" value={visitorGuestName} onChange={e => setVisitorGuestName(e.target.value)} required className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Guest Phone *</label>
                <input type="text" value={visitorGuestPhone} onChange={e => setVisitorGuestPhone(e.target.value)} required className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 9876543210" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expected Visit Date *</label>
                <input type="date" value={visitorDate} onChange={e => setVisitorDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <button type="submit" disabled={actionBusy} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                {actionBusy ? "Generating..." : "Generate Pass"}
              </button>
            </form>
          </div>
        </div>
      )}

      {leaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLeaveModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLeaveModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><i data-lucide="x" className="w-5 h-5"></i></button>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Submit Leave Request</h3>
            <form onSubmit={handleCreateLeaveRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Departure *</label>
                  <input type="date" value={leaveDepartureDate} onChange={e => setLeaveDepartureDate(e.target.value)} required min={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Return *</label>
                  <input type="date" value={leaveReturnDate} onChange={e => setLeaveReturnDate(e.target.value)} required min={leaveDepartureDate || new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason for Leave *</label>
                <textarea value={gateLeaveReason} onChange={e => setGateLeaveReason(e.target.value)} required rows="3" placeholder="e.g. Going home for holidays" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
              <button type="submit" disabled={actionBusy} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
                {actionBusy ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Generic Modal */}
      {genericModal ? (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setGenericModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">{genericModal.title}</h3>
              <button onClick={() => setGenericModal(null)} className="text-slate-400 hover:text-slate-600">
                <i data-lucide="x" className="w-5 h-5"></i>
              </button>
            </div>
            <div>{genericModal.body}</div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-right">
              {genericModal.footer || (
                <button onClick={() => setGenericModal(null)} className="text-slate-500 text-sm hover:underline">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {documentViewer ? (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm"
          onClick={closeDocumentViewer}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{documentViewer.title}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                  {documentViewer.type === "receipt" ? "Bill Preview" : "Agreement Preview"}
                </p>
              </div>
              <button onClick={closeDocumentViewer} className="text-slate-400 hover:text-slate-600">
                <i data-lucide="x" className="w-5 h-5"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {documentViewer.body}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              {documentViewer.type === "receipt" ? (
                <button
                  onClick={() => {
                    const item = docs.find((d) => d.key === "receipt")?.rentItem;
                    if (item) downloadReceiptPdf(item);
                  }}
                  disabled={pdfBusy}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
                >
                  <i data-lucide="download" className="w-4 h-4"></i>
                  {pdfBusy ? "Generating..." : "Download PDF"}
                </button>
              ) : null}
              <button
                onClick={closeDocumentViewer}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
