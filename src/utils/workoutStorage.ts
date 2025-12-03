import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompletedWorkoutExercise } from "../screens/WorkoutScreen";
import { ExerciseSet } from "../screens/WorkoutExerciseScreen";

const WORKOUT_PROGRESS_KEY = "workout_progress";

export interface CurrentExerciseProgress {
  workoutExerciseId: number;
  exerciseId: number;
  currentSet: number;
  sets: ExerciseSet[];
  timerStartedAt?: number; // timestamp when timer started
  restTimerReset: number;
}

export interface WorkoutProgress {
  workoutId: number;
  completedExercises: CompletedWorkoutExercise[];
  currentExercise?: CurrentExerciseProgress;
  startedAt: string;
}

export async function saveWorkoutProgress(
  progress: WorkoutProgress
): Promise<void> {
  try {
    await AsyncStorage.setItem(WORKOUT_PROGRESS_KEY, JSON.stringify(progress));
    console.log(
      "[WorkoutStorage] Saved progress:",
      JSON.stringify(progress, null, 2)
    );
  } catch (error) {
    console.error("[WorkoutStorage] Failed to save:", error);
  }
}

export async function loadWorkoutProgress(): Promise<WorkoutProgress | null> {
  try {
    const data = await AsyncStorage.getItem(WORKOUT_PROGRESS_KEY);
    const parsed = data ? JSON.parse(data) : null;
    console.log(
      "[WorkoutStorage] Loaded progress:",
      parsed ? JSON.stringify(parsed, null, 2) : "null"
    );
    return parsed;
  } catch (error) {
    console.error("[WorkoutStorage] Failed to load:", error);
    return null;
  }
}

export async function clearWorkoutProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WORKOUT_PROGRESS_KEY);
    console.log("[WorkoutStorage] Cleared progress");
  } catch (error) {
    console.error("[WorkoutStorage] Failed to clear:", error);
  }
}
