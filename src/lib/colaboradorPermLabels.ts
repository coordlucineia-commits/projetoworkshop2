import type { StaffPermKey } from "./staffPermKeys";

export type ColaboradorModuloToggle = {
  key: StaffPermKey;
  label: string;
  hint: string;
};

export const COLABORADOR_MODULOS: ColaboradorModuloToggle[] = [
  { key: "dashboard", label: "Dashboard", hint: "Visão geral e métricas da academia" },
  { key: "alunos", label: "Alunos", hint: "Listagem, perfil e cadastro de alunos" },
  { key: "checkins", label: "Check-ins", hint: "Histórico e controle de frequência" },
  { key: "agendamentos", label: "Agendamentos", hint: "Gestão de visitas agendadas" },
  { key: "professores", label: "Professores", hint: "Listagem e perfil de professores" },
  { key: "receitas", label: "Receitas", hint: "Cadastro e listagem de receitas" },
  { key: "exercicios", label: "Exercícios", hint: "Cadastro e listagem de exercícios" },
  { key: "aulas", label: "Aulas", hint: "Calendário e gestão de aulas" },
  {
    key: "configuracoes",
    label: "Configurações",
    hint: "Configurações gerais do sistema",
  },
];
