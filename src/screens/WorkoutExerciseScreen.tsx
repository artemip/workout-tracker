import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState, useRef } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { StackParams } from "../../App";
import Timer from "../components/Timer";
import { useExercises } from "../context/ExerciseContext";
import Button from "../components/Button";
import Modal from "../components/Modal";
import SetIndicator from "../components/SetIndicator";
import PlateMathButton from "../components/PlateMath";
import {
  CurrentExerciseProgress,
  saveWorkoutProgress,
  loadWorkoutProgress,
} from "../utils/workoutStorage";

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
  onSkip: () => void;
}

function EditSetModal({ set, onEdit, onClose, onSkip }: EditSetProps) {
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.repsCompleted.toString());

  function onSave() {
    onEdit({
      ...set,
      weight: parseInt(weight) || set.weight,
      repsCompleted: parseInt(reps) || set.repsCompleted,
    });
  }

  return (
    <Modal
      title={`Edit Set ${set.num}`}
      buttonText="Save"
      onClose={onClose}
      onConfirm={onSave}
      isVisible
    >
      <View className="space-y-6">
        <View>
          <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Weight
          </Text>
          <TextInput
            value={weight}
            keyboardType="number-pad"
            className="border-b-2 border-gray-300 py-3 text-2xl text-gray-900 focus:border-blue-500"
            onChangeText={setWeight}
            selectTextOnFocus
          />
        </View>
        <View>
          <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Reps
          </Text>
          <TextInput
            value={reps}
            keyboardType="number-pad"
            className="border-b-2 border-gray-300 py-3 text-2xl text-gray-900 focus:border-blue-500"
            onChangeText={setReps}
            selectTextOnFocus
          />
        </View>
        <TouchableOpacity onPress={onSkip} className="py-2">
          <Text className="text-center text-gray-500">Skip this set</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function WorkoutExerciseScreen({ route, navigation }: Props) {
  const { workoutExercise, completedExercise, savedProgress } = route.params;

  const exercises = useExercises();
  const exercise = exercises[workoutExercise.exercise_id];
  const hasInitialized = useRef(false);

  // Initialize state from savedProgress > completedExercise > fresh start
  const initialSets =
    savedProgress?.sets ??
    completedExercise?.sets ??
    Array.from({ length: workoutExercise.num_sets }, (_, i) => i + 1).map(
      (num) => ({
        num,
        weight: workoutExercise.weight,
        isDropSet:
          num === workoutExercise.num_sets && workoutExercise.end_with_drop_set,
        repsCompleted: workoutExercise.num_reps_per_set,
      })
    );

  const initialSet =
    savedProgress?.currentSet ??
    (completedExercise ? completedExercise.sets.length + 1 : 1);

  const initialRestTimerReset = savedProgress?.restTimerReset ?? 0;

  const [currentSet, setCurrentSet] = useState(initialSet);
  const [restTimerReset, setRestTimerReset] = useState(initialRestTimerReset);
  const [editedSetIdx, setEditedSetIdx] = useState<number>(-1);
  const [sets, setSets] = useState<ExerciseSet[]>(initialSets);

  const currentSetData = sets[currentSet - 1];
  const completedSetsCount = currentSet - 1;
  const isComplete = currentSet > workoutExercise.num_sets;

  // Save current exercise state to AsyncStorage whenever it changes
  useEffect(() => {
    // Skip first render to avoid overwriting on mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    async function saveCurrentExercise() {
      const existingProgress = await loadWorkoutProgress();
      if (!existingProgress) return;

      const currentExercise: CurrentExerciseProgress = {
        workoutExerciseId: workoutExercise.id,
        exerciseId: exercise?.id ?? 0,
        currentSet,
        sets,
        restTimerReset,
      };

      await saveWorkoutProgress({
        ...existingProgress,
        currentExercise,
      });
    }

    saveCurrentExercise();
  }, [currentSet, sets, restTimerReset, workoutExercise.id, exercise?.id]);

  function completeSet() {
    setCurrentSet((set) => set + 1);

    if (currentSet < workoutExercise.num_sets) {
      setRestTimerReset((reset) => reset + 1);
    } else {
      setRestTimerReset(0);
    }
  }

  async function completeExercise() {
    // Clear current exercise from storage since it's now completed
    const existingProgress = await loadWorkoutProgress();
    if (existingProgress) {
      await saveWorkoutProgress({
        ...existingProgress,
        currentExercise: undefined,
      });
    }

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

  function onSkipSet() {
    if (editedSetIdx > -1) {
      const set = sets[editedSetIdx];
      onEditSet({ ...set, weight: 0, repsCompleted: 0 });
    }
  }

  function closeEditSet() {
    setEditedSetIdx(-1);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4">
        {/* Header - Exercise name and target */}
        <View className="border-b border-gray-200 py-4">
          <Text className="text-2xl font-semibold text-gray-900">
            {exercise?.name ?? "Unknown Exercise"}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {workoutExercise.num_sets} sets · {workoutExercise.num_reps_per_set}{" "}
            reps ·{" "}
            {workoutExercise.weight > 0
              ? `${workoutExercise.weight} lbs`
              : "Bodyweight"}
          </Text>
        </View>

        {/* Timer - only shows when active */}
        <Timer
          key={restTimerReset}
          timeSeconds={
            restTimerReset > 0 ? workoutExercise.rest_time_seconds : 0
          }
        />

        {/* Main content - Set display */}
        <View className="flex-1 justify-center items-center">
          {isComplete ? (
            <View className="items-center">
              <Text className="text-sm font-semibold uppercase tracking-wide text-emerald-600 mb-2">
                Complete
              </Text>
              <Text className="text-5xl font-bold text-gray-900">
                All sets done
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setEditedSetIdx(currentSet - 1)}
              activeOpacity={0.7}
              className="items-center"
            >
              <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Set {currentSet} of {workoutExercise.num_sets}
              </Text>
              <Text className="text-5xl font-bold text-gray-900">
                {currentSetData?.isDropSet
                  ? "Drop Set"
                  : `${currentSetData?.weight} lbs`}
              </Text>
              {!currentSetData?.isDropSet && (
                <Text className="text-2xl text-gray-500 mt-2">
                  × {currentSetData?.repsCompleted} reps
                </Text>
              )}
              <Text className="text-sm text-gray-400 mt-4">Tap to edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Set indicators */}
        <View className="py-6">
          <SetIndicator
            totalSets={workoutExercise.num_sets}
            currentSet={currentSet}
            completedSets={completedSetsCount}
          />
        </View>

        {/* Actions */}
        <View className="pb-4 space-y-2">
          <View className="flex-row items-center justify-center">
            <TouchableOpacity
              onPress={goToExerciseLogs}
              className="py-3 px-4"
              activeOpacity={0.6}
            >
              <Text className="text-base text-gray-500">View History</Text>
            </TouchableOpacity>
            {exercise?.type?.toLowerCase() === "barbell" &&
              currentSetData?.weight > 0 && (
                <>
                  <Text className="text-gray-300">|</Text>
                  <View className="px-4">
                    <PlateMathButton weight={currentSetData.weight} />
                  </View>
                </>
              )}
          </View>
          {isComplete ? (
            <Button
              title="Complete Exercise"
              onPress={completeExercise}
              variant="success"
            />
          ) : (
            <Button title="Complete Set" onPress={completeSet} />
          )}
        </View>
      </View>

      {editedSetIdx > -1 && (
        <EditSetModal
          set={sets[editedSetIdx]}
          onClose={closeEditSet}
          onEdit={onEditSet}
          onSkip={onSkipSet}
        />
      )}
    </SafeAreaView>
  );
}
