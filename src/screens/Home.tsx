import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useSWR from "swr";
import { Urls } from "../api/urls";
import {
  Exercise,
  ExerciseLog,
  Workout,
  WorkoutExercise,
} from "../types/types";
import { Feather } from "@expo/vector-icons";

export default function Home() {
  const { data: exercises, error: errorExercises } = useSWR<Exercise[]>(
    Urls.EXERCISES
  );
  const { data: workouts, error: errorWorkouts } = useSWR<Workout[]>(
    Urls.WORKOUTS
  );
  const { data: workoutExercises, error: errorWorkoutExercises } = useSWR<
    WorkoutExercise[]
  >(Urls.WORKOUT_EXERCISES);
  const { data: exerciseLogs, error: errorExerciseLogs } = useSWR<
    ExerciseLog[]
  >(Urls.EXERCISE_LOGS);

  const workoutsByCycle = useMemo(() => {
    return (
      workouts?.reduce((acc, curr) => {
        const { meso_cycle } = curr;
        if (!acc[meso_cycle]) {
          acc[meso_cycle] = [];
        }
        acc[meso_cycle].push(curr);
        return acc;
      }, {} as Record<string, Workout[]>) ?? {}
    );
  }, [workouts]);

  const sortedLogs = useMemo(() => {
    return exerciseLogs?.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    });
  }, [exerciseLogs]);

  return (
    <ScrollView>
      <View className="flex-1 bg-slate-50 gap-6 p-4">
        {Object.keys(workoutsByCycle).map((cycle) => {
          return (
            <View key={cycle} className="gap-1">
              <View className="border-b-2 border-slate-500 pb-2">
                <Text className="text-2xl">Meso Cycle {cycle}</Text>
              </View>
              {workoutsByCycle[cycle].map((workout, idx) => {
                const lastLog = sortedLogs?.find(
                  (e) => e.workout_exercise.workout_id === workout.id
                );
                return (
                  <TouchableOpacity
                    key={workout.id}
                    className="flex-row border-b-2 border-slate-200 py-3 pr-2 justify-between items-center"
                  >
                    <View>
                      <Text className="text-lg">{`#${idx + 1} - ${
                        workout.name
                      }`}</Text>
                      <Text className="text-xs">
                        Last completed:{" "}
                        {lastLog
                          ? new Date(lastLog.created_at!).toLocaleDateString()
                          : "Never"}
                      </Text>
                    </View>
                    <Feather name="chevrons-right" size={24} color="black" />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
