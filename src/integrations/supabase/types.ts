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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      notifications: {
        Row: {
          body: string
          created_at: string
          event_id: string | null
          id: string
          is_read: boolean
          parcel_id: string | null
          push_attempted_at: string | null
          push_status: string
          title: string
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean
          parcel_id?: string | null
          push_attempted_at?: string | null
          push_status?: string
          title: string
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          event_id?: string | null
          id?: string
          is_read?: boolean
          parcel_id?: string | null
          push_attempted_at?: string | null
          push_status?: string
          title?: string
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tracking_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      parcel_watches: {
        Row: {
          created_at: string
          parcel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          parcel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          parcel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parcel_watches_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          declared_value: number
          description: string | null
          destination_city: string
          destination_code: string
          estimated_delivery: string
          id: string
          is_demo: boolean
          origin_city: string
          origin_code: string
          payment_method: string | null
          recipient_address: string
          recipient_name: string
          recipient_phone: string
          sender_address: string
          sender_name: string
          service_type: string
          status: string
          tracking_number: string
          weight_kg: number
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          declared_value?: number
          description?: string | null
          destination_city: string
          destination_code: string
          estimated_delivery?: string
          id?: string
          is_demo?: boolean
          origin_city: string
          origin_code: string
          payment_method?: string | null
          recipient_address: string
          recipient_name: string
          recipient_phone: string
          sender_address: string
          sender_name: string
          service_type?: string
          status?: string
          tracking_number?: string
          weight_kg: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          declared_value?: number
          description?: string | null
          destination_city?: string
          destination_code?: string
          estimated_delivery?: string
          id?: string
          is_demo?: boolean
          origin_city?: string
          origin_code?: string
          payment_method?: string | null
          recipient_address?: string
          recipient_name?: string
          recipient_phone?: string
          sender_address?: string
          sender_name?: string
          service_type?: string
          status?: string
          tracking_number?: string
          weight_kg?: number
        }
        Relationships: []
      }
      post_offices: {
        Row: {
          address: string
          city: string
          hours: string
          id: string
          is_demo: boolean
          lat: number
          lng: number
          name: string
          phone: string | null
        }
        Insert: {
          address: string
          city: string
          hours: string
          id?: string
          is_demo?: boolean
          lat: number
          lng: number
          name: string
          phone?: string | null
        }
        Update: {
          address?: string
          city?: string
          hours?: string
          id?: string
          is_demo?: boolean
          lat?: number
          lng?: number
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          push_enabled: boolean
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          push_enabled?: boolean
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          push_enabled?: boolean
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          description: string
          id: string
          is_simulated: boolean
          location: string
          occurred_at: string
          parcel_id: string
          status: string
        }
        Insert: {
          description: string
          id?: string
          is_simulated?: boolean
          location: string
          occurred_at?: string
          parcel_id: string
          status: string
        }
        Update: {
          description?: string
          id?: string
          is_simulated?: boolean
          location?: string
          occurred_at?: string
          parcel_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_demo_parcel: { Args: { _tracking: string }; Returns: string }
      track_parcel: { Args: { _tracking: string }; Returns: Json }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
