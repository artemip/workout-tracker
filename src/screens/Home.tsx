import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "tailwindcss/colors";
import useSWR, { mutate } from "swr";
import { Urls } from "../api/urls";
import { request } from "../api/request-handler";
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

  // Determine next workout based on last completed workout
  const nextWorkout = useMemo(() => {
    if (!workouts || workouts.length === 0) return undefined;

    // If no logs exist, start from Day 1 (lowest order)
    if (!lastWorkout || sortedLogs.length === 0) {
      return sortedWorkouts[0]; // First workout by order
    }

    // Try to find the next workout (last_order + 1)
    const next = workouts.find((w) => w.order === lastWorkout.order + 1);

    // If no next workout exists (completed program), wrap back to Day 1
    if (!next) {
      return sortedWorkouts[0];
    }

    return next;
  }, [lastWorkout, workouts, sortedLogs, sortedWorkouts]);

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

  const sortedWorkouts = useMemo(() => {
    return workouts?.sort((a, b) => a.order - b.order) ?? [];
  }, [workouts]);

  const completedWorkouts = useMemo(() => {
    return sortedWorkouts?.filter((w) =>
      sortedLogs.some(
        (l) => workoutExercises[l.workout_exercise_id]?.workout_id === w.id
      )
    );
  }, [sortedLogs, workoutExercises]);

  const incompleteWorkouts = useMemo(() => {
    return sortedWorkouts?.filter(
      (w) =>
        !sortedLogs.some(
          (l) => workoutExercises[l.workout_exercise_id]?.workout_id === w.id
        )
    );
  }, [completedWorkouts, sortedWorkouts]);

  function WorkoutRow(workout: Workout) {
    const lastLog = sortedLogs.find(
      (e) => workoutExercises[e.workout_exercise_id]?.workout_id === workout.id
    );
    return (
      <Row
        key={workout.id}
        onPress={() => goToWorkout(workout)}
        icon="chevrons-right"
      >
        <View>
          <Text className="text-lg">{`Day ${workout.order} - ${workout.name}`}</Text>
          <Text className="text-xs">
            Last completed:{" "}
            {lastLog
              ? new Date(lastLog.created_at!).toLocaleDateString()
              : "Never"}
          </Text>
        </View>
      </Row>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 flex-col">
      {isLoading ? (
        <View className="flex-col flex-1 align-center justify-center">
          <ActivityIndicator size="large" color={colors.blue[400]} />
        </View>
      ) : (
        <>
          {nextWorkout && (
            <View className="pb-4 bg-slate-50 pt-4 px-4 border-b-slate-300 border-b-2 drop-shadow-2xl">
              <SafeAreaView>
                <Text className="text-slate-500 text-2xl mb-2">
                  Next Workout
                </Text>
              </SafeAreaView>
              <Text className="text-slate-900 font-semibold text-lg mb-8">
                {nextWorkout?.name} (Day {nextWorkout?.order}, Meso Cycle{" "}
                {nextWorkout?.meso_cycle})
              </Text>
              <Button
                title="Start Workout"
                onPress={() => goToWorkout(nextWorkout)}
              />
            </View>
          )}
          <ScrollView className="flex-1 pb-4 bg-slate-200 px-4 pt-2">
            {sortedWorkouts?.length === 0 && (
              <Text className="text-xl">No workouts found.</Text>
            )}
            <Text className="text-lg font-semibold">Upcoming workouts</Text>
            {incompleteWorkouts?.length > 0 &&
              incompleteWorkouts.map((workout) => (
                <WorkoutRow key={workout.id} {...workout} />
              ))}
            <Text className="text-lg font-semibold pt-4 border-t-slate-500 border-t-2">
              Completed workouts
            </Text>
            {completedWorkouts?.length > 0 &&
              completedWorkouts.map((workout) => (
                <WorkoutRow key={workout.id} {...workout} />
              ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
