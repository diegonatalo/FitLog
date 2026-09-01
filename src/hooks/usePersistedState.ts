import { useEffect, useState } from "react";
import { loadState, saveState, type StorageKey } from "../lib/storage";

/**
 * State that is seeded from localStorage on mount and written back whenever it
 * changes. Replaces the repeated `useState(() => load...) + useEffect(save...)`
 * pattern used across the store.
 */
export function usePersistedState<T>(key: StorageKey) {
  const [value, setValue] = useState<T>(() => loadState<T>(key));
  useEffect(() => saveState(key, value), [key, value]);
  return [value, setValue] as const;
}
