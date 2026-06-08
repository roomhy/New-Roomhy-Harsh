import React, { useEffect, useState, useMemo } from "react";
import PropertyOwnerLayout from "../../components/propertyowner/PropertyOwnerLayout";
import { getOwnerRuntimeSession, clearOwnerRuntimeSession } from "../../utils/propertyowner";
import { fetchPayments } from "../../utils/rentCollectionApi";
import { Search, Download, Eye, X, Printer } from "lucide-react";

function billingLabel(billingMonth) {
  if (!billingMonth) return "—";
  const [yr, mo] = billingMonth.split("-");
  if (!yr || !mo) return billingMonth;
  return new Date(parseInt(yr), parseInt(mo) - 1).toLocaleString("en", { month: "long" }) + " " + yr;
}

function numberToWords(num) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (!num) return "Zero";
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }
  return "Rupees " + convert(num) + " Only";
}

function buildReceiptHtml(r) {
  const balance     = Math.max(0, r.amount - (r.paid ?? r.amount));
  const isPaid      = balance === 0;
  const paidAmt     = r.paid ?? r.amount;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt ${r.id}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Helvetica Neue',Arial,sans-serif;color:#000;background:#fff;font-size:13px}
    .page{max-width:760px;margin:0 auto;padding:40px 44px 36px}

    /* header */
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #ddd}
    .logo{font-family:Georgia,serif;font-size:42px;font-weight:900;letter-spacing:-2px;color:#000;line-height:1}
    .logo em{font-weight:400;font-style:italic}
    .co{text-align:right;font-size:11.5px;color:#222;line-height:1.65}
    .co strong{display:block;font-size:13.5px;font-weight:700;margin-bottom:3px}

    /* title band */
    .title-band{text-align:center;margin:0 0 18px;padding:10px 0;border-top:2px solid #000;border-bottom:2px solid #000}
    .title-band h2{font-size:15px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:#000}

    /* two-col details */
    .details-row{display:flex;gap:16px;margin-bottom:18px}
    .box{flex:1;border:1px solid #d1d5db;border-radius:4px;overflow:hidden}
    .box-head{background:#f5f5f5;padding:8px 14px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#444;border-bottom:1px solid #d1d5db}
    .box-body{padding:10px 14px}
    .field-row{display:flex;justify-content:space-between;align-items:baseline;padding:3.5px 0;font-size:12.5px;gap:8px}
    .field-row .lbl{color:#555;white-space:nowrap}
    .field-row .val{font-weight:600;color:#000;text-align:right}
    .badge-paid{display:inline-block;padding:3px 10px;border:1.5px solid #16a34a;border-radius:3px;font-size:11px;font-weight:800;letter-spacing:.06em;color:#166534;background:#f0fdf4}
    .badge-partial{display:inline-block;padding:3px 10px;border:1.5px solid #d97706;border-radius:3px;font-size:11px;font-weight:800;letter-spacing:.06em;color:#92400e;background:#fffbeb}
    .bill-name{font-size:15px;font-weight:700;margin-bottom:2px}

    /* items table */
    table.items{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:0}
    table.items thead tr{background:#f5f5f5}
    table.items th{padding:9px 14px;text-align:left;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;border:1px solid #d1d5db}
    table.items th.center{text-align:center}
    table.items th.right{text-align:right}
    table.items td{padding:12px 14px;border:1px solid #e8e8e8;vertical-align:top;color:#000}
    table.items td.center{text-align:center}
    table.items td.right{text-align:right;font-weight:600}
    .desc-sub{font-size:11px;color:#666;margin-top:3px}

    /* totals box */
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:0;margin-bottom:16px;border:1px solid #d1d5db;border-top:none}
    .totals-inner{width:320px;border-left:1px solid #d1d5db}
    .totals-head{background:#f5f5f5;padding:8px 16px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#444;border-bottom:1px solid #d1d5db}
    .t-row{display:flex;justify-content:space-between;padding:5px 16px;font-size:13px}
    .t-row .tv{font-weight:600}
    .t-row.sep{border-top:1.5px solid #000;padding-top:8px;padding-bottom:8px;margin-top:4px}
    .t-row.sep .tk,.t-row.sep .tv{font-size:14px;font-weight:800}

    /* words */
    .words{border:1px solid #d1d5db;padding:10px 14px;font-size:12.5px;margin-bottom:16px}

    /* terms */
    .terms-head{font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#444;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid #e5e5e5}
    .terms-list{font-size:11px;color:#444;line-height:1.85;padding-left:2px}
    .terms-list li{list-style:disc;margin-left:14px}
    .terms-list li b{color:#000}

    /* footer */
    .end-note{text-align:center;font-size:10.5px;color:#999;margin-top:20px;padding-top:12px;border-top:1px solid #efefef}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:20px}}
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="hdr">
    <div class="logo">Room<em>Hy</em></div>
    <div class="co">
      <strong>RoomHy Technologies India Pvt. Ltd.</strong>
      CIN: U72000MP2024PTC123456 | GSTIN: 23AABCR1234A1Z5 | PAN: AABCR1234A<br/>
      Sector 7, Civil Lines, Indore, Madhya Pradesh - 452001, India<br/>
      Contact: care@roomhy.com | Web: www.roomhy.com
    </div>
  </div>

  <!-- Title band -->
  <div class="title-band">
    <h2>Rental Payment Receipt</h2>
  </div>

  <!-- Invoice details + Bill To -->
  <div class="details-row">
    <div class="box">
      <div class="box-head">Invoice Details</div>
      <div class="box-body">
        <div class="field-row"><span class="lbl">Invoice #</span><span class="val">${r.id}</span></div>
        <div class="field-row"><span class="lbl">Invoice Date</span><span class="val">${r.date}</span></div>
        <div class="field-row"><span class="lbl">Due On</span><span class="val">Due on Receipt</span></div>
        <div class="field-row"><span class="lbl">State Code</span><span class="val">MP (23)</span></div>
        <div class="field-row"><span class="lbl">Status</span><span class="val"><span class="${isPaid ? "badge-paid" : "badge-partial"}">${isPaid ? "&#10003; PAID" : "PARTIAL"}</span></span></div>
      </div>
    </div>
    <div class="box">
      <div class="box-head">Bill To</div>
      <div class="box-body">
        <div class="bill-name">${r.tenant}</div>
        <div class="field-row"><span class="lbl">Room</span><span class="val">Room ${r.room}</span></div>
        ${r.phone ? `<div class="field-row"><span class="lbl">Phone</span><span class="val">${r.phone}</span></div>` : ""}
        ${r.email ? `<div class="field-row"><span class="lbl">Email</span><span class="val">${r.email}</span></div>` : ""}
        ${r.address ? `<div class="field-row"><span class="lbl">Address</span><span class="val">${r.address}</span></div>` : ""}
      </div>
    </div>
  </div>

  <!-- Items table -->
  <table class="items">
    <thead>
      <tr>
        <th style="width:36px">#</th>
        <th>Item &amp; Description</th>
        <th class="center" style="width:54px">Qty</th>
        <th class="right" style="width:110px">Rate</th>
        <th class="right" style="width:120px">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>
          <strong>${r.type || "Rent &amp; Utility"}</strong>
          <div class="desc-sub">Rental Income Charges for this duration (${r.period})</div>
          <div class="desc-sub">SAC: 997211</div>
        </td>
        <td class="center">1</td>
        <td class="right">&#8377;${r.amount.toLocaleString("en-IN")}.00</td>
        <td class="right">&#8377;${r.amount.toLocaleString("en-IN")}.00</td>
      </tr>
    </tbody>
  </table>

  <!-- Payment Breakdown Summary -->
  <div class="totals-wrap">
    <div class="totals-inner">
      <div class="totals-head">Payment Breakdown Summary</div>
      <div class="t-row"><span class="tk">Total</span><span class="tv">&#8377;${r.amount.toLocaleString("en-IN")}.00</span></div>
      <div class="t-row"><span class="tk">Payment Made</span><span class="tv">(-) &#8377;${paidAmt.toLocaleString("en-IN")}.00</span></div>
      <div class="t-row sep"><span class="tk">Balance Due</span><span class="tv">&#8377;${balance.toLocaleString("en-IN")}.00</span></div>
    </div>
  </div>

  <!-- Total in words -->
  <div class="words"><strong>Total In Words:</strong> ${numberToWords(r.amount)}</div>

  <!-- Terms & Notes -->
  <div class="terms-head">Terms &amp; Notes</div>
  <ul class="terms-list">
    <li><b>Tenant App:</b> Manage Your Stay and Pay your rent through the Tenant App (Available On Android &amp; iOS)</li>
    <li><b>Late Fee:</b> Delay in rent payment will lead to Rs.100 fine per day.</li>
    <li><b>Support:</b> If you have any issues, you can get in touch with our dedicated care desk at care@roomhy.com.</li>
    <li><b>T&amp;C:</b> Payment of the invoice confirms your agreement with the Terms and Conditions mentioned in the agreement and on www.roomhy.com/tnc.</li>
  </ul>

  <div class="end-note">This is a Computer generated invoice. Signature is not required.</div>
</div>
</body>
</html>`;
}

// ── Receipt Modal (on-screen preview) ────────────────────────────────────────
function ReceiptModal({ receipt, onClose }) {
  const balance = Math.max(0, receipt.amount - (receipt.paid ?? receipt.amount));
  const isPaid  = balance === 0;
  const paidAmt = receipt.paid ?? receipt.amount;

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=860,height=960");
    win.document.write(buildReceiptHtml(receipt));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const S = {
    label: { fontSize: 11, color: "#555", whiteSpace: "nowrap" },
    value: { fontSize: 12.5, fontWeight: 600, color: "#000", textAlign: "right" },
    boxHead: { background: "#f5f5f5", padding: "8px 14px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#444", borderBottom: "1px solid #d1d5db" },
    box: { border: "1px solid #d1d5db", borderRadius: 4, overflow: "hidden", flex: 1 },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.52)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[94vh] overflow-y-auto"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", color: "#000" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between px-6 py-3 rounded-t-xl">
          <span className="font-mono font-bold text-[13px] text-gray-500">{receipt.id}</span>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-[11.5px] font-bold transition-colors">
              <Printer size={12} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="size-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="px-10 py-8" style={{ background: "#fff" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid #ddd" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 900, letterSpacing: -2, lineHeight: 1, color: "#000" }}>
              Room<span style={{ fontWeight: 400, fontStyle: "italic" }}>Hy</span>
            </div>
            <div style={{ textAlign: "right", fontSize: 11.5, color: "#222", lineHeight: 1.65 }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3 }}>RoomHy Technologies India Pvt. Ltd.</p>
              <p>CIN: U72000MP2024PTC123456 | GSTIN: 23AABCR1234A1Z5 | PAN: AABCR1234A</p>
              <p>Sector 7, Civil Lines, Indore, Madhya Pradesh - 452001, India</p>
              <p>Contact: care@roomhy.com | Web: www.roomhy.com</p>
            </div>
          </div>

          {/* Title band */}
          <div style={{ textAlign: "center", margin: "0 0 16px", padding: "9px 0", borderTop: "2px solid #000", borderBottom: "2px solid #000" }}>
            <h2 style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: "#000" }}>Rental Payment Receipt</h2>
          </div>

          {/* Invoice Details + Bill To */}
          <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
            {/* Invoice Details */}
            <div style={S.box}>
              <div style={S.boxHead}>Invoice Details</div>
              <div style={{ padding: "10px 14px" }}>
                {[
                  ["Invoice #", receipt.id],
                  ["Invoice Date", receipt.date],
                  ["Due On", "Due on Receipt"],
                  ["State Code", "MP (23)"],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "3.5px 0", gap: 8 }}>
                    <span style={S.label}>{lbl}</span>
                    <span style={S.value}>{val}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", gap: 8 }}>
                  <span style={S.label}>Status</span>
                  <span style={{
                    display: "inline-block", padding: "3px 10px",
                    border: `1.5px solid ${isPaid ? "#16a34a" : "#d97706"}`,
                    borderRadius: 3, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em",
                    color: isPaid ? "#166534" : "#92400e",
                    background: isPaid ? "#f0fdf4" : "#fffbeb"
                  }}>
                    {isPaid ? "✓ PAID" : "PARTIAL"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div style={S.box}>
              <div style={S.boxHead}>Bill To</div>
              <div style={{ padding: "10px 14px" }}>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{receipt.tenant}</p>
                {[
                  ["Room", `Room ${receipt.room}`],
                  ...(receipt.phone ? [["Phone", receipt.phone]] : []),
                  ...(receipt.email ? [["Email", receipt.email]] : []),
                  ...(receipt.address ? [["Address", receipt.address]] : []),
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "3px 0", gap: 8 }}>
                    <span style={S.label}>{lbl}</span>
                    <span style={S.value}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 0 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                {[["#", "left", 34], ["Item & Description", "left", null], ["Qty", "center", 54], ["Rate", "right", 110], ["Amount", "right", 120]].map(([h, align, w]) => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: align, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#555", border: "1px solid #d1d5db", ...(w ? { width: w } : {}) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "12px 14px", border: "1px solid #e8e8e8", color: "#666" }}>1</td>
                <td style={{ padding: "12px 14px", border: "1px solid #e8e8e8" }}>
                  <p style={{ fontWeight: 600 }}>{receipt.type || "Rent & Utility"}</p>
                  <p style={{ fontSize: 11, color: "#666", marginTop: 3 }}>Rental Income Charges for this duration ({receipt.period})</p>
                  <p style={{ fontSize: 11, color: "#666", marginTop: 2 }}>SAC: 997211</p>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center", border: "1px solid #e8e8e8" }}>1</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, border: "1px solid #e8e8e8" }}>₹{receipt.amount.toLocaleString("en-IN")}.00</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, border: "1px solid #e8e8e8" }}>₹{receipt.amount.toLocaleString("en-IN")}.00</td>
              </tr>
            </tbody>
          </table>

          {/* Payment Breakdown Summary */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14, border: "1px solid #d1d5db", borderTop: "none" }}>
            <div style={{ width: 320, borderLeft: "1px solid #d1d5db" }}>
              <div style={{ background: "#f5f5f5", padding: "7px 16px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#444", borderBottom: "1px solid #d1d5db" }}>
                Payment Breakdown Summary
              </div>
              {[
                ["Total", `₹${receipt.amount.toLocaleString("en-IN")}.00`, false],
                ["Payment Made", `(-) ₹${paidAmt.toLocaleString("en-IN")}.00`, false],
                ["Balance Due", `₹${balance.toLocaleString("en-IN")}.00`, true],
              ].map(([label, val, bold]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: bold ? "8px 16px" : "5px 16px", borderTop: bold ? "1.5px solid #000" : "none", marginTop: bold ? 4 : 0 }}>
                  <span style={{ fontSize: bold ? 14 : 13, fontWeight: bold ? 800 : 400 }}>{label}</span>
                  <span style={{ fontSize: bold ? 14 : 13, fontWeight: bold ? 800 : 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total in words */}
          <div style={{ border: "1px solid #d1d5db", padding: "9px 14px", fontSize: 12.5, marginBottom: 16 }}>
            <strong>Total In Words:</strong> {numberToWords(receipt.amount)}
          </div>

          {/* Terms & Notes */}
          <p style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#444", marginBottom: 6, paddingBottom: 5, borderBottom: "1px solid #e5e5e5" }}>Terms &amp; Notes</p>
          <ul style={{ fontSize: 11, color: "#444", lineHeight: 1.9, paddingLeft: 16 }}>
            <li><strong>Tenant App:</strong> Manage Your Stay and Pay your rent through the Tenant App (Available On Android &amp; iOS)</li>
            <li><strong>Late Fee:</strong> Delay in rent payment will lead to Rs.100 fine per day.</li>
            <li><strong>Support:</strong> If you have any issues, you can get in touch with our dedicated care desk at care@roomhy.com.</li>
            <li><strong>T&amp;C:</strong> Payment of the invoice confirms your agreement with the Terms and Conditions mentioned in the agreement and on www.roomhy.com/tnc.</li>
          </ul>

          <div style={{ textAlign: "center", fontSize: 10.5, color: "#bbb", marginTop: 20, paddingTop: 12, borderTop: "1px solid #efefef" }}>
            This is a Computer generated invoice. Signature is not required.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ReceiptsPage() {
  const owner = getOwnerRuntimeSession();
  if (!owner?.loginId && typeof window !== "undefined") {
    window.location.href = "/propertyowner/ownerlogin";
    return null;
  }

  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewing, setViewing]   = useState(null);

  useEffect(() => {
    fetchPayments(300)
      .then(d => setPayments(d?.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Shape each payment into the receipt object the modal expects
  const receipts = useMemo(() => payments.map(p => ({
    id:     p.invoiceNumber || p.transactionId || String(p._id).slice(-8).toUpperCase(),
    tenant: p.tenantName,
    room:   p.roomNo,
    phone:  p.tenantPhone,
    email:  p.tenantEmail,
    date:   new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    period: billingLabel(p.billingMonth),
    amount: p.rentAmount || p.amount,
    paid:   p.amount,
    type:   p.electricityBill > 0 ? "Rent & Utility" : p.totalPenalty > 0 ? "Rent + Penalty" : "Rent Only",
    _raw:   p,
  })), [payments]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(r =>
      r.tenant.toLowerCase().includes(q) ||
      String(r.room).toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }, [receipts, debouncedSearch]);

  const handleDownload = (r) => {
    const win = window.open("", "_blank", "width=860,height=960");
    win.document.write(buildReceiptHtml(r));
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  return (
    <PropertyOwnerLayout
      owner={owner}
      title="Issued Receipts"
      onLogout={() => { clearOwnerRuntimeSession(); window.location.href = "/propertyowner/ownerlogin"; }}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-[38px] md:text-[44px] leading-[1.05] text-foreground">Issued Receipts</h1>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">Search and download generated receipts for every recorded payment.</p>
        </div>
        {!loading && (
          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1 font-semibold self-start md:mt-2">
            {receipts.length} receipt{receipts.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt ID, tenant, or room..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase tracking-wider text-muted-foreground bg-muted/50">
                <th className="px-6 py-3.5 font-semibold">Receipt ID</th>
                <th className="px-6 py-3.5 font-semibold">Tenant Name</th>
                <th className="px-6 py-3.5 font-semibold">Room</th>
                <th className="px-6 py-3.5 font-semibold">Billing Period</th>
                <th className="px-6 py-3.5 font-semibold">Type</th>
                <th className="px-6 py-3.5 font-semibold">Amount Paid</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">Loading receipts...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">No receipts found.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r._raw._id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-foreground">{r.id}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{r.tenant}</td>
                  <td className="px-6 py-4 font-bold text-foreground">Room {r.room}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.period}</td>
                  <td className="px-6 py-4 text-muted-foreground">{r.type}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{(r.paid || r.amount).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setViewing(r)}
                      title="View receipt"
                      className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center justify-center transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDownload(r)}
                      title="Print / Save PDF"
                      className="size-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center justify-center transition-colors"
                    >
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewing && (
        <ReceiptModal
          receipt={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </PropertyOwnerLayout>
  );
}
