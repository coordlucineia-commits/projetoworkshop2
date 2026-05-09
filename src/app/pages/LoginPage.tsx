import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { resolveLoginDestination } from "../../lib/authRedirect";

function mapAuthErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid_credentials")) {
    return "E-mail ou senha incorretos.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (m.includes("too many requests")) {
    return "Muitas tentativas. Aguarde um momento e tente de novo.";
  }
  return raw;
}

type View = "login" | "forgot" | "forgot_done";

export function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");

  // ── login ──
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── recuperar senha ──
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [devTempPassword, setDevTempPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!isSupabaseConfigured) {
      setLoginError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      return;
    }
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) {
      setLoginError("Informe e-mail e senha.");
      return;
    }
    setSubmitting(true);
    const supabase = getSupabase();
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });
    if (authErr || !authData.user) {
      setLoginError(mapAuthErrorMessage(authErr?.message ?? "Falha no login."));
      setSubmitting(false);
      return;
    }
    const {
      data: { user: verified },
      error: verifyErr,
    } = await supabase.auth.getUser();
    if (verifyErr || !verified) {
      setLoginError(verifyErr?.message ?? "Sessão não confirmada. Tente novamente.");
      setSubmitting(false);
      await supabase.auth.signOut();
      return;
    }

    // ── Checar flag de troca obrigatória de senha ──
    const forcePwChange = verified.user_metadata?.force_password_change === true;
    if (forcePwChange) {
      setSubmitting(false);
      navigate("/nova-senha", { replace: true });
      return;
    }

    const resolved = await resolveLoginDestination(supabase);
    setSubmitting(false);
    if (!resolved.ok) {
      await supabase.auth.signOut();
      if (resolved.code === "no_colaborador_perm") {
        setLoginError(
          "Sua conta de colaborador não tem nenhum módulo liberado. Entre em contato com o administrador.",
        );
        return;
      }
      setLoginError(
        "Este e-mail não está vinculado a um perfil LuTe Academy (aluno, professor ou equipe). Solicite seu cadastro na recepção.",
      );
      return;
    }
    navigate(resolved.path, { replace: true });
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryMsg(null);
    setDevTempPassword(null);
    const trimmed = recoveryEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setRecoveryMsg({ ok: false, text: "Informe um e-mail válido." });
      return;
    }
    setRecoveryLoading(true);
    try {
      const supabase = getSupabase();
      const appOrigin = `${window.location.protocol}//${window.location.host}`;
      const { data, error } = await supabase.functions.invoke("reset-password", {
        body: { email: trimmed, app_origin: appOrigin },
      });
      if (error) throw new Error(error.message);
      const res = data as { sent?: boolean; emailSent?: boolean; tempPassword?: string } | null;
      if (res?.tempPassword) {
        // Sem Resend configurado — modo dev: mostra no próprio app
        setDevTempPassword(res.tempPassword);
        setRecoveryMsg({
          ok: true,
          text: "Senha temporária gerada (Resend não configurado — copie abaixo).",
        });
      } else {
        setRecoveryMsg({
          ok: true,
          text: "Se o e-mail estiver cadastrado, você receberá a senha temporária em instantes.",
        });
      }
      setView("forgot_done");
    } catch (err) {
      setRecoveryMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Erro ao solicitar recuperação. Tente novamente.",
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  // ── sub-componentes de layout (fundo idêntico em todos os views) ──────────
  const pageShell = (children: React.ReactNode) => (
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
      {/* Grid noise */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
          {children}
        </div>
      </motion.div>
    </div>
  );

  const logo = (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#00F9E4" }}>
        <span className="font-black text-base" style={{ color: "#0A0A0A" }}>LT</span>
      </div>
      <span className="text-2xl font-black tracking-tight text-white">
        Lu<span style={{ color: "#00F9E4" }}>Te</span>
      </span>
    </div>
  );

  const footer = (
    <div className="mt-7 space-y-4">
      <p className="text-[10px] text-center uppercase tracking-wider font-mono" style={{ color: "#3A3A3A" }}>
        Conta institucional vinculada ao cadastro LuTe Academy
      </p>
      <p className="text-center font-mono" style={{ fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.07em" }}>
        desenvolvido por{" "}
        <span style={{ color: "#4A4A4A", fontWeight: 700 }}>Lucineia Tenorio</span>
      </p>
    </div>
  );

  // ── VIEW: login ───────────────────────────────────────────────────────────
  if (view === "login") {
    return pageShell(
      <>
        <div className="flex flex-col items-center mb-8">
          {logo}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: "rgba(0,249,228,0.08)", border: "1px solid rgba(0,249,228,0.2)" }}
          >
            <LogIn size={28} style={{ color: "#00F9E4" }} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-center mb-2 tracking-tight text-white">
            Login LuTe Academy
          </h1>
          <p className="text-sm text-center leading-relaxed" style={{ color: "#9A9A9A" }}>
            Uma entrada para aluno, professor ou administrativo.{" "}
            <span style={{ color: "#00F9E4" }}>Redirecionamento automático</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* E-mail */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest px-2 font-mono" style={{ color: "#9A9A9A" }}>
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={18} style={{ color: "#00F9E4" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@academia.com.br"
                className="w-full pl-12 pr-5 py-3.5 rounded-full text-sm text-white transition-colors outline-none"
                style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#F5F5F5" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00F9E4")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <label className="block text-[10px] uppercase tracking-widest font-mono" style={{ color: "#9A9A9A" }}>
                Senha
              </label>
              <button
                type="button"
                onClick={() => { setRecoveryEmail(email); setView("forgot"); }}
                className="text-[10px] uppercase tracking-widest font-mono transition-colors"
                style={{ color: "#606060", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={18} style={{ color: "#00F9E4" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 rounded-full text-sm transition-colors outline-none"
                style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#F5F5F5" }}
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
              </button>
            </div>
          </div>

          {loginError && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}>
              <AlertCircle size={15} className="shrink-0" />
              {loginError}
            </div>
          )}

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
            <LogIn size={16} />
            {submitting ? "Entrando…" : "Entrar"}
          </motion.button>
        </form>

        <div className="mt-7 space-y-4">
          <p className="text-[10px] text-center uppercase tracking-wider font-mono" style={{ color: "#3A3A3A" }}>
            Conta institucional vinculada ao cadastro LuTe Academy
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ color: "#606060" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
          >
            <ArrowLeft size={15} className="shrink-0 text-primary" />
            Voltar para homepage
          </button>
          <p className="text-center font-mono" style={{ fontSize: "10px", color: "#2E2E2E", letterSpacing: "0.07em" }}>
            desenvolvido por{" "}
            <span style={{ color: "#4A4A4A", fontWeight: 700 }}>Lucineia Tenorio</span>
          </p>
        </div>
      </>
    );
  }

  // ── VIEW: forgot (entrada do e-mail) ──────────────────────────────────────
  if (view === "forgot") {
    return pageShell(
      <>
        <div className="flex flex-col items-center mb-8">
          {logo}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: "rgba(0,249,228,0.08)", border: "1px solid rgba(0,249,228,0.2)" }}
          >
            <KeyRound size={28} style={{ color: "#00F9E4" }} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-center mb-2 tracking-tight text-white">
            Recuperar acesso
          </h1>
          <p className="text-sm text-center leading-relaxed" style={{ color: "#9A9A9A" }}>
            Informe seu e-mail cadastrado. Você receberá uma{" "}
            <span style={{ color: "#00F9E4" }}>senha temporária</span> para entrar.
          </p>
        </div>

        <form onSubmit={handleRecovery} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest px-2 font-mono" style={{ color: "#9A9A9A" }}>
              E-mail cadastrado
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={18} style={{ color: "#00F9E4" }} />
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="usuario@academia.com.br"
                autoFocus
                className="w-full pl-12 pr-5 py-3.5 rounded-full text-sm transition-colors outline-none"
                style={{ background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#F5F5F5" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00F9E4")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
              />
            </div>
          </div>

          <AnimatePresence>
            {recoveryMsg && !recoveryMsg.ok && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}
              >
                <AlertCircle size={15} className="shrink-0" />
                {recoveryMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={recoveryLoading}
            whileHover={{ scale: recoveryLoading ? 1 : 1.02 }}
            whileTap={{ scale: recoveryLoading ? 1 : 0.98 }}
            className="w-full py-3.5 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
            <KeyRound size={16} />
            {recoveryLoading ? "Enviando…" : "Enviar senha temporária"}
          </motion.button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setView("login")}
            className="w-full text-sm flex items-center justify-center gap-2 transition-colors"
            style={{ color: "#606060" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
          >
            <ArrowLeft size={15} className="shrink-0 text-primary" />
            Voltar ao login
          </button>
        </div>
        {footer}
      </>
    );
  }

  // ── VIEW: forgot_done (confirmação) ───────────────────────────────────────
  return pageShell(
    <>
      <div className="flex flex-col items-center mb-8">
        {logo}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <CheckCircle2 size={28} style={{ color: "#22C55E" }} strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-black uppercase text-center mb-2 tracking-tight text-white">
          Verifique seu e-mail
        </h1>
        <p className="text-sm text-center leading-relaxed" style={{ color: "#9A9A9A" }}>
          {recoveryMsg?.text ?? "Senha temporária enviada para o e-mail cadastrado."}
        </p>
      </div>

      {/* Modo dev: exibe senha temporária quando Resend não está configurado */}
      {devTempPassword && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-5 text-center"
          style={{ background: "#111111", border: "1px solid #2A2A2A" }}
        >
          <p className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: "#6B6B6B" }}>
            Senha temporária gerada
          </p>
          <p className="text-2xl font-black tracking-[0.3em] font-mono" style={{ color: "#00F9E4" }}>
            {devTempPassword}
          </p>
          <p className="text-[10px] mt-2" style={{ color: "#555" }}>
            Configure RESEND_API_KEY na Edge Function para envio automático por e-mail.
          </p>
        </motion.div>
      )}

      <p className="text-sm text-center mb-6" style={{ color: "#6B6B6B" }}>
        Use a senha temporária para entrar. Ao acessar, você será solicitado a{" "}
        <span style={{ color: "#00F9E4" }}>criar uma nova senha</span>.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setView("login")}
        className="w-full py-3.5 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
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
        <LogIn size={16} />
        Ir para o login
      </motion.button>

      {footer}
    </>
  );
}
