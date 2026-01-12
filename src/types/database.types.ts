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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          battle_tag: string | null
          class_id: string
          created_at: string
          discord_id: string | null
          id: string
          level: number | null
          motivation: string | null
          name: string
          race: string | null
          raid_experience: string | null
          realm: string | null
          screenshot_url: string | null
          spec_id: string
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string
          user_id: string | null
          warcraftlogs_link: string | null
          why_jsc: string | null
          wlogs_color: string | null
          wlogs_score: number | null
        }
        Insert: {
          about_me?: string | null
          avatar_url?: string | null
          battle_tag?: string | null
          class_id: string
          created_at?: string
          discord_id?: string | null
          id?: string
          level?: number | null
          motivation?: string | null
          name: string
          race?: string | null
          raid_experience?: string | null
          realm?: string | null
          screenshot_url?: string | null
          spec_id: string
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          user_id?: string | null
          warcraftlogs_link?: string | null
          why_jsc?: string | null
          wlogs_color?: string | null
          wlogs_score?: number | null
        }
        Update: {
          about_me?: string | null
          avatar_url?: string | null
          battle_tag?: string | null
          class_id?: string
          created_at?: string
          discord_id?: string | null
          id?: string
          level?: number | null
          motivation?: string | null
          name?: string
          race?: string | null
          raid_experience?: string | null
          realm?: string | null
          screenshot_url?: string | null
          spec_id?: string
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          user_id?: string | null
          warcraftlogs_link?: string | null
          why_jsc?: string | null
          wlogs_color?: string | null
          wlogs_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "wow_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_spec_id_fkey"
            columns: ["spec_id"]
            isOneToOne: false
            referencedRelation: "wow_specs"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          email: string
          id: string
          last_seen: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          last_seen?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_seen?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      officer_notes: {
        Row: {
          author_id: string
          candidate_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          author_id: string
          candidate_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          author_id?: string
          candidate_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "officer_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_notes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          vote: Database["public"]["Enums"]["vote_type"]
          voter_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          vote: Database["public"]["Enums"]["vote_type"]
          voter_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          vote?: Database["public"]["Enums"]["vote_type"]
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      wow_classes: {
        Row: {
          color: string
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          color: string
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      wow_specs: {
        Row: {
          class_id: string
          id: string
          name: string
          role: string
        }
        Insert: {
          class_id: string
          id?: string
          name: string
          role: string
        }
        Update: {
          class_id?: string
          id?: string
          name?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "wow_specs_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "wow_classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      candidate_status: "pending" | "accepted" | "rejected" | "waitlist"
      user_role: "pending" | "member" | "officer" | "gm"
      vote_type: "yes" | "no" | "neutral"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      candidate_status: ["pending", "accepted", "rejected", "waitlist"],
      user_role: ["pending", "member", "officer", "gm"],
      vote_type: ["yes", "no", "neutral"],
    },
  },
} as const
