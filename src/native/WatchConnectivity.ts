/**
 * WatchConnectivity - TypeScript bindings for the native WatchConnectivity module
 *
 * Provides communication between the React Native app and the watchOS companion app.
 */

import { NativeModules, NativeEventEmitter, Platform } from "react-native";

// Type definitions
export interface WatchWorkoutState {
  exerciseName: string;
  exerciseType?: string;
  currentSet: number;
  totalSets: number;
  weight: number;
  targetReps: number;
  restTimeSeconds: number;
  timerStartedAt?: number;
}

export interface WatchSetCompletedEvent {
  weight: number;
  repsCompleted: number;
  timestamp: number;
}

export interface WatchReachabilityEvent {
  isReachable: boolean;
}

// Get native module (only available on iOS)
const { WatchConnectivityModule } = NativeModules;

// Check if module is available
const isAvailable = Platform.OS === "ios" && WatchConnectivityModule != null;

// Debug logging
console.log("[WatchConnectivity] Module available:", isAvailable);
console.log("[WatchConnectivity] NativeModules:", Object.keys(NativeModules));

// Create event emitter if available
const eventEmitter = isAvailable
  ? new NativeEventEmitter(WatchConnectivityModule)
  : null;

// Type for cleanup function
type CleanupFunction = () => void;

/**
 * WatchConnectivity API
 */
export const WatchConnectivity = {
  /**
   * Check if WatchConnectivity is available (iOS only)
   */
  isAvailable: (): boolean => isAvailable,

  /**
   * Check if an Apple Watch is paired
   */
  isWatchPaired: async (): Promise<boolean> => {
    if (!isAvailable) return false;
    try {
      return await WatchConnectivityModule.isWatchPaired();
    } catch {
      return false;
    }
  },

  /**
   * Check if the Watch app is currently reachable
   */
  isWatchReachable: async (): Promise<boolean> => {
    if (!isAvailable) return false;
    try {
      return await WatchConnectivityModule.isWatchReachable();
    } catch {
      return false;
    }
  },

  /**
   * Send current workout state to Watch
   */
  sendWorkoutState: (state: WatchWorkoutState): void => {
    console.log(
      "[WatchConnectivity] sendWorkoutState called, available:",
      isAvailable
    );
    if (!isAvailable) {
      console.log("[WatchConnectivity] Module not available, skipping");
      return;
    }
    console.log("[WatchConnectivity] Sending state:", JSON.stringify(state));
    WatchConnectivityModule.sendWorkoutState(state);
  },

  /**
   * Notify Watch that a workout has started
   */
  sendWorkoutStarted: (state: WatchWorkoutState): void => {
    if (!isAvailable) return;
    WatchConnectivityModule.sendWorkoutStarted(state);
  },

  /**
   * Notify Watch that the workout has ended
   */
  sendWorkoutEnded: (): void => {
    if (!isAvailable) return;
    WatchConnectivityModule.sendWorkoutEnded();
  },

  /**
   * Subscribe to Watch reachability changes
   */
  onReachabilityChanged: (
    callback: (event: WatchReachabilityEvent) => void
  ): CleanupFunction => {
    if (!eventEmitter) return () => {};
    const subscription = eventEmitter.addListener(
      "onWatchReachabilityChanged",
      callback
    );
    return () => subscription.remove();
  },

  /**
   * Subscribe to set completed events from Watch
   */
  onSetCompleted: (
    callback: (event: WatchSetCompletedEvent) => void
  ): CleanupFunction => {
    if (!eventEmitter) return () => {};
    const subscription = eventEmitter.addListener("onSetCompleted", callback);
    return () => subscription.remove();
  },

  /**
   * Subscribe to all Watch messages
   */
  onWatchMessage: (
    callback: (message: Record<string, unknown>) => void
  ): CleanupFunction => {
    if (!eventEmitter) return () => {};
    const subscription = eventEmitter.addListener("onWatchMessage", callback);
    return () => subscription.remove();
  },
};

export default WatchConnectivity;
