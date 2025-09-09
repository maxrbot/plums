import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our waitlist table
export interface WaitlistEntry {
  id?: number
  email: string
  created_at?: string
  source?: string
  utm_source?: string
  utm_campaign?: string
  utm_medium?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
}

// Function to add email to waitlist
export async function addToWaitlist(data: Omit<WaitlistEntry, 'id' | 'created_at'>) {
  const { data: result, error } = await supabase
    .from('waitlist')
    .insert([data])
    .select()
    .single()

  if (error) {
    throw error
  }

  return result
}

// Function to check if email already exists
export async function checkEmailExists(email: string) {
  const { data, error } = await supabase
    .from('waitlist')
    .select('email')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error
  }

  return !!data
}
