import type { RunState } from "@/types/schema";

export const RUN_STATE_STORAGE_KEY = "sports-career-swipe:run-state:v1";

export function createEmptyRunState(): RunState {
  return {
    round: 1,
    max_rounds: 16,
    lane_ratings: {},
    history: [],
    convergence: {
      top_lane_id: "",
      runner_up_lane_id: "",
      rating_gap: 0,
      confidence_pct: 0,
    },
  };
}

export function readRunStateFromStorage(): RunState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(RUN_STATE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RunState;
  } catch {
    return null;
  }
}

export function writeRunStateToStorage(runState: RunState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RUN_STATE_STORAGE_KEY, JSON.stringify(runState));
}

