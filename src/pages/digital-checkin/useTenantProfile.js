import { useCallback, useEffect, useMemo, useState } from "react";
import { cleanPropertyName, getApiBases, isLocalHost } from "./utils";

const EMPTY = {
  loginId: "",
  // personal — tenant fills
  name: "", email: "", phone: "", dob: "",
  permanentAddress: "", guardianNumber: "", backupEmail: "",
  // property — owner-locked if set
  propertyName: "", propertyAddress: "", roomNo: "", accommodationType: "",
  // financial — owner-locked if set
  agreedRent: "", securityDeposit: "", moveInDate: "",
  licenseDuration: "", licenseEndDate: "",
  licenseFeeDueDate: "5", moveOutCharges: "0", noticePeriodCharges: "0",
  inclusions: "", minimumStayDuration: "3 Months", gstCharges: "0",
  propertyAddress: "", permanentAddress: ""
};

function calcEndDate(startDate, durationStr) {
  if (!startDate || !durationStr) return "";
  // Extract the first number from strings like "3 months", "11 Months", "4"
  const match = String(durationStr).match(/(\d+)/);
  const months = match ? parseInt(match[1], 10) : NaN;
  if (!months || isNaN(months)) return "";
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// Fields that are locked if the owner provided them at assignment time
const OWNER_FIELDS = [
  "propertyName", "roomNo", "agreedRent", "moveInDate",
  "accommodationType", "securityDeposit", "minimumStayDuration", "licenseFeeDueDate",
  "licenseDuration", "moveOutCharges", "noticePeriodCharges", "inclusions", "gstCharges",
  "propertyAddress"
];

export const useTenantProfile = () => {
  const apiBases = useMemo(() => getApiBases(), []);
  const apiBase = useMemo(
    () => (import.meta.env?.VITE_API_URL || (isLocalHost() ? "http://localhost:5001" : "https://roohmy-backend-xwa9.vercel.app")),
    []
  );
  const [form, setForm] = useState(EMPTY);
  const [locked, setLocked] = useState({});        // { fieldName: true } for owner-set fields
  const [loading, setLoading] = useState(false);

  const updateForm = useCallback((patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  // Read loginId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("loginId");
    if (id) updateForm({ loginId: id.toUpperCase() });
  }, [updateForm]);

  // Prefill from backend when loginId is known
  useEffect(() => {
    const loginId = (form.loginId || "").trim().toUpperCase();
    if (!loginId) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      let tenant = null;

      // 1. Try the dedicated profile GET endpoint
      try {
        for (const base of apiBases) {
          const res = await fetch(`${base}/api/checkin/tenant/profile/${encodeURIComponent(loginId)}`);
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            tenant = data?.tenant || null;
            if (tenant) break;
          }
        }
      } catch (_) {}

      // 2. Fallback: local cache or /api/tenants
      if (!tenant) {
        try {
          const cached = JSON.parse(localStorage.getItem("roomhy_tenants") || "[]");
          tenant = cached.find((t) => String(t.loginId || "").toUpperCase() === loginId) || null;
        } catch (_) {}
      }
      if (!tenant) {
        try {
          const res = await fetch(`${apiBase}/api/tenants`);
          const data = await res.json().catch(() => ({}));
          const list = Array.isArray(data) ? data : Array.isArray(data.tenants) ? data.tenants : [];
          tenant = list.find((t) => String(t.loginId || "").toUpperCase() === loginId) || null;
        } catch (_) {}
      }

      if (!tenant || cancelled) { setLoading(false); return; }

      const profile  = tenant.digitalCheckin?.profile  || {};
      const details  = tenant.digitalCheckin?.agreementDetails || {};

      // Resolve property name
      const rawPropName = tenant.propertyTitle || profile.propertyName || tenant.propertyName || "";
      let propertyName = cleanPropertyName(rawPropName);
      if (!propertyName && tenant.propertyId) {
        try {
          const res = await fetch(`${apiBase}/api/properties`);
          if (res.ok) {
            const pd = await res.json().catch(() => ({}));
            const match = (Array.isArray(pd?.properties) ? pd.properties : [])
              .find((p) => String(p._id || p.id || "") === String(tenant.propertyId));
            propertyName = cleanPropertyName(match && (match.title || match.name));
          }
        } catch (_) {}
      }

      const rentRaw   = tenant.agreedRent || profile.agreedRent || "";
      const rentDisplay = rentRaw ? `INR ${rentRaw}` : "";

      const patch = {
        name:               tenant.name             || profile.name            || "",
        email:              tenant.email            || profile.email           || "",
        phone:              tenant.phone            || profile.phone           || "",
        dob:                tenant.dob              || profile.dob             || "",
        guardianNumber:     tenant.guardianNumber   || profile.guardianNumber  || "",
        permanentAddress:   details.permanentAddress|| profile.permanentAddress|| "",
        backupEmail:        details.backupEmail     || "",
        propertyName:       propertyName            || "",
        propertyAddress:    details.propertyAddress || "",
        roomNo:             tenant.roomNo           || profile.roomNo          || "",
        accommodationType:  details.accommodationType|| profile.accommodationType|| tenant.roomType || "",
        agreedRent:         rentDisplay,
        securityDeposit:    details.securityDeposit != null ? String(details.securityDeposit) : (tenant.securityDepositTotal ? String(tenant.securityDepositTotal) : ""),
        moveInDate:         tenant.moveInDate ? String(tenant.moveInDate).slice(0, 10) : (profile.moveInDate || ""),
        licenseDuration:    details.licenseDuration || "",
        licenseEndDate:     details.licenseEndDate  || "",
        licenseFeeDueDate:  details.licenseFeeDueDate|| "5",
        moveOutCharges:     details.moveOutCharges  != null ? String(details.moveOutCharges)  : "",
        noticePeriodCharges:details.noticePeriodCharges != null ? String(details.noticePeriodCharges) : "",
        inclusions:         details.inclusions      || profile.inclusions      || "",
        minimumStayDuration:details.minimumStayDuration|| "3 Months",
        gstCharges:         details.gstCharges      != null ? String(details.gstCharges) : "0",
        licenseDuration:    details.licenseDuration  || "",
        propertyAddress:    details.propertyAddress  || "",
        permanentAddress:   details.permanentAddress || profile.permanentAddress || ""
      };
      if (!cancelled) {
        updateForm(patch);
        // Mark owner-provided fields as locked (non-empty values set by owner at assignment)
        const lockedMap = {};
        for (const f of OWNER_FIELDS) {
          const v = patch[f] || "";
          if (v && v !== "INR " && v !== "INR 0") lockedMap[f] = true;
        }
        setLocked(lockedMap);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [form.loginId, apiBase, apiBases, updateForm]);

  // Auto-calculate licenseEndDate when moveInDate or licenseDuration changes
  useEffect(() => {
    if (!form.licenseDuration || !form.moveInDate) return;
    const computed = calcEndDate(form.moveInDate, form.licenseDuration);
    if (computed && computed !== form.licenseEndDate) {
      setForm((prev) => ({ ...prev, licenseEndDate: computed }));
    }
  }, [form.licenseDuration, form.moveInDate]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!form.permanentAddress.trim()) {
        alert("Permanent address is required for the Rental Agreement");
        return;
      }
      if (!form.phone.trim()) {
        alert("Phone number is required");
        return;
      }

      const rentRaw = (form.agreedRent || "").replace(/[^\d.]/g, "");
      const payload = {
        loginId:             form.loginId.trim().toUpperCase(),
        name:                form.name.trim(),
        email:               form.email.trim(),
        phone:               form.phone.trim(),
        dob:                 form.dob,
        guardianNumber:      form.guardianNumber.trim(),
        moveInDate:          form.moveInDate,
        permanentAddress:    form.permanentAddress.trim(),
        backupEmail:         form.backupEmail.trim(),
        accommodationType:   form.accommodationType.trim(),
        propertyAddress:     form.propertyAddress.trim(),
        securityDeposit:     form.securityDeposit.trim(),
        licenseDuration:     form.licenseDuration.trim(),
        licenseEndDate:      form.licenseEndDate.trim(),
        licenseFeeDueDate:   form.licenseFeeDueDate.trim() || "5",
        moveOutCharges:      form.moveOutCharges.trim(),
        noticePeriodCharges: form.noticePeriodCharges.trim(),
        inclusions:          form.inclusions.trim(),
        minimumStayDuration: form.minimumStayDuration.trim() || "3 Months",
        gstCharges:          form.gstCharges.trim() || "0",
        propertyName:        form.propertyName.trim(),
        roomNo:              form.roomNo.trim(),
        agreedRent:          rentRaw ? Number(rentRaw) : null
      };

      const res = await fetch(`${apiBase}/api/checkin/tenant/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) return alert(data.message || "Failed to save profile");

      window.location.href = `/digital-checkin/tenantkyc?loginId=${encodeURIComponent(payload.loginId)}`;
    },
    [apiBase, form]
  );

  return { form, updateForm, locked, loading, handleSubmit };
};
