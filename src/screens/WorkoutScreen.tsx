import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, Text, View, SafeAreaView } from "react-native";
import useSWR, { mutate } from "swr";
import { StackParams } from "../../App";
import { Urls } from "../api/urls";
import Row from "../components/Row";
import { useExercises } from "../context/ExerciseContext";
import { ExerciseLog, WorkoutExercise } from "../types/types";
import Button from "../components/Button";
import { ExerciseSet } from "./WorkoutExerciseScreen";
import { request } from "../api/request-handler";
import {
  saveWorkoutProgress,
  loadWorkoutProgress,
  clearWorkoutProgress,
  WorkoutProgress,
  CurrentExerciseProgress,
} from "../utils/workoutStorage";
import { useWatchConnectivity } from "../hooks/useWatchConnectivity";

type Props = NativeStackScreenProps<StackParams, "Workout">;

export interface CompletedWorkoutExercise {
  id: number;
  exerciseId: number;
  sets: ExerciseSet[];
}

// Track if we've shown the resume prompt this session (persists across re-renders)
let hasShownResumePrompt = false;

export default function WorkoutScreen({ route, navigation }: Props) {
  const [completedWorkoutExercises, setCompletedWorkoutExercises] = useState<
    CompletedWorkoutExercise[]
  >([]);
  const [currentExerciseProgress, setCurrentExerciseProgress] = useState<
    CurrentExerciseProgress | undefined
  >(undefined);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { workout, completedExercise } = route.params;

  const exercises = useExercises();

  // Watch connectivity for workout lifecycle
  const { notifyWorkoutStarted, notifyWorkoutEnded } = useWatchConnectivity();

  const { data: workoutExercises, error: errorWorkouts } = useSWR<
    WorkoutExercise[]
  >(`${Urls.WORKOUT_EXERCISES}?workout_id=eq.${workout.id}`);

  useEffect(() => {
    errorWorkouts && Alert.alert("Error", errorWorkouts.message);
  }, [errorWorkouts]);

  // Load saved progress on initial mount only
  useEffect(() => {
    async function initializeProgress() {
      const savedProgress = await loadWorkoutProgress();

      if (
        savedProgress &&
        savedProgress.workoutId === workout.id &&
        !hasShownResumePrompt
      ) {
        const hasCompletedExercises =
          savedProgress.completedExercises.length > 0;
        const hasCurrentExercise = !!savedProgress.currentExercise;

        if (hasCompletedExercises || hasCurrentExercise) {
          hasShownResumePrompt = true;
          Alert.alert(
            "Resume Workout?",
            `You have progress saved from a previous session. Would you like to continue?`,
            [
              {
                text: "Start Fresh",
                style: "destructive",
                onPress: async () => {
                  await clearWorkoutProgress();
                  // Also initialize fresh storage for this workout
                  await saveWorkoutProgress({
                    workoutId: workout.id,
                    completedExercises: [],
                    startedAt: new Date().toISOString(),
                  });
                  setIsInitialized(true);
                },
              },
              {
                text: "Resume",
                onPress: () => {
                  setCompletedWorkoutExercises(
                    savedProgress.completedExercises
                  );
                  setCurrentExerciseProgress(savedProgress.currentExercise);
                  setIsInitialized(true);
                },
              },
            ]
          );
          return;
        }
      }

      // No saved progress or different workout - initialize fresh
      if (!savedProgress || savedProgress.workoutId !== workout.id) {
        await saveWorkoutProgress({
          workoutId: workout.id,
          completedExercises: [],
          startedAt: new Date().toISOString(),
        });
      }
      setIsInitialized(true);
    }

    initializeProgress();
  }, [workout.id]);

  // Notify Watch when workout starts
  useEffect(() => {
    if (isInitialized) {
      notifyWorkoutStarted({
        exerciseName: workout.name,
        currentSet: 1,
        totalSets: 1,
        weight: 0,
        targetReps: 0,
        restTimeSeconds: 0,
      });
    }
  }, [isInitialized, workout.name, notifyWorkoutStarted]);

  // Reload current exercise progress when screen gains focus (coming back from exercise)
  useFocusEffect(
    useCallback(() => {
      if (!isInitialized) return;

      async function reloadCurrentExercise() {
        const savedProgress = await loadWorkoutProgress();
        if (savedProgress && savedProgress.workoutId === workout.id) {
          setCurrentExerciseProgress(savedProgress.currentExercise);
        }
      }
      reloadCurrentExercise();
    }, [workout.id, isInitialized])
  );

  // Handle completed exercise coming back from WorkoutExerciseScreen
  useEffect(() => {
    if (completedExercise) {
      setCompletedWorkoutExercises((prev) => {
        const existing = prev.findIndex((x) => x.id === completedExercise.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = completedExercise;
          return updated;
        }
        return [...prev, completedExercise];
      });
      // Clear current exercise progress since it's now completed
      setCurrentExerciseProgress(undefined);
    }
  }, [completedExercise]);

  // Save completed exercises whenever they change
  useEffect(() => {
    if (!isInitialized) return;

    async function saveCompletedExercises() {
      const existingProgress = await loadWorkoutProgress();
      if (existingProgress && existingProgress.workoutId === workout.id) {
        await saveWorkoutProgress({
          ...existingProgress,
          completedExercises: completedWorkoutExercises,
        });
      }
    }
    saveCompletedExercises();
  }, [completedWorkoutExercises, workout.id, isInitialized]);

  async function goToWorkoutExercise(workoutExercise: WorkoutExercise) {
    // Load latest progress from storage
    const savedProgress = await loadWorkoutProgress();
    const currentExercise =
      savedProgress?.currentExercise?.workoutExerciseId === workoutExercise.id
        ? savedProgress.currentExercise
        : undefined;

    // Check if already completed
    const completed = completedWorkoutExercises.find(
      (x) => x.id === workoutExercise.id
    );

    navigation.navigate("WorkoutExercise", {
      workoutExercise: { ...workoutExercise, workout },
      completedExercise: completed,
      savedProgress: currentExercise,
    });
  }

  async function saveWorkout() {
    setIsSavingWorkout(true);

    try {
      await request<ExerciseLog[], ExerciseLog[]>(
        Urls.EXERCISE_LOGS,
        "POST",
        completedWorkoutExercises
          .map((we) => {
            return we.sets.map((set) => ({
              set_number: set.num,
              reps_completed: set.repsCompleted,
              weight_used: set.weight,
              workout_exercise_id: we.id,
              exercise_id: we.exerciseId,
            }));
          })
          .flat()
      );

      mutate(Urls.EXERCISE_LOGS);

      // Clear saved progress after successful save
      await clearWorkoutProgress();
      // Reset the prompt flag so next workout can show it
      hasShownResumePrompt = false;

      // Notify Watch that workout is complete
      notifyWorkoutEnded();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSavingWorkout(false);
      Alert.alert(
        "Success",
        `Saved workout ${workout.name} on ${new Date().toLocaleDateString()}.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]
      );
    }
  }

  const sortedByOrder = useMemo(() => {
    return workoutExercises?.sort((a, b) => {
      return a.order - b.order;
    });
  }, [workoutExercises]);

  const totalExercises = sortedByOrder?.length ?? 0;
  const completedCount = completedWorkoutExercises.length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-2xl font-semibold text-gray-900">
              {workout.name}
            </Text>
            {totalExercises > 0 && (
              <Text className="text-base text-gray-500">
                {completedCount} of {totalExercises}
              </Text>
            )}
          </View>
        </View>

        {/* Exercise List */}
        <ScrollView className="flex-1 px-4">
          {sortedByOrder?.length === 0 && (
            <Text className="text-base text-gray-500 py-4">
              No exercises in this workout.
            </Text>
          )}
          {sortedByOrder?.map((we) => {
            const exercise = exercises[we.exercise_id];
            const isCompleted = completedWorkoutExercises.find(
              (x) => x.id === we.id
            );
            const isInProgress =
              currentExerciseProgress?.workoutExerciseId === we.id;
            return (
              <Row
                key={we.id}
                onPress={() => goToWorkoutExercise(we)}
                icon={isCompleted ? "check" : "chevron-right"}
                completed={!!isCompleted}
              >
                <View>
                  <View className="flex-row items-center">
                    <Text
                      className={`text-base ${
                        isCompleted ? "text-gray-500" : "text-gray-900"
                      }`}
                    >
                      {exercise?.name ?? "Unknown Exercise"}
                    </Text>
                    {isInProgress && !isCompleted && (
                      <View className="ml-2 bg-blue-100 px-2 py-0.5 rounded">
                        <Text className="text-xs text-blue-700">
                          In Progress
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-gray-500">
                    {we.num_sets} sets · {we.num_reps_per_set} reps ·{" "}
                    {we.weight > 0 ? `${we.weight} lbs` : "Bodyweight"}
                  </Text>
                </View>
              </Row>
            );
          })}
        </ScrollView>

        {/* Save Button */}
        <View className="px-4 pb-4 pt-2 border-t border-gray-200">
          <Button
            title={
              completedCount > 0
                ? `Save Workout (${completedCount})`
                : "Save Workout"
            }
            onPress={saveWorkout}
            variant="success"
            isLoading={isSavingWorkout}
            disabled={completedCount === 0}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
