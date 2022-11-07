import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import { SWRConfig } from "swr";
import axios from "axios";
import { SUPABASE_API_KEY } from "@env";

const Stack = createNativeStackNavigator();

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
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SWRConfig>
  );
}
