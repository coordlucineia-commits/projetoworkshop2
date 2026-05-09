import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { resolveLoginDestination } from "../../lib/authRedirect";
import { DevFooter } from "../components/DevFooter";

export function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Garante que há sessão ativa; caso contrário redireciona para login
  useEffect(() => {
    if (!isSupabaseConfigured) { navigate("/login", { replace: true }); return; }
    void getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) navigate("/login", { replace: true });
        else setChecking(false);
      });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (nova.length < 6) {
      setError("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (nova !== confirmar) {
      setError("As senhas não coincidem.");
      return;
    }
    setSaving(true);
    const sb = getSupabase();
    const { error: updErr } = await sb.auth.updateUser({
      password: nova,
      data: { force_password_change: false },
    });
    setSaving(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    const resolved = await resolveLoginDestination(sb);
    if (!resolved.ok) {
      await sb.auth.signOut();
      navigate("/login", { replace: true });
      return;
    }
    navigate(resolved.path, { replace: true });
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}
    >
      {/* glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10"
          style={{ background: "#00F9E4" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          className="relative rounded-[16px] p-8 md:p-10"
          style={{ background: "#0D0D0D", border: "1px solid #1E1E1E", boxShadow: "0 0 60px rgba(0,249,228,0.06)" }}
        >
          {/* top line */}
          <div className="absolute top-0 left-8 right-8 h-[1px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,249,228,0.4), transparent)" }} />

          {/* header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#00F9E4" }}>
                <span className="font-black text-base" style={{ color: "#0A0A0A" }}>LT</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Lu<span style={{ color: "#00F9E4" }}>Te</span>
              </span>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: "rgba(0,249,228,0.08)", border: "1px solid rgba(0,249,228,0.2)" }}
            >
              <ShieldCheck size={28} style={{ color: "#00F9E4" }} strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-black uppercase text-center mb-2 tracking-tight text-white">
              Criar nova senha
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: "#9A9A9A" }}>
              Você entrou com uma senha temporária.{" "}
              <span style={{ color: "#00F9E4" }}>Defina uma senha definitiva</span> para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova senha */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest px-2 font-mono" style={{ color: "#9A9A9A" }}>
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={18} style={{ color: "#00F9E4" }} />
                <input
                  type={showNova ? "text" : "password"}
                  value={nova}
                  onChange={(e) => setNova(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                  className="w-full pl-12 pr-12 py-3.5 rounded-full text-sm transition-colors outline-none"
                  style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#F5F5F5" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00F9E4")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
                />
                <button type="button" onClick={() => setShowNova((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#606060" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
                >
                  {showNova ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmar */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest px-2 font-mono" style={{ color: "#9A9A9A" }}>
                Confirmar nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={18} style={{ color: "#00F9E4" }} />
                <input
                  type={showConfirmar ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full pl-12 pr-12 py-3.5 rounded-full text-sm transition-colors outline-none"
                  style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#F5F5F5" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00F9E4")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
                />
                <button type="button" onClick={() => setShowConfirmar((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#606060" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
                >
                  {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Indicador de força */}
            {nova.length > 0 && (
              <div className="flex gap-1.5 px-2">
                {[...Array(4)].map((_, i) => {
                  const strength = nova.length >= 10 ? 4 : nova.length >= 8 ? 3 : nova.length >= 6 ? 2 : 1;
                  const colors = ["#F87171", "#FBBF24", "#34D399", "#00F9E4"];
                  return (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: i < strength ? colors[strength - 1] : "#2A2A2A" }} />
                  );
                })}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}>
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="w-full py-3.5 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#00F9E4", color: "#0A0A0A" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#33FFEE";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(0,249,228,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#00F9E4";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <ShieldCheck size={16} />
              {saving ? "Salvando…" : "Definir nova senha"}
            </motion.button>
          </form>

          <div className="mt-6">
            <DevFooter />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
