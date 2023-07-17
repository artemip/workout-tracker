import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  isLoading?: boolean;
}

const VARIANTS = {
  primary: {
    enabled: "bg-sky-500",
    disabled: "bg-sky-200",
    text: "text-white",
  },
  secondary: {
    enabled: "text-sky-500",
    disabled: "text-sky-200",
    text: "",
  },
  success: {
    enabled: "bg-teal-500",
    disabled: "bg-teal-200",
    text: "text-white",
  },
  danger: {
    enabled: "bg-rose-500",
    disabled: "bg-rose-200",
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

  const textColor = VARIANTS[variant].text;

  const className = `p-3 items-center ${color}`;

  return (
    <TouchableOpacity className={className} disabled={disabled} {...props}>
      <Text className={`text-base ${textColor}`}>
        {isLoading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
}
