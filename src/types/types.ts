import { Database } from "./supabase";

export type Exercise = Database["public"]["Tables"]["exercises"]["Row"];
export type Workout = Database["public"]["Tables"]["workouts"]["Row"];

type DBWorkoutExercise =
  Database["public"]["Tables"]["workout_exercises"]["Row"];
export interface WorkoutExercise extends DBWorkoutExercise {
  exercise: Exercise;
  workout: Workout;
}

type DBExerciseLog = Database["public"]["Tables"]["exercise_logs"]["Insert"];
export interface ExerciseLog extends DBExerciseLog {
  workout_exercise: WorkoutExercise;
}
