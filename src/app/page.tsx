"use client";

import { TopBar } from "@/components/layout/TopBar"
import { QuickActionsGrid } from "@/components/features/QuickActionsGrid"
import { TodaySummary } from "@/components/features/TodaySummary"
import { PomodoroWidget } from "@/components/features/PomodoroWidget"
import { MotionDiv } from "@/components/ui/motion"
import { TaskList } from "@/components/features/TaskList"
import { HabitTracker } from "@/components/features/HabitTracker"
import { NotesWidget } from "@/components/features/NotesWidget"

export default function Home() {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <TopBar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-5xl font-extrabold mb-2 gradient-text">
            {getGreeting()} ☕
          </h1>
          <p className="text-lg text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-enhanced p-6 rounded-2xl card-hover"
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">Quick Actions</h2>
              <QuickActionsGrid />
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-enhanced p-6 rounded-2xl card-hover"
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">Today's Tasks</h2>
              <TaskList />
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-enhanced p-6 rounded-2xl card-hover"
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">Habit Tracker</h2>
              <HabitTracker />
            </MotionDiv>
          </div>

          <div className="space-y-8">
            <MotionDiv
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-enhanced p-6 rounded-2xl card-hover"
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">Today's Summary</h2>
              <TodaySummary />
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-enhanced p-6 rounded-2xl card-hover"
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">Focus Timer</h2>
              <PomodoroWidget />
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-enhanced p-6 rounded-2xl card-hover"
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">Quick Notes</h2>
              <NotesWidget />
            </MotionDiv>
          </div>
        </div>
      </div>
    </main>
  )
}
