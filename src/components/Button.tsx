import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  isLoading?: boolean;
}

const VARIANTS = {
  primary: {
    base: "bg-blue-500",
    text: "text-white",
  },
  secondary: {
    base: "bg-transparent border border-gray-300",
    text: "text-gray-700",
  },
  success: {
    base: "bg-emerald-600",
    text: "text-white",
  },
  danger: {
    base: "bg-red-600",
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
  const variantStyle = VARIANTS[variant];
  const opacity = disabled ? "opacity-40" : "";

  return (
    <TouchableOpacity
      className={`py-3 px-4 items-center ${variantStyle.base} ${opacity}`}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Text className={`text-base font-medium ${variantStyle.text}`}>
        {isLoading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
}
