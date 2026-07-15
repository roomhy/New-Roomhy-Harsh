// Tasks API — the ONLY place task endpoints are called.
// Thin wrappers over the shared apiFetch HTTP client (base URL, auth header,
// JSON, timeout all handled there). Endpoints are unchanged from the pages.
import { apiFetch } from "../utils/api";

/** Tasks assigned to a staff member. Returns an array. */
export async function getStaffTasks(staffLoginId) {
  const data = await apiFetch(`/api/tasks?assignedStaffLoginId=${encodeURIComponent(staffLoginId)}`);
  return data?.data || [];
}

/** Update a task's status. */
export async function updateTaskStatus(taskId, status) {
  return apiFetch(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
