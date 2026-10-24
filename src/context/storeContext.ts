import { createContext } from "react";
import type { Store } from "../hooks/useWorkoutStore";

export const StoreContext = createContext<Store | null>(null);
