import {
  KeyboardAvoidingView,
  Modal as ReactModal,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import Button from "./Button";
import { Feather } from "@expo/vector-icons";

interface Props extends ViewProps {
  isVisible: boolean;
  title: string;
  buttonText: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function Modal({
  isVisible,
  title,
  buttonText,
  onClose,
  onConfirm,
  children,
}: Props) {
  return (
    <ReactModal
      animationType="slide"
      visible={isVisible}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 p-6 bg-white">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-semibold text-gray-900">{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={8}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 space-y-6">{children}</View>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={60}>
          <Button title={buttonText} onPress={onConfirm ?? onClose} />
          {onConfirm && (
            <TouchableOpacity
              onPress={onClose}
              className="py-4 items-center"
              activeOpacity={0.6}
            >
              <Text className="text-base text-gray-500">Cancel</Text>
            </TouchableOpacity>
          )}
        </KeyboardAvoidingView>
      </View>
    </ReactModal>
  );
}
