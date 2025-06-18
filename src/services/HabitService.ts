import { JsonDB } from '../lib/jsonDB';
import { Habit, HabitSchema, CreateHabitData } from '../types/Habit';
import { v4 as uuidv4 } from 'uuid';

const db = new JsonDB<Habit>('habits.json');

export const HabitService = {
  async getAll(): Promise<Habit[]> {
    const habits = await db.read();
    
    // Recalculate weeklyProgress for each habit based on current week
    return habits.map(habit => {
      const weeklyProgress = this.calculateCurrentWeekProgress(habit);
      return {
        ...habit,
        weeklyProgress
      };
    });
  },

  calculateCurrentWeekProgress(habit: Habit): boolean[] {
    const today = new Date();
    const weekProgress = Array(7).fill(false);
    
    // Calculate dates for the current week (Sunday to Saturday)
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - today.getDay() + dayIndex);
      const dateStr = targetDate.toISOString().split('T')[0];
      
      weekProgress[dayIndex] = Boolean(habit.completions?.[dateStr]);
    }
    
    return weekProgress;
  },

  async getById(id: string): Promise<Habit | undefined> {
    const habits = await db.read();
    return habits.find(h => h.id === id);
  },

  async create(habitData: CreateHabitData): Promise<Habit> {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...habitData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      streak: 0,
      bestStreak: 0,
      totalCompletions: 0,
      completions: {},
      weeklyProgress: Array(7).fill(false),
      tags: habitData.tags || [],
      targetFrequency: habitData.targetFrequency || 7,
    };
    
    HabitSchema.parse(newHabit);
    const habits = await db.read();
    habits.push(newHabit);
    await db.write(habits);
    return newHabit;
  },

  async update(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const habits = await db.read();
    const idx = habits.findIndex(h => h.id === id);
    if (idx === -1) return undefined;
    
    const updated = { ...habits[idx], ...updates, updatedAt: new Date().toISOString() };
    HabitSchema.parse(updated);
    habits[idx] = updated;
    await db.write(habits);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const habits = await db.read();
    const filtered = habits.filter(h => h.id !== id);
    await db.write(filtered);
    return filtered.length < habits.length;
  },

  async markComplete(id: string, date: string): Promise<Habit | undefined> {
    const habits = await db.read();
    const habit = habits.find(h => h.id === id);
    if (!habit) return undefined;

    // Update completions record
    const newCompletions = { ...habit.completions, [date]: true };
    
    // Calculate new streak
    let streak = 0;
    let checkDate = new Date(date);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (newCompletions[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate current week progress
    const updatedHabit = {
      ...habit,
      completions: newCompletions,
      streak,
      bestStreak: Math.max(habit.bestStreak, streak),
      totalCompletions: habit.totalCompletions + 1,
    };
    
    const weeklyProgress = this.calculateCurrentWeekProgress(updatedHabit);

    const updated = await this.update(id, {
      completions: newCompletions,
      streak,
      bestStreak: Math.max(habit.bestStreak, streak),
      totalCompletions: habit.totalCompletions + 1,
      weeklyProgress,
    });

    return updated;
  },

  async markIncomplete(id: string, date: string): Promise<Habit | undefined> {
    const habits = await db.read();
    const habit = habits.find(h => h.id === id);
    if (!habit) return undefined;

    // Update completions record
    const newCompletions = { ...habit.completions };
    delete newCompletions[date];
    
    // Recalculate streak
    let streak = 0;
    let checkDate = new Date(date);
    // Start from the date itself and go backwards
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (newCompletions[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate current week progress
    const updatedHabit = {
      ...habit,
      completions: newCompletions,
      streak,
      totalCompletions: Math.max(0, habit.totalCompletions - 1),
    };
    
    const weeklyProgress = this.calculateCurrentWeekProgress(updatedHabit);

    const updated = await this.update(id, {
      completions: newCompletions,
      streak,
      totalCompletions: Math.max(0, habit.totalCompletions - 1),
      weeklyProgress,
    });

    return updated;
  },

  async getHabitsForDate(date: string): Promise<Habit[]> {
    const habits = await db.read();
    return habits.filter(habit => habit.completions[date]);
  },

  async getHabitStats(id: string): Promise<{
    streak: number;
    bestStreak: number;
    totalCompletions: number;
    weeklyCompletions: number;
    monthlyCompletions: number;
  } | undefined> {
    const habit = await this.getById(id);
    if (!habit) return undefined;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let weeklyCompletions = 0;
    let monthlyCompletions = 0;

    Object.entries(habit.completions).forEach(([dateStr, completed]) => {
      if (completed) {
        const date = new Date(dateStr);
        if (date >= oneWeekAgo) weeklyCompletions++;
        if (date >= oneMonthAgo) monthlyCompletions++;
      }
    });

    return {
      streak: habit.streak,
      bestStreak: habit.bestStreak,
      totalCompletions: habit.totalCompletions,
      weeklyCompletions,
      monthlyCompletions,
    };
  },
};
