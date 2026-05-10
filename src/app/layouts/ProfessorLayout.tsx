import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useRequireProfessor } from "../hooks/useRequireProfessor";
import {
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  CalendarRange,
  UserCircle,
  Utensils,
  Dumbbell,
  LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { DevFooter } from "../components/DevFooter";
import { SidebarBrand } from "../components/SidebarBrand";
import { SidebarLogoutButton, SidebarUserRow } from "../components/SidebarProfileFooter";

type TabItem = {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
};

const SIDEBAR_TABS: TabItem[] = [
  { id: "dash", path: "/professor/dashboard", label: "Início", icon: LayoutDashboard },
  { id: "eval", path: "/professor/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { id: "plans", path: "/professor/treinos", label: "Treinos", icon: ListChecks },
  { id: "sess", path: "/professor/sessoes", label: "Sessões", icon: CalendarRange },
  { id: "perfil", path: "/professor/perfil", label: "Meu perfil", icon: UserCircle },
  { id: "rec", path: "/professor/receitas", label: "Receitas", icon: Utensils },
  { id: "ex", path: "/professor/exercicios", label: "Exercícios", icon: Dumbbell },
];

const MOBILE_DOCK_TABS: TabItem[] = [
  { id: "dash", path: "/professor/dashboard", label: "Início", icon: LayoutDashboard },
  { id: "eval", path: "/professor/avaliacoes", label: "Avaliações", icon: ClipboardList },
  { id: "plans", path: "/professor/treinos", label: "Treinos", icon: ListChecks },
  { id: "sess", path: "/professor/sessoes", label: "Sessões", icon: CalendarRange },
  { id: "perfil", path: "/professor/perfil", label: "Meu perfil", icon: UserCircle },
  { id: "menu", path: "/professor/menu", label: "Mais", icon: LayoutGrid },
];

function sidebarActiveId(pathname: string): string {
  if (pathname.startsWith("/professor/menu")) return "";
  if (pathname.startsWith("/professor/avaliacoes")) return "eval";
  if (pathname.startsWith("/professor/treinos")) return "plans";
  if (pathname.startsWith("/professor/receitas")) return "rec";
  if (pathname.startsWith("/professor/exercicios")) return "ex";
  if (pathname.startsWith("/professor/sessoes")) return "sess";
  if (pathname.startsWith("/professor/perfil")) return "perfil";
  return "dash";
}

function dockActiveId(pathname: string): string {
  if (pathname.startsWith("/professor/menu")) return "menu";
  if (pathname.startsWith("/professor/receitas") || pathname.startsWith("/professor/exercicios")) return "menu";
  if (pathname.startsWith("/professor/avaliacoes")) return "eval";
  if (pathname.startsWith("/professor/treinos")) return "plans";
  if (pathname.startsWith("/professor/sessoes")) return "sess";
  if (pathname.startsWith("/professor/perfil")) return "perfil";
  return "dash";
}

export function ProfessorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ok, checking, professorId } = useRequireProfessor();
  const [sidebarNome, setSidebarNome] = useState("");

  const onLogout = () => void getSupabase().auth.signOut().then(() => navigate("/login"));

  useEffect(() => {
    if (!professorId || !isSupabaseConfigured) {
      setSidebarNome("");
      return;
    }
    let cancelled = false;
    void getSupabase()
      .from("professores")
      .select("nome")
      .eq("id", professorId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setSidebarNome(String((data as { nome?: string } | null)?.nome ?? "").trim());
      });
    return () => {
      cancelled = true;
    };
  }, [professorId]);

  if (checking || !ok || !professorId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <p style={{ color: "#00F9E4", fontFamily: "monospace", fontSize: 11 }} className="uppercase">
          Carregando área do professor…
        </p>
      </div>
    );
  }

  const p = location.pathname;
  const sidebarSel = sidebarActiveId(p);
  const dockSel = dockActiveId(p);

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "#0A0A0A", color: "#F5F5F5", maxWidth: "100%", width: "100%" }}>
      <aside
        className="hidden md:flex flex-col w-[200px] shrink-0 sticky top-0 h-screen"
        style={{ background: "#111111", borderRight: "1px solid #1E1E1E" }}
      >
        <SidebarBrand onNavigateHome={() => navigate("/professor/dashboard")} />
        <SidebarUserRow displayName={sidebarNome || "Professor"} roleLabelMono="PROFESSOR" />
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto min-h-0">
          {SIDEBAR_TABS.map((it) => {
            const sel = sidebarSel === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => navigate(it.path)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition-colors text-left w-full"
                style={{
                  background: sel ? "#00F9E4" : "transparent",
                  color: sel ? "#0A0A0A" : "#AAA",
                  fontWeight: sel ? 700 : 400,
                }}
              >
                <it.icon size={17} />
                {it.label}
              </button>
            );
          })}
        </nav>
        <SidebarLogoutButton onSignOut={onLogout} />
        <DevFooter className="mt-1 px-3 pb-1" />
      </aside>

      <main className="flex-1 px-0 md:px-10 pb-[66px] md:pb-8 flex flex-col">
        <Outlet context={{ professorId }} />
        <DevFooter className="py-4 md:hidden" />
      </main>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#222222] pb-[env(safe-area-inset-bottom)]"
        style={{ background: "#111111" }}
      >
        <div className="grid grid-cols-6 h-[58px] items-center px-0.5">
          {MOBILE_DOCK_TABS.map((it) => {
            const sel = dockSel === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => navigate(it.path)}
                className="flex flex-col items-center justify-center gap-0.5 py-1 min-w-0 h-full rounded-lg transition-colors"
                style={{ color: sel ? "#00F9E4" : "#6B6B6B" }}
              >
                <it.icon size={17} strokeWidth={sel ? 2.4 : 2} className="shrink-0" />
                <span className="text-[8px] font-semibold text-center leading-tight max-w-[100%] px-0.5 line-clamp-2">
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
