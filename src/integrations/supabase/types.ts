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
      empresas: {
        Row: {
          created_at: string | null
          data_fundacao: string | null
          estagio: string | null
          id: string
          nome: string
          num_funcionarios: number | null
          segmento: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          data_fundacao?: string | null
          estagio?: string | null
          id?: string
          nome: string
          num_funcionarios?: number | null
          segmento?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          data_fundacao?: string | null
          estagio?: string | null
          id?: string
          nome?: string
          num_funcionarios?: number | null
          segmento?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          data_criacao: string | null
          data_resolucao: string | null
          descricao: string
          empresa_id: string | null
          id: string
          prioridade: string
          status: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          data_criacao?: string | null
          data_resolucao?: string | null
          descricao: string
          empresa_id?: string | null
          id?: string
          prioridade: string
          status?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          data_criacao?: string | null
          data_resolucao?: string | null
          descricao?: string
          empresa_id?: string | null
          id?: string
          prioridade?: string
          status?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      integracoes_bancarias: {
        Row: {
          created_at: string | null
          detalhes: Json | null
          empresa_id: string | null
          id: string
          nome_banco: string
          status: string
          tipo_conexao: string
          ultimo_sincronismo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          detalhes?: Json | null
          empresa_id?: string | null
          id?: string
          nome_banco: string
          status: string
          tipo_conexao: string
          ultimo_sincronismo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          detalhes?: Json | null
          empresa_id?: string | null
          id?: string
          nome_banco?: string
          status?: string
          tipo_conexao?: string
          ultimo_sincronismo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integracoes_bancarias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas: {
        Row: {
          burn_rate: number | null
          caixa_atual: number | null
          cash_flow: number | null
          created_at: string | null
          data_referencia: string
          empresa_id: string | null
          id: string
          mrr_growth: number | null
          receita_mensal: number | null
          runway_meses: number | null
          updated_at: string | null
        }
        Insert: {
          burn_rate?: number | null
          caixa_atual?: number | null
          cash_flow?: number | null
          created_at?: string | null
          data_referencia: string
          empresa_id?: string | null
          id?: string
          mrr_growth?: number | null
          receita_mensal?: number | null
          runway_meses?: number | null
          updated_at?: string | null
        }
        Update: {
          burn_rate?: number | null
          caixa_atual?: number | null
          cash_flow?: number | null
          created_at?: string | null
          data_referencia?: string
          empresa_id?: string | null
          id?: string
          mrr_growth?: number | null
          receita_mensal?: number | null
          runway_meses?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          categoria: string
          created_at: string | null
          data_transacao: string
          descricao: string
          empresa_id: string | null
          id: string
          metodo_pagamento: string | null
          recorrente: boolean | null
          tipo: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data_transacao: string
          descricao: string
          empresa_id?: string | null
          id?: string
          metodo_pagamento?: string | null
          recorrente?: boolean | null
          tipo: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data_transacao?: string
          descricao?: string
          empresa_id?: string | null
          id?: string
          metodo_pagamento?: string | null
          recorrente?: boolean | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_owner_of_empresa: {
        Args: {
          empresa_uuid: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
