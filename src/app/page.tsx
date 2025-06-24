"use client";

import { TaskList } from "@/components/features/TaskList"
import { TodaySummary } from "@/components/features/TodaySummary"
import { useEffect, useState } from "react"

export default function Home() {
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 18) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {greeting}
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <TodaySummary />
      </div>

      {/* Today's Tasks */}
      <div className="card-clean p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">Today's Tasks</h2>
        <TaskList />
      </div>
    </div>
  );
}
