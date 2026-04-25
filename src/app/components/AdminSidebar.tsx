import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Monitor,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "alunos", label: "Alunos", icon: Users, path: "/alunos" },
  { id: "checkins", label: "Check-ins", icon: ClipboardCheck, path: "/checkins" },
  { id: "recepcao", label: "Modo Recepção", icon: Monitor, path: "/recepcao" },
  { id: "config", label: "Configurações", icon: Settings, path: "/config" },
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

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = getActiveId(location.pathname);

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
      {/* Logo */}
      <div
        className="px-5 py-6 cursor-pointer"
        style={{ borderBottom: "1px solid #1E1E1E" }}
        onClick={() => navigate("/dashboard")}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#00F9E4" }}
          >
            <span className="font-black text-sm" style={{ color: "#0A0A0A" }}>
              LT
            </span>
          </div>
          <div>
            <p className="font-black tracking-tight text-base leading-tight text-white">
              Lu<span style={{ color: "#00F9E4" }}>Te</span>
            </p>
            <p
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "#606060" }}
            >
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
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

      {/* User & Logout */}
      <div
        className="px-3 pb-5"
        style={{ borderTop: "1px solid #1E1E1E", paddingTop: "16px" }}
      >
        <div className="flex items-center gap-3 mb-3 px-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#00F9E4" }}
          >
            <span className="font-bold text-xs" style={{ color: "#0A0A0A" }}>
              AL
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">Admin LuTe</p>
            <p
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: "#606060" }}
            >
              Gestor
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors duration-200"
          style={{ color: "#606060" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#606060")
          }
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </motion.aside>
  );
}