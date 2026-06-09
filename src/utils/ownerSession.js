const OWNER_LOGIN_ID_REGEX = /^ROOMHY\d{4,}$/i;

const normalizeOwnerSession = (value) => {
  if (!value || typeof value !== "object") return null;
  const loginId = String(value.loginId || value.ownerLoginId || "").trim().toUpperCase();
  if (!OWNER_LOGIN_ID_REGEX.test(loginId)) return null;
  return {
    ...value,
    loginId
  };
};

export const getOwnerSession = () => {
  if (typeof window === "undefined") return null;

  // ONLY read from owner-specific keys — NOT "user" (superadmin key)
  const keys = [
    () => sessionStorage.getItem("owner_session"),
    () => localStorage.getItem("owner_session"),
  ];

  for (const read of keys) {
    try {
      const raw = read();
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const normalized = normalizeOwnerSession(parsed);
      if (normalized) return normalized;
    } catch (_) {
      // ignore bad storage values
    }
  }

  return null;
};

export const requireOwnerSession = () => {
  const owner = getOwnerSession();
  if (!owner || !owner.loginId) {
    if (typeof window !== "undefined") {
      window.location.href = "/propertyowner/ownerlogin";
    }
    return null;
  }
  return owner;
};

