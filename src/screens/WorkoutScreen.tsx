import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
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

type Props = NativeStackScreenProps<StackParams, "Workout">;

export interface CompletedWorkoutExercise {
  id: number;
  exerciseId: number;
  sets: ExerciseSet[];
}

export default function WorkoutScreen({ route, navigation }: Props) {
  const [completedWorkoutExercises, setCompletedWorkoutExercises] = useState<
    CompletedWorkoutExercise[]
  >([]);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  const { workout, completedExercise } = route.params;

  const exercises = useExercises();

  const { data: workoutExercises, error: errorWorkouts } = useSWR<
    WorkoutExercise[]
  >(`${Urls.WORKOUT_EXERCISES}?workout_id=eq.${workout.id}`);

  useEffect(() => {
    errorWorkouts && Alert.alert("Error", errorWorkouts.message);
  }, [errorWorkouts]);

  useEffect(() => {
    if (completedExercise) {
      setCompletedWorkoutExercises((prev) => {
        return [...prev, completedExercise];
      });
    }
  }, [completedExercise]);

  function goToWorkoutExercise(workoutExercise: WorkoutExercise) {
    navigation.navigate("WorkoutExercise", {
      workoutExercise: { ...workoutExercise, workout },
      completedExercise: completedWorkoutExercises
        .reverse()
        .find((x) => x.id === workoutExercise.id),
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
            return (
              <Row
                key={we.id}
                onPress={() => goToWorkoutExercise(we)}
                icon={isCompleted ? "check" : "chevron-right"}
                completed={!!isCompleted}
              >
                <View>
                  <Text
                    className={`text-base ${
                      isCompleted ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {exercise?.name ?? "Unknown Exercise"}
                  </Text>
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
