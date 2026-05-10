import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ClipboardList,
  ArrowLeft,
  Users2,
  Users,
  Utensils,
  Dumbbell,
  Columns2,
  Settings,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import { staffHasPerm, useStaffSession } from "../context/StaffSessionContext";
import type { StaffPermKey } from "../../lib/staffPermKeys";
import { getSupabase } from "../../lib/supabaseClient";

const links: {
  label: string;
  path: string;
  icon: LucideIcon;
  hint: string;
  perm: StaffPermKey;
  superAdminOnly?: boolean;
}[] = [
  { label: "Professores", path: "/professores", icon: Users2, hint: "Equipe técnica", perm: "professores" },
  {
    label: "Colaboradores",
    path: "/colaboradores",
    icon: Users,
    hint: "Gestão de contas da equipe",
    perm: "dashboard",
    superAdminOnly: true,
  },
  { label: "Receitas", path: "/receitas", icon: Utensils, hint: "Biblioteca nutricional", perm: "receitas" },
  { label: "Exercícios", path: "/exercicios", icon: Dumbbell, hint: "Biblioteca de treino", perm: "exercicios" },
  { label: "Aulas em grade", path: "/aulas", icon: Columns2, hint: "Salas A e B", perm: "aulas" },
  { label: "Avaliações físicas", path: "/avaliacoes", icon: ClipboardList, hint: "Agenda e fichas realizadas", perm: "alunos" },
  { label: "Configurações", path: "/config", icon: Settings, hint: "Academia", perm: "configuracoes" },
];

export function AdminMenuMorePage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("dashboard");
  const { role, permissoes } = useStaffSession();

  const visibleLinks = useMemo(
    () =>
      links
        .filter((l) => staffHasPerm(role, permissoes, l.perm))
        .filter((l) => !l.superAdminOnly || role === "super_admin")
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [role, permissoes],
  );

  const onSair = () => void getSupabase().auth.signOut().then(() => navigate("/login"));

  if (checking || permGuard.checking || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <p style={{ color: "#00F9E4", fontFamily: "monospace", fontSize: 12 }}>
          CARREGANDO...
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%", color: "#F5F5F5" }}
    >
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="px-4 md:px-10 flex-1 overflow-y-auto pt-8 pb-[72px] md:pb-16">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-sm"
            style={{ color: "#9A9A9A" }}
          >
            <ArrowLeft size={16} className="shrink-0 text-primary" /> Voltar
          </button>

          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black uppercase tracking-tight mb-2"
          >
            Mais opções
          </motion.h1>
          <p className="text-sm mb-8" style={{ color: "#6B6B6B" }}>
            Conteúdo, professores e ferramentas adicionais.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {visibleLinks.map(({ label, path, icon: Icon, hint }, i) => (
              <motion.button
                key={path}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                onClick={() => navigate(path)}
                className="text-left rounded-2xl p-5 transition-colors"
                style={{
                  background: "#111111",
                  border: "1px solid #2A2A2A",
                }}
              >
                <div className="flex items-center gap-3 mb-0 md:mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(0,249,228,0.12)", color: "#00F9E4" }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="font-bold">{label}</span>
                </div>
                <p className="text-xs hidden md:block" style={{ color: "#6B6B6B" }}>
                  {hint}
                </p>
              </motion.button>
            ))}
          </div>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * visibleLinks.length }}
            onClick={onSair}
            className="mt-4 w-full max-w-xl text-left rounded-2xl p-5 transition-colors"
            style={{
              background: "#151515",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#E5E5E5",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }}
              >
                <LogOut size={18} />
              </div>
              <span className="font-bold">Sair</span>
            </div>
            <p className="text-xs mt-2 hidden md:block pl-[52px]" style={{ color: "#6B6B6B" }}>
              Encerrar sessão neste dispositivo
            </p>
          </motion.button>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
