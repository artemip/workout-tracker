import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Vibration, Platform } from "react-native";

interface Props {
  timeSeconds: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

function vibrate() {
  const interval = setInterval(() => {
    Vibration.vibrate([0, 500, 200, 500]);
    console.debug("Vibrating...");
  }, 1000);
  setTimeout(() => clearInterval(interval), 5000);
}

export default function Timer({ timeSeconds }: Props) {
  const [seconds, setSeconds] = useState(timeSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      vibrate();
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, seconds]);

  useEffect(() => {
    setSeconds(timeSeconds);
    setIsActive(true);
  }, [timeSeconds]);

  return (
    <View className="flex-1 flex-col justify-center items-center">
      <Text className="text-5xl font-bold">
        {timeSeconds > 0 ? formatTime(seconds) : "--"}
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
