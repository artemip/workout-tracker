/**
 * useWatchConnectivity - React hook for Watch connectivity
 *
 * Provides easy-to-use Watch sync functionality with automatic cleanup.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import {
  WatchConnectivity,
  WatchWorkoutState,
  WatchSetCompletedEvent,
} from "../native/WatchConnectivity";

interface UseWatchConnectivityOptions {
  onSetCompleted?: (event: WatchSetCompletedEvent) => void;
}

export function useWatchConnectivity(
  options: UseWatchConnectivityOptions = {}
) {
  const [isWatchReachable, setIsWatchReachable] = useState(false);
  const lastSentState = useRef<string>("");

  // Check initial reachability
  useEffect(() => {
    if (!WatchConnectivity.isAvailable()) return;

    WatchConnectivity.isWatchReachable().then(setIsWatchReachable);

    // Subscribe to reachability changes
    const cleanup = WatchConnectivity.onReachabilityChanged((event) => {
      setIsWatchReachable(event.isReachable);
    });

    return cleanup;
  }, []);

  // Subscribe to set completed events
  useEffect(() => {
    if (!WatchConnectivity.isAvailable() || !options.onSetCompleted) return;

    const cleanup = WatchConnectivity.onSetCompleted(options.onSetCompleted);
    return cleanup;
  }, [options.onSetCompleted]);

  // Send workout state to Watch (with deduplication)
  const sendWorkoutState = useCallback((state: WatchWorkoutState) => {
    if (!WatchConnectivity.isAvailable()) return;

    // Deduplicate - don't send if state hasn't changed (except timer)
    const stateKey = JSON.stringify({
      ...state,
      timerStartedAt: undefined, // Ignore timer changes for deduplication
    });

    if (stateKey !== lastSentState.current || state.timerStartedAt) {
      lastSentState.current = stateKey;
      WatchConnectivity.sendWorkoutState(state);
    }
  }, []);

  // Notify Watch workout started
  const notifyWorkoutStarted = useCallback((state: WatchWorkoutState) => {
    if (!WatchConnectivity.isAvailable()) return;
    WatchConnectivity.sendWorkoutStarted(state);
  }, []);

  // Notify Watch workout ended
  const notifyWorkoutEnded = useCallback(() => {
    if (!WatchConnectivity.isAvailable()) return;
    lastSentState.current = "";
    WatchConnectivity.sendWorkoutEnded();
  }, []);

  return {
    isAvailable: WatchConnectivity.isAvailable(),
    isWatchReachable,
    sendWorkoutState,
    notifyWorkoutStarted,
    notifyWorkoutEnded,
  };
}

export default useWatchConnectivity;
