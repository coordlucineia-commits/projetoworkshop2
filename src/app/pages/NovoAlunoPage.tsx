import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Printer,
  Save,
  User2,
  Heart,
  AlertTriangle,
  Target,
  Ruler,
  CreditCard,
  FileCheck,
  ChevronDown,
  Zap,
  UserPlus,
  CheckCircle2,
  Eraser,
} from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import type { PlanoRow } from "../../lib/cadastroAluno";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { salvarCadastroAluno } from "../../lib/salvarCadastroAluno";

// ─── Reusable form primitives ──────────────────────────────────────────────

const IC =
  "w-full bg-[#1A1A1A] border border-[#303030] rounded-full px-5 py-3 text-white text-sm placeholder:text-[#606060] focus:outline-none transition-all";

const TC =
  "w-full bg-[#1A1A1A] border border-[#303030] rounded-[16px] px-5 py-3 text-white text-sm placeholder:text-[#606060] focus:outline-none transition-all resize-none";

function focusCian(e: React.FocusEvent<any>) {
  e.currentTarget.style.borderColor = "#00F9E4";
}
function blurGray(e: React.FocusEvent<any>) {
  e.currentTarget.style.borderColor = "#303030";
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="block font-mono text-[10px] uppercase tracking-widest mb-2"
      style={{ color: "#A8A8A8" }}
    >
      {children}
      {required && <span style={{ color: "#00F9E4" }}> *</span>}
    </label>
  );
}

function SelectField({
  children,
  value,
  onChange,
  placeholder = "Selecione",
  disabled,
}: {
  children: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        disabled={disabled}
        className={IC + " appearance-none cursor-pointer pr-10"}
        style={{ color: value ? "#F5F5F5" : "#606060" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={focusCian}
        onBlur={blurGray}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#606060" }}
      />
    </div>
  );
}

// SIM / NÃO pill toggle
function TogglePills({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const colorFor = (opt: string, selected: boolean) => {
    if (!selected)
      return {
        bg: "transparent",
        border: "#2A2A2A",
        color: "#606060",
      };
    if (opt === "SIM")
      return { bg: "rgba(0,249,228,0.1)", border: "#00F9E4", color: "#00F9E4" };
    if (opt === "NÃO")
      return {
        bg: "rgba(154,154,154,0.1)",
        border: "#9A9A9A",
        color: "#9A9A9A",
      };
    return { bg: "rgba(0,249,228,0.1)", border: "#00F9E4", color: "#00F9E4" };
  };

  return (
    <div className="flex gap-2 shrink-0">
      {options.map((opt) => {
        const sel = value === opt;
        const c = colorFor(opt, sel);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === value ? "" : opt)}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-150 border"
            style={{
              background: c.bg,
              borderColor: c.border,
              color: c.color,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// Question row for anamnese / PAR-Q
function QuestionRow({
  label,
  questionKey,
  options = ["SIM", "NÃO"],
  answers,
  setAnswer,
}: {
  label: string;
  questionKey: string;
  options?: string[];
  answers: Record<string, string>;
  setAnswer: (k: string, v: string) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3"
      style={{ borderBottom: "1px solid #1A1A1A" }}
    >
      <span className="text-sm flex-1 leading-snug" style={{ color: "#CFCFCF" }}>
        {label}
      </span>
      <TogglePills
        options={options}
        value={answers[questionKey] || ""}
        onChange={(v) => setAnswer(questionKey, v)}
      />
    </div>
  );
}

// Section card wrapper
function SectionCard({
  icon,
  iconColor,
  iconBg,
  number,
  title,
  optional,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  number: string;
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] overflow-hidden"
      style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{ borderBottom: `2px solid ${iconColor}` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <h2 className="font-black uppercase tracking-tight text-base text-white">
          {number}. {title}
        </h2>
        {optional && (
          <span
            className="ml-auto text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              color: "#606060",
              border: "1px solid #2A2A2A",
              background: "transparent",
            }}
          >
            Opcional
          </span>
        )}
      </div>
      {/* Section body */}
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function NovoAlunoPage() {
  const navigate = useNavigate();

  // ── Section 1: Dados Pessoais ──
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [sexo, setSexo] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [profissao, setProfissao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [contatoEmergencia, setContatoEmergencia] = useState("");
  const [telEmergencia, setTelEmergencia] = useState("");
  const [fotoAluno, setFotoAluno] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoAluno(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFotoClick = () => {
    fileInputRef.current?.click();
  };

  // ── Section 2: Anamnese ──
  const [anamnese, setAnamnese] = useState<Record<string, string>>({});
  const setAnamneseAnswer = (k: string, v: string) =>
    setAnamnese((p) => ({ ...p, [k]: v }));

  // ── Section 3: PAR-Q ──
  const [parq, setParq] = useState<Record<string, string>>({});
  const setParqAnswer = (k: string, v: string) =>
    setParq((p) => ({ ...p, [k]: v }));
  const parqHasSim = Object.values(parq).some((v) => v === "SIM");

  // ── Section 4: Objetivos ──
  const [objetivo, setObjetivo] = useState("");
  const [jaTreinou, setJaTreinou] = useState("");
  const [tempoPratica, setTempoPratica] = useState("");
  const [vezesSemana, setVezesSemana] = useState("");
  const [horarioPref, setHorarioPref] = useState("");

  // ── Section 5: Corporais ──
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [imc, setImc] = useState("");
  const [gordura, setGordura] = useState("");
  const [medidas, setMedidas] = useState("");

  // ── Section 6: Plano (estados antes dos efeitos que os usam) ──
  const [tipoPlano, setTipoPlano] = useState("");
  const [valorPlano, setValorPlano] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataVenc, setDataVenc] = useState("");
  const [formaPagto, setFormaPagto] = useState("");
  const [planos, setPlanos] = useState<PlanoRow[]>([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = parseFloat(peso);
    const h = parseFloat(altura) / 100;
    if (p > 0 && h > 0) {
      setImc((p / (h * h)).toFixed(1));
    } else {
      setImc("");
    }
  }, [peso, altura]);

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured) {
      setLoadingPlanos(false);
      return;
    }
    void (async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("planos")
          .select("*")
          .eq("ativo", true)
          .order("nome");
        if (cancelled) return;
        if (error) {
          toast.error("Não foi possível carregar os planos.");
          setPlanos([]);
        } else {
          setPlanos(data ?? []);
        }
      } catch {
        if (!cancelled) toast.error("Supabase não configurado ou indisponível.");
      } finally {
        if (!cancelled) setLoadingPlanos(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!tipoPlano || tipoPlano === "OUTRO") return;
    const pl = planos.find((x) => x.id === tipoPlano);
    if (pl) {
      setValorPlano(
        pl.preco.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
    }
  }, [tipoPlano, planos]);

  // ── Section 7: Termo ──
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const today = new Date().toISOString().split("T")[0];

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPosRef.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#00F9E4";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env");
      return;
    }
    const canvas = canvasRef.current;
    let assinaturaPng: string | null = null;
    if (canvas) {
      try {
        assinaturaPng = canvas.toDataURL("image/png");
      } catch {
        assinaturaPng = null;
      }
    }
    setSaving(true);
    try {
      const sb = getSupabase();
      const res = await salvarCadastroAluno(sb, {
        nome,
        dataNasc,
        cpf,
        rg,
        sexo,
        estadoCivil,
        profissao,
        telefone,
        email,
        endereco,
        contatoEmergencia,
        telEmergencia,
        foto: fotoAluno,
        anamnese,
        parq,
        parqHasSim,
        objetivo,
        jaTreinou,
        tempoPratica,
        vezesSemana,
        horarioPref,
        peso,
        altura,
        imc,
        gordura,
        medidasTexto: medidas,
        tipoPlano,
        valorPlano,
        dataInicio,
        dataVenc,
        formaPagto,
        assinaturaPng,
      });
      toast.success(`Aluno ${res.matricula} cadastrado. PIN de check-in: ${res.pin}`);
      navigate("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar cadastro.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const OBJECTIVES = [
    "Emagrecimento",
    "Hipertrofia",
    "Condicionamento Físico",
    "Reabilitação",
    "Saúde Geral",
    "Outro",
  ];

  // CPF mask
  const handleCpf = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    const masked = n
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(masked);
  };

  // Phone mask
  const handlePhone =
    (setter: (v: string) => void) => (v: string) => {
      const n = v.replace(/\D/g, "").slice(0, 11);
      const masked = n
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
      setter(masked);
    };

  return (
    <div
      className="min-h-screen flex overflow-x-hidden"
      style={{ background: "#0A0A0A", color: "#F5F5F5", maxWidth: "100%", width: "100%" }}
    >
      <AdminSidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Header ── */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-4 shrink-0"
          style={{ background: "#111111", borderBottom: "1px solid #1E1E1E" }}
        >
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <button
              onClick={() => navigate("/dashboard")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors"
            >
              Novo Aluno
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }}>Cadastro de Novo Aluno</span>
          </div>
          <div className="md:hidden font-black uppercase tracking-tight text-lg" style={{ color: "#F2F2F2" }}>
            CADASTRO
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/cadastro")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all"
              style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#F5F5F5" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#00F9E4";
                (e.currentTarget as HTMLButtonElement).style.color = "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A2A";
                (e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5";
              }}
            >
              <UserPlus size={14} />
              Novo Aluno
            </button>
            <button
              onClick={() => navigate("/cadastro")}
              className="md:hidden p-2 rounded-full transition-colors"
              style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#F2F2F2" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#303030";
              }}
            >
              <UserPlus size={16} />
            </button>
            <button
              onClick={() => navigate("/recepcao")}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap"
              style={{ background: "#00F9E4", color: "#0A0A0A" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#33FFEE";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,249,228,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#00F9E4";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <Zap size={14} />
              <span className="hidden sm:inline">Ativar Recepção</span>
              <span className="sm:hidden">Recepção</span>
            </button>
          </div>
        </header>

        {/* ── Form Action Bar ── */}
        <div
          className="flex items-center justify-between px-4 md:px-6 py-3 shrink-0"
          style={{ background: "#090909", borderBottom: "1px solid #1E1E1E" }}
        >
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="hidden md:flex items-center gap-2 text-sm font-mono uppercase tracking-wider transition-colors"
              style={{ color: "#606060" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#606060")
              }
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div
              className="hidden md:block w-px h-6 shrink-0"
              style={{ background: "#303030" }}
            />
            <h1
              className="font-black uppercase tracking-tight text-sm md:text-lg"
              style={{ color: "#F2F2F2" }}
            >
              Cadastrar Novo Aluno
            </h1>
          </div>

          {/* Right: Print + Save */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
                color: "#F2F2F2",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor = "#606060")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor = "#303030")
              }
            >
              <Printer size={14} />
              Imprimir
            </button>
            <button
              type="submit"
              form="form-novo-aluno"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-50"
              style={{ background: "#00F9E4", color: "#0A0A0A" }}
              onMouseEnter={(e) => {
                if (saving) return;
                (e.currentTarget as HTMLButtonElement).style.background = "#33FFEE";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 20px rgba(0,249,228,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#00F9E4";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <Save size={14} />
              {saving ? "Salvando…" : "Salvar Cadastro"}
            </button>
          </div>
        </div>

        {/* ── Scrollable Form ── */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 min-w-0">
          <form
            id="form-novo-aluno"
            onSubmit={handleSubmit}
            className="w-full min-w-0 px-4 md:px-6 py-6 space-y-5 box-border"
          >

            {/* ═══ SECTION 1: DADOS PESSOAIS ═══ */}
            <SectionCard
              number="1"
              title="Dados Pessoais"
              icon={<User2 size={16} style={{ color: "#00F9E4" }} />}
              iconColor="#00F9E4"
              iconBg="rgba(0,249,228,0.12)"
            >
              <div className="space-y-4">
                {/* Foto do Aluno */}
                <div className="flex flex-col items-center gap-3 pb-4" style={{ borderBottom: "1px solid #1E1E1E" }}>
                  <FieldLabel>Foto do Aluno</FieldLabel>
                  <div
                    onClick={handleFotoClick}
                    className="relative group cursor-pointer"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      border: "2px dashed #303030",
                      background: fotoAluno ? "transparent" : "#1A1A1A",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!fotoAluno) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#00F9E4";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!fotoAluno) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#303030";
                      }
                    }}
                  >
                    {fotoAluno ? (
                      <>
                        <img
                          src={fotoAluno}
                          alt="Foto do aluno"
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300"
                        >
                          <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Trocar foto
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <User2 size={32} style={{ color: "#606060" }} />
                        <span className="text-xs text-center px-2" style={{ color: "#606060" }}>
                          Clique para adicionar
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-center" style={{ color: "#606060" }}>
                    Formatos: JPG, PNG (máx. 5MB)
                  </p>
                </div>

                {/* Nome */}
                <div>
                  <FieldLabel required>Nome Completo</FieldLabel>
                  <input
                    type="text"
                    className={IC}
                    placeholder="Nome completo do aluno"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onFocus={focusCian}
                    onBlur={blurGray}
                  />
                </div>

                {/* Row: Data Nasc + CPF + RG */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel required>Data de Nascimento</FieldLabel>
                    <input
                      type="date"
                      className={IC}
                      style={{ colorScheme: "dark" }}
                      value={dataNasc}
                      onChange={(e) => setDataNasc(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel required>CPF</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => handleCpf(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel required>RG</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      placeholder="00.000.000-0"
                      value={rg}
                      onChange={(e) => setRg(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>

                {/* Row: Sexo + Estado Civil + Profissão */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel required>Sexo</FieldLabel>
                    <SelectField value={sexo} onChange={setSexo}>
                      <option value="F">Feminino</option>
                      <option value="M">Masculino</option>
                      <option value="O">Outro</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel required>Estado Civil</FieldLabel>
                    <SelectField value={estadoCivil} onChange={setEstadoCivil}>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viuvo">Viúvo(a)</option>
                      <option value="outro">Outro</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel required>Profissão</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      placeholder="Ex: Engenheiro, Professor..."
                      value={profissao}
                      onChange={(e) => setProfissao(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>

                {/* Row: Telefone + E-mail */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Telefone (WhatsApp)</FieldLabel>
                    <input
                      type="tel"
                      className={IC}
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      onChange={(e) => handlePhone(setTelefone)(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel required>E-mail</FieldLabel>
                    <input
                      type="email"
                      className={IC}
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <FieldLabel required>Endereço Completo</FieldLabel>
                  <input
                    type="text"
                    className={IC}
                    placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    onFocus={focusCian}
                    onBlur={blurGray}
                  />
                </div>

                {/* Row: Contato Emergência */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Contato de Emergência</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      placeholder="Nome completo"
                      value={contatoEmergencia}
                      onChange={(e) => setContatoEmergencia(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Telefone do Contato de Emergência</FieldLabel>
                    <input
                      type="tel"
                      className={IC}
                      placeholder="(00) 00000-0000"
                      value={telEmergencia}
                      onChange={(e) =>
                        handlePhone(setTelEmergencia)(e.target.value)
                      }
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ═══ SECTION 2: ANAMNESE ═══ */}
            <SectionCard
              number="2"
              title="Dados de Saúde (Anamnese Básica)"
              icon={<Heart size={16} style={{ color: "#EF4444" }} />}
              iconColor="#EF4444"
              iconBg="rgba(239,68,68,0.12)"
            >
              <div className="divide-y-0">
                {[
                  { key: "doenca", label: "Possui alguma doença diagnosticada?" },
                  { key: "cardiaco", label: "Problemas cardíacos?" },
                  {
                    key: "pressao",
                    label: "Pressão alta ou baixa?",
                    options: ["NÃO", "ALTA", "BAIXA"],
                  },
                  { key: "diabetes", label: "Possui diabetes?" },
                  { key: "desmaios", label: "Desmaios ou tonturas frequentes?" },
                  { key: "respiratorio", label: "Problemas respiratórios?" },
                  { key: "articular", label: "Problemas articulares?" },
                  { key: "cirurgia", label: "Já realizou cirurgia?" },
                  { key: "medicacao", label: "Faz uso de medicação contínua?" },
                  {
                    key: "gestante",
                    label: "Está gestante?",
                    options: ["SIM", "NÃO", "N/A"],
                  },
                  { key: "limitacao", label: "Possui limitação física?" },
                  {
                    key: "recomMedica",
                    label: "Possui recomendação médica para prática de exercícios?",
                  },
                ].map((q) => (
                  <QuestionRow
                    key={q.key}
                    label={q.label}
                    questionKey={q.key}
                    options={q.options}
                    answers={anamnese}
                    setAnswer={setAnamneseAnswer}
                  />
                ))}
              </div>
            </SectionCard>

            {/* ═══ SECTION 3: PAR-Q ═══ */}
            <SectionCard
              number="3"
              title="Questionário PAR-Q (Prontidão para Atividade Física)"
              icon={<AlertTriangle size={16} style={{ color: "#FACC15" }} />}
              iconColor="#FACC15"
              iconBg="rgba(250,204,21,0.12)"
            >
              <p className="text-xs mb-4 font-mono uppercase tracking-wider" style={{ color: "#606060" }}>
                Responda SIM ou NÃO para cada pergunta.
              </p>

              <div>
                {[
                  {
                    key: "p1",
                    label: "Algum médico já disse que você possui problema cardíaco?",
                  },
                  {
                    key: "p2",
                    label: "Sente dor no peito ao realizar atividade física?",
                  },
                  {
                    key: "p3",
                    label: "Sentiu dor no peito no último mês?",
                  },
                  {
                    key: "p4",
                    label:
                      "Perde o equilíbrio por tontura ou já perdeu a consciência?",
                  },
                  {
                    key: "p5",
                    label:
                      "Possui problema ósseo ou articular que pode piorar com exercício?",
                  },
                  {
                    key: "p6",
                    label:
                      "Seu médico já recomendou restrição de atividade física?",
                  },
                ].map((q) => (
                  <QuestionRow
                    key={q.key}
                    label={q.label}
                    questionKey={q.key}
                    answers={parq}
                    setAnswer={setParqAnswer}
                  />
                ))}
              </div>

              {/* PAR-Q Alert */}
              {parqHasSim && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start gap-3 p-4 rounded-[12px]"
                  style={{
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <AlertTriangle
                    size={16}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#EF4444" }}
                  />
                  <p className="text-sm leading-relaxed" style={{ color: "#CFCFCF" }}>
                    ⚠️ Se respondeu 1 ou mais respostas{" "}
                    <span style={{ color: "#EF4444" }} className="font-bold">
                      "SIM"
                    </span>
                    , recomendamos avaliação médica antes de iniciar as atividades
                    físicas.
                  </p>
                </motion.div>
              )}
            </SectionCard>

            {/* ═══ SECTION 4: OBJETIVOS ═══ */}
            <SectionCard
              number="4"
              title="Objetivos do Aluno"
              icon={<Target size={16} style={{ color: "#00F9E4" }} />}
              iconColor="#00F9E4"
              iconBg="rgba(0,249,228,0.12)"
            >
              <div className="space-y-5">
                {/* Objetivo principal */}
                <div>
                  <FieldLabel>Qual seu principal objetivo?</FieldLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {OBJECTIVES.map((obj) => {
                      const sel = objetivo === obj;
                      return (
                        <button
                          key={obj}
                          type="button"
                          onClick={() => setObjetivo(sel ? "" : obj)}
                          className="px-4 py-3 rounded-full text-sm transition-all border text-center"
                          style={
                            sel
                              ? {
                                  background: "rgba(0,249,228,0.1)",
                                  borderColor: "#00F9E4",
                                  color: "#00F9E4",
                                }
                              : {
                                  background: "transparent",
                                  borderColor: "#2A2A2A",
                                  color: "#9A9A9A",
                                }
                          }
                        >
                          {obj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Já treinou + Tempo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Já treinou antes?</FieldLabel>
                    <SelectField value={jaTreinou} onChange={setJaTreinou}>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Há quanto tempo pratica exercícios?</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      placeholder="Ex: 6 meses, 2 anos"
                      value={tempoPratica}
                      onChange={(e) => setTempoPratica(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>

                {/* Vezes por semana + Horário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Quantas vezes por semana pretende treinar?</FieldLabel>
                    <SelectField value={vezesSemana} onChange={setVezesSemana}>
                      <option value="1">1× por semana</option>
                      <option value="2">2× por semana</option>
                      <option value="3">3× por semana</option>
                      <option value="4">4× por semana</option>
                      <option value="5">5× por semana</option>
                      <option value="6">6× por semana</option>
                      <option value="7">Todos os dias</option>
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel>Preferência de horário</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      placeholder="Ex: manhã, tarde, noite"
                      value={horarioPref}
                      onChange={(e) => setHorarioPref(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ═══ SECTION 5: INFORMAÇÕES CORPORAIS ═══ */}
            <SectionCard
              number="5"
              title="Informações Corporais (Avaliação Inicial)"
              icon={<Ruler size={16} style={{ color: "#8B5CF6" }} />}
              iconColor="#8B5CF6"
              iconBg="rgba(139,92,246,0.12)"
              optional
            >
              <div className="space-y-4">
                {/* Peso + Altura + IMC + %Gordura */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <FieldLabel>Peso</FieldLabel>
                    <div className="relative">
                      <input
                        type="number"
                        className={IC + " pr-12"}
                        placeholder="0"
                        value={peso}
                        onChange={(e) => setPeso(e.target.value)}
                        onFocus={focusCian}
                        onBlur={blurGray}
                      />
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono"
                        style={{ color: "#606060" }}
                      >
                        KG
                      </span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Altura</FieldLabel>
                    <div className="relative">
                      <input
                        type="number"
                        className={IC + " pr-12"}
                        placeholder="0"
                        value={altura}
                        onChange={(e) => setAltura(e.target.value)}
                        onFocus={focusCian}
                        onBlur={blurGray}
                      />
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono"
                        style={{ color: "#606060" }}
                      >
                        CM
                      </span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>IMC</FieldLabel>
                    <div className="relative">
                      <input
                        type="text"
                        className={IC}
                        placeholder="Auto"
                        value={imc}
                        readOnly
                        style={{
                          borderColor: imc ? "#00F9E4" : "#303030",
                          color: imc ? "#00F9E4" : "#606060",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>% Gordura</FieldLabel>
                    <div className="relative">
                      <input
                        type="number"
                        className={IC + " pr-8"}
                        placeholder="0"
                        value={gordura}
                        onChange={(e) => setGordura(e.target.value)}
                        onFocus={focusCian}
                        onBlur={blurGray}
                      />
                      <span
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono"
                        style={{ color: "#606060" }}
                      >
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medidas */}
                <div>
                  <FieldLabel>Medidas Corporais</FieldLabel>
                  <textarea
                    className={TC}
                    rows={3}
                    placeholder="Ex: Braço 35cm, Cintura 80cm, Quadril 96cm"
                    value={medidas}
                    onChange={(e) => setMedidas(e.target.value)}
                    onFocus={focusCian}
                    onBlur={blurGray}
                  />
                </div>
              </div>
            </SectionCard>

            {/* ═══ SECTION 6: PLANO CONTRATADO ═══ */}
            <SectionCard
              number="6"
              title="Plano Contratado"
              icon={<CreditCard size={16} style={{ color: "#4ADE80" }} />}
              iconColor="#4ADE80"
              iconBg="rgba(74,222,128,0.12)"
            >
              <div className="space-y-4">
                {/* Tipo + Valor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Tipo de Plano</FieldLabel>
                    <SelectField
                      value={tipoPlano}
                      onChange={setTipoPlano}
                      disabled={loadingPlanos || saving}
                    >
                      {loadingPlanos ? (
                        <option value="">Carregando planos…</option>
                      ) : (
                        <>
                          {planos.map((pl) => (
                            <option key={pl.id} value={pl.id}>
                              {pl.nome} —{" "}
                              {pl.preco.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                              /mês
                            </option>
                          ))}
                          <option value="OUTRO">Outro (valor manual)</option>
                        </>
                      )}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel required>Valor (R$)</FieldLabel>
                    <div className="relative">
                      <span
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-mono"
                        style={{ color: "#606060" }}
                      >
                        R$
                      </span>
                      <input
                        type="text"
                        className={IC + " pl-10"}
                        placeholder="0,00"
                        value={valorPlano}
                        onChange={(e) => setValorPlano(e.target.value)}
                        onFocus={focusCian}
                        onBlur={blurGray}
                        disabled={saving}
                        readOnly={tipoPlano !== "" && tipoPlano !== "OUTRO"}
                      />
                    </div>
                  </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Data de Início</FieldLabel>
                    <input
                      type="date"
                      className={IC}
                      style={{ colorScheme: "dark" }}
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Data de Vencimento</FieldLabel>
                    <input
                      type="date"
                      className={IC}
                      style={{ colorScheme: "dark" }}
                      value={dataVenc}
                      onChange={(e) => setDataVenc(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <FieldLabel required>Forma de Pagamento</FieldLabel>
                  <SelectField
                    value={formaPagto}
                    onChange={setFormaPagto}
                    disabled={saving}
                  >
                    <option value="PIX">PIX</option>
                    <option value="CARTAO_CREDITO">Cartão de crédito</option>
                    <option value="CARTAO_DEBITO">Cartão de débito</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="BOLETO">Boleto</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                  </SelectField>
                </div>
              </div>
            </SectionCard>

            {/* ═══ SECTION 7: TERMO DE RESPONSABILIDADE ═══ */}
            <SectionCard
              number="7"
              title="Termo de Responsabilidade"
              icon={<FileCheck size={16} style={{ color: "#00F9E4" }} />}
              iconColor="#00F9E4"
              iconBg="rgba(0,249,228,0.12)"
            >
              <div className="space-y-5">
                {/* Termo text */}
                <div
                  className="p-4 rounded-[12px] text-sm leading-relaxed space-y-3"
                  style={{
                    background: "#0A0A0A",
                    border: "1px solid #1E1E1E",
                    color: "#CFCFCF",
                  }}
                >
                  <p>
                    Declaro que as informações acima são verdadeiras e estou ciente de
                    que a prática de atividades físicas envolve riscos.
                    Comprometo-me a informar qualquer alteração em meu estado de saúde
                    à administração da academia.
                  </p>
                  <p>
                    Autorizo o uso dos meus dados conforme a{" "}
                    <span style={{ color: "#00F9E4" }}>
                      Lei Geral de Proteção de Dados (LGPD)
                    </span>{" "}
                    para fins administrativos da academia, incluindo comunicações sobre
                    serviços, agendamentos e informações relevantes.
                  </p>
                </div>

                {/* Assinatura */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Assinatura do Aluno</FieldLabel>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider transition-colors"
                      style={{ color: "#606060" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color = "#606060")
                      }
                    >
                      <Eraser size={12} />
                      Limpar
                    </button>
                  </div>
                  <div
                    className="rounded-[16px] overflow-hidden relative"
                    style={{ border: "1px solid #2A2A2A", background: "#0A0A0A" }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={120}
                      className="w-full h-[120px] cursor-crosshair touch-none"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={stopDraw}
                    />
                    <span
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest pointer-events-none select-none"
                      style={{ color: "#2A2A2A" }}
                    >
                      Assine aqui
                    </span>
                  </div>
                </div>

                {/* Data */}
                <div className="w-48">
                  <FieldLabel>Data</FieldLabel>
                  <input
                    type="date"
                    className={IC}
                    style={{ colorScheme: "dark" }}
                    defaultValue={today}
                    readOnly
                  />
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid #1E1E1E" }} />

                {/* REGISTRAR button */}
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="flex items-center gap-3 px-8 py-4 rounded-full font-black uppercase tracking-wider text-sm transition-all disabled:opacity-50"
                    style={{ background: "#00F9E4", color: "#0A0A0A" }}
                    onMouseEnter={(e) => {
                      if (saving) return;
                      (e.currentTarget as HTMLButtonElement).style.background = "#33FFEE";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 30px rgba(0,249,228,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#00F9E4";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                  >
                    <CheckCircle2 size={18} />
                    {saving ? "Salvando…" : "REGISTRAR ALUNO"}
                  </motion.button>
                </div>
              </div>
            </SectionCard>

          </form>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
