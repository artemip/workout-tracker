import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import * as Notifications from "expo-notifications";

interface Props {
  timeSeconds: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

async function schedulePushNotification(numSeconds: number) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "Rest time is over",
      body: "Move on to the next set",
      autoDismiss: true,
      sound: true,
      vibrate: [0, 250, 250, 250],
    },
    trigger: {
      seconds: numSeconds,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });
}

export default function Timer({ timeSeconds }: Props) {
  const [ticks, setTicks] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationRef = useRef<string | undefined>();

  useEffect(() => {
    setTimerStartTime(Date.now());
  }, [timeSeconds]);

  useEffect(() => {
    async function startTimer() {
      if (timerStartTime && timeSeconds && !intervalRef.current) {
        notificationRef.current = await schedulePushNotification(timeSeconds);
        setTicks((prev) => prev + 1);

        intervalRef.current = setInterval(() => {
          setTicks((prev) => prev + 1);
        }, 1000);
      }
    }

    startTimer();
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
      notificationRef.current &&
        Notifications.cancelScheduledNotificationAsync(notificationRef.current);

      intervalRef.current = null;
    };
  }, [timerStartTime]);

  function getSecondsRemaining() {
    const secondsElapsed = Math.floor((Date.now() - timerStartTime) / 1000);
    return Math.max(0, timeSeconds - secondsElapsed);
  }

  // Don't render when timer is inactive
  if (timeSeconds <= 0) {
    return null;
  }

  const secondsRemaining = getSecondsRemaining();
  const isUrgent = secondsRemaining <= 10 && secondsRemaining > 0;
  const isComplete = secondsRemaining === 0;

  // Hide when complete
  if (isComplete) {
    return null;
  }

  return (
    <View className="py-8 items-center">
      <Text className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Rest
      </Text>
      <Text
        key={ticks.toString()}
        className={`text-6xl font-bold ${
          isUrgent ? "text-blue-500" : "text-gray-900"
        }`}
      >
        {formatTime(secondsRemaining)}
      </Text>
    </View>
  );
}
