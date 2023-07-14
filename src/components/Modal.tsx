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
      <View className="flex-1 p-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold">{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 py-2">{children}</View>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={60}>
          <Button title={buttonText} onPress={onConfirm ?? onClose} />
          {onConfirm && (
            <>
              <View className="pb-2" />
              <Button title="Cancel" onPress={onClose} variant="secondary" />
            </>
          )}
        </KeyboardAvoidingView>
      </View>
    </ReactModal>
  );
}
