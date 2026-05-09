import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CalendarRange,
  ClipboardList,
  Droplets,
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  UserCircle,
  Utensils,
} from "lucide-react";
import { isSexoFemininoAluno } from "./alunoSexo";

export type AlunoNavItem = {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  /** Rótulo na barra inferior (quando diferente de `label`). */
  navShortLabel?: string;
  /** Texto auxiliar na página Mais. */
  hint: string;
  /** Só entra na sidebar / Mais quando verdadeiro. */
  onlyForSexoFeminino?: boolean;
};

const RAW_ALUNO_NAV_ITEMS: AlunoNavItem[] = [
  { id: "dash", path: "/aluno/dashboard", label: "Início", icon: LayoutDashboard, hint: "Resumo do dia e atalhos" },
  { id: "ag", path: "/aluno/aulas", label: "Aulas", icon: CalendarDays, hint: "Cronograma de aulas" },
  { id: "mine", path: "/aluno/meu-treino", label: "Meu treino", icon: ListChecks, hint: "Plano do dia" },
  { id: "ex", path: "/aluno/exercicios", label: "Exercícios", icon: Dumbbell, hint: "Biblioteca de exercícios" },
  {
    id: "aval",
    path: "/aluno/minhas-avaliacoes",
    label: "Minhas avaliações",
    icon: ClipboardList,
    navShortLabel: "Avaliação",
    hint: "Agenda e medidas corporais",
  },
  { id: "rec", path: "/aluno/receitas", label: "Receitas", icon: Utensils, hint: "Receitas nutricionais" },
  { id: "sess", path: "/aluno/sessoes", label: "Personal", icon: CalendarRange, hint: "Agendar aulas personal / sessões do plano" },
  {
    id: "perfil",
    path: "/aluno/perfil",
    label: "Meu Perfil",
    icon: UserCircle,
    navShortLabel: "Perfil",
    hint: "Cadastro e senha",
  },
  {
    id: "ciclo",
    path: "/aluno/ciclo-menstrual",
    label: "Ciclo menstrual",
    icon: Droplets,
    hint: "Duração e intervalo entre menstruações",
    onlyForSexoFeminino: true,
  },
];

/** Início sempre primeiro; demais em ordem alfabética (pt-BR) por `label`. */
export function getAlunoSidebarNavItems(sexoAluno?: string | null): AlunoNavItem[] {
  const showFem = isSexoFemininoAluno(sexoAluno);
  const base = RAW_ALUNO_NAV_ITEMS.filter((it) => !it.onlyForSexoFeminino || showFem);
  const inicio = base.filter((x) => x.id === "dash");
  const rest = base.filter((x) => x.id !== "dash").sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
  );
  return [...inicio, ...rest];
}
