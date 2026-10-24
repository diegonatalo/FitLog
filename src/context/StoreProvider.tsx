import type { ReactNode } from "react";
import { useWorkoutStore } from "../hooks/useWorkoutStore";
import { StoreContext } from "./storeContext";

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useWorkoutStore();
  return <StoreContext value={store}>{children}</StoreContext>;
}
