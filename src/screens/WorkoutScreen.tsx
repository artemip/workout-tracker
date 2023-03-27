import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useContext, useEffect, useMemo } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import useSWR from "swr";
import { StackParams } from "../../App";
import { Urls } from "../api/urls";
import Row from "../components/Row";
import { useExercises } from "../context/ExerciseContext";
import { WorkoutExercise } from "../types/types";

type Props = NativeStackScreenProps<StackParams, "Workout">;

export default function WorkoutScreen({ route, navigation }: Props) {
  const { workout } = route.params;

  const exercises = useExercises();

  const { data: workoutExercises, error: errorWorkouts } = useSWR<
    WorkoutExercise[]
  >(`${Urls.WORKOUT_EXERCISES}?workout_id=eq.${workout.id}`);

  useEffect(() => {
    errorWorkouts && Alert.alert("Error", errorWorkouts.message);
  }, [errorWorkouts]);

  function goToWorkoutExercise(workoutExercise: WorkoutExercise) {
    navigation.navigate("WorkoutExercise", { workoutExercise });
  }

  const sortedByOrder = useMemo(() => {
    return workoutExercises?.sort((a, b) => {
      return a.order - b.order;
    });
  }, [workoutExercises]);

  return (
    <View className="flex-1 p-4">
      <View className="border-b-2 border-slate-500 pb-2">
        <Text className="text-2xl">{workout.name}</Text>
      </View>
      <ScrollView>
        {sortedByOrder?.map((we) => {
          const exercise = exercises[we.exercise_id];
          return (
            <Row
              key={we.id}
              onPress={() => goToWorkoutExercise(we)}
              icon="chevrons-right"
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
    </View>
  );
}
