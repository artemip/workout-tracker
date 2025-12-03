import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "tailwindcss/colors";
import useSWR from "swr";
import { Urls } from "../api/urls";
import { ExerciseLog, Workout } from "../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackParams } from "../../App";
import Row from "../components/Row";
import { useWorkoutExercises } from "../context/WorkoutExerciseContext";
import Button from "../components/Button";
import { Feather } from "@expo/vector-icons";

type Props = NativeStackScreenProps<StackParams, "Home">;

export default function Home({ navigation }: Props) {
  const [showCompleted, setShowCompleted] = useState(false);

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

  const sortedWorkouts = useMemo(() => {
    return workouts?.sort((a, b) => a.order - b.order) ?? [];
  }, [workouts]);

  const totalWorkouts = sortedWorkouts.length;

  const lastWorkout = workouts?.find(
    (w) =>
      w.id === workoutExercises[sortedLogs[0]?.workout_exercise_id]?.workout_id
  );

  const nextWorkout = useMemo(() => {
    if (!workouts || workouts.length === 0) return undefined;

    if (!lastWorkout || sortedLogs.length === 0) {
      return sortedWorkouts[0];
    }

    const next = workouts.find((w) => w.order === lastWorkout.order + 1);

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

  const completedWorkouts = useMemo(() => {
    return sortedWorkouts?.filter((w) =>
      sortedLogs.some(
        (l) => workoutExercises[l.workout_exercise_id]?.workout_id === w.id
      )
    );
  }, [sortedLogs, workoutExercises, sortedWorkouts]);

  const incompleteWorkouts = useMemo(() => {
    return sortedWorkouts?.filter(
      (w) =>
        !sortedLogs.some(
          (l) => workoutExercises[l.workout_exercise_id]?.workout_id === w.id
        )
    );
  }, [sortedLogs, sortedWorkouts, workoutExercises]);

  // Calculate progress
  const progressPercent =
    totalWorkouts > 0
      ? Math.round((completedWorkouts.length / totalWorkouts) * 100)
      : 0;

  function getLastCompletedDate(workout: Workout): string | null {
    const lastLog = sortedLogs.find(
      (e) => workoutExercises[e.workout_exercise_id]?.workout_id === workout.id
    );
    return lastLog ? new Date(lastLog.created_at!).toLocaleDateString() : null;
  }

  function UpcomingWorkoutRow({ workout }: { workout: Workout }) {
    return (
      <Row
        key={workout.id}
        onPress={() => goToWorkout(workout)}
        icon="chevron-right"
      >
        <Text className="text-base text-gray-900">
          Day {workout.order} · {workout.name}
        </Text>
      </Row>
    );
  }

  function CompletedWorkoutRow({ workout }: { workout: Workout }) {
    const date = getLastCompletedDate(workout);
    return (
      <Row key={workout.id} onPress={() => goToWorkout(workout)} completed>
        <View className="flex-row flex-1 justify-between items-center">
          <Text className="text-base text-gray-500">
            Day {workout.order} · {workout.name}
          </Text>
          {date && <Text className="text-sm text-gray-400">{date}</Text>}
        </View>
      </Row>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.blue[500]} />
        </View>
      ) : (
        <>
          {/* Next Workout Hero */}
          {nextWorkout && (
            <SafeAreaView className="bg-white border-b border-gray-200">
              <View className="px-4 pt-4 pb-6">
                <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  Next Workout
                </Text>
                <Text className="text-2xl font-semibold text-gray-900 mb-1">
                  {nextWorkout.name}
                </Text>
                <Text className="text-base text-gray-500 mb-6">
                  Day {nextWorkout.order} of {totalWorkouts} · Meso Cycle{" "}
                  {nextWorkout.meso_cycle}
                </Text>

                {/* Progress bar */}
                <View className="mb-6">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-500">
                      Program Progress
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {progressPercent}%
                    </Text>
                  </View>
                  <View className="h-1 bg-gray-200">
                    <View
                      className="h-1 bg-blue-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </View>
                </View>

                <Button
                  title="Start Workout"
                  onPress={() => goToWorkout(nextWorkout)}
                />
              </View>
            </SafeAreaView>
          )}

          <ScrollView className="flex-1 bg-surface">
            {/* Upcoming Workouts */}
            <View className="px-4 pt-4">
              <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Upcoming
              </Text>
            </View>
            <View className="bg-white px-4">
              {incompleteWorkouts.length === 0 ? (
                <Text className="py-4 text-gray-500">
                  All workouts completed!
                </Text>
              ) : (
                incompleteWorkouts.map((workout) => (
                  <UpcomingWorkoutRow key={workout.id} workout={workout} />
                ))
              )}
            </View>

            {/* Completed Workouts - Collapsible */}
            {completedWorkouts.length > 0 && (
              <>
                <TouchableOpacity
                  className="px-4 pt-6 pb-2 flex-row items-center justify-between"
                  onPress={() => setShowCompleted(!showCompleted)}
                  activeOpacity={0.6}
                >
                  <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Completed ({completedWorkouts.length})
                  </Text>
                  <Feather
                    name={showCompleted ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
                {showCompleted && (
                  <View className="bg-white px-4">
                    {completedWorkouts.map((workout) => (
                      <CompletedWorkoutRow key={workout.id} workout={workout} />
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Bottom spacing */}
            <View className="h-8" />
          </ScrollView>
        </>
      )}
    </View>
  );
}
