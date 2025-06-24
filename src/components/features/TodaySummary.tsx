"use client";

import { Calendar, Clock, Target, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { TaskService } from "@/services/TaskService";
import { HabitService } from "@/services/HabitService";
import { Database } from "@/types/Database";

type Task = Database['public']['Tables']['tasks']['Row'];
type Habit = Database['public']['Tables']['habits']['Row'];

export function TodaySummary() {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [totalHabits, setTotalHabits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [tasks, habits] = await Promise.all([
        TaskService.getByDate(today),
        HabitService.getAll()
      ]);
      
      setTodayTasks(tasks);
      setTotalHabits(habits.length);
    } catch (error) {
      console.error("Failed to load today's data:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = todayTasks.filter(task => task.completed).length;
  const totalTasks = todayTasks.length;

  const stats = [
    {
      icon: Calendar,
      label: "Tasks Completed",
      value: loading ? "..." : `${completedTasks}/${totalTasks}`,
    },
    {
      icon: Target,
      label: "Total Habits",
      value: loading ? "..." : `${totalHabits}`,
    },
    {
      icon: TrendingUp,
      label: "Progress",
      value: loading ? "..." : totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : "0%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card-clean p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/50 rounded-lg">
              <stat.icon className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-medium text-foreground">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 