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
      documentos: {
        Row: {
          arquivo_url: string
          created_at: string
          empresa_id: string
          id: string
          nome: string
          tamanho: number
          tipo: string
          updated_at: string | null
        }
        Insert: {
          arquivo_url: string
          created_at?: string
          empresa_id: string
          id?: string
          nome: string
          tamanho: number
          tipo: string
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string
          created_at?: string
          empresa_id?: string
          id?: string
          nome?: string
          tamanho?: number
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string
          data_fundacao: string | null
          estagio: string | null
          id: string
          logo_url: string | null
          nome: string
          num_funcionarios: number | null
          segmento: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          data_fundacao?: string | null
          estagio?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          num_funcionarios?: number | null
          segmento?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          data_fundacao?: string | null
          estagio?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          num_funcionarios?: number | null
          segmento?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      insights: {
        Row: {
          data_criacao: string
          data_resolucao: string | null
          descricao: string
          empresa_id: string
          id: string
          prioridade: string
          status: string
          tipo: string
          titulo: string
        }
        Insert: {
          data_criacao?: string
          data_resolucao?: string | null
          descricao: string
          empresa_id: string
          id?: string
          prioridade: string
          status: string
          tipo: string
          titulo: string
        }
        Update: {
          data_criacao?: string
          data_resolucao?: string | null
          descricao?: string
          empresa_id?: string
          id?: string
          prioridade?: string
          status?: string
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
          created_at: string
          detalhes: Json | null
          empresa_id: string
          id: string
          nome_banco: string
          status: string
          tipo_conexao: string
          ultimo_sincronismo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          detalhes?: Json | null
          empresa_id: string
          id?: string
          nome_banco: string
          status: string
          tipo_conexao: string
          ultimo_sincronismo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          detalhes?: Json | null
          empresa_id?: string
          id?: string
          nome_banco?: string
          status?: string
          tipo_conexao?: string
          ultimo_sincronismo?: string | null
          updated_at?: string
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
          created_at: string
          data_referencia: string
          empresa_id: string
          id: string
          mrr_growth: number | null
          receita_mensal: number | null
          runway_meses: number | null
          updated_at: string
        }
        Insert: {
          burn_rate?: number | null
          caixa_atual?: number | null
          cash_flow?: number | null
          created_at?: string
          data_referencia: string
          empresa_id: string
          id?: string
          mrr_growth?: number | null
          receita_mensal?: number | null
          runway_meses?: number | null
          updated_at?: string
        }
        Update: {
          burn_rate?: number | null
          caixa_atual?: number | null
          cash_flow?: number | null
          created_at?: string
          data_referencia?: string
          empresa_id?: string
          id?: string
          mrr_growth?: number | null
          receita_mensal?: number | null
          runway_meses?: number | null
          updated_at?: string
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
          avatar_url: string | null
          bio: string | null
          cargo: string | null
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cargo?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          categoria: string
          created_at: string
          data_transacao: string
          descricao: string
          empresa_id: string
          id: string
          metodo_pagamento: string | null
          recorrente: boolean | null
          tipo: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data_transacao: string
          descricao: string
          empresa_id: string
          id?: string
          metodo_pagamento?: string | null
          recorrente?: boolean | null
          tipo: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data_transacao?: string
          descricao?: string
          empresa_id?: string
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
      transacoes_bancarias: {
        Row: {
          account_id: string
          balance_after: number | null
          categoria: string | null
          codigo_moeda: string | null
          created_at: string
          data_transacao: string
          descricao: string
          empresa_id: string
          id: string
          integracao_id: string
          location: string | null
          merchant_category: string | null
          merchant_name: string | null
          metadata: Json | null
          metodo_pagamento: string | null
          reference: string | null
          status: string | null
          subcategoria: string | null
          tags: string[] | null
          tipo: string
          transaction_id: string
          updated_at: string
          valor: number
        }
        Insert: {
          account_id: string
          balance_after?: number | null
          categoria?: string | null
          codigo_moeda?: string | null
          created_at?: string
          data_transacao: string
          descricao: string
          empresa_id: string
          id?: string
          integracao_id: string
          location?: string | null
          merchant_category?: string | null
          merchant_name?: string | null
          metadata?: Json | null
          metodo_pagamento?: string | null
          reference?: string | null
          status?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo: string
          transaction_id: string
          updated_at?: string
          valor: number
        }
        Update: {
          account_id?: string
          balance_after?: number | null
          categoria?: string | null
          codigo_moeda?: string | null
          created_at?: string
          data_transacao?: string
          descricao?: string
          empresa_id?: string
          id?: string
          integracao_id?: string
          location?: string | null
          merchant_category?: string | null
          merchant_name?: string | null
          metadata?: Json | null
          metodo_pagamento?: string | null
          reference?: string | null
          status?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string
          transaction_id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_bancarias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_bancarias_integracao_id_fkey"
            columns: ["integracao_id"]
            isOneToOne: false
            referencedRelation: "integracoes_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          config: Json | null
          created_at: string
          empresa_id: string
          id: string
          provider: string
          updated_at: string
          webhook_url: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          empresa_id: string
          id?: string
          provider: string
          updated_at?: string
          webhook_url: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          empresa_id?: string
          id?: string
          provider?: string
          updated_at?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configs_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_executions: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          payload: Json | null
          result: Json | null
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          payload?: Json | null
          result?: Json | null
          source: string
          status: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          payload?: Json | null
          result?: Json | null
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_executions_empresa_id_fkey"
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
      insert_demo_data: {
        Args: { p_empresa_id: string }
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
