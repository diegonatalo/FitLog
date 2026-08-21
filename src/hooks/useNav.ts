import { useCallback, useState } from "react";

export type Tab = "home" | "library" | "history";

export type Route =
  | { t: "home" }
  | { t: "library" }
  | { t: "history" }
  | { t: "exercise"; id: string }
  | { t: "workout"; id: string }
  | { t: "workoutForm"; id?: string }
  | { t: "session"; id: string }
  | { t: "sessionDetail"; id: string };

const TABS: Tab[] = ["home", "library", "history"];

export function isTab(route: Route): route is { t: Tab } {
  return (TABS as string[]).includes(route.t);
}

export function useNav() {
  const [stack, setStack] = useState<Route[]>([{ t: "home" }]);
  const current = stack[stack.length - 1];

  const push = useCallback(
    (route: Route) => setStack((s) => [...s, route]),
    [],
  );
  const pop = useCallback(
    () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    [],
  );
  const selectTab = useCallback((tab: Tab) => setStack([{ t: tab }]), []);
  /** replace the top of the stack (e.g. finishing a form returns to prior screen) */
  const replace = useCallback(
    (route: Route) => setStack((s) => [...s.slice(0, -1), route]),
    [],
  );

  const activeTab: Tab = (isTab(stack[0]) ? stack[0].t : "home") as Tab;
  const atRoot = stack.length === 1;

  return { current, stack, push, pop, replace, selectTab, activeTab, atRoot };
}
