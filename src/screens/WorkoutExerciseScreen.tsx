import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, Text, View } from "react-native";
import { StackParams } from "../../App";
import Row from "../components/Row";
import { useExercises } from "../context/ExerciseContext";

type Props = NativeStackScreenProps<StackParams, "WorkoutExercise">;

interface Set {
  num: number;
  weight: number | "Drop Set";
}

export default function WorkoutExerciseScreen({ route }: Props) {
  const { workoutExercise } = route.params;

  const exercises = useExercises();
  const exercise = exercises[workoutExercise.exercise_id];

  const sets: Set[] = Array.from(
    { length: workoutExercise.num_sets },
    (_, i) => i + 1
  ).map((num) => ({
    num,
    weight:
      num === workoutExercise.num_sets && workoutExercise.end_with_drop_set
        ? "Drop Set"
        : workoutExercise.weight,
  }));

  return (
    <View className="flex-1 p-4">
      <View className="border-b-2 border-slate-500 pb-2">
        <Text className="text-2xl">{exercise?.name ?? "Unknown Exercise"}</Text>
      </View>
      <ScrollView>
        {sets.map((set) => (
          <Row key={set.num}>
            <View>
              <Text className="text-lg">
                {set.weight === "Drop Set" ? "Drop Set" : `${set.weight} lbs`}
              </Text>
            </View>
          </Row>
        ))}
      </ScrollView>
    </View>
  );
}
