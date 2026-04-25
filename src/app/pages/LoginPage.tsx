import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    setSubmitting(true);
    const supabase = getSupabase();
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    if (authErr || !authData.user) {
      setError(authErr?.message ?? "Falha no login.");
      setSubmitting(false);
      return;
    }
    const uid = authData.user.id;
    const { data: isAdmin, error: rpcErr } = await supabase.rpc("is_admin", { uid });
    if (rpcErr) {
      await supabase.auth.signOut();
      setError(rpcErr.message);
      setSubmitting(false);
      return;
    }
    if (!isAdmin) {
      await supabase.auth.signOut();
      setError("Este usuário não possui perfil de administrador ativo.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10"
          style={{ background: "#00F9E4" }}
        />
      </div>

      {/* Grid noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          className="relative rounded-[16px] p-8 md:p-10"
          style={{
            background: "#0D0D0D",
            border: "1px solid #1E1E1E",
            boxShadow: "0 0 60px rgba(0,249,228,0.06)",
          }}
        >
          {/* Top cian line */}
          <div
            className="absolute top-0 left-8 right-8 h-[1px] rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,249,228,0.4), transparent)" }}
          />

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "#00F9E4" }}
              >
                <span className="font-black text-base" style={{ color: "#0A0A0A" }}>LT</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Lu<span style={{ color: "#00F9E4" }}>Te</span>
              </span>
            </div>

            {/* Shield icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{
                background: "rgba(0,249,228,0.08)",
                border: "1px solid rgba(0,249,228,0.2)",
              }}
            >
              <Shield size={28} style={{ color: "#00F9E4" }} strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black uppercase text-center mb-2 tracking-tight text-white">
              PAINEL ADMIN
            </h1>
            <p className="text-sm text-center leading-relaxed" style={{ color: "#9A9A9A" }}>
              Acesso restrito ao sistema de gestão{" "}
              <span style={{ color: "#00F9E4" }}>LuTe Academy</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* E-mail */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest px-2 font-mono" style={{ color: "#9A9A9A" }}>
                E-mail
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={18}
                  style={{ color: "#606060" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@academia.com.br"
                  className="w-full pl-12 pr-5 py-3.5 rounded-full text-sm text-white transition-colors outline-none"
                  style={{
                    background: "#0A0A0A",
                    border: "1px solid #2A2A2A",
                    color: "#F5F5F5",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00F9E4")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest px-2 font-mono" style={{ color: "#9A9A9A" }}>
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={18}
                  style={{ color: "#606060" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-full text-sm transition-colors outline-none"
                  style={{
                    background: "#0A0A0A",
                    border: "1px solid #2A2A2A",
                    color: "#F5F5F5",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00F9E4")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#606060" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span className="sr-only">{showPassword ? "Ocultar senha" : "Mostrar senha"}</span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-center px-2" style={{ color: "#F87171" }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
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
              <Shield size={16} />
              {submitting ? "Entrando…" : "ACESSAR PAINEL"}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-7 space-y-4">
            <p
              className="text-[10px] text-center uppercase tracking-wider font-mono"
              style={{ color: "#3A3A3A" }}
            >
              Acesso exclusivo para administradores
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full text-sm flex items-center justify-center gap-2 transition-colors"
              style={{ color: "#606060" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
            >
              <ArrowLeft size={15} />
              Voltar para área do membro
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
