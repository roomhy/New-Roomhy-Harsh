const WEBSITE_USER_KEY = "website_user";
const WEBSITE_TOKEN_KEY = "website_token";
const ACCESS_TOKEN_KEY = "accessToken";
const TOKEN_KEY = "token";
const USER_KEY = "user";

export const getWebsiteApiUrl = () =>
  import.meta.env?.VITE_API_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : "https://roohmy-backend-xwa9.vercel.app");

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getStoredWebsiteToken = () => {
  try {
    return (
      localStorage.getItem(WEBSITE_TOKEN_KEY) ||
      sessionStorage.getItem(WEBSITE_TOKEN_KEY) ||
      ""
    );
  } catch {
    return "";
  }
};

const normalizeWebsiteUser = (user) => {
  if (!user || typeof user !== "object") return null;
  const loginId = user.loginId || user.email || user.id || user.userId || "";
  return {
    ...user,
    loginId,
    email: user.email || user.gmail || user.userEmail || "",
    role: user.role || "tenant"
  };
};

export const getWebsiteUser = () => {
  try {
    // Only read website-specific keys — ignore generic 'user'/'userData' used by superadmin/staff
    const user =
      safeParse(localStorage.getItem(WEBSITE_USER_KEY)) ||
      safeParse(sessionStorage.getItem(WEBSITE_USER_KEY)) ||
      null;
    return normalizeWebsiteUser(user);
  } catch {
    return null;
  }
};

export const setWebsiteSession = (user, token) => {
  const normalized = normalizeWebsiteUser(user);
  if (!normalized) return null;
  const safeToken = (token || "").toString().trim();
  try {
    // Only write to website-specific keys — do NOT touch generic 'user'/'token' keys
    localStorage.setItem(WEBSITE_USER_KEY, JSON.stringify(normalized));
    sessionStorage.setItem(WEBSITE_USER_KEY, JSON.stringify(normalized));

    if (safeToken) {
      localStorage.setItem(WEBSITE_TOKEN_KEY, safeToken);
      sessionStorage.setItem(WEBSITE_TOKEN_KEY, safeToken);
    }
  } catch (error) {
    console.error("Failed to store website session:", error);
  }
  return normalized;
};

export const clearWebsiteSession = () => {
  try {
    // Only clear website-specific keys
    localStorage.removeItem(WEBSITE_USER_KEY);
    sessionStorage.removeItem(WEBSITE_USER_KEY);
    localStorage.removeItem(WEBSITE_TOKEN_KEY);
    sessionStorage.removeItem(WEBSITE_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear website session:", error);
  }
};

export const getWebsiteSession = () => {
  const user = getWebsiteUser();
  const token = getStoredWebsiteToken();
  return user && token ? { user, token } : null;
};

export const isWebsiteLoggedIn = () => {
  const user = getWebsiteUser();
  const token = getStoredWebsiteToken();
  return !!user && !!token;
};

export const getWebsiteUserId = () => {
  const user = getWebsiteUser();
  if (!user) return "";
  return user.id || user.userId || user.loginId || user.ownerId || "";
};

export const getWebsiteUserName = () => {
  const user = getWebsiteUser();
  if (!user) return "Guest";
  return user.firstName || user.name || user.fullName || "User";
};

export const getWebsiteUserEmail = () => {
  const user = getWebsiteUser();
  if (!user) return "";
  return user.email || user.gmail || user.userEmail || "";
};

export const logoutWebsite = (redirectPage = "login") => {
  clearWebsiteSession();
  try {
    localStorage.removeItem("owner_session");
    localStorage.removeItem("tenant_user");
    localStorage.removeItem("bookingRequestData");
    sessionStorage.clear();
  } catch {
    // ignore
  }
  window.location.href = redirectPage;
};
