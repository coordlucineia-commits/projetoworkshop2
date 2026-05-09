import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  LayoutGrid,
} from "lucide-react";
import { staffHasPerm, useStaffSession } from "../context/StaffSessionContext";
import type { StaffPermKey } from "../../lib/staffPermKeys";

const navDefs: {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  perm: StaffPermKey;
  /** “Mais”: não entra na ordem alfabética por label — fica sempre por último. */
  sortLast?: boolean;
}[] = [
  { id: "dashboard", label: "Início", icon: LayoutDashboard, path: "/dashboard", perm: "dashboard" },
  { id: "alunos", label: "Alunos", icon: Users, path: "/alunos", perm: "alunos" },
  { id: "checkins", label: "Checks", icon: ClipboardCheck, path: "/checkins", perm: "checkins" },
  {
    id: "agendamentos",
    label: "Visitas",
    icon: Calendar,
    path: "/agendamentos",
    perm: "agendamentos",
  },
  { id: "menu", label: "Mais", icon: LayoutGrid, path: "/admin/menu", perm: "dashboard", sortLast: true },
];

/** Início (dashboard) primeiro; demais alfabéticos (pt-BR); itens sortLast ao final. */
function sortMobileNav<T extends { id: string; label: string; sortLast?: boolean }>(items: T[]): T[] {
  const last = items.filter((x) => x.sortLast);
  const midd = items.filter((x) => !x.sortLast);
  const dash = midd.filter((x) => x.id === "dashboard");
  const rest = midd.filter((x) => x.id !== "dashboard").sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  return [...dash, ...rest, ...last];
}

function navItemVisible(
  role: ReturnType<typeof useStaffSession>["role"],
  permissoes: ReturnType<typeof useStaffSession>["permissoes"],
  item: (typeof navDefs)[number],
): boolean {
  if (item.id === "menu") {
    return role === "super_admin" || role === "colaborador";
  }
  return staffHasPerm(role, permissoes, item.perm);
}

function getActiveId(pathname: string): string {
  if (pathname.startsWith("/admin/menu")) return "menu";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/cadastro")) return "alunos";
  if (pathname.startsWith("/alunos")) return "alunos";
  if (pathname.startsWith("/checkins")) return "checkins";
  if (pathname.startsWith("/agendamentos")) return "agendamentos";
  return "";
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, permissoes } = useStaffSession();
  const activeId = getActiveId(location.pathname);

  const visible = useMemo(() => {
    return sortMobileNav(navDefs.filter((item) => navItemVisible(role, permissoes, item)));
  }, [role, permissoes]);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#111111",
        borderTop: "1px solid #222222",
        height: "64px",
      }}
    >
      <div className="h-full flex items-center justify-around px-1">
        {visible.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[52px]"
              style={{
                background: isActive ? "rgba(0,249,228,0.10)" : "transparent",
                color: isActive ? "#00F9E4" : "#6B6B6B",
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span
                className="uppercase tracking-wider text-center leading-tight"
                style={{
                  fontSize: "9px",
                  fontWeight: isActive ? 700 : 400,
                  maxWidth: "64px",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
