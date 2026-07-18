import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { STALE } from "../lib/queryClient";
import {
  getMyAttendance, checkIn, checkOut, getTenantAttendance, markTenantAttendance,
  applyLeave, getTenantHistory,
} from "../api/attendance";

/** The logged-in staff member's own attendance for a month. */
export function useMyAttendance(staffLoginId, month, year, options = {}) {
  return useQuery({
    queryKey: queryKeys.attendance.mine(staffLoginId, month, year),
    queryFn: () => getMyAttendance(staffLoginId, month, year),
    enabled: !!staffLoginId,
    staleTime: STALE.attendance,
    ...options,
  });
}

export function useCheckIn(staffLoginId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => checkIn(staffLoginId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.attendance.all }),
  });
}

export function useCheckOut(staffLoginId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => checkOut(staffLoginId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.attendance.all }),
  });
}

export function useApplyLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => applyLeave(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.attendance.all }),
  });
}

/** Tenant attendance for an owner on a date. */
export function useTenantAttendance(ownerLoginId, date, options = {}) {
  return useQuery({
    queryKey: queryKeys.attendance.tenants(ownerLoginId, date),
    queryFn: () => getTenantAttendance(ownerLoginId, date),
    enabled: !!ownerLoginId && !!date,
    staleTime: STALE.attendance,
    ...options,
  });
}

/** One tenant's attendance history for a month. */
export function useTenantHistory(ownerLoginId, tenantId, month, year, options = {}) {
  return useQuery({
    queryKey: queryKeys.attendance.tenantHistory(ownerLoginId, tenantId, month, year),
    queryFn: () => getTenantHistory(ownerLoginId, tenantId, month, year),
    enabled: !!ownerLoginId && !!tenantId,
    staleTime: STALE.attendance,
    ...options,
  });
}

/**
 * Mark one tenant present/absent with an optimistic cache update on the
 * tenant-attendance list for that date; rolls back on error.
 */
export function useMarkTenantAttendance(ownerLoginId, date) {
  const qc = useQueryClient();
  const key = queryKeys.attendance.tenants(ownerLoginId, date);
  return useMutation({
    mutationFn: (payload) => markTenantAttendance(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old = []) => {
        const arr = Array.isArray(old) ? [...old] : [];
        const idx = arr.findIndex((r) => String(r.tenantId) === String(payload.tenantId));
        if (idx >= 0) arr[idx] = { ...arr[idx], status: payload.status };
        else arr.push({ tenantId: payload.tenantId, status: payload.status, date: payload.date });
        return arr;
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
