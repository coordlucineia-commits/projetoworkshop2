import type { StaffPermKey, StaffPermissions } from "./staffPermKeys";

/** Subconjunto de papéis para escolher rota inicial (sem acoplar ao React). */
export type StaffHomeRole = "super_admin" | "colaborador" | "none";

type NavItem = {
  id: string;
  label: string;
  path: string;
  perm: StaffPermKey;
};

/** Ordem alinhada a `AdminSidebar` (dashboard primeiro; demais pt-BR; Avaliações após Aulas). */
const STAFF_SIDEBAR_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", perm: "dashboard" },
  { id: "alunos", label: "Alunos", path: "/alunos", perm: "alunos" },
  { id: "checkins", label: "Check-ins", path: "/checkins", perm: "checkins" },
  { id: "agendamentos", label: "Agendamentos", path: "/agendamentos", perm: "agendamentos" },
  { id: "professores", label: "Professores", path: "/professores", perm: "professores" },
  { id: "receitas", label: "Receitas", path: "/receitas", perm: "receitas" },
  { id: "exercicios", label: "Exercícios", path: "/exercicios", perm: "exercicios" },
  { id: "aulas", label: "Aulas", path: "/aulas", perm: "aulas" },
  { id: "avaliacoes", label: "Avaliações", path: "/avaliacoes", perm: "alunos" },
  { id: "config", label: "Configurações", path: "/config", perm: "configuracoes" },
];

function pinNavAfter(items: NavItem[], afterId: string, movingId: string): NavItem[] {
  const moving = items.find((x) => x.id === movingId);
  if (!moving) return items;
  const without = items.filter((x) => x.id !== movingId);
  const afterIndex = without.findIndex((x) => x.id === afterId);
  if (afterIndex === -1) return [...without, moving];
  return [...without.slice(0, afterIndex + 1), moving, ...without.slice(afterIndex + 1)];
}

function sortSidebarNav(items: NavItem[]): NavItem[] {
  const dash = items.filter((x) => x.id === "dashboard");
  const rest = pinNavAfter(
    items.filter((x) => x.id !== "dashboard").sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    "aulas",
    "avaliacoes",
  );
  return [...dash, ...rest];
}

function hasPerm(role: StaffHomeRole, perms: StaffPermissions, key: StaffPermKey): boolean {
  if (role === "super_admin") return true;
  if (role !== "colaborador") return false;
  return !!perms[key];
}

/** Primeira rota administrativa permitida (login, ou fallback quando falta permissão na tela atual). */
export function getFirstAllowedStaffPath(role: StaffHomeRole, permissoes: StaffPermissions): string | null {
  if (role === "super_admin") return "/dashboard";
  if (role !== "colaborador") return null;
  const allowed = STAFF_SIDEBAR_NAV.filter((d) => hasPerm(role, permissoes, d.perm));
  const sorted = sortSidebarNav(allowed);
  return sorted[0]?.path ?? null;
}
