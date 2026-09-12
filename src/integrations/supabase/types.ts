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
      connected_accounts: {
        Row: {
          connected_at: string
          display_name: string | null
          email: string
          id: string
          is_active: boolean
          platform: string
          storage_total: number
          storage_used: number
          user_id: string
        }
        Insert: {
          connected_at?: string
          display_name?: string | null
          email: string
          id?: string
          is_active?: boolean
          platform: string
          storage_total?: number
          storage_used?: number
          user_id: string
        }
        Update: {
          connected_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean
          platform?: string
          storage_total?: number
          storage_used?: number
          user_id?: string
        }
        Relationships: []
      }
      file_shares: {
        Row: {
          created_at: string
          expires_at: string
          file_id: string
          id: string
          recipient: string | null
          revoked: boolean
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          file_id: string
          id?: string
          recipient?: string | null
          revoked?: boolean
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          file_id?: string
          id?: string
          recipient?: string | null
          revoked?: boolean
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_shares_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_text_index: {
        Row: {
          content: string
          created_at: string
          file_id: string
          id: string
          status: string
          tsv: unknown
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          file_id: string
          id?: string
          status?: string
          tsv?: unknown
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_id?: string
          id?: string
          status?: string
          tsv?: unknown
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_text_index_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: true
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          created_at: string
          file_id: string
          filename: string
          id: string
          is_current: boolean
          note: string | null
          size_bytes: number
          source_provider: string
          storage_path: string | null
          user_id: string
          version_no: number
        }
        Insert: {
          created_at?: string
          file_id: string
          filename: string
          id?: string
          is_current?: boolean
          note?: string | null
          size_bytes?: number
          source_provider?: string
          storage_path?: string | null
          user_id: string
          version_no?: number
        }
        Update: {
          created_at?: string
          file_id?: string
          filename?: string
          id?: string
          is_current?: boolean
          note?: string | null
          size_bytes?: number
          source_provider?: string
          storage_path?: string | null
          user_id?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          cloud_path: string | null
          deleted_at: string | null
          file_type: string | null
          filename: string
          id: string
          is_duplicate: boolean
          last_modified: string
          size_bytes: number
          source_account_id: string | null
          source_provider: string
          storage_path: string | null
          thumbnail_url: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          cloud_path?: string | null
          deleted_at?: string | null
          file_type?: string | null
          filename: string
          id?: string
          is_duplicate?: boolean
          last_modified?: string
          size_bytes?: number
          source_account_id?: string | null
          source_provider?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          cloud_path?: string | null
          deleted_at?: string | null
          file_type?: string | null
          filename?: string
          id?: string
          is_duplicate?: boolean
          last_modified?: string
          size_bytes?: number
          source_account_id?: string | null
          source_provider?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_metadata_account_id_fkey"
            columns: ["source_account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_optimize: boolean
          compact_view: boolean
          created_at: string
          dark_mode: boolean
          default_upload_destination: string | null
          encryption_enabled: boolean
          id: string
          smart_split: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_optimize?: boolean
          compact_view?: boolean
          created_at?: string
          dark_mode?: boolean
          default_upload_destination?: string | null
          encryption_enabled?: boolean
          id?: string
          smart_split?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_optimize?: boolean
          compact_view?: boolean
          created_at?: string
          dark_mode?: boolean
          default_upload_destination?: string | null
          encryption_enabled?: boolean
          id?: string
          smart_split?: boolean
          updated_at?: string
          user_id?: string
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
