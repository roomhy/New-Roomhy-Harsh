import { useCallback, useMemo, useRef, useState } from "react";
import { setWebsiteSession } from "../utils/websiteSession";

const getApiUrl = () =>
  import.meta.env?.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : "https://roohmy-backend-xwa9.vercel.app");

export function useWebsiteLogin() {
  const apiUrl = useMemo(() => getApiUrl(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toastTimer = useRef(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmedEmail, password: trimmedPassword })
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.token && data.user) {
        setWebsiteSession(data.user, data.token);
        window.location.href = "/website/index";
        return;
      }
      setError(data.message || "Invalid email or password.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, email, password]);

  const handleForgot = useCallback(() => {
    window.location.href = "/website/forgot-password";
  }, []);

  return {
    email,
    password,
    loading,
    error,
    setEmail,
    setPassword,
    handleSubmit,
    handleForgot
  };
}
