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
      {nextWorkout && (
        <View className="pb-4 bg-slate-100 pt-10 px-4">
          <Text className="text-slate-500 text-2xl mb-2">Next Workout</Text>
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
      <ScrollView className="flex-1 mt- bg-slate-200 px-4 pt-2 border-t-slate-300 border-t-2">
        {isLoading && (
          <ActivityIndicator size="large" color={colors.blue[400]} />
        )}
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
    </View>
  );
}
