import type { useWorkoutStore } from "../hooks/useWorkoutStore";

export type Store = ReturnType<typeof useWorkoutStore>;

export interface PageProps {
  store: Store;
}
