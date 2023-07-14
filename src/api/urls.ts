import Constants from "expo-constants";

const API_URL = "https://" + Constants.expoConfig?.extra?.apiUrl;
export class Urls {
  static EXERCISES = API_URL + "/rest/v1/exercises";
  static WORKOUTS = API_URL + "/rest/v1/workouts";
  static WORKOUT_EXERCISES = API_URL + "/rest/v1/workout_exercises";
  static EXERCISE_LOGS = API_URL + "/rest/v1/exercise_logs";
}
