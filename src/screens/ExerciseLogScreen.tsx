import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo } from "react";
import { Alert, ScrollView, Text, View, SafeAreaView } from "react-native";
import useSWR from "swr";
import { StackParams } from "../../App";
import { Urls } from "../api/urls";
import { ExerciseLog } from "../types/types";
import Button from "../components/Button";

type Props = NativeStackScreenProps<StackParams, "ExerciseLog">;

interface GroupedLogs {
  date: string;
  logs: ExerciseLog[];
}

export default function ExerciseLogScreen({ route, navigation }: Props) {
  const { exercise } = route.params;

  const { data: exerciseLogs, error } = useSWR<ExerciseLog[]>(
    `${Urls.EXERCISE_LOGS}?exercise_id=eq.${exercise.id}`
  );

  useEffect(() => {
    error && Alert.alert("Error", error.message);
  }, [error]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    if (!exerciseLogs) return [];

    const sorted = [...exerciseLogs].sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    });

    const groups: GroupedLogs[] = [];
    let currentDate = "";
    let currentGroup: ExerciseLog[] = [];

    sorted.forEach((log) => {
      const logDate = new Date(log.created_at!).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (logDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, logs: currentGroup });
        }
        currentDate = logDate;
        currentGroup = [log];
      } else {
        currentGroup.push(log);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, logs: currentGroup });
    }

    return groups;
  }, [exerciseLogs]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!exerciseLogs || exerciseLogs.length === 0) return null;

    const weights = exerciseLogs
      .filter((l) => l.weight_used > 0)
      .map((l) => l.weight_used);

    if (weights.length === 0) return null;

    const best = Math.max(...weights);
    const avg = Math.round(weights.reduce((a, b) => a + b, 0) / weights.length);

    return { best, avg };
  }, [exerciseLogs]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 px-4 py-4">
          <Text className="text-2xl font-semibold text-gray-900">
            {exercise.name}
          </Text>
          {stats && (
            <Text className="text-sm text-gray-500 mt-1">
              Best: {stats.best} lbs · Average: {stats.avg} lbs
            </Text>
          )}
        </View>

        {/* Log List */}
        <ScrollView className="flex-1">
          {groupedLogs.length === 0 ? (
            <Text className="px-4 py-8 text-gray-500 text-center">
              No history yet
            </Text>
          ) : (
            groupedLogs.map((group) => (
              <View key={group.date}>
                {/* Date Header */}
                <View className="px-4 pt-4 pb-2 bg-surface">
                  <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    {group.date}
                  </Text>
                </View>
                {/* Logs for this date */}
                <View className="px-4 bg-white">
                  {group.logs.map((log, idx) => (
                    <View
                      key={log.id}
                      className={`py-3 ${
                        idx < group.logs.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <Text className="text-base text-gray-900">
                        Set {log.set_number}:{" "}
                        {log.weight_used > 0
                          ? `${log.weight_used} lbs`
                          : "Bodyweight"}{" "}
                        × {log.reps_completed}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
          {/* Bottom spacing */}
          <View className="h-4" />
        </ScrollView>

        {/* Close Button */}
        <View className="px-4 pb-4 pt-2 border-t border-gray-200">
          <Button title="Close" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </SafeAreaView>
  );
}
