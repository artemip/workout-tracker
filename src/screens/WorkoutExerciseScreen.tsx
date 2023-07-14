import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { StackParams } from "../../App";
import Row from "../components/Row";
import Timer from "../components/Timer";
import { useExercises } from "../context/ExerciseContext";
import Button from "../components/Button";
import Modal from "../components/Modal";

type Props = NativeStackScreenProps<StackParams, "WorkoutExercise">;

export interface ExerciseSet {
  num: number;
  weight: number;
  isDropSet: boolean;
  repsCompleted: number;
}

interface EditSetProps {
  set: ExerciseSet;
  onEdit: (set: ExerciseSet) => void;
  onClose: () => void;
}

function EditSetModal({ set, onEdit, onClose }: EditSetProps) {
  const [editedSet, setEditedSet] = useState<ExerciseSet>({ ...set });

  function updateWeight(newWeight: number) {
    setEditedSet((prev) => ({ ...prev, weight: newWeight }));
  }

  function updateNumRepsCompleted(newNumRepsCompleted: number) {
    setEditedSet((prev) => ({ ...prev, repsCompleted: newNumRepsCompleted }));
  }

  function onEditSet() {
    onEdit(editedSet);
  }

  function skipSet() {
    onEdit({ ...set, weight: 0 });
  }

  return (
    <Modal
      title={`Edit Set ${set.num}`}
      buttonText="Edit"
      onClose={onClose}
      onConfirm={onEditSet}
      isVisible
    >
      <Text className="text-lg mt-4">Updated Weight</Text>
      <TextInput
        placeholder={`${set.weight.toString()} lbs`}
        keyboardType="number-pad"
        className="border-b-2 py-2 border-gray-400 text-3xl mb-4"
        onChangeText={(text) => updateWeight(parseInt(text))}
      />
      <Text className="text-lg mt-4">Reps Completed</Text>
      <TextInput
        placeholder={`${set.repsCompleted.toString()}`}
        keyboardType="number-pad"
        className="border-b-2 py-2 border-gray-400 text-3xl mb-4"
        onChangeText={(text) => updateNumRepsCompleted(parseInt(text))}
      />
      <Button title="Skip Set" onPress={skipSet} variant="danger" />
    </Modal>
  );
}

export default function WorkoutExerciseScreen({ route, navigation }: Props) {
  const { workoutExercise, completedExercise } = route.params;

  const [currentSet, setCurrentSet] = useState(
    completedExercise ? completedExercise.sets.length + 1 : 1
  );
  const [restTimerReset, setRestTimerReset] = useState(0);
  const [editedSetIdx, setEditedSetIdx] = useState<number>(-1);

  const exercises = useExercises();
  const exercise = exercises[workoutExercise.exercise_id];

  const [sets, setSets] = useState<ExerciseSet[]>(
    completedExercise
      ? completedExercise.sets
      : Array.from({ length: workoutExercise.num_sets }, (_, i) => i + 1).map(
          (num) => ({
            num,
            weight: workoutExercise.weight,
            isDropSet:
              num === workoutExercise.num_sets &&
              workoutExercise.end_with_drop_set,
            repsCompleted: workoutExercise.num_reps_per_set,
          })
        )
  );

  function completeSet() {
    setCurrentSet((set) => set + 1);

    if (currentSet < workoutExercise.num_sets) {
      setRestTimerReset((reset) => reset + 1);
    } else {
      setRestTimerReset(0);
    }
  }

  function completeExercise() {
    return navigation.navigate("Workout", {
      workout: workoutExercise.workout,
      completedExercise: {
        id: workoutExercise.id,
        exerciseId: exercise.id,
        sets: sets,
      },
    });
  }

  function goToExerciseLogs() {
    navigation.navigate("ExerciseLog", { exercise: exercise });
  }

  function onEditSet(set: ExerciseSet) {
    setSets((sets) => {
      const newSets = [...sets];

      const idx = newSets.findIndex((s) => s.num === set.num);
      newSets[idx] = set;

      return newSets;
    });

    closeEditSet();
  }

  function closeEditSet() {
    setEditedSetIdx(-1);
  }

  const isComplete = currentSet > workoutExercise.num_sets;

  return (
    <View className="flex-1 p-4 mb-8">
      <View className="border-b-2 border-slate-300 pb-2">
        <Text className="text-2xl">
          {exercise?.name ?? "Unknown Exercise"}{" "}
          <Text className="text-sm">
            {`(${workoutExercise.num_sets} Sets x ${workoutExercise.num_reps_per_set} Reps)`}
          </Text>
        </Text>
      </View>
      <View className="flex-1 border-b-2 border-slate-300 pb-2">
        <Timer
          key={restTimerReset}
          timeSeconds={
            restTimerReset > 0 ? workoutExercise.rest_time_seconds : 0
          }
        />
      </View>
      <Text className="text-lg pt-2">Progress</Text>
      <ScrollView className="">
        {sets.map((set, idx) => {
          const isCurrentSet = set.num === currentSet;
          const skipped = set.weight === 0;
          const icon = skipped
            ? "x-circle"
            : set.num < currentSet
            ? "check-circle"
            : "circle";
          return (
            <Row key={set.num} icon={icon} onPress={() => setEditedSetIdx(idx)}>
              <View className="flex-row items-baseline">
                {skipped ? (
                  <Text className="text-lg text-gray-500">Skipped</Text>
                ) : (
                  <>
                    <Text
                      className={`text-lg ${isCurrentSet ? "font-bold" : ""}`}
                    >
                      {set.isDropSet
                        ? "Drop Set"
                        : `${set.weight} lbs x ${set.repsCompleted}`}
                    </Text>
                    <Text className="text-sm text-gray-500 ml-2">
                      {workoutExercise.weight !== set.weight
                        ? `(${workoutExercise.weight} lbs x ${workoutExercise.num_reps_per_set})`
                        : ""}
                    </Text>
                  </>
                )}
              </View>
            </Row>
          );
        })}
      </ScrollView>
      <Button
        title="View Logs"
        variant="secondary"
        onPress={goToExerciseLogs}
      />
      <View className="mb-2" />
      {isComplete ? (
        <Button
          title="Complete Exercise"
          onPress={completeExercise}
          variant="success"
        />
      ) : (
        <Button title={`Complete Set ${currentSet}`} onPress={completeSet} />
      )}
      {editedSetIdx > -1 ? (
        <EditSetModal
          set={sets[editedSetIdx]}
          onClose={closeEditSet}
          onEdit={onEditSet}
        />
      ) : undefined}
    </View>
  );
}
