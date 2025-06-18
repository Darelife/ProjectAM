import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.string(),
  dueDate: z.string().optional(),
  completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  eisenhowerQuadrant: z.enum(['do', 'schedule', 'delegate', 'delete']).optional(),
  linkedNoteIds: z.array(z.string()),
  tags: z.array(z.string()),
  pomodoroCount: z.number().optional(),
  calendarDate: z.string().optional(),
  habitId: z.string().optional(),
  updatedAt: z.string(),
});

export type Task = z.infer<typeof TaskSchema>; 