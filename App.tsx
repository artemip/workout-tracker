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

export default function App() {
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
