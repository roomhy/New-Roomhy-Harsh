import React from "react";
import { useHtmlPage } from "../../utils/htmlPage";
import { useTenantProfile } from "./useTenantProfile";

const Field = ({ label, note, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
      {label}
      {note && <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6, fontSize: 12 }}>{note}</span>}
    </label>
    {children}
  </div>
);

const inputStyle = (isLocked) => ({
  width: "100%", boxSizing: "border-box",
  padding: "9px 12px", borderRadius: 6,
  border: `1px solid ${isLocked ? "#e5e7eb" : "#d1d5db"}`,
  fontSize: 14, color: isLocked ? "#6b7280" : "#111827",
  background: isLocked ? "#f9fafb" : "#fff",
  cursor: isLocked ? "not-allowed" : "auto"
});

const SectionTitle = ({ n, title }) => (
  <div style={{ gridColumn: "1 / -1", marginTop: 8, marginBottom: 4, paddingBottom: 6, borderBottom: "2px solid #e5e7eb" }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {n && <span style={{ color: "#3b82f6", marginRight: 6 }}>{n}</span>}
      {title}
    </span>
  </div>
);

const LockBadge = () => (
  <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}>
    owner-set
  </span>
);

export default function DigitalCheckinTenantprofile() {
  useHtmlPage({
    title: "Tenant Digital Check-In - Profile",
    bodyClass: "",
    htmlAttrs: { lang: "en" },
    metas: [
      { charset: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" }
    ],
    links: [{ rel: "stylesheet", href: "/digital-checkin/assets/css/tenantprofile.css" }],
    styles: [],
    scripts: [],
    inlineScripts: []
  });

  const { form, updateForm, locked, loading, handleSubmit } = useTenantProfile();

  const inp = (field, extra = {}) => (
    <input
      value={form[field] || ""}
      onChange={(e) => !locked[field] && updateForm({ [field]: e.target.value })}
      readOnly={!!locked[field]}
      style={inputStyle(!!locked[field])}
      {...extra}
    />
  );

  return (
    <div className="html-page">
      <div className="wrap">
        <h2>Tenant Profile</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
          Complete your profile. All details will be printed in your Rental Agreement (Annexure A).
          Fields marked <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>owner-set</span> are pre-filled by your property owner and cannot be changed.
        </p>

        {loading && (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#6b7280", fontSize: 14 }}>
            Loading profile data...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid">

            {/* ── SECTION 1: Identity ── */}
            <SectionTitle n="01" title="Identity" />

            <Field label="Login ID">
              <input value={form.loginId} readOnly style={inputStyle(true)} />
            </Field>

            <Field label="Full Name *">
              {inp("name", { required: true, placeholder: "As per Aadhaar card" })}
            </Field>

            <Field label="Date of Birth *">
              {inp("dob", { type: "date", required: true })}
            </Field>

            {/* ── SECTION 2: Contact ── */}
            <SectionTitle n="02" title="Contact Details" />

            <Field label="Email Address" note="(used in agreement)">
              {inp("email", { type: "email", placeholder: "your@email.com" })}
            </Field>

            <Field label="Phone Number *" note="(used in agreement)">
              {inp("phone", { required: true, placeholder: "10-digit mobile number" })}
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Permanent Address *" note="(used in agreement)">
                <textarea
                  value={form.permanentAddress || ""}
                  onChange={(e) => updateForm({ permanentAddress: e.target.value })}
                  rows={3}
                  required
                  placeholder="House/Flat No., Street, Area, City, State, PIN"
                  style={{ ...inputStyle(false), resize: "vertical" }}
                />
              </Field>
            </div>

            <Field label="Guardian / Emergency Number *" note="(backup phone for agreement)">
              {inp("guardianNumber", { required: true, placeholder: "Emergency contact number" })}
            </Field>

            <Field label="Backup Email" note="(optional)">
              {inp("backupEmail", { type: "email", placeholder: "Backup contact email" })}
            </Field>

            {/* ── SECTION 3: Property Details ── */}
            <SectionTitle n="03" title="Property Details" />

            <Field label={<>Property Name {locked.propertyName && <LockBadge />}</>}>
              {inp("propertyName", { placeholder: "Property / PG name" })}
            </Field>

            <Field label="Property Address" note="(optional)">
              {inp("propertyAddress", { placeholder: "Full address of the property" })}
            </Field>

            <Field label={<>Room / Bed Number {locked.roomNo && <LockBadge />}</>}>
              {inp("roomNo", { placeholder: "e.g. Room 101 / Bed A" })}
            </Field>

            <Field label="Accommodation Type *">
              {locked.accommodationType ? (
                <input value={form.accommodationType || ""} readOnly style={inputStyle(true)} />
              ) : (
                <select
                  value={form.accommodationType || ""}
                  onChange={(e) => updateForm({ accommodationType: e.target.value })}
                  required
                  style={{ ...inputStyle(false), appearance: "auto" }}
                >
                  <option value="">Select type</option>
                  <option>Single Room</option>
                  <option>Double Sharing</option>
                  <option>Triple Sharing</option>
                  <option>Dormitory</option>
                  <option>Private PG</option>
                  <option>Flat / Apartment</option>
                  <option>AC Room</option>
                  <option>Non-AC Room</option>
                </select>
              )}
            </Field>

            {/* ── SECTION 4: Financial / Agreement Terms ── */}
            <SectionTitle n="04" title="Agreement & Financial Terms" />

            <Field label={<>Monthly Rent (₹) {locked.agreedRent && <LockBadge />}</>}>
              {inp("agreedRent", { placeholder: "e.g. INR 8000" })}
            </Field>

            <Field label="Security Deposit (₹)">
              {inp("securityDeposit", { type: "number", min: "0", placeholder: "Amount in ₹" })}
            </Field>

            <Field label={<>License Start Date (Move-in) {locked.moveInDate && <LockBadge />}</>}>
              {inp("moveInDate", { type: "date", required: true })}
            </Field>

            <Field label="License Duration *" note="(e.g. 3 months — auto-calculates end date)">
              {inp("licenseDuration", { required: true, placeholder: "e.g. 3 months" })}
            </Field>

            <Field label="License End Date" note="(auto-filled from duration)">
              {inp("licenseEndDate", { type: "date" })}
            </Field>

            <Field label="License Fee Due Date" note="(day of month, default: 5)">
              {inp("licenseFeeDueDate", { type: "number", min: "1", max: "28", placeholder: "5" })}
            </Field>

            <Field label="Move Out Charges (₹)" note="(0 if none)">
              {inp("moveOutCharges", { type: "number", min: "0", placeholder: "0" })}
            </Field>

            <Field label="Notice Period Charges (₹)" note="(0 if none)">
              {inp("noticePeriodCharges", { type: "number", min: "0", placeholder: "0" })}
            </Field>

            <Field label="Minimum Stay Duration" note="(default: 3 Months)">
              {inp("minimumStayDuration", { placeholder: "e.g. 3 Months" })}
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Inclusions" note="(what is included in rent: WiFi, electricity, meals, etc.)">
                {inp("inclusions", { placeholder: "e.g. WiFi, 2 meals/day, housekeeping" })}
              </Field>
            </div>

            <Field label="GST Charges (₹)" note="(0 if not applicable)">
              {inp("gstCharges", { type: "number", min: "0", placeholder: "0" })}
            </Field>

          </div>

          <button type="submit" disabled={loading} style={{ marginTop: 24, width: "100%" }}>
            {loading ? "Loading..." : "Save & Continue to KYC Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}
