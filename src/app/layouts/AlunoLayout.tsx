import { Outlet, useNavigate, useLocation } from "react-router";
import { useMemo, useEffect, useState } from "react";
import { useRequireAluno } from "../hooks/useRequireAluno";
import { useAutoCheckin } from "../hooks/useAutoCheckin";
import { LayoutGrid } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { DevFooter } from "../components/DevFooter";
import { getAlunoSidebarNavItems, type AlunoNavItem } from "../../lib/alunoNavConfig";
import { SidebarBrand } from "../components/SidebarBrand";
import { SidebarLogoutButton, SidebarUserRow } from "../components/SidebarProfileFooter";

type MobileDockItem =
  | AlunoNavItem
  | { id: "menu"; path: string; label: string; navShortLabel: string; icon: typeof LayoutGrid };

export function AlunoLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ok, checking, alunoId } = useRequireAluno();
  const { registrado: checkinRegistrado } = useAutoCheckin(ok ? (alunoId ?? null) : null);
  const [sidebarNome, setSidebarNome] = useState("");
  const [alunoSexo, setAlunoSexo] = useState<string | null>(null);

  const onLogout = () => void getSupabase().auth.signOut().then(() => navigate("/login"));

  const sidebarNav = useMemo(() => getAlunoSidebarNavItems(alunoSexo), [alunoSexo]);

  useEffect(() => {
    if (!alunoId || !isSupabaseConfigured) {
      setSidebarNome("");
      setAlunoSexo(null);
      return;
    }
    let cancelled = false;
    void getSupabase()
      .from("alunos")
      .select("nome, sexo")
      .eq("id", alunoId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          const row = data as { nome?: string; sexo?: string | null } | null;
          setSidebarNome(String(row?.nome ?? "").trim());
          setAlunoSexo(row?.sexo ?? null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [alunoId]);

  const mobileBar = useMemo((): MobileDockItem[] => {
    const map = Object.fromEntries(sidebarNav.map((it) => [it.id, it])) as Record<string, AlunoNavItem>;
    return [
      map.dash,
      map.mine,
      map.aval,
      map.perfil,
      {
        id: "menu",
        path: "/aluno/menu",
        label: "Mais",
        navShortLabel: "Mais",
        icon: LayoutGrid,
      },
    ];
  }, [sidebarNav]);

  if (checking || !ok || !alunoId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <p style={{ color: "#00F9E4", fontFamily: "monospace", fontSize: 11 }} className="uppercase">
          Carregando área do aluno…
        </p>
      </div>
    );
  }

  const pathname = location.pathname;
  const active = (): string => {
    if (pathname.startsWith("/aluno/menu")) return "menu";
    if (pathname.startsWith("/aluno/receitas")) return "rec";
    if (pathname.startsWith("/aluno/exercicios")) return "ex";
    if (pathname.startsWith("/aluno/meu-treino")) return "mine";
    if (pathname.startsWith("/aluno/sessoes")) return "sess";
    if (pathname.startsWith("/aluno/aulas")) return "ag";
    if (pathname.startsWith("/aluno/minhas-avaliacoes")) return "aval";
    if (pathname.startsWith("/aluno/perfil")) return "perfil";
    if (pathname.startsWith("/aluno/ciclo-menstrual")) return "ciclo";
    return "dash";
  };
  const act = active();

  return (
    <div
      className="aluno-app-shell min-h-screen flex flex-col lg:flex-row"
      style={{ background: "#0A0A0A", color: "#F5F5F5", maxWidth: "100%", width: "100%" }}
    >
      <aside
        className="hidden lg:flex flex-col w-[200px] shrink-0 sticky top-0 h-screen"
        style={{ background: "#111111", borderRight: "1px solid #1E1E1E" }}
      >
        <SidebarBrand onNavigateHome={() => navigate("/aluno/dashboard")} />
        <SidebarUserRow displayName={sidebarNome || "Aluno"} roleLabelMono="ALUNO" />
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto min-h-0">
          {sidebarNav.map((it) => {
            const sel = act === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => navigate(it.path)}
                className="flex w-full min-w-0 items-center gap-3 rounded-full px-[14px] py-2.5 text-left text-sm leading-normal transition-colors"
                style={{
                  background: sel ? "#00F9E4" : "transparent",
                  color: sel ? "#0A0A0A" : "#AAA",
                  fontWeight: sel ? 700 : 400,
                }}
              >
                <it.icon className="shrink-0" size={16} strokeWidth={2} />
                <span>{it.label}</span>
              </button>
            );
          })}
        </nav>
        <SidebarLogoutButton onSignOut={onLogout} />
        <DevFooter className="mt-1 px-3 pb-1" />
      </aside>

      <main className="flex-1 min-w-0 flex flex-col px-4 md:px-10 pb-[72px] lg:pb-8">
        <Outlet context={{ alunoId, checkinRegistrado, alunoSexo }} />
        <DevFooter className="py-4 lg:hidden" />
      </main>

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] border-t border-[#222222]"
        style={{ background: "#111111" }}
      >
        <div className="grid grid-cols-5 gap-1 h-[58px] items-center px-1">
          {mobileBar.map((it) => {
            const sel = act === it.id;
            const navLabel = "navShortLabel" in it && it.navShortLabel ? it.navShortLabel : it.label;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => navigate(it.path)}
                className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl min-w-0 px-0.5"
                style={{
                  background: sel ? "rgba(0,249,228,0.10)" : "transparent",
                  color: sel ? "#00F9E4" : "#6B6B6B",
                }}
              >
                <it.icon size={18} strokeWidth={sel ? 2.4 : 2} />
                <span className="text-[9px] uppercase tracking-wider font-semibold truncate max-w-[72px] text-center leading-tight">
                  {navLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
