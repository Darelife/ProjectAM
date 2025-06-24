import { z } from 'zod';

export const HabitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  totalCompletions: z.number().default(0),
  targetFrequency: z.number().default(7), // times per week
  tags: z.array(z.string()).default([]),
  // Track completions by date (YYYY-MM-DD format)
  completions: z.record(z.string(), z.boolean()).default({}),
});

export type Habit = z.infer<typeof HabitSchema>;

// Helper type for creating habits
export type CreateHabitData = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'totalCompletions'>;

// Helper type for habit with calculated streaks
export interface HabitWithStreaks extends Habit {
  streak: number;
  bestStreak: number;
}

// Utility functions for calculating streaks
export function calculateStreaks(completions: Record<string, boolean>): { currentStreak: number; bestStreak: number } {
  // Get all completion dates and sort them
  const completionDates = Object.keys(completions)
    .filter(date => completions[date])
    .sort();
  
  if (completionDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }
  
  // Calculate current streak (consecutive days ending today)
  let currentStreak = 0;
  const today = new Date();
  let checkDate = new Date(today);
  
  // Start from today and count backwards
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (completions[dateStr]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Calculate best streak (longest consecutive sequence ever)
  let bestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < completionDates.length; i++) {
    const prevDate = new Date(completionDates[i - 1]);
    const currDate = new Date(completionDates[i]);
    
    // Check if dates are consecutive (difference of 1 day)
    const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  bestStreak = Math.max(bestStreak, tempStreak);
  
  return { currentStreak, bestStreak };
}

// Helper function to add streaks to a habit
export function addStreaksToHabit(habit: Habit): HabitWithStreaks {
  const { currentStreak, bestStreak } = calculateStreaks(habit.completions);
  return {
    ...habit,
    streak: currentStreak,
    bestStreak: bestStreak
  };
}
