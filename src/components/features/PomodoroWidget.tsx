"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Play, Pause, Timer, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

export function PomodoroWidget() {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play notification sound or show notification
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    switch (mode) {
      case "pomodoro":
        setTimeLeft(25 * 60);
        break;
      case "shortBreak":
        setTimeLeft(5 * 60);
        break;
      case "longBreak":
        setTimeLeft(15 * 60);
        break;
    }
  };

  const switchMode = (newMode: "pomodoro" | "shortBreak" | "longBreak") => {
    setMode(newMode);
    setIsRunning(false);
    switch (newMode) {
      case "pomodoro":
        setTimeLeft(25 * 60);
        break;
      case "shortBreak":
        setTimeLeft(5 * 60);
        break;
      case "longBreak":
        setTimeLeft(15 * 60);
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium gradient-text">Focus Timer</h3>
        <Timer className="w-5 h-5 text-primary" />
      </div>

      <div className="flex justify-center space-x-2 mb-6">
        <button
          onClick={() => switchMode("pomodoro")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${mode === "pomodoro"
              ? "button-primary"
              : "bg-background/50 hover:bg-background/80"
            }`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => switchMode("shortBreak")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${mode === "shortBreak"
              ? "button-primary"
              : "bg-background/50 hover:bg-background/80"
            }`}
        >
          Short Break
        </button>
        <button
          onClick={() => switchMode("longBreak")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${mode === "longBreak"
              ? "button-primary"
              : "bg-background/50 hover:bg-background/80"
            }`}
        >
          Long Break
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="text-6xl font-bold mb-2 gradient-text">
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-muted-foreground">
          {mode === "pomodoro"
            ? "Time to focus"
            : mode === "shortBreak"
              ? "Take a short break"
              : "Take a long break"}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className="button-primary p-4 rounded-full hover:scale-105 transition-transform"
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </MotionDiv>
  );
} 