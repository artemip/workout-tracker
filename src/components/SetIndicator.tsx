import { View } from "react-native";

interface Props {
  totalSets: number;
  currentSet: number; // 1-indexed, the set being worked on
  completedSets: number; // number of sets already done
}

export default function SetIndicator({
  totalSets,
  currentSet,
  completedSets,
}: Props) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: totalSets }, (_, i) => {
        const setNumber = i + 1;
        const isCompleted = setNumber <= completedSets;
        const isCurrent = setNumber === currentSet;

        let style = "bg-gray-200"; // pending
        if (isCompleted) {
          style = "bg-emerald-600"; // completed
        } else if (isCurrent) {
          style = "bg-blue-500"; // current
        }

        return <View key={i} className={`w-3 h-3 ${style}`} />;
      })}
    </View>
  );
}
