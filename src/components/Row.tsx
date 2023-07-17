import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props extends TouchableOpacityProps {
  icon?: keyof typeof Feather.glyphMap;
}

export default function Row({ children, icon, ...props }: Props) {
  return (
    <View className="border-b-2 border-slate-200">
      <TouchableOpacity
        className="flex-row py-4 pr-2 justify-between items-center"
        {...props}
      >
        {children}
        {icon && <Feather name={icon} size={24} color="black" />}
      </TouchableOpacity>
    </View>
  );
}
