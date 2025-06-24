"use client";

import { MotionDiv } from "@/components/ui/motion";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { HabitService } from "@/services/HabitService";
import { Habit, HabitWithStreaks, addStreaksToHabit } from "@/types/Habit";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HabitTracker() {
  const [habits, setHabits] = useState<HabitWithStreaks[]>([]);
  const [newHabit, setNewHabit] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habitsData = await HabitService.getAll();
      // Add calculated streaks to each habit
      const habitsWithStreaks = habitsData.map(habit => addStreaksToHabit(habit));
      setHabits(habitsWithStreaks);
    } catch (error) {
      console.error("Failed to load habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async () => {
    if (newHabit.trim()) {
      try {
        await HabitService.create({
          name: newHabit.trim(),
          description: "",
          icon: "🎯",
          color: "bg-gradient-to-r from-teal-500 to-blue-500",
          targetFrequency: 7,
          tags: [],
          completions: {},
        });
        await loadHabits();
        setNewHabit("");
      } catch (error) {
        console.error("Failed to add habit:", error);
      }
    }
  };

  const toggleHabitDay = async (habitId: string, dayIndex: number) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const today = new Date();
      const targetDate = new Date(today);
      // dayIndex now matches JavaScript's getDay() where 0=Sunday, 1=Monday, etc.
      targetDate.setDate(today.getDate() - today.getDay() + dayIndex);
      const dateStr = targetDate.toISOString().split('T')[0];

      if (habit.completions[dateStr]) {
        await HabitService.markIncomplete(habitId, dateStr);
      } else {
        await HabitService.markComplete(habitId, dateStr);
      }
      
      await loadHabits();
    } catch (error) {
      console.error("Failed to toggle habit:", error);
    }
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

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Circle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No habits yet</p>
          <p className="text-sm">Add your first habit above</p>
        </div>
      ) : (
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
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      {habit.icon && <span className="text-lg">{habit.icon}</span>}
                      <span>{habit.name}</span>
                      {habit.streak > 0 && (
                        <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                          {habit.streak} day streak
                        </span>
                      )}
                    </div>
                  </td>
                  {DAYS.map((day, index) => {
                    // Calculate the date for this day of the week
                    const today = new Date();
                    const targetDate = new Date(today);
                    targetDate.setDate(today.getDate() - today.getDay() + index);
                    const dateStr = targetDate.toISOString().split('T')[0];
                    const completed = Boolean(habit.completions[dateStr]);
                    
                    return (
                      <td key={index} className="p-3 text-center">
                        <button
                          onClick={() => toggleHabitDay(habit.id, index)}
                          className={`p-1 rounded-full transition-colors ${completed
                              ? "text-teal-500 hover:text-teal-400"
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
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MotionDiv>
  );
} 