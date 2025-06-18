"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Play, Pause, Timer } from "lucide-react"
import { useState, useEffect } from "react"

export function PomodoroWidget() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <MotionDiv
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 card-hover p-4 rounded-xl bg-card border border-border/40"
    >
      <div className="flex items-center space-x-3">
        <Timer className="w-5 h-5 text-primary" />
        <div className="text-lg font-medium">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>
    </MotionDiv>
  )
} 