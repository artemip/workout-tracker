import {
  createContext,
  ProviderProps,
  useContext,
  useEffect,
  useMemo,
} from "react";
import useSWR from "swr";
import { Urls } from "../api/urls";
import useErrorLogger from "../hooks/useErrorLogger";
import { Exercise } from "../types/types";

type Exercises = Record<Exercise["id"], Exercise>;

const ExerciseContext = createContext<Exercises>([]);

function ExerciseProvider({ children }: ProviderProps<Exercises>) {
  const { data: exercises, error } = useSWR<Exercise[]>(Urls.EXERCISES);
  useErrorLogger(error);

  const exercisesById = useMemo(() => {
    return exercises?.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {} as Exercises);
  }, [exercises]);

  return (
    <ExerciseContext.Provider value={exercisesById ?? {}}>
      {children}
    </ExerciseContext.Provider>
  );
}

export function useExercises() {
  return useContext(ExerciseContext);
}

export { ExerciseContext, ExerciseProvider };
