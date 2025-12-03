import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props extends TouchableOpacityProps {
  icon?: keyof typeof Feather.glyphMap;
  completed?: boolean;
  interactive?: boolean;
}

export default function Row({
  children,
  icon,
  completed,
  interactive = true,
  ...props
}: Props) {
  const iconName = completed ? "check" : icon;
  const iconColor = completed ? "#059669" : "#9CA3AF";

  const content = (
    <>
      <View className={`flex-1 ${completed ? "opacity-60" : ""}`}>
        {children}
      </View>
      {iconName && <Feather name={iconName} size={20} color={iconColor} />}
    </>
  );

  if (!interactive) {
    return (
      <View className="border-b border-gray-200">
        <View className="flex-row py-5 pr-2 justify-between items-center">
          {content}
        </View>
      </View>
    );
  }

  return (
    <View className="border-b border-gray-200">
      <TouchableOpacity
        className="flex-row py-5 pr-2 justify-between items-center"
        activeOpacity={0.6}
        {...props}
      >
        {content}
      </TouchableOpacity>
    </View>
  );
}
