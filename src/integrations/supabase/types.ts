export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          created_at: string
          crop_suggestions: string[] | null
          id: string
          irrigation_summary: Json | null
          recommendations: string[] | null
          report_date: string
          sensor_summary: Json | null
          sent_at: string | null
          user_id: string
          weather_summary: Json | null
        }
        Insert: {
          created_at?: string
          crop_suggestions?: string[] | null
          id?: string
          irrigation_summary?: Json | null
          recommendations?: string[] | null
          report_date: string
          sensor_summary?: Json | null
          sent_at?: string | null
          user_id: string
          weather_summary?: Json | null
        }
        Update: {
          created_at?: string
          crop_suggestions?: string[] | null
          id?: string
          irrigation_summary?: Json | null
          recommendations?: string[] | null
          report_date?: string
          sensor_summary?: Json | null
          sent_at?: string | null
          user_id?: string
          weather_summary?: Json | null
        }
        Relationships: []
      }
      irrigation_logs: {
        Row: {
          created_at: string
          duration_minutes: number
          humidity: number | null
          id: string
          soil_moisture_after: number | null
          soil_moisture_before: number | null
          temperature: number | null
          user_id: string
          water_amount_liters: number
          zone: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          humidity?: number | null
          id?: string
          soil_moisture_after?: number | null
          soil_moisture_before?: number | null
          temperature?: number | null
          user_id: string
          water_amount_liters: number
          zone: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          humidity?: number | null
          id?: string
          soil_moisture_after?: number | null
          soil_moisture_before?: number | null
          temperature?: number | null
          user_id?: string
          water_amount_liters?: number
          zone?: string
        }
        Relationships: []
      }
      kenyan_locations: {
        Row: {
          county: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          sub_county: string
          ward: string
        }
        Insert: {
          county: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          sub_county: string
          ward: string
        }
        Update: {
          county?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          sub_county?: string
          ward?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          id: string
          order_notes: string | null
          product_id: string
          quantity: number
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          order_notes?: string | null
          product_id: string
          quantity: number
          status?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          id?: string
          order_notes?: string | null
          product_id?: string
          quantity?: number
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vendor_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_messages: {
        Row: {
          expires_at: string
          id: string
          message_type: string
          otp_code: string
          phone_number: string
          sent_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          message_type: string
          otp_code: string
          phone_number: string
          sent_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          message_type?: string
          otp_code?: string
          phone_number?: string
          sent_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          county: string | null
          created_at: string
          crop_types: string[] | null
          farm_name: string | null
          farm_size_acres: number | null
          full_name: string | null
          id: string
          phone_number: string | null
          profile_picture_url: string | null
          sub_county: string | null
          updated_at: string
          ward: string | null
        }
        Insert: {
          county?: string | null
          created_at?: string
          crop_types?: string[] | null
          farm_name?: string | null
          farm_size_acres?: number | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          profile_picture_url?: string | null
          sub_county?: string | null
          updated_at?: string
          ward?: string | null
        }
        Update: {
          county?: string | null
          created_at?: string
          crop_types?: string[] | null
          farm_name?: string | null
          farm_size_acres?: number | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          sub_county?: string | null
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      registered_sensors: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          last_ping: string | null
          location_zone: string
          name: string
          sensor_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          last_ping?: string | null
          location_zone: string
          name: string
          sensor_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          last_ping?: string | null
          location_zone?: string
          name?: string
          sensor_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sensor_data: {
        Row: {
          created_at: string
          id: string
          location_zone: string | null
          sensor_type: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          location_zone?: string | null
          sensor_type: string
          unit: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          location_zone?: string | null
          sensor_type?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          price: number | null
          product_name: string
          stock_quantity: number | null
          unit: string | null
          vendor_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          product_name: string
          stock_quantity?: number | null
          unit?: string | null
          vendor_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          product_name?: string
          stock_quantity?: number | null
          unit?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          rating: number | null
          specialization: string[] | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          rating?: number | null
          specialization?: string[] | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          rating?: number | null
          specialization?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
