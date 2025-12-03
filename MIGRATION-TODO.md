# Package Migration Plan

> Created: Dec 3, 2025  
> Goal: Update stale packages safely with commits between each step

## Current State
- **Expo SDK**: 49.0.6 (released July 2023)
- **React Native**: 0.72.3
- **React**: 18.2.0

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

## Phase 5: Expo SDK 51 Migration (High Risk) ⚠️
**Prerequisites:**
- Review [Expo SDK 51 changelog](https://expo.dev/changelog/2024/05-07-sdk-51)

**Changes:**
- [ ] expo: 50 → 51
- [ ] React Native: 0.73 → 0.74

---

## Phase 6: Expo SDK 52 Migration (High Risk) ⚠️
**Prerequisites:**
- Review [Expo SDK 52 changelog](https://expo.dev/changelog/2024/11-12-sdk-52)

**Changes:**
- [ ] expo: 51 → 52
- [ ] React Native: 0.74 → 0.76
- [ ] New Architecture becomes default (can opt-out if issues)

---

## Phase 7: React Navigation 7 (High Risk) ⚠️
Major version with breaking changes.

**Prerequisites:**
- Review [React Navigation 7 upgrade guide](https://reactnavigation.org/docs/upgrading-from-6.x)

**Changes:**
- [ ] @react-navigation/native: 6.x → 7.x
- [ ] @react-navigation/native-stack: 6.x → 7.x

---

## Phase 8: Other Major Updates (Future)
Consider these after core is stable:

- [ ] nativewind: 2.x → 4.x (major API changes)
- [ ] tailwindcss: 3.x → 4.x (major changes)
- [ ] React 19 (when Expo supports it)

---

## Notes
- Always run `yarn ios` and `yarn android` after each phase
- Commit after each successful phase
- Keep this file updated with progress

