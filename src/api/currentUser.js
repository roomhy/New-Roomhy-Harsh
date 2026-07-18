// Current user API — one place for the identity endpoint so every component
// shares a single cached query (STEP 13: no duplicate current-user requests).
import { apiFetch } from "../utils/api";

export async function getCurrentUser() {
  const data = await apiFetch(`/api/auth/me`);
  return data && typeof data.user === "object" ? data.user : data;
}
