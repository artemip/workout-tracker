export default {
  expo: {
    name: "Artem's Workout Tracker",
    slug: "workout-tracker",
    owner: "artemp",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.artemp.workouttracker",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      package: "com.artemp.workouttracker",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "6790c0cb-f41f-47a7-990c-56f27c1e2672",
      },
      apiUrl: "rsagdlcddicrwlmjwrpw.supabase.co",
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYWdkbGNkZGljcndsbWp3cnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjY2MTMsImV4cCI6MjA4MDMwMjYxM30.8CQs-brmgGRNt50bOVwVU-9jpHuSav16TU_p3RlgOFQ",
    },
  },
};
