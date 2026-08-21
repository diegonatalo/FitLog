import type { useWorkoutStore } from "../hooks/useWorkoutStore";
import type { useNav } from "../hooks/useNav";

export type Store = ReturnType<typeof useWorkoutStore>;
export type Nav = ReturnType<typeof useNav>;

export interface PageProps {
  store: Store;
  nav: Nav;
}
