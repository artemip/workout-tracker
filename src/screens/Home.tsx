import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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

type Props = NativeStackScreenProps<StackParams, "Home">;

export default function Home({ navigation }: Props) {
  const { data: workouts, error: errorWorkouts } = useSWR<Workout[]>(
    Urls.WORKOUTS
  );

  const { data: exerciseLogs, error: errorExerciseLogs } = useSWR<
    ExerciseLog[]
  >(Urls.EXERCISE_LOGS);

  const workoutsByCycle = useMemo(() => {
    return (
      workouts?.reduce((acc, curr) => {
        const { meso_cycle } = curr;
        if (!acc[meso_cycle]) {
          acc[meso_cycle] = [];
        }
        acc[meso_cycle].push(curr);
        return acc;
      }, {} as Record<string, Workout[]>) ?? {}
    );
  }, [workouts]);

  const sortedLogs = useMemo(() => {
    return exerciseLogs?.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    });
  }, [exerciseLogs]);

  function goToWorkout(workout: Workout) {
    navigation.navigate("Workout", { workout });
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 gap-8 p-4">
      {Object.keys(workoutsByCycle).map((cycle) => {
        return (
          <View key={cycle}>
            <View className="border-b-2 border-slate-500 pb-2">
              <Text className="text-2xl">Meso Cycle {cycle}</Text>
            </View>
            {workoutsByCycle[cycle].map((workout, idx) => {
              const lastLog = sortedLogs?.find(
                (e) => e.workout_exercise.workout_id === workout.id
              );
              return (
                <Row
                  key={workout.id}
                  onPress={() => goToWorkout(workout)}
                  icon="chevrons-right"
                >
                  <View>
                    <Text className="text-lg">{`#${idx + 1} - ${
                      workout.name
                    }`}</Text>
                    <Text className="text-xs">
                      Last completed:{" "}
                      {lastLog
                        ? new Date(lastLog.created_at!).toLocaleDateString()
                        : "Never"}
                    </Text>
                  </View>
                </Row>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}
