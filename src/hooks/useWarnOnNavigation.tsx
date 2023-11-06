import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { StackParams } from "../../App";
import { Alert } from "react-native";

function useWarnOnNavigation(
  message: string,
  navigation: NativeStackNavigationProp<StackParams>,
  disabled: boolean = false
) {
  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (disabled) {
          return;
        }

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert("Are you sure?", message, [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Confirm",
            style: "destructive",
            // If the user confirmed, then we dispatch the action we blocked earlier
            // This will continue the action that had triggered the removal of the screen
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]);
      }),
    [navigation, message, disabled]
  );
}

export default useWarnOnNavigation;
