import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "tailwindcss/colors";
import useSWR from "swr";
import { Urls } from "../api/urls";
import {
  Exercise,
  ExerciseLog,
  Workout,
  WorkoutExercise,
} from "../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParams } from "../../App";
import Row from "../components/Row";
import { useWorkoutExercises } from "../context/WorkoutExerciseContext";
import Button from "../components/Button";

type Props = NativeStackScreenProps<StackParams, "Home">;

export default function Home({ navigation }: Props) {
  const { data: workouts, error: errorWorkouts } = useSWR<Workout[]>(
    Urls.WORKOUTS
  );

  const { data: exerciseLogs, error: errorExerciseLogs } = useSWR<
    ExerciseLog[]
  >(Urls.EXERCISE_LOGS);

  const isLoading = !workouts || !exerciseLogs;

  const workoutsByCycle = useMemo(() => {
    return (
      workouts?.reduce((acc, curr) => {
        const { meso_cycle } = curr;
        if (!acc[meso_cycle]) {
          acc[meso_cycle] = [];
        }
        acc[meso_cycle].push(curr);
        acc[meso_cycle] = acc[meso_cycle].sort((a, b) => a.order - b.order);
        return acc;
      }, {} as Record<string, Workout[]>) ?? {}
    );
  }, [workouts]);

  const workoutExercises = useWorkoutExercises();

  const sortedLogs = useMemo(() => {
    return (
      exerciseLogs?.sort((a, b) => {
        return (
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        );
      }) ?? []
    );
  }, [exerciseLogs]);

  const lastWorkout = workouts?.find(
    (w) =>
      w.id === workoutExercises[sortedLogs[0]?.workout_exercise_id]?.workout_id
  );

  const nextWorkout = lastWorkout
    ? workouts?.find((w) => w.order === lastWorkout.order + 1)
    : undefined;

  function goToWorkout(workout: Workout) {
    navigation.navigate("Workout", { workout });
  }

  useEffect(() => {
    if (errorWorkouts || errorExerciseLogs) {
      Alert.alert(
        "Error",
        errorWorkouts?.message ?? errorExerciseLogs?.message
      );
    }
  }, [errorWorkouts, errorExerciseLogs]);

  return (
    <View className="flex-1 bg-slate-50 p-4 flex-col">
      {nextWorkout && (
        <View className="pb-8">
          <Text className="text-2xl mb-2">Next Workout:</Text>
          <Text className="text-xl mb-8">
            {nextWorkout?.name} (Meso Cycle {nextWorkout?.meso_cycle})
          </Text>
          <Button
            title="Start Workout"
            onPress={() => goToWorkout(nextWorkout)}
          />
        </View>
      )}
      <ScrollView className="flex-1 gap-8 mt-0">
        {isLoading && (
          <ActivityIndicator size="large" color={colors.blue[400]} />
        )}
        {Object.keys(workoutsByCycle).map((cycle) => {
          return (
            <View key={cycle}>
              <View className="border-b-2 border-slate-600 pb-2">
                <Text className="text-xl">Meso Cycle {cycle}</Text>
              </View>
              {workoutsByCycle[cycle].map((workout, idx) => {
                const lastLog = sortedLogs.find(
                  (e) =>
                    workoutExercises[e.workout_exercise_id]?.workout_id ===
                    workout.id
                );
                return (
                  <Row
                    key={workout.id}
                    onPress={() => goToWorkout(workout)}
                    icon="chevrons-right"
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
                  </Row>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
