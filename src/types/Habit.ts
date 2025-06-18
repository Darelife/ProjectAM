import { z } from 'zod';

export const HabitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  streak: z.number().default(0),
  bestStreak: z.number().default(0),
  totalCompletions: z.number().default(0),
  targetFrequency: z.number().default(7), // times per week
  tags: z.array(z.string()).default([]),
  // Track completions by date (YYYY-MM-DD format)
  completions: z.record(z.string(), z.boolean()).default({}),
  // Weekly tracking for current week (Mon-Sun)
  weeklyProgress: z.array(z.boolean()).length(7).default(Array(7).fill(false)),
});

export type Habit = z.infer<typeof HabitSchema>;

// Helper type for creating habits
export type CreateHabitData = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'streak' | 'bestStreak' | 'totalCompletions'>;
