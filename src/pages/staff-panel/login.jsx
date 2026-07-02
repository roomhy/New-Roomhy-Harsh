import React, { useEffect, useState } from "react";
import { fetchJson } from "../../utils/api";
import { User, Key, Eye, EyeOff, ArrowRight, Lock, Shield } from "lucide-react";

function setStaffSession(data) {
  const s = JSON.stringify(data);
  sessionStorage.setItem("staff_session", s);
  localStorage.setItem("staff_session", s);
}

function setStaffToken(token) {
  if (!token) return;
  sessionStorage.setItem("token", token);
  localStorage.setItem("token", token);
}

export default function StaffLogin() {
  const [step, setStep] = useState("login"); // "login" | "setPassword"
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const [resetToken, setResetToken] = useState("");

  // If already logged in → redirect
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.loginId) { window.location.href = "/staff"; }
      }
    } catch (_) {}
  }, []);

  const handleLogin = async () => {
    if (!loginId || !password) {
      setErrorMsg("Please enter your Staff ID and password.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    try {
      const data = await fetchJson("/api/employees/login", {
        method: "POST",
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
      setStaffData(data.data);
      if (data.requirePasswordReset || data.data?.requirePasswordReset) {
        setResetToken(data.resetToken || "");
        setStep("setPassword");
        return;
      }
      const emp = data.data || {};
      setStaffSession({
        _id: emp._id,
        loginId: emp.loginId,
        name: emp.name,
        role: emp.role,
        parentLoginId: emp.parentLoginId,
        permissions: emp.permissions || [],
        assignedPropertyName: emp.assignedPropertyName || "",
        photoDataUrl: emp.photoDataUrl || "",
      });
      setStaffToken(data.token);
      window.location.href = "/staff";
    } catch (err) {
      let msg = "Login failed.";
      try { const p = JSON.parse(err?.body || "{}"); msg = p?.error || p?.message || err?.message || msg; } catch (_) { msg = err?.message || msg; }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setErrorMsg("Passwords do not match."); return; }
    setErrorMsg("");
    setLoading(true);
    try {
      const resetRes = await fetchJson(`/api/employees/${loginId.trim()}/reset-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${resetToken}` },
        body: JSON.stringify({ newPassword }),
      });
      const emp = staffData || {};
      setStaffSession({
        _id: emp._id || emp.id,
        loginId: emp.loginId || loginId.trim(),
        name: emp.name,
        role: emp.role,
        parentLoginId: emp.parentLoginId,
        permissions: emp.permissions || [],
        assignedPropertyName: emp.assignedPropertyName || "",
        photoDataUrl: emp.photoDataUrl || "",
      });
      setStaffToken(resetRes?.token);
      window.location.href = "/staff";
    } catch (err) {
      let msg = "Failed to set password.";
      try { const p = JSON.parse(err?.body || "{}"); msg = p?.error || p?.message || err?.message || msg; } catch (_) { msg = err?.message || msg; }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center relative overflow-hidden border border-slate-200">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-600">RoomHy</span>
        </div>

        {step === "login" && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1 mt-2">Staff Login</h1>
            <p className="text-gray-500 mb-6 text-sm">Sign in to your staff account</p>

            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User className="w-5 h-5" /></span>
                <input
                  type="text"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="e.g. STAFF0001"
                  value={loginId}
                  onChange={e => setLoginId(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>
            </div>

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Key className="w-5 h-5" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMsg && <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-lg px-4 py-3 mb-4 text-sm text-left">{errorMsg}</div>}

            <button type="button" onClick={handleLogin} disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
              {loading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === "setPassword" && (
          <div>
            <div className="flex justify-center mb-4 mt-2">
              <div className="bg-green-100 p-3 rounded-full"><Lock className="w-8 h-8 text-green-600" /></div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Set New Password</h1>
            <p className="text-gray-500 mb-6 text-sm">First login — please set your permanent password.</p>

            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? "text" : "password"}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                />
                <button type="button" onClick={() => setShowNewPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSetPassword()}
                />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMsg && <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-lg px-4 py-3 mb-4 text-sm text-left">{errorMsg}</div>}

            <button type="button" onClick={handleSetPassword} disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
              {loading ? "Saving..." : "Set Password & Continue"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-6">© {new Date().getFullYear()} RoomHy · Staff Portal</p>
      </div>
    </main>
  );
}
