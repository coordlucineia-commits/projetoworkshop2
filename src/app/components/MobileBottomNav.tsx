import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Monitor,
  Settings,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "alunos", label: "Alunos", icon: Users, path: "/alunos" },
  { id: "checkins", label: "Check-ins", icon: ClipboardCheck, path: "/checkins" },
  { id: "recepcao", label: "Recepção", icon: Monitor, path: "/recepcao" },
  { id: "config", label: "Config", icon: Settings, path: "/config" },
];

function getActiveId(pathname: string): string {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/cadastro") return "alunos";
  if (pathname.startsWith("/alunos")) return "alunos";
  if (pathname.startsWith("/checkins")) return "checkins";
  if (pathname.startsWith("/recepcao")) return "recepcao";
  if (pathname.startsWith("/config")) return "config";
  return "";
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#111111",
        borderTop: "1px solid #222222",
        height: "64px",
      }}
    >
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
              style={{
                background: isActive ? "rgba(0,249,228,0.10)" : "transparent",
                color: isActive ? "#00F9E4" : "#6B6B6B",
              }}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span
                className="uppercase tracking-wider"
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 400,
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
