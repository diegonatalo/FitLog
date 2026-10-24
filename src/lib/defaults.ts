import type { Exercise, LoadType, MuscleGroup, Workout } from "../types";

const BASE = Date.now();

const exercise = (
  id: string,
  name: string,
  muscleGroup: MuscleGroup,
  loadType: LoadType,
  order: number,
): Exercise => ({
  id: `ex-${id}`,
  name,
  muscleGroup,
  loadType,
  createdAt: BASE + order,
});

export const DEFAULT_EXERCISES: Exercise[] = [
  exercise("supino-reto", "Supino reto", "peito", "weight", 0),
  exercise("supino-inclinado", "Supino inclinado", "peito", "weight", 1),
  exercise("voador", "Voador", "peito", "plates", 2),
  exercise("agachamento-smith", "Agachamento no smith", "pernas", "weight", 3),
  exercise("leg-press-45", "Leg press 45°", "pernas", "weight", 4),
  exercise("hack", "Hack", "pernas", "weight", 5),
  exercise("cadeira-extensora", "Cadeira extensora", "pernas", "plates", 6),
  exercise("cadeira-flexora", "Cadeira flexora", "pernas", "plates", 7),
  exercise("cadeira-adutora", "Cadeira adutora", "pernas", "plates", 8),
  exercise("panturrilha", "Panturrilha", "pernas", "plates", 9),
  exercise("elevacao-pelvica", "Elevação pélvica", "gluteos", "weight", 10),
  exercise("puxador-frente-barra", "Puxador frente (barra)", "costas", "plates", 11),
  exercise("puxador-frente-triangulo", "Puxador frente (triângulo)", "costas", "plates", 12),
  exercise("remada-alta", "Remada alta", "costas", "plates", 13),
  exercise("remada-baixa", "Remada baixa", "costas", "plates", 14),
  exercise("face-pull", "Face pull", "costas", "plates", 15),
  exercise("elevacao-lateral", "Elevação lateral", "ombros", "plates", 16),
  exercise("desenvolvimento-halteres", "Desenvolvimento com halteres", "ombros", "weight", 17),
  exercise("rosca-direta", "Rosca direta", "biceps", "weight", 18),
  exercise("rosca-scott", "Rosca scott", "biceps", "plates", 19),
  exercise("triceps-corda", "Tríceps corda", "triceps", "plates", 20),
  exercise("triceps-frances", "Tríceps francês", "triceps", "plates", 21),
  exercise("abdomen-supra", "Abdominal supra", "abdomen", "bodyweight", 22),
  exercise("abdomen-infra", "Abdominal infra", "abdomen", "bodyweight", 23),
];

const workout = (id: string, name: string, exerciseIds: string[]): Workout => ({
  id: `wk-${id}`,
  name,
  exerciseIds,
  createdAt: BASE,
});

export const DEFAULT_WORKOUTS: Workout[] = [
  workout("push", "Push", [
    "ex-supino-reto",
    "ex-voador",
    "ex-elevacao-lateral",
    "ex-triceps-corda",
    "ex-triceps-frances",
  ]),
  workout("pull", "Pull", [
    "ex-puxador-frente-barra",
    "ex-remada-baixa",
    "ex-face-pull",
    "ex-rosca-direta",
    "ex-rosca-scott",
  ]),
  workout("legs", "Legs", [
    "ex-agachamento-smith",
    "ex-elevacao-pelvica",
    "ex-cadeira-flexora",
    "ex-cadeira-extensora",
    "ex-cadeira-adutora",
    "ex-panturrilha",
  ]),
];
