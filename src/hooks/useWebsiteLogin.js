import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function useWebsiteLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier: email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Store token and user data (use 'userData' key to match AuthContext)
      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      
      // Redirect to home page
      window.location.href = "/website/index";
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = () => {
    window.location.href = "/website/forgot-password";
  };

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
