import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import { SWRConfig } from "swr";
import axios from "axios";
import { SUPABASE_API_KEY } from "@env";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import { Workout, WorkoutExercise } from "./src/types/types";
import { ExerciseProvider } from "./src/context/ExerciseContext";
import WorkoutExerciseScreen from "./src/screens/WorkoutExerciseScreen";

export type StackParams = {
  Home: undefined;
  Workout: { workout: Workout };
  WorkoutExercise: { workoutExercise: WorkoutExercise };
};

const Stack = createNativeStackNavigator<StackParams>();

export default function App() {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) =>
          axios
            .get(url, {
              headers: {
                Authorization: `Bearer ${SUPABASE_API_KEY}`,
                apikey: `${SUPABASE_API_KEY}`,
                "Content-Type": "application/json",
              },
            })
            .then((res) => res.data),
      }}
    >
      <ExerciseProvider value={{}}>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
            <Stack.Screen
              name="WorkoutExercise"
              component={WorkoutExerciseScreen}
            />
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </ExerciseProvider>
    </SWRConfig>
  );
}
