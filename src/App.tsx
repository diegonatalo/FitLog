import { Navigate, Route, Routes } from "react-router";
import { useTheme } from "./hooks/useTheme";
import { useWorkoutStore } from "./hooks/useWorkoutStore";
import { Layout } from "./components/Layout";
import { patterns } from "./lib/paths";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ExerciseDetail } from "./pages/ExerciseDetail";
import { WorkoutDetail } from "./pages/WorkoutDetail";
import { WorkoutForm } from "./pages/WorkoutForm";
import { SessionScreen } from "./pages/SessionScreen";
import { SessionDetail } from "./pages/SessionDetail";

export default function App() {
  const { theme, toggle } = useTheme();
  const store = useWorkoutStore();

  return (
    <Routes>
      <Route
        element={<Layout store={store} theme={theme} onToggleTheme={toggle} />}
      >
        <Route path={patterns.home} element={<HomePage store={store} />} />
        <Route
          path={patterns.library}
          element={<LibraryPage store={store} />}
        />
        <Route
          path={patterns.history}
          element={<HistoryPage store={store} />}
        />
        <Route
          path={patterns.sessionDetail}
          element={<SessionDetail store={store} />}
        />
        <Route
          path={patterns.exercise}
          element={<ExerciseDetail store={store} />}
        />
        <Route
          path={patterns.newWorkout}
          element={<WorkoutForm store={store} />}
        />
        <Route
          path={patterns.editWorkout}
          element={<WorkoutForm store={store} />}
        />
        <Route
          path={patterns.workout}
          element={<WorkoutDetail store={store} />}
        />
        <Route
          path={patterns.session}
          element={<SessionScreen store={store} />}
        />
        <Route path="*" element={<Navigate to={patterns.home} replace />} />
      </Route>
    </Routes>
  );
}
