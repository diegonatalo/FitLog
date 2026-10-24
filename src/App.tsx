import { Navigate, Route, Routes } from "react-router";
import { useTheme } from "./hooks/useTheme";
import { Layout } from "./components/Layout";
import { patterns } from "./lib/paths";
import { HomePage } from "./pages/HomePage";
import { LibraryPage } from "./pages/LibraryPage";
import { HistoryPage } from "./pages/HistoryPage";
import { CardioPage } from "./pages/CardioPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ExerciseDetail } from "./pages/ExerciseDetail";
import { WorkoutDetail } from "./pages/WorkoutDetail";
import { WorkoutForm } from "./pages/WorkoutForm";
import { SessionScreen } from "./pages/SessionScreen";
import { SessionDetail } from "./pages/SessionDetail";

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <Routes>
      <Route element={<Layout theme={theme} onToggleTheme={toggle} />}>
        <Route path={patterns.home} element={<HomePage />} />
        <Route path={patterns.library} element={<LibraryPage />} />
        <Route path={patterns.history} element={<HistoryPage />} />
        <Route path={patterns.cardio} element={<CardioPage />} />
        <Route path={patterns.settings} element={<SettingsPage />} />
        <Route path={patterns.sessionDetail} element={<SessionDetail />} />
        <Route path={patterns.exercise} element={<ExerciseDetail />} />
        <Route path={patterns.newWorkout} element={<WorkoutForm />} />
        <Route path={patterns.editWorkout} element={<WorkoutForm />} />
        <Route path={patterns.workout} element={<WorkoutDetail />} />
        <Route path={patterns.session} element={<SessionScreen />} />
        <Route path="*" element={<Navigate to={patterns.home} replace />} />
      </Route>
    </Routes>
  );
}
