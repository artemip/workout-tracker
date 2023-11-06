import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import useSWR, { mutate } from "swr";
import { StackParams } from "../../App";
import { Urls } from "../api/urls";
import Row from "../components/Row";
import { useExercises } from "../context/ExerciseContext";
import { ExerciseLog, Workout, WorkoutExercise } from "../types/types";
import Button from "../components/Button";
import { ExerciseSet } from "./WorkoutExerciseScreen";
import { request } from "../api/request-handler";
import useWarnOnNavigation from "../hooks/useWarnOnNavigation";

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
      const result = await request<ExerciseLog[], ExerciseLog[]>(
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

  return (
    <View className="flex-1 p-4 mb-4">
      <View className="border-b-2 border-slate-500 pb-2">
        <Text className="text-2xl">{workout.name}</Text>
      </View>
      <ScrollView>
        {sortedByOrder?.map((we) => {
          const exercise = exercises[we.exercise_id];
          const isCompleted = completedWorkoutExercises.find(
            (x) => x.id === we.id
          );
          return (
            <Row
              key={we.id}
              onPress={() => goToWorkoutExercise(we)}
              icon={isCompleted ? "check-circle" : "chevrons-right"}
            >
              <View>
                <Text className="text-lg">
                  {exercise?.name ?? "Unknown Exercise"}
                </Text>
                <Text className="text-xs">
                  {we.weight > 0 ? `${we.weight} lbs` : "BW"} x {we.num_sets} x{" "}
                  {we.num_reps_per_set}
                </Text>
              </View>
            </Row>
          );
        })}
      </ScrollView>
      <Button
        title="Save Workout"
        onPress={saveWorkout}
        variant="success"
        isLoading={isSavingWorkout}
        disabled={completedWorkoutExercises.length === 0}
      />
    </View>
  );
}
