// filepath: /home/darelife/Desktop/prog/projectam/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/Database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error)
  throw new Error(error.message || 'Database operation failed')
}

// Utility function to format dates for Supabase
export function formatDateForSupabase(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Utility function to parse Supabase dates
export function parseSupabaseDate(dateString: string): Date {
  return new Date(dateString)
}