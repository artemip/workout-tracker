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
import { WorkoutExercise } from "../types/types";

type WorkoutExercises = Record<WorkoutExercise["id"], WorkoutExercise>;

const WorkoutExerciseContext = createContext<WorkoutExercises>([]);

function WorkoutExerciseProvider({
  children,
}: ProviderProps<WorkoutExercises>) {
  const { data: workoutExercises, error } = useSWR<WorkoutExercise[]>(
    Urls.WORKOUT_EXERCISES
  );
  useErrorLogger(error);

  const workoutExercisesById = useMemo(() => {
    return (
      workoutExercises?.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as WorkoutExercises) ?? {}
    );
  }, [workoutExercises]);

  return (
    <WorkoutExerciseContext.Provider value={workoutExercisesById ?? {}}>
      {children}
    </WorkoutExerciseContext.Provider>
  );
}

export function useWorkoutExercises() {
  return useContext(WorkoutExerciseContext);
}

export { WorkoutExerciseContext, WorkoutExerciseProvider };
