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
import { useWorkoutExercises } from "../context/WorkoutExerciseContext";

type Props = NativeStackScreenProps<StackParams, "ExerciseLog">;

export default function ExerciseLogScreen({ route, navigation }: Props) {
  const { exercise } = route.params;

  const { data: exerciseLogs, error } = useSWR<ExerciseLog[]>(
    `${Urls.EXERCISE_LOGS}?exercise_id=eq.${exercise.id}`
  );

  useEffect(() => {
    error && Alert.alert("Error", error.message);
  }, [error]);

  const reverseChronologicalLogs = useMemo(() => {
    return exerciseLogs?.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    });
  }, [exerciseLogs]);

  return (
    <View className="flex-1 p-4 mb-4">
      <View className="border-b-2 border-slate-500 pb-2">
        <Text className="text-2xl">{exercise.name}</Text>
      </View>
      <ScrollView>
        {reverseChronologicalLogs?.map((log) => {
          return (
            <Row key={log.id} onPress={() => {}}>
              <View>
                <Text className="text-lg">
                  {exercise?.name ?? "Unknown Exercise"}
                </Text>
                <Text className="text-xs">
                  {log.weight_used > 0 ? `${log.weight_used} lbs` : "BW"} x{" "}
                  {log.reps_completed}
                </Text>
              </View>
              <View>
                <Text className="text-md">
                  {new Date(log.created_at!).toLocaleDateString()}
                </Text>
              </View>
            </Row>
          );
        })}
      </ScrollView>
      <Button title="Close" onPress={() => navigation.goBack()} />
    </View>
  );
}
