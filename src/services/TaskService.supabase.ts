import { supabase, handleSupabaseError, formatDateForSupabase } from '../lib/supabase'
import { Task, TaskInsert, TaskUpdate } from '../types/Database'

export const TaskService = {
  async getAll(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  },

  async getById(id: string): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching task:', error)
      return null
    }
  },

  async getByDate(date: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('calendar_date', date)
        .order('created_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by date:', error)
      return []
    }
  },

  async create(taskData: Omit<TaskInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          tags: taskData.tags || [],
          linked_note_ids: taskData.linked_note_ids || []
        }])
        .select()
        .single()
      
      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  async update(id: string, updates: TaskUpdate): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) handleSupabaseError(error)
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    }
  },

  async markComplete(id: string): Promise<Task | null> {
    return this.update(id, { completed: true })
  },

  async markIncomplete(id: string): Promise<Task | null> {
    return this.update(id, { completed: false })
  },

  async searchByTitle(query: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error searching tasks:', error)
      return []
    }
  },

  async getByPriority(priority: 'low' | 'medium' | 'high'): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('priority', priority)
        .order('created_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by priority:', error)
      return []
    }
  },

  async getOverdue(): Promise<Task[]> {
    try {
      const today = formatDateForSupabase(new Date())
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .lt('due_date', today)
        .eq('completed', false)
        .order('due_date', { ascending: true })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching overdue tasks:', error)
      return []
    }
  },

  async getUpcoming(days: number = 7): Promise<Task[]> {
    try {
      const today = new Date()
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + days)
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('due_date', formatDateForSupabase(today))
        .lte('due_date', formatDateForSupabase(futureDate))
        .eq('completed', false)
        .order('due_date', { ascending: true })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error)
      return []
    }
  }
}
