import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kivgnlegwnftefuipald.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdmdubGVnd25mdGVmdWlwYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTYwNzQsImV4cCI6MjA2NjAzMjA3NH0.wv_wFmseu4YrXzjImcyDIuvX3t6zLl7ZvfDAHRmRJ5E'

// Get the current app URL for redirect configuration
export const getAppUrl = () => {
  return import.meta.env.VITE_APP_URL ||
         (import.meta.env.DEV ? 'http://localhost:8080' : 'https://www.gosubtle.app')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      session_bridge_tokens: {
        Row: {
          id: string
          bridge_token: string
          user_id: string
          session_data: any
          client_ip: string | null
          user_agent: string | null
          expires_at: string
          used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bridge_token: string
          user_id: string
          session_data: any
          client_ip?: string | null
          user_agent?: string | null
          expires_at: string
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bridge_token?: string
          user_id?: string
          session_data?: any
          client_ip?: string | null
          user_agent?: string | null
          expires_at?: string
          used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_sync_logs: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_source: string
          data: any
          client_ip: string | null
          user_agent: string | null
          success: boolean
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_source?: string
          data?: any
          client_ip?: string | null
          user_agent?: string | null
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_source?: string
          data?: any
          client_ip?: string | null
          user_agent?: string | null
          success?: boolean
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      exchange_bridge_token: {
        Args: {
          bridge_token_param: string
          client_ip?: string
          user_agent_param?: string
        }
        Returns: any
      }
      log_session_sync_event: {
        Args: {
          user_id_param: string
          event_type_param: string
          event_source_param?: string
          data_param?: any
          client_ip_param?: string
          user_agent_param?: string
          success_param?: boolean
          error_message_param?: string
        }
        Returns: string
      }
      sync_session_status: {
        Args: {
          user_id_param: string
          session_data_param: any
        }
        Returns: any
      }
    }
  }
}