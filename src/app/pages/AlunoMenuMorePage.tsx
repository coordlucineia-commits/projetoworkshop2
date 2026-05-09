import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, LogOut } from "lucide-react";
import { getAlunoSidebarNavItems } from "../../lib/alunoNavConfig";
import { getSupabase } from "../../lib/supabaseClient";

type Ctx = { alunoId: string; checkinRegistrado: boolean; alunoSexo: string | null };

export function AlunoMenuMorePage() {
  const navigate = useNavigate();
  const { alunoSexo } = useOutletContext<Ctx>();

  const items = useMemo(() => getAlunoSidebarNavItems(alunoSexo), [alunoSexo]);

  const onSair = () => void getSupabase().auth.signOut().then(() => navigate("/login"));

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border pt-6 pb-28 min-w-0">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-sm aluno-no-print"
        style={{ color: "#9A9A9A" }}
      >
        <ArrowLeft size={16} className="shrink-0 text-primary" /> Voltar
      </button>

      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-black text-2xl md:text-3xl tracking-tight mb-2"
        style={{ color: "#F2F2F2" }}
      >
        Mais
      </motion.h1>
      <p className="text-sm mb-8" style={{ color: "#6B6B6B" }}>
        Todo o menu da área do aluno — igual à barra lateral no desktop.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0">
        {items.map(({ label, path, hint, icon: Icon }, i) => (
          <motion.button
            key={path}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            onClick={() => navigate(path)}
            className="text-left rounded-2xl p-5 transition-colors w-full min-w-0"
            style={{
              background: "#111111",
              border: "1px solid #2A2A2A",
            }}
          >
            <div className="flex items-center gap-3 mb-0 md:mb-2 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,249,228,0.12)", color: "#00F9E4" }}
              >
                <Icon size={18} />
              </div>
              <span className="font-bold truncate" style={{ color: "#F2F2F2" }}>
                {label}
              </span>
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
        transition={{ delay: 0.04 * items.length }}
        onClick={onSair}
        className="mt-4 w-full text-left rounded-2xl p-5 transition-colors"
        style={{
          background: "#151515",
          border: "1px solid rgba(239,68,68,0.25)",
          color: "#E5E5E5",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
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
    </div>
  );
}
