export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      call_logs: {
        Row: {
          call_id: string | null
          campaign_id: string
          contact_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          recording_url: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          call_id?: string | null
          campaign_id: string
          contact_id: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          call_id?: string | null
          campaign_id?: string
          contact_id?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          recording_url?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          completed_calls: number
          created_at: string
          description: string | null
          id: string
          max_retries: number
          name: string
          scheduled_end: string | null
          scheduled_start: string | null
          script: string | null
          status: string
          total_contacts: number
          updated_at: string
          user_id: string
          voice_id: string | null
          voice_speed: number
        }
        Insert: {
          completed_calls?: number
          created_at?: string
          description?: string | null
          id?: string
          max_retries?: number
          name: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          script?: string | null
          status?: string
          total_contacts?: number
          updated_at?: string
          user_id: string
          voice_id?: string | null
          voice_speed?: number
        }
        Update: {
          completed_calls?: number
          created_at?: string
          description?: string | null
          id?: string
          max_retries?: number
          name?: string
          scheduled_end?: string | null
          scheduled_start?: string | null
          script?: string | null
          status?: string
          total_contacts?: number
          updated_at?: string
          user_id?: string
          voice_id?: string | null
          voice_speed?: number
        }
        Relationships: []
      }
      contacts: {
        Row: {
          call_status: string
          campaign_id: string
          created_at: string
          extra_data: Json | null
          full_name: string
          id: string
          last_called_at: string | null
          phone: string
          retry_count: number
          updated_at: string
        }
        Insert: {
          call_status?: string
          campaign_id: string
          created_at?: string
          extra_data?: Json | null
          full_name: string
          id?: string
          last_called_at?: string | null
          phone: string
          retry_count?: number
          updated_at?: string
        }
        Update: {
          call_status?: string
          campaign_id?: string
          created_at?: string
          extra_data?: Json | null
          full_name?: string
          id?: string
          last_called_at?: string | null
          phone?: string
          retry_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          call_log_id: string
          created_at: string
          id: string
          message: string
          role: string
          timestamp_seconds: number | null
          updated_at: string
        }
        Insert: {
          call_log_id: string
          created_at?: string
          id?: string
          message: string
          role: string
          timestamp_seconds?: number | null
          updated_at?: string
        }
        Update: {
          call_log_id?: string
          created_at?: string
          id?: string
          message?: string
          role?: string
          timestamp_seconds?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          points_balance: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          points_balance?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          points_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      script_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          script: string
          updated_at: string
          user_id: string
          voice_id: string | null
          voice_speed: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          script: string
          updated_at?: string
          user_id: string
          voice_id?: string | null
          voice_speed?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          script?: string
          updated_at?: string
          user_id?: string
          voice_id?: string | null
          voice_speed?: number
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          api_key: string | null
          api_provider: string
<<<<<<< HEAD
=======
          confirm_keywords: string[] | null
          confirm_response: string | null
>>>>>>> TN-Ford
          confirmation_keywords: string[]
          created_at: string
          default_script: string | null
          id: string
          max_retries: number
<<<<<<< HEAD
          rejection_keywords: string[]
          retry_interval_minutes: number
=======
          notify_campaign_success: boolean | null
          notify_low_points: boolean | null
          reject_keywords: string[] | null
          reject_response: string | null
          rejection_keywords: string[]
          retry_interval_minutes: number
          unclear_action: string | null
          unclear_response: string | null
>>>>>>> TN-Ford
          updated_at: string
          user_id: string
          voice_id: string | null
          voice_speed: number
        }
        Insert: {
          api_key?: string | null
          api_provider?: string
<<<<<<< HEAD
=======
          confirm_keywords?: string[] | null
          confirm_response?: string | null
>>>>>>> TN-Ford
          confirmation_keywords?: string[]
          created_at?: string
          default_script?: string | null
          id?: string
          max_retries?: number
<<<<<<< HEAD
          rejection_keywords?: string[]
          retry_interval_minutes?: number
=======
          notify_campaign_success?: boolean | null
          notify_low_points?: boolean | null
          reject_keywords?: string[] | null
          reject_response?: string | null
          rejection_keywords?: string[]
          retry_interval_minutes?: number
          unclear_action?: string | null
          unclear_response?: string | null
>>>>>>> TN-Ford
          updated_at?: string
          user_id: string
          voice_id?: string | null
          voice_speed?: number
        }
        Update: {
          api_key?: string | null
          api_provider?: string
<<<<<<< HEAD
=======
          confirm_keywords?: string[] | null
          confirm_response?: string | null
>>>>>>> TN-Ford
          confirmation_keywords?: string[]
          created_at?: string
          default_script?: string | null
          id?: string
          max_retries?: number
<<<<<<< HEAD
          rejection_keywords?: string[]
          retry_interval_minutes?: number
=======
          notify_campaign_success?: boolean | null
          notify_low_points?: boolean | null
          reject_keywords?: string[] | null
          reject_response?: string | null
          rejection_keywords?: string[]
          retry_interval_minutes?: number
          unclear_action?: string | null
          unclear_response?: string | null
>>>>>>> TN-Ford
          updated_at?: string
          user_id?: string
          voice_id?: string | null
          voice_speed?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
