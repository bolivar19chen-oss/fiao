export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      business_members: {
        Row: {
          business_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          corregimiento_code: string | null
          created_at: string
          district_code: string | null
          id: string
          legal_name: string | null
          legal_rep_id: string | null
          legal_rep_name: string | null
          legal_structure: string | null
          name: string
          operating_notice: string | null
          province_code: string | null
          ruc: string | null
          ruc_dv: string | null
        }
        Insert: {
          address?: string | null
          corregimiento_code?: string | null
          created_at?: string
          district_code?: string | null
          id?: string
          legal_name?: string | null
          legal_rep_id?: string | null
          legal_rep_name?: string | null
          legal_structure?: string | null
          name: string
          operating_notice?: string | null
          province_code?: string | null
          ruc?: string | null
          ruc_dv?: string | null
        }
        Update: {
          address?: string | null
          corregimiento_code?: string | null
          created_at?: string
          district_code?: string | null
          id?: string
          legal_name?: string | null
          legal_rep_id?: string | null
          legal_rep_name?: string | null
          legal_structure?: string | null
          name?: string
          operating_notice?: string | null
          province_code?: string | null
          ruc?: string | null
          ruc_dv?: string | null
        }
        Relationships: []
      }
      customer_invites: {
        Row: {
          business_id: string
          code_hash: string
          created_at: string
          created_by: string | null
          customer_id: string
          expires_at: string
          id: string
          redeemed_at: string | null
          redeemed_by: string | null
        }
        Insert: {
          business_id: string
          code_hash: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          expires_at: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Update: {
          business_id?: string
          code_hash?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          expires_at?: string
          id?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_invites_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_invites_customer_id_business_id_fkey"
            columns: ["customer_id", "business_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          credit_score: number | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          credit_score?: number | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          credit_score?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      installments: {
        Row: {
          amount_cents: number
          business_id: string
          due_date: string
          id: string
          number: number
          sale_id: string
        }
        Insert: {
          amount_cents: number
          business_id: string
          due_date: string
          id?: string
          number: number
          sale_id: string
        }
        Update: {
          amount_cents?: number
          business_id?: string
          due_date?: string
          id?: string
          number?: number
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installments_sale_id_business_id_fkey"
            columns: ["sale_id", "business_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      panama_divisions: {
        Row: {
          code: string
          kind: string
          name: string
          parent_code: string | null
          source_version: string
        }
        Insert: {
          code: string
          kind: string
          name: string
          parent_code?: string | null
          source_version: string
        }
        Update: {
          code?: string
          kind?: string
          name?: string
          parent_code?: string | null
          source_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "panama_divisions_parent_code_fkey"
            columns: ["parent_code"]
            isOneToOne: false
            referencedRelation: "panama_divisions"
            referencedColumns: ["code"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          business_id: string
          client_token: string
          created_by: string | null
          id: string
          method: string
          paid_at: string
          provider_ref: string | null
          sale_id: string
        }
        Insert: {
          amount_cents: number
          business_id: string
          client_token?: string
          created_by?: string | null
          id?: string
          method?: string
          paid_at?: string
          provider_ref?: string | null
          sale_id: string
        }
        Update: {
          amount_cents?: number
          business_id?: string
          client_token?: string
          created_by?: string | null
          id?: string
          method?: string
          paid_at?: string
          provider_ref?: string | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_sale_id_business_id_fkey"
            columns: ["sale_id", "business_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      products: {
        Row: {
          business_id: string
          created_at: string
          id: string
          low_stock_threshold: number
          name: string
          price_cents: number
          stock: number
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name: string
          price_cents: number
          stock?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          low_stock_threshold?: number
          name?: string
          price_cents?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string
          full_name: string
          national_id: string
          phone: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          full_name: string
          national_id: string
          phone: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          full_name?: string
          national_id?: string
          phone?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          business_id: string
          id: string
          product_id: string
          quantity: number
          sale_id: string
          unit_price_cents: number
        }
        Insert: {
          business_id: string
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          unit_price_cents: number
        }
        Update: {
          business_id?: string
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_business_id_fkey"
            columns: ["product_id", "business_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_business_id_fkey"
            columns: ["sale_id", "business_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      sales: {
        Row: {
          balance_cents: number
          business_id: string
          created_at: string
          customer_id: string
          id: string
          total_cents: number
        }
        Insert: {
          balance_cents: number
          business_id: string
          created_at?: string
          customer_id: string
          id?: string
          total_cents: number
        }
        Update: {
          balance_cents?: number
          business_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_business_id_fkey"
            columns: ["customer_id", "business_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_business_onboarding: {
        Args: {
          p_address: string
          p_corregimiento_code: string
          p_date_of_birth: string
          p_district_code: string
          p_full_name: string
          p_legal_name: string
          p_legal_rep_id: string
          p_legal_rep_name: string
          p_legal_structure: string
          p_national_id: string
          p_operating_notice: string
          p_phone: string
          p_province_code: string
          p_ruc: string
          p_ruc_dv: string
          p_trade_name: string
        }
        Returns: string
      }
      create_business: { Args: { p_name: string }; Returns: string }
      create_customer_invite: {
        Args: { p_customer_id: string; p_ttl_minutes?: number }
        Returns: string
      }
      hash_invite_code: { Args: { p_code: string }; Returns: string }
      is_customer: { Args: { p_customer_id: string }; Returns: boolean }
      is_member: { Args: { p_business_id: string }; Returns: boolean }
      is_owner: { Args: { p_business_id: string }; Returns: boolean }
      is_sale_customer: { Args: { p_sale_id: string }; Returns: boolean }
      redeem_customer_invite: { Args: { p_code: string }; Returns: string }
      register_payment: {
        Args: {
          p_amount_cents: number
          p_client_token: string
          p_method: string
          p_provider_ref?: string
          p_sale_id: string
        }
        Returns: string
      }
      update_business_legal: {
        Args: {
          p_address: string
          p_business_id: string
          p_corregimiento_code: string
          p_district_code: string
          p_legal_name: string
          p_legal_rep_id: string
          p_legal_rep_name: string
          p_legal_structure: string
          p_operating_notice: string
          p_province_code: string
          p_ruc: string
          p_ruc_dv: string
        }
        Returns: undefined
      }
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
    keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
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
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
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
