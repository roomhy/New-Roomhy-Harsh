import React, { useEffect } from "react";
import { UNIFIED_LOGIN_PATH } from "../../utils/staffAccess";

// The standalone staff login page has been retired. Staff now authenticate
// through the single unified login form (the owner portal login), which detects
// STAFF login IDs and routes them into the staff experience. This component only
// redirects any old bookmarks / session-expiry links to that unified login.
export default function StaffLogin() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const expired = params.get("expired") === "1" ? "?expired=1" : "";
    window.location.replace(`${UNIFIED_LOGIN_PATH}${expired}`);
  }, []);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold">Redirecting to login…</p>
      </div>
    </main>
  );
}
