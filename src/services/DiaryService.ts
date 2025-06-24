import { supabase, handleSupabaseError, formatDateForSupabase } from '../lib/supabase'
import { DiaryEntry, DiaryEntryInsert, DiaryEntryUpdate } from '../types/Database'

export const DiaryService = {
  async getAll(): Promise<DiaryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching diary entries:', error)
      return []
    }
  },

  async getById(id: string): Promise<DiaryEntry | null> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching diary entry:', error)
      return null
    }
  },

  async getByDate(date: string): Promise<DiaryEntry | null> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('date', date)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching diary entry by date:', error)
      return null
    }
  },

  async create(entryData: Omit<DiaryEntryInsert, 'id' | 'created_at' | 'updated_at'>): Promise<DiaryEntry> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .insert([{
          ...entryData,
          tags: entryData.tags || [],
          linked_note_ids: entryData.linked_note_ids || []
        }])
        .select()
        .single()
      
      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error creating diary entry:', error)
      throw error
    }
  },

  async update(id: string, updates: DiaryEntryUpdate): Promise<DiaryEntry | null> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
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
      console.error('Error updating diary entry:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
      
      if (error) handleSupabaseError(error)
      return true
    } catch (error) {
      console.error('Error deleting diary entry:', error)
      return false
    }
  },

  async getByDateRange(startDate: string, endDate: string): Promise<DiaryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching diary entries by date range:', error)
      return []
    }
  },

  async getByMood(mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'): Promise<DiaryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('mood', mood)
        .order('date', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching diary entries by mood:', error)
      return []
    }
  },

  async searchByContent(query: string): Promise<DiaryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('date', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error searching diary entries:', error)
      return []
    }
  },

  async getRecent(limit: number = 5): Promise<DiaryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit)
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching recent diary entries:', error)
      return []
    }
  },

  async getMoodStats(days: number = 30): Promise<Record<string, number>> {
    try {
      const endDate = new Date()
      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - days)
      
      const entries = await this.getByDateRange(
        formatDateForSupabase(startDate),
        formatDateForSupabase(endDate)
      )
      
      const moodCounts: Record<string, number> = {
        great: 0,
        good: 0,
        neutral: 0,
        bad: 0,
        terrible: 0
      }
      
      entries.forEach(entry => {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
        }
      })
      
      return moodCounts
    } catch (error) {
      console.error('Error fetching mood stats:', error)
      return {}
    }
  },

  async getStreakInfo(): Promise<{ currentStreak: number; bestStreak: number }> {
    try {
      const entries = await this.getAll()
      
      if (entries.length === 0) {
        return { currentStreak: 0, bestStreak: 0 }
      }
      
      // Sort by date ascending
      const sortedEntries = entries.sort((a, b) => a.date.localeCompare(b.date))
      
      let currentStreak = 0
      let bestStreak = 0
      let tempStreak = 1
      
      // Calculate current streak from today backwards
      const today = formatDateForSupabase(new Date())
      const todayEntry = entries.find(e => e.date === today)
      
      if (todayEntry) {
        currentStreak = 1
        let checkDate = new Date()
        checkDate.setDate(checkDate.getDate() - 1)
        
        while (true) {
          const dateStr = formatDateForSupabase(checkDate)
          const entryExists = entries.find(e => e.date === dateStr)
          
          if (entryExists) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }
      }
      
      // Calculate best streak
      for (let i = 1; i < sortedEntries.length; i++) {
        const prevDate = new Date(sortedEntries[i - 1].date)
        const currDate = new Date(sortedEntries[i].date)
        
        // Check if dates are consecutive
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayDiff === 1) {
          tempStreak++
        } else {
          bestStreak = Math.max(bestStreak, tempStreak)
          tempStreak = 1
        }
      }
      
      bestStreak = Math.max(bestStreak, tempStreak, currentStreak)
      
      return { currentStreak, bestStreak }
    } catch (error) {
      console.error('Error calculating streak info:', error)
      return { currentStreak: 0, bestStreak: 0 }
    }
  }
}
