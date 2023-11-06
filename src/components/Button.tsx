import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  isLoading?: boolean;
}

const VARIANTS = {
  primary: {
    enabled: "bg-blue-500",
    disabled: "bg-gray-200",
    text: "text-white",
  },
  secondary: {
    enabled: "text-blue-500",
    disabled: "text-gray-200",
    text: "text-black",
  },
  success: {
    enabled: "bg-green-500",
    disabled: "bg-gray-200",
    text: "text-white",
  },
  danger: {
    enabled: "bg-red-500",
    disabled: "bg-red-200",
    text: "text-white",
  },
};

export default function Button({
  title,
  isLoading,
  disabled,
  variant = "primary",
  ...props
}: Props) {
  const color = disabled
    ? VARIANTS[variant].disabled
    : VARIANTS[variant].enabled;

  const textColor = disabled ? "text-gray-400" : VARIANTS[variant].text;

  const className = `p-3 items-center ${color}`;

  return (
    <TouchableOpacity className={className} disabled={disabled} {...props}>
      <Text className={`text-base ${textColor}`}>
        {isLoading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
}
