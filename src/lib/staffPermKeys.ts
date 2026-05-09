/** Chaves sincronizadas com colaboradores.permissoes (JSONB) e RLS staff_has_perm. */
export const STAFF_PERM_KEYS = [
  "dashboard",
  "alunos",
  "checkins",
  "agendamentos",
  "professores",
  "receitas",
  "exercicios",
  "aulas",
  "configuracoes",
] as const;

export type StaffPermKey = (typeof STAFF_PERM_KEYS)[number];

export type StaffPermissions = Partial<Record<StaffPermKey, boolean>>;

export const STAFF_ROUTE_PERM: Partial<Record<string, StaffPermKey>> = {
  "/dashboard": "dashboard",
  "/alunos": "alunos",
  "/cadastro": "alunos",
  "/checkins": "checkins",
  "/agendamentos": "agendamentos",
  "/professores": "professores",
  "/receitas": "receitas",
  "/exercicios": "exercicios",
  "/aulas": "aulas",
  "/avaliacoes": "alunos",
  "/config": "configuracoes",
};

/** Rotas apenas super-admin (Gestão de colaboradores) */
export const SUPER_ADMIN_ROUTE_PREFIXES = ["/colaboradores"];
