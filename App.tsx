import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import { SWRConfig } from "swr";
import WorkoutScreen, {
  CompletedWorkoutExercise,
} from "./src/screens/WorkoutScreen";
import { Exercise, Workout, WorkoutExercise } from "./src/types/types";
import { ExerciseProvider } from "./src/context/ExerciseContext";
import WorkoutExerciseScreen, {
  ExerciseSet,
} from "./src/screens/WorkoutExerciseScreen";
import { request } from "./src/api/request-handler";
import { WorkoutExerciseProvider } from "./src/context/WorkoutExerciseContext";
import ExerciseLogScreen from "./src/screens/ExerciseLogScreen";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import * as Device from "expo-device";
import { Subscription } from "expo-modules-core";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type StackParams = {
  Home: undefined;
  Workout: {
    workout: Workout;
    completedExercise?: CompletedWorkoutExercise;
  };
  WorkoutExercise: {
    workoutExercise: WorkoutExercise;
    completedExercise?: CompletedWorkoutExercise;
  };
  ExerciseLog: {
    exercise: Exercise;
  };
};

const Stack = createNativeStackNavigator<StackParams>();

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    Alert.alert("Must use physical device for Push Notifications");
  }

  return token;
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Subscription | undefined>();
  const responseListener = useRef<Subscription | undefined>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token ?? "")
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current!
      );
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, []);

  return (
    <SWRConfig
      value={{
        fetcher: (resource: string) =>
          request(resource, "GET")
            .then((res) => res.data)
            .catch((err) => console.log(err.message)),
      }}
    >
      <ExerciseProvider value={{}}>
        <WorkoutExerciseProvider value={{}}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Group>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Workout" component={WorkoutScreen} />
                <Stack.Screen
                  name="WorkoutExercise"
                  component={WorkoutExerciseScreen}
                />
                <Stack.Screen
                  name="ExerciseLog"
                  component={ExerciseLogScreen}
                />
              </Stack.Group>
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </WorkoutExerciseProvider>
      </ExerciseProvider>
    </SWRConfig>
  );
}
