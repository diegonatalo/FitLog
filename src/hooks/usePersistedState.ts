import { useEffect, useState } from "react";

/**
 * useState mirrored to localStorage. `load` and `save` must be stable
 * (module-level) functions. Changes made in other tabs are picked up through
 * the `storage` event, so two open tabs never overwrite each other with
 * stale data.
 */
export function usePersistedState<T>(
  key: string,
  load: () => T,
  save: (value: T) => void,
) {
  const [state, setState] = useState<T>(load);

  useEffect(() => {
    save(state);
  }, [state, save]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key || e.key === null) setState(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, load]);

  return [state, setState] as const;
}
