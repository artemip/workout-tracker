import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  isLoading?: boolean;
}

export default function Button({
  title,
  variant,
  isLoading,
  disabled,
  ...props
}: Props) {
  const colorWeight = disabled ? "200" : "500";
  const color =
    variant === "secondary" || variant === "danger"
      ? ""
      : variant === "success"
      ? `bg-green-${colorWeight}`
      : `bg-blue-${colorWeight}`;

  const textColor =
    variant === "secondary"
      ? "text-blue-500"
      : variant === "danger"
      ? "text-red-500"
      : "text-white";

  return (
    <TouchableOpacity
      className={`p-3 items-center ${color}`}
      disabled={disabled}
      {...props}
    >
      <Text className={`text-base ${textColor}`}>
        {isLoading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
}
