// Generated types would normally come from: supabase gen types typescript --project-id <id>
// This stub is hand-maintained until the project is linked to a live Supabase instance.
// Keep in sync with supabase/migrations/*.sql

export type Database = {
  public: {
    Tables: {
      households: {
        Row: {
          id: string
          name: string
          invite_code: string
          is_beta: boolean
          plan: 'free' | 'paid'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          grandfathered_price: number | null
          subscribed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code?: string
          is_beta?: boolean
          plan?: 'free' | 'paid'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          grandfathered_price?: number | null
          subscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['households']['Insert']>
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: 'owner' | 'member'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          role?: 'owner' | 'member'
          invited_by?: string | null
          joined_at?: string
        }
        Update: Partial<Database['public']['Tables']['household_members']['Insert']>
      }
      items: {
        Row: {
          id: string
          household_id: string
          created_by: string
          name: string
          category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'brooch' | 'watch' | 'other'
          given_by: string | null
          headline: string | null
          story: string | null
          acquired_era: string | null
          estimated_value_cents: number | null
          appraisal_doc_url: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          created_by: string
          name: string
          category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'brooch' | 'watch' | 'other'
          given_by?: string | null
          headline?: string | null
          story?: string | null
          acquired_era?: string | null
          estimated_value_cents?: number | null
          appraisal_doc_url?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      item_attributes: {
        Row: {
          id: string
          item_id: string
          attribute_name: string
          attribute_value: string
          order_index: number
        }
        Insert: {
          id?: string
          item_id: string
          attribute_name: string
          attribute_value: string
          order_index?: number
        }
        Update: Partial<Database['public']['Tables']['item_attributes']['Insert']>
      }
      item_photos: {
        Row: {
          id: string
          item_id: string
          photo_url: string
          is_primary: boolean
          caption: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          photo_url: string
          is_primary?: boolean
          caption?: string | null
          order_index?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['item_photos']['Insert']>
      }
      lookup_attempts: {
        Row: {
          id: string
          household_id: string
          attempted_by: string
          candidate_item_ids: string[] | null
          selected_item_id: string | null
          was_correct_top_match: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          attempted_by: string
          candidate_item_ids?: string[] | null
          selected_item_id?: string | null
          was_correct_top_match?: boolean | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['lookup_attempts']['Insert']>
      }
    }
    Functions: {
      get_my_household_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}
