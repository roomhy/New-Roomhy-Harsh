// Tasks API — the ONLY place task endpoints are called.
// Thin wrappers over the shared apiFetch HTTP client (base URL, auth header,
// JSON, timeout all handled there). Endpoints are unchanged from the pages.
import { apiFetch } from "../utils/api";

/** Tasks assigned to a staff member. Returns an array. */
export async function getStaffTasks(staffLoginId) {
  let parentLoginId = '';
  let staffMongoId = '';
  try {
    const raw = sessionStorage.getItem("staff_session") || localStorage.getItem("staff_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      parentLoginId = parsed.parentLoginId;
      staffMongoId = parsed._id || parsed.id;
    }
  } catch (e) { }

  const promises = [
    apiFetch(`/api/tasks?assignedStaffLoginId=${encodeURIComponent(staffLoginId)}`).catch(() => ({ data: [] }))
  ];

  if (parentLoginId && staffMongoId) {
    promises.push(
      apiFetch(`/api/maintenance/owner/${encodeURIComponent(parentLoginId)}`).catch(() => ({ tasks: [] }))
    );
  }

  const [tasksRes, maintRes] = await Promise.all(promises);

  const normalTasks = tasksRes?.data || [];

  const maintTasks = (maintRes?.tasks || [])
    .filter(t => t.assignedStaffId === staffMongoId)
    .map(t => ({
      _id: "maint_" + t._id,
      realId: t._id,
      title: t.title,
      description: "Maintenance Task • " + (t.frequency || "One-time"),
      status: t.status === "Scheduled" ? "Pending" : t.status, // normal tasks use Pending
      priority: "High",
      dueDate: t.scheduledDate,
      category: "Maintenance",
      assignedStaffName: t.assignedStaffName,
      createdAt: t.createdAt,
      completedAt: (t.status === "Completed") ? t.updatedAt : null,
    }));

  return [...normalTasks, ...maintTasks];
}

/** Update a task's status. */
export async function updateTaskStatus(taskId, status) {
  if (String(taskId).startsWith("maint_")) {
    const realId = taskId.replace("maint_", "");
    // Maintenance uses Scheduled instead of Pending
    const apiStatus = status === "Pending" ? "Scheduled" : status;
    return apiFetch(`/api/maintenance/${realId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: apiStatus }),
    });
  }
  return apiFetch(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
