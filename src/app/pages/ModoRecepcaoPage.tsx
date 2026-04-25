import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "react-qr-code";
import {
  X,
  Hash,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

type AlunoCheckin = {
  id: string;
  nome: string;
  plano: string;
};

export function ModoRecepcaoPage() {
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<"codigo" | "email">("codigo");
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [erro, setErro] = useState(false);
  const [showSucesso, setShowSucesso] = useState(false);
  const [sucessoAluno, setSucessoAluno] = useState<AlunoCheckin | null>(null);
  const [checkinErro, setCheckinErro] = useState<string | null>(null);
  const [checkinCarregando, setCheckinCarregando] = useState(false);
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Listener para ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(true);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setErro(false);

    // Avançar para próximo campo
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const validarPin = () => {
    const pinCompleto = pin.join("");
    if (pinCompleto === "1234") {
      setShowModal(false);
      navigate("/dashboard");
    } else {
      setErro(true);
      setPin(["", "", "", ""]);
      pinRefs[0].current?.focus();
    }
  };

  const buscarAluno = useCallback(
    async (qRaw: string): Promise<AlunoCheckin | null> => {
      if (!isSupabaseConfigured) return null;
      const s = getSupabase();
      const q = qRaw.trim();
      if (!q) return null;

      const sel = "id, nome, matricula, email, pin, planos ( nome )";
      const planoDe = (row: { planos: { nome: string } | null } | null) =>
        row?.planos?.nome?.toUpperCase() ?? "—";

      if (q.includes("@")) {
        const { data } = await s
          .from("alunos")
          .select(sel)
          .ilike("email", q)
          .limit(1)
          .maybeSingle();
        if (data) {
          return { id: data.id, nome: data.nome, plano: planoDe(data) };
        }
        return null;
      }

      if (/^\d{4}$/.test(q)) {
        const { data } = await s
          .from("alunos")
          .select(sel)
          .eq("pin", q)
          .limit(1)
          .maybeSingle();
        if (data) {
          return { id: data.id, nome: data.nome, plano: planoDe(data) };
        }
      }

      const digits = q.replace(/\D/g, "");
      const mat = q.startsWith("#") ? q : digits ? `#${digits}` : q;
      const { data: m1 } = await s
        .from("alunos")
        .select(sel)
        .eq("matricula", mat)
        .limit(1)
        .maybeSingle();
      if (m1) {
        return { id: m1.id, nome: m1.nome, plano: planoDe(m1) };
      }

      if (!q.startsWith("#") && mat !== q) {
        const { data: m2 } = await s
          .from("alunos")
          .select(sel)
          .eq("matricula", q)
          .limit(1)
          .maybeSingle();
        if (m2) {
          return { id: m2.id, nome: m2.nome, plano: planoDe(m2) };
        }
      }

      return null;
    },
    [],
  );

  const handleSimularQR = () => {
    void (async () => {
      if (!isSupabaseConfigured) {
        setCheckinErro("Configure o Supabase no .env");
        return;
      }
      setCheckinErro(null);
      setCheckinCarregando(true);
      const al = await buscarAluno(busca);
      if (!al) {
        setCheckinErro("Nenhum aluno encontrado. Verifique e-mail, matrícula ou PIN de 4 dígitos.");
        setCheckinCarregando(false);
        return;
      }
      const s = getSupabase();
      const { error } = await s.from("checkins").insert({
        aluno_id: al.id,
        data_hora: new Date().toISOString(),
        metodo: "QR_CODE",
      });
      if (error) {
        setCheckinErro(error.message);
        setCheckinCarregando(false);
        return;
      }
      setSucessoAluno(al);
      setCheckinCarregando(false);
      setShowSucesso(true);
      setTimeout(() => {
        setShowSucesso(false);
        setSucessoAluno(null);
      }, 5000);
    })();
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ background: "#090909", maxWidth: "100%", width: "100%" }}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 py-4 flex items-center justify-between"
        style={{
          background: "rgba(13, 13, 13, 0.5)",
          borderBottom: "1px solid #000000",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#00F9E4" }}
          >
            <span className="font-black text-sm" style={{ color: "#0A0A0A" }}>
              LT
            </span>
          </div>
          <h1
            className="font-black text-base md:text-lg uppercase tracking-tight"
            style={{ color: "#F2F2F2" }}
          >
            Modo Recepção Ativo
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-6 h-6 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: "#F2F2F2" }}
        >
          <X size={20} />
        </button>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 pb-20 md:pb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl w-full"
        >
          {/* Headline */}
          <div className="text-center mb-9">
            <h2
              className="font-black text-6xl mb-2 uppercase tracking-tight"
              style={{ color: "#F2F2F2" }}
            >
              Aproxime o QR Code
            </h2>
            <p className="text-xl" style={{ color: "#A8A8A8" }}>
              ou digite seu código de membro / email
            </p>
          </div>

          {/* QR Code Area */}
          <div className="flex justify-center mb-12">
            <div
              className="w-80 h-80 rounded-2xl flex items-center justify-center"
              style={{ border: "4px solid #303030" }}
            >
              <QRCode
                value="LUTE-DEMO-12345"
                size={200}
                bgColor="#090909"
                fgColor="#303030"
                level="M"
              />
            </div>
          </div>

          {/* Tabs de método */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setMetodo("codigo")}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                background: metodo === "codigo" ? "#00F9E4" : "#1A1A1A",
                color: metodo === "codigo" ? "#0A0A0A" : "#606060",
              }}
            >
              <Hash size={14} />
              Código
            </button>

            <button
              onClick={() => setMetodo("email")}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                background: metodo === "email" ? "#00F9E4" : "#1A1A1A",
                color: metodo === "email" ? "#0A0A0A" : "#606060",
              }}
            >
              <Mail size={14} />
              Email
            </button>
          </div>

          {/* Campo de busca */}
          <div className="mb-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-6 top-1/2 -translate-y-1/2"
                style={{ color: "#606060" }}
              />
              <input
                type={metodo === "email" ? "email" : "text"}
                placeholder={
                  metodo === "codigo"
                    ? "Digite o código..."
                    : "Digite o email..."
                }
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-full px-16 py-4 text-base transition-colors"
                style={{
                  background: "#0D0D0D",
                  border: "2px solid #303030",
                  color: "#FFFFFF",
                }}
                onFocus={(e) =>
                  ((e.currentTarget as HTMLInputElement).style.borderColor =
                    "#00F9E4")
                }
                onBlur={(e) =>
                  ((e.currentTarget as HTMLInputElement).style.borderColor =
                    "#303030")
                }
              />
            </div>
            <p
              className="text-xs font-mono tracking-widest text-center mt-2"
              style={{ color: "#606060" }}
            >
              {metodo === "codigo" ? "Ex: #1234, PIN 4 dígitos" : "Ex: aluno@email.com"}
            </p>
            {checkinErro && (
              <p className="text-xs text-center mt-2 flex items-center justify-center gap-1" style={{ color: "#F87171" }}>
                <AlertCircle size={12} />
                {checkinErro}
              </p>
            )}
          </div>

          {/* Botão Simular */}
          <button
            onClick={handleSimularQR}
            disabled={checkinCarregando}
            className="w-full py-3 rounded-full text-sm font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50"
            style={{
              background: "#1A1A1A",
              border: "1px solid #303030",
              color: "#606060",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#00F9E4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "#303030";
            }}
          >
            {checkinCarregando ? "Registrando…" : "Confirmar check-in (QR / manual)"}
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="px-20 py-3"
        style={{
          background: "rgba(13, 13, 13, 0.5)",
          borderTop: "1px solid #303030",
        }}
      >
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest opacity-70" style={{ color: "#606060" }}>
          <span>
            Scanner QR Code ativo • Validação automática • Entrada manual
            disponível
          </span>
          <span>Pressione ESC para voltar</span>
        </div>
      </footer>

      {/* Modal de PIN */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0, 0, 0, 0.8)" }}
            onClick={() => {
              setShowModal(false);
              setPin(["", "", "", ""]);
              setErro(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="p-8 rounded-2xl max-w-md w-full"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
              }}
            >
              <h3
                className="font-black text-2xl mb-2 text-center uppercase tracking-tight"
                style={{ color: "#F2F2F2" }}
              >
                Acesso Restrito
              </h3>
              <p
                className="text-center mb-6"
                style={{ color: "#A8A8A8" }}
              >
                Insira a senha para sair do modo recepção
              </p>

              {/* PIN Inputs */}
              <div className="flex gap-3 justify-center mb-4">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-16 h-16 text-center text-3xl font-bold rounded-xl transition-all"
                    style={{
                      background: "#1A1A1A",
                      border: erro
                        ? "2px solid #EF4444"
                        : "2px solid #303030",
                      color: "#F2F2F2",
                    }}
                    onFocus={(e) =>
                      !erro &&
                      ((e.currentTarget as HTMLInputElement).style.borderColor =
                        "#00F9E4")
                    }
                    onBlur={(e) =>
                      !erro &&
                      ((e.currentTarget as HTMLInputElement).style.borderColor =
                        "#303030")
                    }
                  />
                ))}
              </div>

              {erro && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-sm mb-4"
                  style={{ color: "#EF4444" }}
                >
                  Senha incorreta. Tente novamente.
                </motion.p>
              )}

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setPin(["", "", "", ""]);
                    setErro(false);
                  }}
                  className="flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
                  style={{
                    background: "#1A1A1A",
                    border: "1px solid #303030",
                    color: "#606060",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#00F9E4";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#303030";
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={validarPin}
                  disabled={pin.some((d) => !d)}
                  className="flex-1 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "#00F9E4",
                    color: "#0A0A0A",
                  }}
                  onMouseEnter={(e) => {
                    if (!pin.some((d) => !d)) {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 30px rgba(0, 249, 228, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "none";
                  }}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tela de Sucesso */}
      <AnimatePresence>
        {showSucesso && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: "rgba(0, 0, 0, 0.95)" }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: "rgba(34, 197, 94, 0.2)" }}
              >
                <CheckCircle2 size={64} style={{ color: "#22C55E" }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-black text-5xl mb-3"
                style={{ color: "#F2F2F2" }}
              >
                Bem-vindo, {sucessoAluno?.nome ?? "—"}!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl mb-2"
                style={{ color: "#22C55E" }}
              >
                Check-in realizado com sucesso
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-6 text-lg"
                style={{ color: "#A8A8A8" }}
              >
                <span className="font-mono uppercase tracking-widest">
                  Plano: {sucessoAluno?.plano ?? "—"}
                </span>
                <span>•</span>
                <span className="font-mono">
                  {new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileBottomNav />
    </div>
  );
}
