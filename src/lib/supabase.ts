import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (admin)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export type Database = {
  public: {
    Tables: {
      visitors: {
        Row: {
          id: string
          created_at: string
          ip_address: string
          country: string
          country_code: string
          city: string
          user_agent: string
          path: string
          is_bot: boolean
          is_intrusion_attempt: boolean
          intrusion_type: string | null
        }
        Insert: Omit<Database['public']['Tables']['visitors']['Row'], 'id' | 'created_at'>
      }
      registrations: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string
          island: string
          ip_address: string
          country: string
        }
        Insert: Omit<Database['public']['Tables']['registrations']['Row'], 'id' | 'created_at'>
      }
    }
  }
}
