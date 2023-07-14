export default {
  expo: {
    name: "Workout Tracker",
    slug: "workout-tracker",
    owner: "artemp",
    version: "1.0.0",
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
      bundleIdentifier: "com.artem-pasyechnyk.workout-tracker",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "6790c0cb-f41f-47a7-990c-56f27c1e2672",
      },
      apiUrl: "sdiwsniatofmjtssguiw.supabase.co",
      apiKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkaXdzbmlhdG9mbWp0c3NndWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njc2ODgzNDgsImV4cCI6MTk4MzI2NDM0OH0.Ca6zyeLxQcZBC1ymi6iHuIUaqBOHcXu-BZYWV7JYnQ4",
    },
  },
};
