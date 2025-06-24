import { supabase } from '../lib/supabase';
import { Database } from '../types/Database';
import { Habit, CreateHabitData } from '../types/Habit';

type HabitRow = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitUpdate = Database['public']['Tables']['habits']['Update'];
type HabitCompletionRow = Database['public']['Tables']['habit_completions']['Row'];
type HabitCompletionInsert = Database['public']['Tables']['habit_completions']['Insert'];

// Transform database row to Habit type
function transformHabitRow(row: HabitRow & { completions?: HabitCompletionRow[] }): Habit {
  // Convert completions array to date-boolean record
  const completionsRecord: Record<string, boolean> = {};
  if (row.completions) {
    row.completions.forEach(completion => {
      completionsRecord[completion.date] = completion.completed;
    });
  }

  // Calculate total completions
  const totalCompletions = row.completions?.filter(c => c.completed).length || 0;

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    icon: row.icon || '🎯',
    color: row.color || 'bg-gradient-to-r from-blue-500 to-cyan-500',
    targetFrequency: row.target_frequency || 7,
    tags: row.tags || [],
    totalCompletions,
    completions: completionsRecord,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const HabitService = {
  async getAll(): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select(`
          *,
          completions:habit_completions(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(transformHabitRow) || [];
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw new Error('Failed to fetch habits');
    }
  },

  async getById(id: string): Promise<Habit | undefined> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select(`
          *,
          completions:habit_completions(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
      }

      return data ? transformHabitRow(data) : undefined;
    } catch (error) {
      console.error('Error fetching habit:', error);
      return undefined;
    }
  },

  async create(habitData: CreateHabitData): Promise<Habit> {
    try {
      const insertData: HabitInsert = {
        name: habitData.name,
        description: habitData.description || '',
        icon: habitData.icon || '🎯',
        color: habitData.color || 'bg-gradient-to-r from-blue-500 to-cyan-500',
        target_frequency: habitData.targetFrequency || 7,
        tags: habitData.tags || []
      };

      const { data, error } = await supabase
        .from('habits')
        .insert(insertData)
        .select(`
          *,
          completions:habit_completions(*)
        `)
        .single();

      if (error) throw error;

      return transformHabitRow(data);
    } catch (error) {
      console.error('Error creating habit:', error);
      throw new Error('Failed to create habit');
    }
  },

  async update(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    try {
      const updateData: HabitUpdate = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.targetFrequency !== undefined) updateData.target_frequency = updates.targetFrequency;
      if (updates.tags !== undefined) updateData.tags = updates.tags;

      const { data, error } = await supabase
        .from('habits')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          completions:habit_completions(*)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        throw error;
      }

      return data ? transformHabitRow(data) : undefined;
    } catch (error) {
      console.error('Error updating habit:', error);
      return undefined;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      // Hard delete - completions will be cascade deleted due to foreign key constraint
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
  },

  async markComplete(id: string, date: string): Promise<Habit | undefined> {
    try {
      // Insert or update the completion
      const completionData: HabitCompletionInsert = {
        habit_id: id,
        date: date,
        completed: true
      };

      const { error: completionError } = await supabase
        .from('habit_completions')
        .upsert(completionData, {
          onConflict: 'habit_id,date',
          ignoreDuplicates: false
        });

      if (completionError) throw completionError;

      // Return updated habit
      return await this.getById(id);
    } catch (error) {
      console.error('Error marking habit complete:', error);
      return undefined;
    }
  },

  async markIncomplete(id: string, date: string): Promise<Habit | undefined> {
    try {
      // Update the completion to false (or delete it)
      const { error } = await supabase
        .from('habit_completions')
        .upsert({
          habit_id: id,
          date: date,
          completed: false
        }, {
          onConflict: 'habit_id,date',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Return updated habit
      return await this.getById(id);
    } catch (error) {
      console.error('Error marking habit incomplete:', error);
      return undefined;
    }
  },

  async getHabitCompletions(id: string, startDate?: string, endDate?: string): Promise<string[]> {
    try {
      let query = supabase
        .from('habit_completions')
        .select('date')
        .eq('habit_id', id)
        .eq('completed', true)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(completion => completion.date) || [];
    } catch (error) {
      console.error('Error fetching habit completions:', error);
      return [];
    }
  },

  async getHabitStats(id: string): Promise<{
    totalCompletions: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  }> {
    try {
      const habit = await this.getById(id);
      if (!habit) {
        return {
          totalCompletions: 0,
          currentStreak: 0,
          longestStreak: 0,
          completionRate: 0
        };
      }

      // Get completed dates
      const completedDates = Object.keys(habit.completions)
        .filter(date => habit.completions[date])
        .sort();

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      let checkDate = today;
      
      while (habit.completions[checkDate]) {
        currentStreak++;
        const date = new Date(checkDate);
        date.setDate(date.getDate() - 1);
        checkDate = date.toISOString().split('T')[0];
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < completedDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevDate = new Date(completedDates[i - 1]);
          const currDate = new Date(completedDates[i]);
          const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      // Calculate completion rate
      const daysSinceCreation = Math.ceil(
        (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      const expectedCompletions = Math.max(1, Math.floor(daysSinceCreation * habit.targetFrequency / 7));
      const completionRate = Math.min(100, (habit.totalCompletions / expectedCompletions) * 100);

      return {
        totalCompletions: habit.totalCompletions,
        currentStreak,
        longestStreak,
        completionRate: Math.round(completionRate * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating habit stats:', error);
      return {
        totalCompletions: 0,
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0
      };
    }
  }
};
