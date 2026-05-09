import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { getSupabase } from "../../lib/supabaseClient";
import type { StaffPermKey } from "../../lib/staffPermKeys";
import { staffHasPerm, useStaffSession } from "../context/StaffSessionContext";
import { DevFooter } from "./DevFooter";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarLogoutButton, SidebarUserRow } from "./SidebarProfileFooter";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  Users2,
  Utensils,
  Dumbbell,
  Columns2,
  ClipboardList,
  Settings,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  /** Permissão necessária (colaboradores). Super-admin vê sempre. */
  perm: StaffPermKey;
};

const navDefs: NavDef[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", perm: "dashboard" },
  { id: "alunos", label: "Alunos", icon: Users, path: "/alunos", perm: "alunos" },
  { id: "checkins", label: "Check-ins", icon: ClipboardCheck, path: "/checkins", perm: "checkins" },
  {
    id: "agendamentos",
    label: "Agendamentos",
    icon: Calendar,
    path: "/agendamentos",
    perm: "agendamentos",
  },
  { id: "professores", label: "Professores", icon: Users2, path: "/professores", perm: "professores" },
  { id: "receitas", label: "Receitas", icon: Utensils, path: "/receitas", perm: "receitas" },
  { id: "exercicios", label: "Exercícios", icon: Dumbbell, path: "/exercicios", perm: "exercicios" },
  { id: "aulas", label: "Aulas", icon: Columns2, path: "/aulas", perm: "aulas" },
  { id: "avaliacoes", label: "Avaliações", icon: ClipboardList, path: "/avaliacoes", perm: "alunos" },
  { id: "config", label: "Configurações", icon: Settings, path: "/config", perm: "configuracoes" },
];

/** Só aparece para super_admin; ordenado junto aos demais (alfabético). */
const navColaboradoresOnly: NavDef = {
  id: "colaboradores",
  label: "Colaboradores",
  icon: UserCog,
  path: "/colaboradores",
  perm: "dashboard",
};

/** Insere um item logo após outro na lista (ex.: Avaliações após Aulas). */
function pinNavAfter(items: NavDef[], afterId: string, movingId: string): NavDef[] {
  const moving = items.find((x) => x.id === movingId);
  if (!moving) return items;
  const without = items.filter((x) => x.id !== movingId);
  const afterIndex = without.findIndex((x) => x.id === afterId);
  if (afterIndex === -1) return [...without, moving];
  return [...without.slice(0, afterIndex + 1), moving, ...without.slice(afterIndex + 1)];
}

/** Dashboard primeiro; demais em ordem alfabética (pt-BR); Avaliações fixada logo após Aulas. */
function sortSidebarNav(items: NavDef[]): NavDef[] {
  const dash = items.filter((x) => x.id === "dashboard");
  const rest = pinNavAfter(
    items.filter((x) => x.id !== "dashboard").sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    "aulas",
    "avaliacoes",
  );
  return [...dash, ...rest];
}

function getActiveId(pathname: string): string {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/cadastro")) return "alunos";
  if (pathname.startsWith("/alunos")) return "alunos";
  if (pathname.startsWith("/checkins")) return "checkins";
  if (pathname.startsWith("/agendamentos")) return "agendamentos";
  if (pathname.startsWith("/colaboradores")) return "colaboradores";
  if (pathname.startsWith("/professores")) return "professores";
  if (pathname.startsWith("/receitas")) return "receitas";
  if (pathname.startsWith("/exercicios")) return "exercicios";
  if (pathname.startsWith("/aulas")) return "aulas";
  if (pathname.startsWith("/avaliacoes")) return "avaliacoes";
  if (pathname.startsWith("/admin/menu")) return "";
  if (pathname.startsWith("/config")) return "config";
  return "";
}

async function handleSignOut(navigate: (path: string) => void) {
  await getSupabase().auth.signOut();
  navigate("/login");
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, perfilNome, permissoes } = useStaffSession();
  const activeId = getActiveId(location.pathname);

  const navItems = useMemo(() => {
    const base = navDefs.filter((d) => staffHasPerm(role, permissoes, d.perm));
    const merged = role === "super_admin" ? [...base, navColaboradoresOnly] : base;
    return sortSidebarNav(merged);
  }, [role, permissoes]);

  const displayName = perfilNome?.trim() || "Gestão LuTe";
  const roleLabel =
    role === "super_admin" ? "ADMINISTRADOR" : role === "colaborador" ? "COLABORADOR" : "STAFF";

  return (
    <motion.aside
      initial={{ x: -220 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col w-[200px] shrink-0"
      style={{
        background: "#111111",
        borderRight: "1px solid #1E1E1E",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      <SidebarBrand onNavigateHome={() => navigate("/dashboard")} />

      <SidebarUserRow displayName={displayName} roleLabelMono={roleLabel} />

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto min-h-0">
        {navItems.map((item) => {
          const isActive =
            activeId === item.id || (item.id === "professores" && activeId === "professores");
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-all duration-200 text-left"
              style={{
                background: isActive ? "#00F9E4" : "transparent",
                color: isActive ? "#0A0A0A" : "#9A9A9A",
                fontWeight: isActive ? 700 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "#1C1C1C";
                  (e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#9A9A9A";
                }
              }}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <SidebarLogoutButton onSignOut={() => void handleSignOut(navigate)} />
      <DevFooter className="mt-1 px-3 pb-1" />
    </motion.aside>
  );
}
