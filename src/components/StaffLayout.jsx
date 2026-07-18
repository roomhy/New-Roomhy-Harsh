import React, { useEffect, useState } from "react";
import PropertyOwnerLayout from "./propertyowner/PropertyOwnerLayout";
import { getStaffSession, clearStaffSession, UNIFIED_LOGIN_PATH } from "../utils/staffAccess";
import { getOwnerRuntimeSession } from "../utils/propertyowner";

// There is ONE panel — the Property Owner Panel. `StaffLayout` is now just a thin
// wrapper that renders the staff self-service pages (Dashboard, Attendance, Daily
// Tasks) inside that same panel, using the staff-proxy session so the sidebar is
// automatically permission-filtered. The old standalone dark staff shell is gone.

// Decodes a JWT's exp claim (seconds since epoch) into a ms timestamp.
function getTokenExpiryMs(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 : null;
  } catch (_) {
    return null;
  }
}

function forceSessionExpiredLogout() {
  clearStaffSession();
  window.location.href = `${UNIFIED_LOGIN_PATH}?expired=1`;
}

export default function StaffLayout({ children, title }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getStaffSession();
    if (!session?.loginId) {
      window.location.href = UNIFIED_LOGIN_PATH;
      return;
    }
    setReady(true);
  }, []);

  // Proactively log the staff member out the moment their JWT expires.
  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return;
    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;
    const msLeft = expiryMs - Date.now();
    if (msLeft <= 0) { forceSessionExpiredLogout(); return; }
    const timer = setTimeout(forceSessionExpiredLogout, msLeft);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return null;

  const owner = getOwnerRuntimeSession();

  return (
    <PropertyOwnerLayout
      owner={owner}
      title={title}
      onLogout={() => { clearStaffSession(); window.location.href = UNIFIED_LOGIN_PATH; }}
    >
      {children}
    </PropertyOwnerLayout>
  );
}
