import React from "react";
import { Text, View } from "react-native";
import useSWR from "swr";
import { Urls } from "../api/urls";
import { Exercise } from "../types/types";

export default function Home() {
  const { data, error } = useSWR<Exercise[]>(Urls.EXERCISES);

  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <Text>{data?.map((x) => x.name)}</Text>
    </View>
  );
}
