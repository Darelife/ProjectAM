"use client";

import { MotionDiv } from "@/components/ui/motion";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { useState } from "react";

interface Habit {
  id: string;
  name: string;
  days: boolean[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      name: "Morning Exercise",
      days: [true, true, false, true, false, true, false],
    },
    {
      id: "2",
      name: "Read 30 minutes",
      days: [true, true, true, true, true, false, false],
    },
    {
      id: "3",
      name: "Meditate",
      days: [false, true, true, false, true, true, true],
    },
  ]);
  const [newHabit, setNewHabit] = useState("");

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([
        ...habits,
        {
          id: Date.now().toString(),
          name: newHabit.trim(),
          days: Array(7).fill(false),
        },
      ]);
      setNewHabit("");
    }
  };

  const toggleHabitDay = (habitId: string, dayIndex: number) => {
    setHabits(
      habits.map((habit) =>
        habit.id === habitId
          ? {
            ...habit,
            days: habit.days.map((completed, index) =>
              index === dayIndex ? !completed : completed
            ),
          }
          : habit
      )
    );
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addHabit()}
          placeholder="Add a new habit..."
          className="input-focus flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border/40 text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={addHabit}
          className="button-primary p-3 rounded-lg hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left p-3 text-muted-foreground font-medium">Habit</th>
              {DAYS.map((day) => (
                <th key={day} className="p-3 text-center text-muted-foreground font-medium">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr
                key={habit.id}
                className="border-b border-border/40 hover:bg-background/50 transition-colors"
              >
                <td className="p-3 font-medium">{habit.name}</td>
                {habit.days.map((completed, index) => (
                  <td key={index} className="p-3 text-center">
                    <button
                      onClick={() => toggleHabitDay(habit.id, index)}
                      className={`p-1 rounded-full transition-colors ${completed
                          ? "text-green-500 hover:text-green-400"
                          : "text-muted-foreground hover:text-primary"
                        }`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MotionDiv>
  );
} 