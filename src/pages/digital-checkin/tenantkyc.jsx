import React from "react";
import { useHtmlPage } from "../../utils/htmlPage";
import { useTenantKyc } from "./useTenantKyc";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AadhaarUpload = ({ label, side, value, onChange }) => {
  const inputRef = React.useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB");
      return;
    }
    try {
      onChange(await fileToBase64(file));
    } catch {
      alert("Failed to read file. Please try again.");
    }
    e.target.value = "";
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={{ marginBottom: "8px" }}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: "2px dashed #b0bec5",
          borderRadius: "10px",
          minHeight: "110px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: value ? "#f0f4f8" : "#f8fafc",
          overflow: "hidden",
          transition: "border-color 0.15s"
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#546e7a"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#b0bec5"}
      >
        {value ? (
          <img
            src={value}
            alt={label}
            style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain", padding: "6px" }}
          />
        ) : (
          <>
            <div style={{ fontSize: "28px", marginBottom: "6px", lineHeight: 1 }}>
              {side === "front" ? "🪪" : side === "selfie" ? "🤳" : "↩️"}
            </div>
            <div style={{ fontSize: "12px", color: "#546e7a", fontWeight: 600 }}>Click to upload</div>
            <div style={{ fontSize: "11px", color: "#90a4ae", marginTop: "2px" }}>JPG / PNG — max 5 MB</div>
          </>
        )}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{
            marginTop: "5px",
            fontSize: "11px",
            background: "none",
            border: "none",
            color: "#dc2626",
            cursor: "pointer",
            padding: 0,
            fontWeight: 600,
            boxShadow: "none",
            minHeight: "auto",
            width: "auto"
          }}
        >
          Remove
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={side === "selfie" ? "user" : "environment"}
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default function DigitalCheckinTenantkyc() {
  useHtmlPage({
    title: "Tenant Digital Check-In - KYC",
    bodyClass: "",
    htmlAttrs: { lang: "en" },
    metas: [
      { charset: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" }
    ],
    links: [{ rel: "stylesheet", href: "/digital-checkin/assets/css/tenantkyc.css" }],
    styles: [],
    scripts: [],
    inlineScripts: []
  });

  const {
    loginId,
    setLoginId,
    aadhaarNumber,
    setAadhaarNumber,
    aadhaarLinkedPhone,
    setAadhaarLinkedPhone,
    otp,
    setOtp,
    otpMsg,
    nextVisible,
    otpSent,
    handleStart,
    handleComplete,
    handleNext
  } = useTenantKyc();

  const [aadhaarFront, setAadhaarFront] = React.useState("");
  const [aadhaarBack, setAadhaarBack] = React.useState("");
  const [tenantPhoto, setTenantPhoto] = React.useState("");

  return (
    <div className="html-page">
      <div className="wrap">
        <h2>Tenant Aadhaar KYC</h2>
        <div className="grid">
          <div>
            <label>Login ID</label>
            <input value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
          </div>
          <div>
            <label>Aadhaar Number</label>
            <input
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              pattern="\\d{12}"
              maxLength="12"
              required
            />
          </div>
          <div>
            <label>Aadhaar Linked Phone Number</label>
            <input value={aadhaarLinkedPhone} onChange={(e) => setAadhaarLinkedPhone(e.target.value)} required />
          </div>
          <div>
            <label>OTP</label>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP from Aadhaar-linked mobile" />
          </div>
        </div>

        {/* Aadhaar Card Photo Upload */}
        <div style={{ marginTop: "20px" }}>
          <label style={{ marginBottom: "4px" }}>Aadhaar Card Photos</label>
          <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#7a8fa6" }}>
            Upload clear photos of the front and back of your Aadhaar card.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <AadhaarUpload label="Front Side" side="front" value={aadhaarFront} onChange={setAadhaarFront} />
            <AadhaarUpload label="Back Side" side="back" value={aadhaarBack} onChange={setAadhaarBack} />
          </div>
        </div>

        {/* Tenant Selfie */}
        <div style={{ marginTop: "24px" }}>
          <label style={{ marginBottom: "4px" }}>Tenant Selfie / Photo</label>
          <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#7a8fa6" }}>
            Upload a clear face photo of the tenant. This will be stored with your KYC record.
          </p>
          <div style={{ maxWidth: "200px" }}>
            <AadhaarUpload label="Tenant Photo" side="selfie" value={tenantPhoto} onChange={setTenantPhoto} />
          </div>
        </div>

        <button type="button" onClick={handleStart}>Send OTP</button>
        <button type="button" onClick={() => handleComplete(aadhaarFront, aadhaarBack, tenantPhoto)}>
          {otpSent ? "Verify OTP & Complete" : "Complete Verification"}
        </button>
        {otpMsg && <p className="muted">{otpMsg}</p>}
        {nextVisible && (
          <button type="button" onClick={handleNext}>Continue to Rental Agreement</button>
        )}
      </div>
    </div>
  );
}

