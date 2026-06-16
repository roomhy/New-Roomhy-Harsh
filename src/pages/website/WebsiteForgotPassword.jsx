import React, { useState } from "react";
import WebsiteNavbar from "../../components/website/WebsiteNavbar";
import WebsiteFooter from "../../components/website/WebsiteFooter";
import MobileBottomNav from "../../components/website/MobileBottomNav";
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function WebsiteForgotPassword() {
  const [step, setStep] = useState("email"); // "email" | "otp" | "reset" | "done"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cooldownExpiry, setCooldownExpiry] = useState(() => {
    const stored = localStorage.getItem("signup_otp_cooldown_expiry");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (parsed > Date.now()) {
        return parsed;
      }
    }
    return 0;
  });

  const [secondsLeft, setSecondsLeft] = useState(0);

  React.useEffect(() => {
    if (!cooldownExpiry) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.ceil((cooldownExpiry - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0) {
        localStorage.removeItem("signup_otp_cooldown_expiry");
        setCooldownExpiry(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldownExpiry]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 || (data.message && data.message.toLowerCase().includes("too many"))) {
          const expiry = Date.now() + 10 * 60 * 1000;
          localStorage.setItem("signup_otp_cooldown_expiry", expiry.toString());
          setCooldownExpiry(expiry);
        }
        throw new Error(data.message || "Failed to send OTP.");
      }
      setStep("otp");
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP.");
      setToken(data?.token || "");
      setStep("reset");
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");
      setStep("done");
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <WebsiteNavbar />

      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          {/* Back to login */}
          <a
            href="/website/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </a>

          <div className="bg-white rounded-2xl shadow-md p-8">
            {/* Step: email */}
            {step === "email" && (
              <form onSubmit={requestOtp}>
                <div className="flex items-center justify-center w-14 h-14 bg-teal-50 rounded-full mx-auto mb-5">
                  <Mail className="w-7 h-7 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Forgot Password</h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Enter your registered email and we'll send you an OTP.
                </p>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                {secondsLeft > 0 && (
                  <div className="p-4 mb-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-rose-600 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold">Rate Limit Exceeded</p>
                      <p className="text-[11px] text-rose-600">Please wait {formatTime(secondsLeft)} before requesting a new OTP.</p>
                    </div>
                  </div>
                )}

                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-5"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || secondsLeft > 0}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:opacity-100"
                >
                  {secondsLeft > 0 ? `Locked (Wait ${formatTime(secondsLeft)})` : loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* Step: otp */}
            {step === "otp" && (
              <form onSubmit={verifyOtp}>
                <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mx-auto mb-5">
                  <KeyRound className="w-7 h-7 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Enter OTP</h1>
                <p className="text-sm text-gray-500 text-center mb-6">
                  A 6-digit OTP was sent to <strong>{email}</strong>
                </p>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                <label className="block text-sm font-semibold text-gray-700 mb-2">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-5 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 mb-3"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); setOtp(""); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Change email
                </button>
              </form>
            )}

            {/* Step: reset */}
            {step === "reset" && (
              <form onSubmit={resetPassword}>
                <div className="flex items-center justify-center w-14 h-14 bg-purple-50 rounded-full mx-auto mb-5">
                  <Lock className="w-7 h-7 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">New Password</h1>
                <p className="text-sm text-gray-500 text-center mb-6">Choose a strong new password.</p>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative mb-6">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            {/* Step: done */}
            {step === "done" && (
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h1>
                <p className="text-sm text-gray-500 mb-6">Your password has been updated. You can now log in with your new password.</p>
                <a
                  href="/website/login"
                  className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors text-center"
                >
                  Go to Login
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <WebsiteFooter />
      <MobileBottomNav />
    </div>
  );
}
