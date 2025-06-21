import { z } from 'zod';

export const DiaryEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mood: z.enum(['happy', 'neutral', 'sad', 'excited']),
  date: z.string(),
  tags: z.array(z.string()).default([]),
  linkedNoteIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DiaryEntry = z.infer<typeof DiaryEntrySchema>;
