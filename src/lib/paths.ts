/** Route patterns, used for matching (header titles, active tab). */
export const patterns = {
  home: "/",
  library: "/biblioteca",
  history: "/historico",
  exercise: "/exercicio/:id",
  newWorkout: "/treino/novo",
  workout: "/treino/:id",
  editWorkout: "/treino/:id/editar",
  session: "/sessao/:id",
  sessionDetail: "/historico/:id",
} as const;

const fill = (pattern: string, id: string) => pattern.replace(":id", id);

/**
 * URL builders derived from `patterns` so a route is only ever defined once.
 * Static routes are the pattern itself; dynamic ones fill in the `:id` segment.
 */
export const paths = {
  home: patterns.home,
  library: patterns.library,
  history: patterns.history,
  newWorkout: patterns.newWorkout,
  exercise: (id: string) => fill(patterns.exercise, id),
  workout: (id: string) => fill(patterns.workout, id),
  editWorkout: (id: string) => fill(patterns.editWorkout, id),
  session: (id: string) => fill(patterns.session, id),
  sessionDetail: (id: string) => fill(patterns.sessionDetail, id),
} as const;

/** The three bottom-nav tabs, which are the only screens without a back button. */
export const tabPatterns: string[] = [
  patterns.home,
  patterns.library,
  patterns.history,
];
