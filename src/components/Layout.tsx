import { useMemo } from "react";
import { Outlet, matchPath, useLocation, useNavigate } from "react-router";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { patterns, tabPatterns } from "../lib/paths";
import type { Store } from "../pages/shared";

interface HeaderInfo {
  title: string;
  subtitle?: string;
}

type Params = Record<string, string | undefined>;

/**
 * Header copy per route. Ordered most-specific first so static segments
 * (/treino/novo) are considered before dynamic ones (/treino/:id).
 */
const HEADER_RULES: {
  pattern: string;
  resolve: (params: Params, store: Store) => HeaderInfo;
}[] = [
  {
    pattern: patterns.home,
    resolve: () => ({ title: "FitLog", subtitle: "Seus treinos de hoje" }),
  },
  {
    pattern: patterns.library,
    resolve: () => ({ title: "Biblioteca", subtitle: "Todos os exercícios" }),
  },
  {
    pattern: patterns.history,
    resolve: () => ({ title: "Histórico", subtitle: "Treinos concluídos" }),
  },
  { pattern: patterns.newWorkout, resolve: () => ({ title: "Novo treino" }) },
  {
    pattern: patterns.editWorkout,
    resolve: () => ({ title: "Editar treino" }),
  },
  {
    pattern: patterns.exercise,
    resolve: (p, store) => ({
      title: store.exercises.find((e) => e.id === p.id)?.name ?? "Exercício",
    }),
  },
  {
    pattern: patterns.workout,
    resolve: (p, store) => ({
      title: store.workouts.find((w) => w.id === p.id)?.name ?? "Treino",
    }),
  },
  {
    pattern: patterns.session,
    resolve: (p, store) => ({
      title:
        store.sessions.find((s) => s.id === p.id)?.name ??
        "Treino em andamento",
      subtitle: "Sessão ativa",
    }),
  },
  {
    pattern: patterns.sessionDetail,
    resolve: (p, store) => ({
      title: store.sessions.find((s) => s.id === p.id)?.name ?? "Sessão",
    }),
  },
];

interface LayoutProps {
  store: Store;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Layout({ store, theme, onToggleTheme }: LayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isTab = useMemo(
    () => tabPatterns.some((p) => matchPath(p, pathname)),
    [pathname],
  );

  const header = useMemo<HeaderInfo>(() => {
    for (const rule of HEADER_RULES) {
      const match = matchPath(rule.pattern, pathname);
      if (match) return rule.resolve(match.params, store);
    }
    return { title: "Treino Log" };
  }, [pathname, store]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        showBack={!isTab}
        onBack={() => navigate(-1)}
        title={header.title}
        subtitle={header.subtitle}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>

      {isTab && <BottomNav />}
    </div>
  );
}
