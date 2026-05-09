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
      colaboradores: {
        Row: {
          auth_user_id: string
          ativo: boolean
          cpf: string | null
          created_at: string
          criado_por: string | null
          data_nascimento: string | null
          email: string
          endereco: string | null
          foto: string | null
          id: string
          nome: string
          permissoes: Json
          rg: string | null
          telefone: string | null
          ultimo_acesso_em: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          ativo?: boolean
          cpf?: string | null
          created_at?: string
          criado_por?: string | null
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          foto?: string | null
          id?: string
          nome: string
          permissoes?: Json
          rg?: string | null
          telefone?: string | null
          ultimo_acesso_em?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          ativo?: boolean
          cpf?: string | null
          created_at?: string
          criado_por?: string | null
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          foto?: string | null
          id?: string
          nome?: string
          permissoes?: Json
          rg?: string | null
          telefone?: string | null
          ultimo_acesso_em?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      aluno_ciclo_menstrual_registro: {
        Row: {
          aluno_id: string
          data_ultima_menstruacao: string
          dias_ciclo: number
          dias_menstruais: number
          id: string
          registrado_em: string
        }
        Insert: {
          aluno_id: string
          data_ultima_menstruacao: string
          dias_ciclo: number
          dias_menstruais: number
          id?: string
          registrado_em?: string
        }
        Update: {
          aluno_id?: string
          data_ultima_menstruacao?: string
          dias_ciclo?: number
          dias_menstruais?: number
          id?: string
          registrado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "aluno_ciclo_menstrual_registro_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      aluno_notificacoes: {
        Row: {
          id: string
          aluno_id: string
          titulo: string
          corpo: string
          lida_em: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          titulo: string
          corpo: string
          lida_em?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          titulo?: string
          corpo?: string
          lida_em?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aluno_notificacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
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
          professor_acompanhamento_id?: string | null
          professor_avaliacao_id?: string | null
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
          professor_acompanhamento_id?: string | null
          professor_avaliacao_id?: string | null
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
          professor_acompanhamento_id?: string | null
          professor_avaliacao_id?: string | null
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
          {
            foreignKeyName: "alunos_professor_acompanhamento_id_fkey"
            columns: ["professor_acompanhamento_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_professor_avaliacao_id_fkey"
            columns: ["professor_avaliacao_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          agenda_id: string | null
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
          agenda_id?: string | null
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
          agenda_id?: string | null
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
            foreignKeyName: "avaliacoes_agenda_id_fkey"
            columns: ["agenda_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes_agenda"
            referencedColumns: ["id"]
          },
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
      aula_inscricoes: {
        Row: {
          created_at?: string
          id: string
          aula_recorrente_id: string
          aluno_id: string
          semana_inicio: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          aula_recorrente_id: string
          aluno_id: string
          semana_inicio: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          aula_recorrente_id?: string
          aluno_id?: string
          semana_inicio?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "aula_inscricoes_aula_recorrente_id_fkey"
            columns: ["aula_recorrente_id"]
            isOneToOne: false
            referencedRelation: "aulas_recorrentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aula_inscricoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas_recorrentes: {
        Row: {
          cor: string
          created_at: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          max_vagas: number
          nome: string
          professor_id: string | null
          sala: string
        }
        Insert: {
          cor?: string
          created_at?: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          max_vagas?: number
          nome: string
          professor_id?: string | null
          sala: string
        }
        Update: {
          cor?: string
          created_at?: string
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          max_vagas?: number
          nome?: string
          professor_id?: string | null
          sala?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_recorrentes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_agenda: {
        Row: {
          aluno_id: string
          created_at: string
          fim_at: string
          id: string
          inicio_at: string
          professor_id: string | null
          status: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          fim_at: string
          id?: string
          inicio_at: string
          professor_id?: string | null
          status?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          fim_at?: string
          id?: string
          inicio_at?: string
          professor_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_agenda_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_agenda_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios: {
        Row: {
          created_at: string
          descricao_execucao: string
          dicas_seguranca: string
          equipamento: string
          grupo_muscular: string
          id: string
          imagem_url: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao_execucao: string
          dicas_seguranca?: string
          equipamento: string
          grupo_muscular: string
          id?: string
          imagem_url: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao_execucao?: string
          dicas_seguranca?: string
          equipamento?: string
          grupo_muscular?: string
          id?: string
          imagem_url?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      personal_sessoes: {
        Row: {
          aluno_id: string
          created_at: string
          fim_at: string
          id: string
          inicio_at: string
          professor_id: string
          status: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          fim_at: string
          id?: string
          inicio_at: string
          professor_id: string
          status?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          fim_at?: string
          id?: string
          inicio_at?: string
          professor_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_sessoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_sessoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_treino: {
        Row: {
          aluno_id: string
          ativo: boolean
          created_at: string
          id: string
          professor_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          ativo?: boolean
          created_at?: string
          id?: string
          professor_id: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          ativo?: boolean
          created_at?: string
          id?: string
          professor_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_treino_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_treino_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professores"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_treino_dias: {
        Row: {
          dia_semana: number
          id: string
          plano_id: string
          rotulo: string
        }
        Insert: {
          dia_semana: number
          id?: string
          plano_id: string
          rotulo: string
        }
        Update: {
          dia_semana?: number
          id?: string
          plano_id?: string
          rotulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_treino_dias_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_treino"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_treino_exercicios: {
        Row: {
          carga_sugerida: string | null
          equipamento: string | null
          exercicio_id: string | null
          id: string
          nome_exercicio: string
          observacoes: string | null
          ordem: number
          plano_dia_id: string
          repeticoes: string
          series: number
          tempo_descanso_segundos: number | null
        }
        Insert: {
          carga_sugerida?: string | null
          equipamento?: string | null
          exercicio_id?: string | null
          id?: string
          nome_exercicio: string
          observacoes?: string | null
          ordem?: number
          plano_dia_id: string
          repeticoes?: string
          series?: number
          tempo_descanso_segundos?: number | null
        }
        Update: {
          carga_sugerida?: string | null
          equipamento?: string | null
          exercicio_id?: string | null
          id?: string
          nome_exercicio?: string
          observacoes?: string | null
          ordem?: number
          plano_dia_id?: string
          repeticoes?: string
          series?: number
          tempo_descanso_segundos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_treino_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_treino_exercicios_plano_dia_id_fkey"
            columns: ["plano_dia_id"]
            isOneToOne: false
            referencedRelation: "planos_treino_dias"
            referencedColumns: ["id"]
          },
        ]
      }
      professores: {
        Row: {
          area_atuacao: string
          ativo: boolean
          auth_user_id: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          especialidades: Json
          foto: string | null
          horario_trabalho: Json
          id: string
          nome: string
          rg: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          area_atuacao?: string
          ativo?: boolean
          auth_user_id?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          especialidades?: Json
          foto?: string | null
          horario_trabalho?: Json
          id?: string
          nome: string
          rg?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          area_atuacao?: string
          ativo?: boolean
          auth_user_id?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          especialidades?: Json
          foto?: string | null
          horario_trabalho?: Json
          id?: string
          nome?: string
          rg?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      receitas: {
        Row: {
          calorias: number
          carboidratos_g: number
          categoria: string
          created_at: string
          gorduras_g: number
          id: string
          imagem_url: string
          ingredientes: string
          modo_preparo: string
          nome: string
          proteinas_g: number
          refeicao: string
          updated_at: string
        }
        Insert: {
          calorias?: number
          carboidratos_g?: number
          categoria: string
          created_at?: string
          gorduras_g?: number
          id?: string
          imagem_url: string
          ingredientes: string
          modo_preparo: string
          nome: string
          proteinas_g?: number
          refeicao: string
          updated_at?: string
        }
        Update: {
          calorias?: number
          carboidratos_g?: number
          categoria?: string
          created_at?: string
          gorduras_g?: number
          id?: string
          imagem_url?: string
          ingredientes?: string
          modo_preparo?: string
          nome?: string
          proteinas_g?: number
          refeicao?: string
          updated_at?: string
        }
        Relationships: []
      }
      treino_sessao_itens: {
        Row: {
          id: string
          plano_exercicio_id: string
          realizado: boolean
          registro_series: Json
          sessao_id: string
        }
        Insert: {
          id?: string
          plano_exercicio_id: string
          realizado?: boolean
          registro_series?: Json
          sessao_id: string
        }
        Update: {
          id?: string
          plano_exercicio_id?: string
          realizado?: boolean
          registro_series?: Json
          sessao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treino_sessao_itens_plano_exercicio_id_fkey"
            columns: ["plano_exercicio_id"]
            isOneToOne: false
            referencedRelation: "planos_treino_exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treino_sessao_itens_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "treino_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      treino_sessoes: {
        Row: {
          aluno_id: string
          data_ref: string
          finalizado_em: string | null
          id: string
          iniciado_em: string
          plano_dia_id: string
        }
        Insert: {
          aluno_id: string
          data_ref: string
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          plano_dia_id: string
        }
        Update: {
          aluno_id?: string
          data_ref?: string
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          plano_dia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treino_sessoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treino_sessoes_plano_dia_id_fkey"
            columns: ["plano_dia_id"]
            isOneToOne: false
            referencedRelation: "planos_treino_dias"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas_guiadas: {
        Row: {
          created_at: string
          data_visita: string
          horario: string
          id: string
          lembrete_enviado_em: string | null
          nome_completo: string
          status: string
          telefone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_visita: string
          horario: string
          id?: string
          lembrete_enviado_em?: string | null
          nome_completo: string
          status?: string
          telefone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_visita?: string
          horario?: string
          id?: string
          lembrete_enviado_em?: string | null
          nome_completo?: string
          status?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aluno_finalizar_sessao_treino: {
        Args: { p_sessao: string }
        Returns: undefined
      }
      aluno_cancelar_inscricao_aula_promover: {
        Args: { p_inscricao_id: string }
        Returns: undefined
      }
      aluno_iniciar_ou_obter_sessao_treino: {
        Args: { p_data: string; p_plano_dia: string }
        Returns: string
      }
      aluno_toggle_treino_item: {
        Args: { p_feito: boolean; p_plano_item: string; p_sessao: string }
        Returns: undefined
      }
      atualizar_status_financeiro: { Args: never; Returns: undefined }
      bloquear_alunos_em_atraso: { Args: never; Returns: number }
      aluno_atualizar_personal_acompanhamento: {
        Args: { p_professor_id: string }
        Returns: undefined
      }
      confirmar_visita_por_id: { Args: { p_id: string }; Returns: Json }
      criar_visita_guiada: {
        Args: {
          p_data: string
          p_horario: string
          p_nome: string
          p_telefone: string
        }
        Returns: string
      }
      professor_vincular_personal_apos_avaliacao: {
        Args: { p_aluno_id: string }
        Returns: undefined
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      meu_staff_context: { Args: never; Returns: Json }
      colaboradores_registrar_acesso: { Args: never; Returns: undefined }
      staff_has_perm: { Args: { p_key: string }; Returns: boolean }
      meu_aluno_id: { Args: never; Returns: string | null }
      meu_professor_id: { Args: never; Returns: string | null }
      resolve_user_app_area: { Args: never; Returns: string }
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
      visitas_guiadas_marcar_lembrete: {
        Args: { p_id: string }
        Returns: boolean
      }
      visitas_horarios_ocupacao: {
        Args: { p_data: string }
        Returns: {
          horario: string
          ocupacao: number
        }[]
      }
      visitas_guiadas_registrar_envio_lembrete: {
        Args: { p_id: string }
        Returns: boolean
      }
      salvar_plano_treino_professor: {
        Args: {
          p_aluno_id: string
          p_titulo: string
          p_dias: Json
        }
        Returns: string
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
      metodo_checkin: "MANUAL" | "PIN" | "QR_CODE" | "FACIAL" | "LOGIN"
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
      metodo_checkin: ["MANUAL", "PIN", "QR_CODE", "FACIAL", "LOGIN"],
      status_financeiro: ["EM_DIA", "VENCENDO", "EM_ATRASO"],
      status_matricula: ["ATIVO", "BLOQUEADO", "INATIVO"],
      status_pagamento: ["PENDENTE", "PAGO", "ATRASADO", "CANCELADO"],
    },
  },
} as const
