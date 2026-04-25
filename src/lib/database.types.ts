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
      admins: {
        Row: {
          ativo: boolean
          auth_user_id: string
          created_at: string
          email: string
          id: string
          nome: string
          role: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          auth_user_id: string
          created_at?: string
          email: string
          id?: string
          nome: string
          role?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          auth_user_id?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      alunos: {
        Row: {
          anamnese: Json
          auth_user_id: string | null
          cpf: string
          created_at: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          estado_civil: string | null
          foto: string | null
          id: string
          matricula: string
          medidas: Json
          nome: string
          observacoes: string | null
          parq: Json
          parq_has_sim: boolean
          pin: string | null
          plano_id: string | null
          rg: string | null
          sexo: string | null
          status_financeiro: Database["public"]["Enums"]["status_financeiro"]
          status_matricula: Database["public"]["Enums"]["status_matricula"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          anamnese?: Json
          auth_user_id?: string | null
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          estado_civil?: string | null
          foto?: string | null
          id?: string
          matricula: string
          medidas?: Json
          nome: string
          observacoes?: string | null
          parq?: Json
          parq_has_sim?: boolean
          pin?: string | null
          plano_id?: string | null
          rg?: string | null
          sexo?: string | null
          status_financeiro?: Database["public"]["Enums"]["status_financeiro"]
          status_matricula?: Database["public"]["Enums"]["status_matricula"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          anamnese?: Json
          auth_user_id?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          estado_civil?: string | null
          foto?: string | null
          id?: string
          matricula?: string
          medidas?: Json
          nome?: string
          observacoes?: string | null
          parq?: Json
          parq_has_sim?: boolean
          pin?: string | null
          plano_id?: string | null
          rg?: string | null
          sexo?: string | null
          status_financeiro?: Database["public"]["Enums"]["status_financeiro"]
          status_matricula?: Database["public"]["Enums"]["status_matricula"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          altura: number | null
          aluno_id: string
          circunferencias: Json
          created_at: string
          data_avaliacao: string
          id: string
          imc: number | null
          massa_magra: number | null
          medidas: Json
          observacoes: string | null
          percentual_gordura: number | null
          peso: number | null
          updated_at: string
        }
        Insert: {
          altura?: number | null
          aluno_id: string
          circunferencias?: Json
          created_at?: string
          data_avaliacao?: string
          id?: string
          imc?: number | null
          massa_magra?: number | null
          medidas?: Json
          observacoes?: string | null
          percentual_gordura?: number | null
          peso?: number | null
          updated_at?: string
        }
        Update: {
          altura?: number | null
          aluno_id?: string
          circunferencias?: Json
          created_at?: string
          data_avaliacao?: string
          id?: string
          imc?: number | null
          massa_magra?: number | null
          medidas?: Json
          observacoes?: string | null
          percentual_gordura?: number | null
          peso?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          aluno_id: string
          created_at: string
          criado_por: string | null
          data_hora: string
          id: string
          metodo: Database["public"]["Enums"]["metodo_checkin"]
          observacao: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string
          criado_por?: string | null
          data_hora?: string
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_checkin"]
          observacao?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string
          criado_por?: string | null
          data_hora?: string
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_checkin"]
          observacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_academia: {
        Row: {
          cnpj: string | null
          email: string | null
          endereco: string | null
          horario_funcionamento: Json
          id: boolean
          nome_academia: string
          parametros: Json
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          email?: string | null
          endereco?: string | null
          horario_funcionamento?: Json
          id?: boolean
          nome_academia?: string
          parametros?: Json
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          email?: string | null
          endereco?: string | null
          horario_funcionamento?: Json
          id?: boolean
          nome_academia?: string
          parametros?: Json
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      logs_auditoria: {
        Row: {
          acao: string
          admin_id: string | null
          created_at: string
          detalhes: Json
          entidade: string
          entidade_id: string | null
          id: string
          ip: string | null
          user_agent: string | null
        }
        Insert: {
          acao: string
          admin_id?: string | null
          created_at?: string
          detalhes?: Json
          entidade: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Update: {
          acao?: string
          admin_id?: string | null
          created_at?: string
          detalhes?: Json
          entidade?: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_auditoria_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          aluno_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"] | null
          id: string
          referencia_mes: string | null
          status: Database["public"]["Enums"]["status_pagamento"]
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          referencia_mes?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          referencia_mes?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean
          beneficios: Json
          created_at: string
          descricao: string
          id: string
          nome: string
          preco: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          beneficios?: Json
          created_at?: string
          descricao: string
          id?: string
          nome: string
          preco: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          beneficios?: Json
          created_at?: string
          descricao?: string
          id?: string
          nome?: string
          preco?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_status_financeiro: { Args: never; Returns: undefined }
      bloquear_alunos_em_atraso: { Args: never; Returns: number }
      is_admin: { Args: { uid: string }; Returns: boolean }
      registrar_checkin_por_pin: {
        Args: { pin_input: string }
        Returns: {
          aluno_id: string
          created_at: string
          criado_por: string | null
          data_hora: string
          id: string
          metodo: Database["public"]["Enums"]["metodo_checkin"]
          observacao: string | null
        }
        SetofOptions: {
          from: "*"
          to: "checkins"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      forma_pagamento:
        | "PIX"
        | "CARTAO_CREDITO"
        | "CARTAO_DEBITO"
        | "DINHEIRO"
        | "BOLETO"
        | "TRANSFERENCIA"
      metodo_checkin: "MANUAL" | "PIN" | "QR_CODE" | "FACIAL"
      status_financeiro: "EM_DIA" | "VENCENDO" | "EM_ATRASO"
      status_matricula: "ATIVO" | "BLOQUEADO" | "INATIVO"
      status_pagamento: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO"
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
    Enums: {
      forma_pagamento: [
        "PIX",
        "CARTAO_CREDITO",
        "CARTAO_DEBITO",
        "DINHEIRO",
        "BOLETO",
        "TRANSFERENCIA",
      ],
      metodo_checkin: ["MANUAL", "PIN", "QR_CODE", "FACIAL"],
      status_financeiro: ["EM_DIA", "VENCENDO", "EM_ATRASO"],
      status_matricula: ["ATIVO", "BLOQUEADO", "INATIVO"],
      status_pagamento: ["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"],
    },
  },
} as const
