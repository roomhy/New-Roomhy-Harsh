import { QueryClient } from "@tanstack/react-query";

// Named, reusable stale times so cache policy lives in one place (see STEP 14).
// Values are milliseconds.
export const STALE = {
  currentUser: 10 * 60 * 1000, // 10 min — identity changes rarely
  properties: 5 * 60 * 1000,   // 5 min
  attendance: 2 * 60 * 1000,   // 2 min
  tasks: 60 * 1000,            // 1 min
  visitors: 60 * 1000,        // 1 min
  notifications: 30 * 1000,   // 30 sec — frequently changing
};

// Single QueryClient for the whole app. Production defaults:
// - staleTime: sensible per-query overrides; a small global default avoids
//   refetch storms while still keeping data reasonably fresh.
// - gcTime: keep unused data cached for 5 min before garbage collection.
// - retry: retry transient failures once; never retry 4xx (client) errors.
// - refetchOnWindowFocus: off — the backend is on a cold-startable host and
//   focus refetches caused visible flicker in this app.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = error?.status;
        if (status && status >= 400 && status < 500) return false; // don't retry client errors
        return failureCount < 1; // one retry for transient/5xx/network
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
