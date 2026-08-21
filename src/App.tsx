import { useTheme } from "./hooks/useTheme";
import { useWorkoutStore } from "./hooks/useWorkoutStore";
import { useNav } from "./hooks/useNav";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ExerciseDetail } from "./pages/ExerciseDetail";
import { WorkoutDetail } from "./pages/WorkoutDetail";
import { WorkoutForm } from "./pages/WorkoutForm";
import { SessionScreen } from "./pages/SessionScreen";
import { SessionDetail } from "./pages/SessionDetail";

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  home: { title: "FitLog", subtitle: "Seus treinos de hoje" },
  library: { title: "Biblioteca", subtitle: "Todos os exercícios" },
  history: { title: "Histórico", subtitle: "Treinos concluídos" },
};

export default function App() {
  const { theme, toggle } = useTheme();
  const store = useWorkoutStore();
  const nav = useNav();
  const route = nav.current;

  const header = (() => {
    switch (route.t) {
      case "home":
      case "library":
      case "history":
        return { ...TAB_TITLES[route.t], showBack: false };
      case "exercise": {
        const ex = store.exercises.find((e) => e.id === route.id);
        return {
          title: ex?.name ?? "Exercício",
          subtitle: undefined,
          showBack: true,
        };
      }
      case "workout": {
        const wk = store.workouts.find((w) => w.id === route.id);
        return {
          title: wk?.name ?? "Treino",
          subtitle: undefined,
          showBack: true,
        };
      }
      case "workoutForm":
        return {
          title: route.id ? "Editar treino" : "Novo treino",
          subtitle: undefined,
          showBack: true,
        };
      case "session": {
        const s = store.sessions.find((x) => x.id === route.id);
        return {
          title: s?.name ?? "Treino em andamento",
          subtitle: "Sessão ativa",
          showBack: true,
        };
      }
      case "sessionDetail": {
        const s = store.sessions.find((x) => x.id === route.id);
        return {
          title: s?.name ?? "Sessão",
          subtitle: undefined,
          showBack: true,
        };
      }
    }
  })();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        theme={theme}
        onToggleTheme={toggle}
        showBack={header.showBack}
        onBack={nav.pop}
        title={header.title}
        subtitle={header.subtitle}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4">
        {route.t === "home" && <HomePage store={store} nav={nav} />}
        {route.t === "library" && <LibraryPage store={store} nav={nav} />}
        {route.t === "history" && <HistoryPage store={store} nav={nav} />}
        {route.t === "exercise" && (
          <ExerciseDetail store={store} nav={nav} exerciseId={route.id} />
        )}
        {route.t === "workout" && (
          <WorkoutDetail store={store} nav={nav} workoutId={route.id} />
        )}
        {route.t === "workoutForm" && (
          <WorkoutForm store={store} nav={nav} workoutId={route.id} />
        )}
        {route.t === "session" && (
          <SessionScreen store={store} nav={nav} sessionId={route.id} />
        )}
        {route.t === "sessionDetail" && (
          <SessionDetail store={store} nav={nav} sessionId={route.id} />
        )}
      </main>

      {nav.atRoot && (
        <BottomNav active={nav.activeTab} onSelect={nav.selectTab} />
      )}
    </div>
  );
}
