/** Central definition of every route in the app. */
export const paths = {
  home: "/",
  library: "/biblioteca",
  history: "/historico",
  cardio: "/cardio",
  settings: "/ajustes",
  exercise: (id: string) => `/exercicio/${id}`,
  newWorkout: "/treino/novo",
  workout: (id: string) => `/treino/${id}`,
  editWorkout: (id: string) => `/treino/${id}/editar`,
  session: (id: string) => `/sessao/${id}`,
  sessionDetail: (id: string) => `/historico/${id}`,
} as const;

/** Route patterns, used for matching (header titles, active tab). */
export const patterns = {
  home: "/",
  library: "/biblioteca",
  history: "/historico",
  cardio: "/cardio",
  settings: "/ajustes",
  exercise: "/exercicio/:id",
  newWorkout: "/treino/novo",
  workout: "/treino/:id",
  editWorkout: "/treino/:id/editar",
  session: "/sessao/:id",
  sessionDetail: "/historico/:id",
} as const;

/** The bottom-nav tabs, which are the only screens without a back button. */
export const tabPatterns: string[] = [
  patterns.home,
  patterns.library,
  patterns.history,
  patterns.cardio,
];
