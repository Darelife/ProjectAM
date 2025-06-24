"use client";

import { MotionDiv } from "@/components/ui/motion";
import { Calendar, Clock, Coffee, LineChart, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { TaskService } from "@/services/TaskService";
import { HabitService } from "@/services/HabitService";
import { Task } from "@/types/Database";
import { Habit } from "@/types/Database";

export function TodaySummary() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [tasks, allHabits] = await Promise.all([
        TaskService.getByDate(today),
        HabitService.getAll()
      ]);
      
      // Filter habits that are completed today and add streaks
      const todayHabitsData = allHabits
        .filter(habit => habit.completions[today])
        .map(habit => addStreaksToHabit(habit));
      
      setTodayTasks(tasks);
      setTodayHabits(todayHabitsData);
    } catch (error) {
      console.error("Failed to load today's data:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = todayTasks.filter(task => task.completed).length;
  const totalTasks = todayTasks.length;
  const completedHabits = todayHabits.length; // These are already filtered to completed today
  
  // Get total habits for the day calculation
  const [allHabits, setAllHabits] = useState<HabitWithStreaks[]>([]);
  
  useEffect(() => {
    const loadAllHabits = async () => {
      try {
        const habits = await HabitService.getAll();
        const habitsWithStreaks = habits.map(habit => addStreaksToHabit(habit));
        setAllHabits(habitsWithStreaks);
      } catch (error) {
        console.error("Failed to load all habits:", error);
      }
    };
    loadAllHabits();
  }, []);
  
  const totalHabits = allHabits.length;

  // Calculate focus time from completed pomodoro tasks
  const focusTime = todayTasks.reduce((total, task) => {
    return total + (task.pomodoroCount || 0) * 25; // 25 minutes per pomodoro
  }, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const overallProgress = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const summaries = [
    {
      icon: Calendar,
      label: "Tasks Due Today",
      value: loading ? "..." : `${completedTasks}/${totalTasks} tasks`,
      color: "text-teal-500",
      gradient: "from-teal-500/20 to-teal-500/5",
    },
    {
      icon: Clock,
      label: "Focus Time",
      value: loading ? "..." : formatTime(focusTime),
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: Target,
      label: "Habits Completed",
      value: loading ? "..." : `${completedHabits} habits`,
      color: "text-green-500",
      gradient: "from-green-500/20 to-green-500/5",
    },
    {
      icon: Coffee,
      label: "Progress",
      value: loading ? "..." : `${overallProgress}%`,
      color: "text-orange-500",
      gradient: "from-orange-500/20 to-orange-500/5",
    },
  ];
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium gradient-text">Today's Summary</h3>
        <LineChart className="w-5 h-5 text-primary" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {summaries.map((summary) => (
          <MotionDiv
            key={summary.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-xl bg-gradient-to-br ${summary.gradient} border border-border/40`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-background/50 ${summary.color} flex-shrink-0`}>
                <summary.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{summary.label}</p>
                <p className="text-sm font-medium">{summary.value}</p>
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-background/50 border border-border/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Daily Progress</span>
          <span className="text-sm font-medium">{overallProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-background/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </MotionDiv>
  );
} 