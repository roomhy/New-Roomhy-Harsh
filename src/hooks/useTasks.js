import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { STALE } from "../lib/queryClient";
import { getStaffTasks, updateTaskStatus } from "../api/tasks";

/** Tasks assigned to the given staff member. */
export function useStaffTasks(staffLoginId) {
  return useQuery({
    queryKey: queryKeys.tasks.byStaff(staffLoginId),
    queryFn: () => getStaffTasks(staffLoginId),
    enabled: !!staffLoginId,
    staleTime: STALE.tasks,
  });
}

/**
 * Update a task status with an optimistic cache update + rollback on failure,
 * then invalidate the tasks domain so it re-syncs with the server.
 */
export function useUpdateTaskStatus(staffLoginId) {
  const qc = useQueryClient();
  const key = queryKeys.tasks.byStaff(staffLoginId);

  return useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old = []) =>
        old.map((t) =>
          t._id === taskId
            ? { ...t, status, completedAt: status === "Completed" ? new Date().toISOString() : t.completedAt }
            : t
        )
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.tasks.all }),
  });
}
