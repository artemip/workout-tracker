# Package Migration Plan

> Created: Dec 3, 2025  
> Goal: Update stale packages safely with commits between each step

## Current State
- **Expo SDK**: 49.0.6 (released July 2023)
- **React Native**: 0.72.3
- **React**: 18.2.0
- **Platform**: ios (no android!!)

---

## Phase 1: Safe Patch Updates (Low Risk) ✅ DONE
These have already been applied:
- [x] axios: 1.4.0 → 1.13.2
- [x] react-native-dotenv: 3.4.9 → 3.4.11
- [x] @react-navigation/native: 6.1.7 → 6.1.18
- [x] @react-navigation/native-stack: 6.9.13 → 6.11.0
- [x] react-native-web: 0.19.7 → 0.19.13
- [x] @types/node: 20.4.8 → 20.19.25
- [x] @babel/core: 7.22.9 → 7.28.5
- [x] typescript: 5.1.6 → 5.9.3
- [x] @types/react: 18.2.18 → 18.3.27
- [x] @types/jest: 29.5.3 → 29.5.14
- [x] @types/react-test-renderer: 18.0.0 → 18.3.1
- [x] supabase CLI: 1.82.6 → 1.226.4

---

## Phase 2: Expo SDK 49 Patch Update (Low Risk) ✅ DONE
Update Expo to latest patch within SDK 49.

- [x] expo: 49.0.6 → 49.0.23
- [x] react-native: 0.72.3 → 0.72.10 (auto-fixed by expo)
- [x] Run `npx expo install --fix` to fix peer dependency issues
- [x] Reinstall iOS pods

**Test:** `yarn ios` or `yarn android`

---

## Phase 3: SWR Update (Medium Risk) ✅ DONE
SWR v2 has breaking changes in API but worth updating for better performance.

- [x] swr: 1.3.0 → 2.3.7

**Breaking changes checked:**
- `mutate` behavior - ✅ Compatible (uses `mutate(key)` for revalidation)
- Error handling - ✅ Compatible (uses standard error property)
- All `useSWR` calls - ✅ Compatible (uses basic `useSWR<Type>(key)` pattern)

**Command:**
```bash
yarn add swr@^2.3.7
```

**Test:** Verify data fetching still works correctly

---

## Phase 4: Expo SDK 50 Migration (High Risk) ✅ DONE
Major upgrade - requires careful testing.

**Prerequisites:**
- Review [Expo SDK 50 changelog](https://expo.dev/changelog/2024/01-18-sdk-50)
- Backup/commit all current work

**Changes:**
- [x] expo: 49 → 50 (50.0.21)
- [x] React Native: 0.72 → 0.73 (0.73.6)
- [x] expo-device, expo-haptics, expo-notifications, etc. (auto-updated)

**Additional fixes applied:**
- Updated iOS deployment target to 13.4 (required for RN 0.73)
- Removed deprecated `__apply_Xcode_12_5_M1_post_install_workaround` from Podfile
- Updated Gradle to 8.3 (required for RN 0.73)

**Post-update:**
- [x] Clean and rebuild iOS: `cd ios && rm -rf Pods Podfile.lock && pod install`
- [x] Clean Android: `cd android && ./gradlew clean`

---

## Phase 5: Expo SDK 51 Migration (High Risk) ✅ DONE
**Prerequisites:**
- Review [Expo SDK 51 changelog](https://expo.dev/changelog/2024/05-07-sdk-51)

**Changes:**
- [x] expo: 50 → 51 (51.0.39)
- [x] React Native: 0.73 → 0.74 (0.74.5)
- [x] expo-device, expo-haptics, expo-notifications, etc. (auto-updated)

**Additional fixes applied:**
- Updated Android Gradle Plugin to 8.3.0 (required for RN 0.74)
- Updated compileSdkVersion/targetSdkVersion to 34
- Updated minSdkVersion to 23 (required for RN 0.74)
- Updated Kotlin to 1.9.23
- Removed Flipper (deprecated in RN 0.74)
- TypeScript downgraded to 5.3.3 for compatibility
- Patched expo-device for TARGET_OS_SIMULATOR Swift error (patches/expo-device+6.0.2.patch)

**Post-update:**
- [x] Clean and rebuild iOS: `cd ios && rm -rf Pods Podfile.lock && pod install`
- [x] Clean Android: `cd android && ./gradlew clean`

---

## Phase 6: Expo SDK 52 Migration (High Risk) ✅ DONE
**Prerequisites:**
- Review [Expo SDK 52 changelog](https://expo.dev/changelog/2024/11-12-sdk-52)

**Changes:**
- [x] expo: 51 → 52 (52.0.47)
- [x] React Native: 0.74 → 0.76 (0.76.9)
- [x] React: 18.2.0 → 18.3.1
- [x] expo-device, expo-haptics, expo-notifications, etc. (auto-updated)

**Additional fixes applied:**
- Updated iOS deployment target to 15.1 (required for RN 0.76)
- Updated Android Gradle Plugin to 8.6.0 (required for RN 0.76)
- Updated Gradle to 8.10.2
- Updated compileSdkVersion/targetSdkVersion to 35
- Updated minSdkVersion to 24 (required for RN 0.76)
- Updated NDK to 27.1.12297006
- Updated Kotlin to 1.9.24
- Updated build tools to 35.0.0
- Removed deprecated `get_default_flags()` from Podfile
- Removed deprecated `REACT_NATIVE_UNSTABLE_USE_RUNTIME_SCHEDULER_ALWAYS` flag
- Deleted obsolete expo-device patch (fix now included in 7.0.3)
- Added @react-native-community/cli packages for native module linking
- Ran `npx expo prebuild --platform android --clean` to regenerate Android native files

**Post-update:**
- [x] Clean and rebuild iOS: `cd ios && rm -rf Pods Podfile.lock && pod install`
- [x] Clean Android: `cd android && ./gradlew clean`

---

## Phase 7: React Navigation 7 (High Risk) ✅ DONE
Major version with breaking changes.

**Prerequisites:**
- Review [React Navigation 7 upgrade guide](https://reactnavigation.org/docs/upgrading-from-6.x)

**Changes:**
- [x] @react-navigation/native: 6.x → 7.x (7.1.24)
- [x] @react-navigation/native-stack: 6.x → 7.x (7.8.5)

**Notes:**
- No breaking changes affected this codebase (uses basic navigation patterns)
- Navigation APIs used (NavigationContainer, createNativeStackNavigator, NativeStackScreenProps) remain compatible
- Regenerated Android native files with `npx expo prebuild --platform android --clean`

**Post-update:**
- [x] Clean and rebuild iOS: `cd ios && rm -rf Pods Podfile.lock && pod install`
- [x] Clean Android: Regenerated via expo prebuild

---

## Phase 8: NativeWind 4 Migration ✅ DONE
Major upgrade with significant configuration changes.

**Changes:**
- [x] nativewind: 2.x → 4.x (4.2.1)
- [x] Added react-native-reanimated: 3.16.7 (required by NativeWind 4)
- [x] Added react-native-css-interop: 0.2.1 (auto-installed dependency)
- [x] TailwindCSS remains at 3.x (NativeWind 4 requires TailwindCSS >3.3.0, not 4.x)

**Configuration changes:**
- Updated `metro.config.js` to use `withNativeWind` wrapper
- Updated `babel.config.js` with nativewind preset and reanimated plugin
- Created `global.css` with Tailwind directives
- Updated `tailwind.config.js` with nativewind preset
- Created `nativewind-env.d.ts` for proper TypeScript types
- Updated `tsconfig.json` to include type declarations
- Added `import "./global.css"` to App.tsx

**Additional fixes:**
- Fixed Subscription import from expo-notifications
- Fixed Timer.tsx notification trigger types
- Fixed Timer.tsx interval ref type

**Post-update:**
- [x] Clean and rebuild iOS: `cd ios && rm -rf Pods Podfile.lock && pod install`
- [x] Clean Android: Regenerated via expo prebuild

---

## Phase 9: Future Updates
Consider these for future upgrades:

- [ ] TailwindCSS: 3.x → 4.x (when NativeWind supports it)
- [ ] React 19 (when Expo supports it)

---

## Notes
- Always run `yarn ios` and `yarn android` after each phase
- Commit after each successful phase
- Keep this file updated with progress

