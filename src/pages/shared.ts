import { createContext, useContext } from "react";
import type { useWorkoutStore } from "../hooks/useWorkoutStore";

export type Store = ReturnType<typeof useWorkoutStore>;

const StoreContext = createContext<Store | null>(null);

export const StoreProvider = StoreContext.Provider;

/** Access the shared workout store from anywhere inside <StoreProvider>. */
export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore deve ser usado dentro de <StoreProvider>");
  }
  return store;
}
