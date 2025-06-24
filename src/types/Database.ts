export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          completed: boolean
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          calendar_date: string | null
          tags: string[]
          linked_note_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          calendar_date?: string | null
          tags?: string[]
          linked_note_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          completed?: boolean
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          calendar_date?: string | null
          tags?: string[]
          linked_note_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          tags: string[]
          linked_note_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string
          tags?: string[]
          linked_note_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          tags?: string[]
          linked_note_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      diary_entries: {
        Row: {
          id: string
          title: string
          content: string
          mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | null
          date: string
          tags: string[]
          linked_note_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string
          mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | null
          date: string
          tags?: string[]
          linked_note_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | null
          date?: string
          tags?: string[]
          linked_note_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          color: string
          target_frequency: number
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          icon?: string
          color?: string
          target_frequency?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          color?: string
          target_frequency?: number
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          date: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          date: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          date?: string
          completed?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Helper types for easier usage
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']

export type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']
export type DiaryEntryInsert = Database['public']['Tables']['diary_entries']['Insert']
export type DiaryEntryUpdate = Database['public']['Tables']['diary_entries']['Update']

export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitInsert = Database['public']['Tables']['habits']['Insert']
export type HabitUpdate = Database['public']['Tables']['habits']['Update']

export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']
export type HabitCompletionInsert = Database['public']['Tables']['habit_completions']['Insert']
export type HabitCompletionUpdate = Database['public']['Tables']['habit_completions']['Update']
