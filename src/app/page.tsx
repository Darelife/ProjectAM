import { TopBar } from "@/components/layout/TopBar"
import { QuickActionsGrid } from "@/components/features/QuickActionsGrid"
import { TodaySummary } from "@/components/features/TodaySummary"
import { PomodoroWidget } from "@/components/features/PomodoroWidget"
import { MotionDiv } from "@/components/ui/motion"
import { TaskList } from "@/components/features/TaskList"
import { HabitTracker } from "@/components/features/HabitTracker"
import { NotesWidget } from "@/components/features/NotesWidget"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 18) return "Good Afternoon"
  return "Good Evening"
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <TopBar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            {getGreeting()} ☕
          </h1>
          <p className="text-muted-foreground">
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
            <section>
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <QuickActionsGrid />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Today's Tasks</h2>
              <TaskList />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Habit Tracker</h2>
              <HabitTracker />
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Today's Summary</h2>
              <TodaySummary />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Focus Timer</h2>
              <PomodoroWidget />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Quick Notes</h2>
              <NotesWidget />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
