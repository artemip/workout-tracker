import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Vibration, Platform } from "react-native";
import * as Device from "expo-device";
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

  return (
    <View className="flex-1 flex-col justify-center items-center">
      <Text key={ticks.toString()} className="text-5xl font-bold">
        {timeSeconds > 0 ? formatTime(getSecondsRemaining()) : "--"}
      </Text>
      <Text className="text-m">Rest Remaining</Text>
      {/* <TouchableOpacity
        onPress={() => setIsActive(!isActive)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{isActive ? "Pause" : "Start"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleReset} style={styles.button}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  timerWrapper: {
    position: "relative",
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    position: "absolute",
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    lineHeight: 100,
  },
  button: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#0a0",
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
