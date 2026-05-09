import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useMatch } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Printer,
  User2,
  Heart,
  AlertTriangle,
  Target,
  CreditCard,
  FileCheck,
  ChevronDown,
  UserPlus,
  Eraser,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import {
  formatCpfBr,
  jsonRecordToFormStrings,
  LABEL_DURACAO_CONTRATO,
  MESES_CONTRATO,
  parseDuracaoContratoKey,
  parseMoneyBr,
  parseObservacoes,
  type DuracaoContratoKey,
  type PlanoRow,
  dataTerminoPorDataInicioEDuracao,
  valorTotalContratoLiquido,
  subtotalContratoBruto,
  multiplicadorAposDesconto,
  textoResumoDesconto,
  DESCONTO_CONTRATO,
} from "../../lib/cadastroAluno";
import type { Json } from "../../lib/database.types";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { atualizarCadastroAluno, salvarCadastroAluno } from "../../lib/salvarCadastroAluno";
import { invokeWelcomeUserCredentials } from "../../lib/welcomeUserCredentials";
import { DateInputBr } from "../components/DateInputBr";
import {
  ESPECIALIDADE_AVALIACAO_CORPORAL,
  professorTemAvaliacaoCorporal,
} from "../../lib/professorEspecialidades";

// ─── Reusable form primitives ──────────────────────────────────────────────

const IC =
  "w-full bg-[#1A1A1A] border border-[#303030] rounded-full px-5 py-3 text-white text-sm placeholder:text-[#606060] focus:outline-none transition-all";

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
  includePlaceholder = true,
}: {
  children: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  includePlaceholder?: boolean;
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
        {includePlaceholder ? <option value="">{placeholder}</option> : null}
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0 text-primary"
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

// ─── Main Component ────────────────────────────────────────────────────────

export function NovoAlunoPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("alunos");
  const editMatch = useMatch("/cadastro/editar/:id");
  const editAlunoId = editMatch?.params.id;
  const isEdit = Boolean(editAlunoId);

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

  const [professoresCorp, setProfessoresCorp] = useState<{ id: string; nome: string }[]>([]);
  const [loadingProfessoresCorp, setLoadingProfessoresCorp] = useState(false);
  const [avCorpDataIso, setAvCorpDataIso] = useState("");
  const [avCorpHora, setAvCorpHora] = useState("");
  const [avCorpProfessorId, setAvCorpProfessorId] = useState("");

  // ── Plano: duração + valor mensal (total = mensal × meses) ──
  const [duracaoContrato, setDuracaoContrato] = useState<DuracaoContratoKey>("mensal");
  const [valorMensal, setValorMensal] = useState("");
  /** Data de início do contrato como `yyyy-mm-dd`. */
  const [contratoDataInicioIso, setContratoDataInicioIso] = useState("");
  const [formaPagto, setFormaPagto] = useState("");
  /** UUID no catálogo `planos` ou "" (mensalidade manual). */
  const [planoCatalogoId, setPlanoCatalogoId] = useState("");
  const [planosCatalogo, setPlanosCatalogo] = useState<PlanoRow[]>([]);
  const [loadingPlanos, setLoadingPlanos] = useState(true);
  const skipPrecoFromCatalogoOnceRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [canvasDirty, setCanvasDirty] = useState(false);
  const assinaturaExistenteRef = useRef<string | null>(null);
  const [dbAssinaturaUrl, setDbAssinaturaUrl] = useState<string | null>(null);
  const wasEditRef = useRef(false);

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
          setPlanosCatalogo([]);
        } else {
          setPlanosCatalogo(data ?? []);
        }
      } catch {
        if (!cancelled) toast.error("Erro ao carregar planos.");
      } finally {
        if (!cancelled) setLoadingPlanos(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!isSupabaseConfigured) {
      setLoadingProfessoresCorp(false);
      return;
    }
    void (async () => {
      setLoadingProfessoresCorp(true);
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from("professores")
          .select("id, nome, especialidades, ativo")
          .eq("ativo", true)
          .order("nome");
        if (cancelled) return;
        if (error) {
          setProfessoresCorp([]);
          return;
        }
        setProfessoresCorp(
          (data ?? [])
            .filter((p) => professorTemAvaliacaoCorporal(p.especialidades))
            .map((p) => ({ id: p.id, nome: p.nome })),
        );
      } catch {
        if (!cancelled) setProfessoresCorp([]);
      } finally {
        if (!cancelled) setLoadingProfessoresCorp(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!planoCatalogoId) return;
    if (skipPrecoFromCatalogoOnceRef.current) {
      skipPrecoFromCatalogoOnceRef.current = false;
      return;
    }
    const pl = planosCatalogo.find((x) => x.id === planoCatalogoId);
    if (!pl || typeof pl.preco !== "number") return;
    setValorMensal(
      pl.preco.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  }, [planoCatalogoId, planosCatalogo]);

  const contratoDataTerminoIso = useMemo(() => {
    const dk = parseDuracaoContratoKey(duracaoContrato);
    if (!dk || !contratoDataInicioIso) return "";
    return dataTerminoPorDataInicioEDuracao(contratoDataInicioIso, dk) ?? "";
  }, [contratoDataInicioIso, duracaoContrato]);

  useEffect(() => {
    if (!isEdit || !editAlunoId || !isSupabaseConfigured) return;
    let cancelled = false;
    void (async () => {
      setLoadingEdit(true);
      try {
        const sb = getSupabase();
        const { data: row, error } = await sb
          .from("alunos")
          .select("*")
          .eq("id", editAlunoId)
          .single();
        if (cancelled) return;
        if (error || !row) {
          toast.error(error?.message ?? "Aluno não encontrado.");
          navigate("/alunos", { replace: true });
          return;
        }
        const { data: pags } = await sb
          .from("pagamentos")
          .select("*")
          .eq("aluno_id", editAlunoId)
          .order("data_vencimento", { ascending: false })
          .limit(1);
        if (cancelled) return;
        const pag = pags?.[0];
        setNome(row.nome ?? "");
        setDataNasc(row.data_nascimento?.slice(0, 10) ?? "");
        setCpf(formatCpfBr(row.cpf ?? ""));
        setRg((row.rg ?? "").trim());
        setSexo(row.sexo ?? "");
        setEstadoCivil(row.estado_civil ?? "");
        setTelefone((row.telefone ?? "").trim());
        setEmail((row.email ?? "").trim());
        setEndereco((row.endereco ?? "").trim());
        setFotoAluno(row.foto);
        setAnamnese(jsonRecordToFormStrings(row.anamnese as Json));
        setParq(jsonRecordToFormStrings(row.parq as Json));
        const obs = parseObservacoes(row.observacoes);
        setProfissao(obs.profissao);
        setContatoEmergencia(obs.contatoEmergencia);
        setTelEmergencia(obs.telEmergencia);
        setObjetivo(obs.objetivo);
        setJaTreinou(obs.jaTreinou);
        setTempoPratica(obs.tempoPratica);
        setVezesSemana(obs.vezesSemana);
        setHorarioPref(obs.horarioPref);
        const dkEff: DuracaoContratoKey = obs.duracaoContrato || "mensal";
        setDuracaoContrato(dkEff);
        skipPrecoFromCatalogoOnceRef.current = true;
        setPlanoCatalogoId(row.plano_id ?? "");
        const mj = row.medidas as {
          assinatura_termo?: string | null;
        } | null;
        const sig = mj?.assinatura_termo ?? null;
        assinaturaExistenteRef.current = sig;
        setDbAssinaturaUrl(sig);
        if (pag) {
          const meses = MESES_CONTRATO[dkEff];
          const mult = multiplicadorAposDesconto(dkEff);
          const mensalCalc =
            meses > 0 && mult > 0 ? pag.valor / (meses * mult) : pag.valor / Math.max(meses, 1);
          setValorMensal(
            mensalCalc.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          );
          setFormaPagto(pag.forma_pagamento ?? "PIX");
          const ini = pag.descricao?.match(/início\s+(\d{4}-\d{2}-\d{2})/);
          const startIso = (ini?.[1] ?? row.created_at.slice(0, 10)).slice(0, 10);
          setContratoDataInicioIso(startIso);
        } else {
          setValorMensal("");
          setFormaPagto("PIX");
          setContratoDataInicioIso(row.created_at.slice(0, 10));
        }
        const { data: agRow } = await sb
          .from("avaliacoes_agenda")
          .select("professor_id, inicio_at")
          .eq("aluno_id", editAlunoId)
          .eq("status", "agendado")
          .order("inicio_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled) return;
        if (agRow?.inicio_at) {
          const dt = new Date(agRow.inicio_at);
          setAvCorpDataIso(
            `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`,
          );
          setAvCorpHora(
            `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`,
          );
          setAvCorpProfessorId(agRow.professor_id ?? "");
        } else {
          setAvCorpDataIso("");
          setAvCorpHora("");
          setAvCorpProfessorId("");
        }
        setCanvasDirty(false);
      } catch {
        if (!cancelled) toast.error("Erro ao carregar aluno.");
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEdit, editAlunoId, navigate]);

  // ── Termo ──
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
    setCanvasDirty(true);
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
    setCanvasDirty(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (!dbAssinaturaUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = dbAssinaturaUrl;
  }, [dbAssinaturaUrl]);

  useEffect(() => {
    if (wasEditRef.current && !isEdit) {
      setNome("");
      setDataNasc("");
      setCpf("");
      setRg("");
      setSexo("");
      setEstadoCivil("");
      setProfissao("");
      setTelefone("");
      setEmail("");
      setEndereco("");
      setContatoEmergencia("");
      setTelEmergencia("");
      setFotoAluno(null);
      setAnamnese({});
      setParq({});
      setObjetivo("");
      setJaTreinou("");
      setTempoPratica("");
      setVezesSemana("");
      setHorarioPref("");
      setDuracaoContrato("mensal");
      setValorMensal("");
      setContratoDataInicioIso("");
      setFormaPagto("");
      setPlanoCatalogoId("");
      setAvCorpDataIso("");
      setAvCorpHora("");
      setAvCorpProfessorId("");
      setDbAssinaturaUrl(null);
      assinaturaExistenteRef.current = null;
      setCanvasDirty(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    wasEditRef.current = isEdit;
  }, [isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env");
      return;
    }
    if (isEdit && loadingEdit) return;
    if (!contratoDataInicioIso) {
      toast.error("Informe a data de início do contrato no formato DD/MM/AAAA.");
      return;
    }
    const dkSubmit = parseDuracaoContratoKey(duracaoContrato);
    if (!dkSubmit || !contratoDataTerminoIso) {
      toast.error("Não foi possível calcular a data de término. Verifique início e duração.");
      return;
    }
    if (professoresCorp.length === 0 && !loadingProfessoresCorp) {
      toast.error(
        `Cadastre um professor ativo com a especialidade «${ESPECIALIDADE_AVALIACAO_CORPORAL}» antes de matricular.`,
      );
      return;
    }
    if (!avCorpProfessorId.trim() || !avCorpDataIso.trim() || !avCorpHora.trim()) {
      toast.error("Preencha data, horário e professor da avaliação corporal.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(avCorpHora.trim())) {
      toast.error("Informe o horário da avaliação no formato HH:mm (24h).");
      return;
    }
    if (!professoresCorp.some((p) => p.id === avCorpProfessorId)) {
      toast.error("Selecione um professor habilitado em avaliação corporal.");
      return;
    }
    const canvas = canvasRef.current;
    let assinaturaPng: string | null = null;
    if (isEdit && !canvasDirty && assinaturaExistenteRef.current) {
      assinaturaPng = assinaturaExistenteRef.current;
    } else if (canvas) {
      try {
        assinaturaPng = canvas.toDataURL("image/png");
      } catch {
        assinaturaPng = null;
      }
    }
    setSaving(true);
    try {
      const dk = parseDuracaoContratoKey(duracaoContrato);
      const vMes = parseMoneyBr(valorMensal);
      const totalLiquido =
        dk && vMes != null ? valorTotalContratoLiquido(vMes, dk) : NaN;
      const valorPlanoFmt = Number.isFinite(totalLiquido)
        ? totalLiquido.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "";

      const pid = planoCatalogoId.trim();
      const planoNomeCatalogo =
        pid && planosCatalogo.length
          ? planosCatalogo.find((x) => x.id === pid)?.nome ?? null
          : null;

      const sb = getSupabase();
      const payload = {
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
        duracaoContrato,
        valorMensal,
        valorPlano: valorPlanoFmt,
        planoCatalogoId: pid || null,
        planoCatalogoNome: planoNomeCatalogo,
        dataInicio: contratoDataInicioIso,
        dataVenc: contratoDataTerminoIso,
        formaPagto,
        assinaturaPng,
        avaliacaoCorporal: {
          professorId: avCorpProfessorId.trim(),
          dataYmd: avCorpDataIso.trim(),
          hora: avCorpHora.trim(),
        },
      };
      if (isEdit && editAlunoId) {
        await atualizarCadastroAluno(sb, editAlunoId, payload);
        toast.success("Cadastro do aluno atualizado.");
        navigate("/alunos");
      } else {
        const res = await salvarCadastroAluno(sb, payload);

        const cred = await invokeWelcomeUserCredentials(sb, {
          kind: "aluno",
          entity_id: res.alunoId,
        });
        if (cred.error) {
          toast.error(`Aluno cadastrado (PIN ${res.pin}), mas falha ao criar login/e-mail: ${cred.error}`, {
            duration: 14_000,
          });
          navigate("/dashboard");
          return;
        }
        if (cred.emailSent) {
          toast.success(
            `Aluno ${res.matricula} cadastrado. PIN de check-in: ${res.pin}. E-mail com login e senha temporária enviado.`,
          );
        } else if (cred.temporaryPassword) {
          toast.warning(
            `Aluno ${res.matricula}. PIN ${res.pin}. Sem e-mail configurado — informe ao aluno: login ${cred.email ?? email.trim()} · senha temporária ${cred.temporaryPassword}`,
            { duration: 25_000 },
          );
        } else {
          toast.success(`Aluno ${res.matricula} cadastrado. PIN de check-in: ${res.pin}`);
        }
        navigate("/dashboard");
      }
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

  if (checking || permGuard.checking || !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A]" style={{ fontFamily: "monospace", fontSize: 12 }}>
        <span style={{ color: "#00F9E4" }}>Verificando acesso…</span>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
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
              type="button"
              onClick={() => navigate(isEdit ? "/alunos" : "/dashboard")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors"
            >
              {isEdit ? "Alunos" : "Novo Aluno"}
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }}>
              {isEdit ? "Editar cadastro" : "Cadastro de Novo Aluno"}
            </span>
          </div>
          <div className="md:hidden font-black uppercase tracking-tight text-lg" style={{ color: "#F2F2F2" }}>
            {isEdit ? "EDITAR" : "CADASTRO"}
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
              onClick={() => navigate(isEdit ? "/alunos" : "/dashboard")}
              className="hidden md:flex items-center gap-2 text-sm font-mono uppercase tracking-wider transition-colors"
              style={{ color: "#606060" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = "#606060")
              }
            >
              <ArrowLeft size={16} className="shrink-0 text-primary" />
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
              {isEdit ? "Editar cadastro do aluno" : "Cadastrar Novo Aluno"}
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
            <SavePrimaryButton
              type="submit"
              form="form-novo-aluno"
              preset="form"
              loading={saving || loadingEdit}
              className="px-5 py-2"
            >
              {isEdit ? "Salvar alterações" : "Salvar cadastro"}
            </SavePrimaryButton>
          </div>
        </div>

        {/* ── Scrollable Form ── */}
        <main className="px-4 md:px-10 relative flex-1 overflow-y-auto pb-20 md:pb-0 min-w-0">
          {loadingEdit && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
              style={{ background: "rgba(10,10,10,0.85)" }}
            >
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#00F9E4" }}>
                Carregando dados…
              </p>
            </div>
          )}
          <form
            id="form-novo-aluno"
            onSubmit={handleSubmit}
            aria-busy={loadingEdit}
            className={`w-[95%] mx-auto min-w-0 px-0 md:px-2 py-6 box-border ${loadingEdit ? "pointer-events-none opacity-40" : ""}`}
          >

            <CadastroFormAccordion defaultValue={["cad-aluno-1"]}>
            <CadastroFormAccordionSection
              value="cad-aluno-1"
              ordinal="1"
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
                    <DateInputBr
                      inputClassName={IC}
                      valueIso={dataNasc}
                      onChangeIso={setDataNasc}
                      disabled={saving || loadingEdit}
                      onFocus={focusCian}
                      onBlur={blurGray}
                      required
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
            </CadastroFormAccordionSection>

            <CadastroFormAccordionSection
              value="cad-aluno-2"
              ordinal="2"
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
            </CadastroFormAccordionSection>

            <CadastroFormAccordionSection
              value="cad-aluno-3"
              ordinal="3"
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
            </CadastroFormAccordionSection>

            <CadastroFormAccordionSection
              value="cad-aluno-4"
              ordinal="4"
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
            </CadastroFormAccordionSection>

            <CadastroFormAccordionSection
              value="cad-aluno-5"
              ordinal="5"
              title="Plano Contratado"
              icon={<CreditCard size={16} style={{ color: "#4ADE80" }} />}
              iconColor="#4ADE80"
              iconBg="rgba(74,222,128,0.12)"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel>Plano</FieldLabel>
                    <SelectField
                      value={planoCatalogoId}
                      onChange={setPlanoCatalogoId}
                      disabled={saving || loadingPlanos}
                      placeholder={loadingPlanos ? "Carregando…" : "Outro — valor manual"}
                    >
                      {planosCatalogo.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.nome} —{" "}
                          {pl.preco.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                          /mês
                        </option>
                      ))}
                    </SelectField>
                    <p className="text-xs mt-2" style={{ color: "#606060" }}>
                      Sem seleção = mensalidade informada apenas no campo ao lado dos meses de duração.
                    </p>
                  </div>
                  <div>
                    <FieldLabel required>Duração</FieldLabel>
                    <SelectField
                      value={duracaoContrato}
                      onChange={(v) =>
                        setDuracaoContrato(
                          (parseDuracaoContratoKey(v) || "mensal") as DuracaoContratoKey,
                        )
                      }
                      includePlaceholder={false}
                      disabled={saving}
                    >
                      {(Object.keys(LABEL_DURACAO_CONTRATO) as DuracaoContratoKey[]).map(
                        (key) => (
                          <option key={key} value={key}>
                            {LABEL_DURACAO_CONTRATO[key]}
                          </option>
                        ),
                      )}
                    </SelectField>
                  </div>
                  <div>
                    <FieldLabel required>Valor mensal (R$)</FieldLabel>
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
                        value={valorMensal}
                        onChange={(e) => setValorMensal(e.target.value)}
                        onFocus={focusCian}
                        onBlur={blurGray}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-[12px] px-4 py-3 text-sm space-y-2"
                  style={{ background: "#0A0A0A", border: "1px solid #1E1E1E" }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span
                      className="font-mono uppercase text-[10px] tracking-wider"
                      style={{ color: "#606060" }}
                    >
                      Valor total do contrato
                    </span>
                    <span className="font-bold text-[#00F9E4] text-base">
                      {(() => {
                        const dk = parseDuracaoContratoKey(duracaoContrato);
                        const vm = parseMoneyBr(valorMensal);
                        if (!dk || vm == null) return "—";
                        const liq = valorTotalContratoLiquido(vm, dk);
                        return liq.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                      })()}
                    </span>
                  </div>
                  {(() => {
                    const dk = parseDuracaoContratoKey(duracaoContrato);
                    const vm = parseMoneyBr(valorMensal);
                    if (!dk || vm == null) return null;
                    const meses = MESES_CONTRATO[dk];
                    const bruto = subtotalContratoBruto(vm, dk);
                    const liq = valorTotalContratoLiquido(vm, dk);
                    const d = DESCONTO_CONTRATO[dk];
                    return (
                      <div className="text-xs space-y-1" style={{ color: "#A8A8A8" }}>
                        <p>
                          Bruto:{" "}
                          <span style={{ color: "#CFCFCF" }}>
                            {bruto.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>{" "}
                          ({meses} {meses === 1 ? "mês" : "meses"} × valor mensal)
                        </p>
                        <p>
                          {d > 0 ? (
                            <>
                              Desconto ({Math.round(d * 100)}%):{" "}
                              <span style={{ color: "#00F9E4" }}>
                                −
                                {(bruto - liq).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </>
                          ) : (
                            <span>Sem desconto sobre o pacote mensal.</span>
                          )}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: "#606060" }}>
                          {textoResumoDesconto(dk)}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Datas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Data de início</FieldLabel>
                    <DateInputBr
                      inputClassName={IC}
                      valueIso={contratoDataInicioIso}
                      onChangeIso={setContratoDataInicioIso}
                      disabled={saving || loadingEdit}
                      onFocus={focusCian}
                      onBlur={blurGray}
                      required
                    />
                    <p className="text-xs mt-2" style={{ color: "#606060" }}>
                      Digite dia/mês/ano ou toque no ícone para escolher no calendário. O término é
                      calculado pela duração.
                    </p>
                  </div>
                  <div>
                    <FieldLabel required>Data de término / vencimento</FieldLabel>
                    <DateInputBr
                      inputClassName={IC + " cursor-not-allowed opacity-90"}
                      valueIso={contratoDataTerminoIso}
                      onChangeIso={() => {}}
                      readOnly
                      hideCalendarButton
                      placeholder="—"
                      title="Preenchida ao informar início e duração"
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
            </CadastroFormAccordionSection>

            <CadastroFormAccordionSection
              value="cad-aluno-6"
              ordinal="6"
              title="Agendamento — Avaliação corporal"
              icon={<Activity size={16} style={{ color: "#F472B6" }} />}
              iconColor="#F472B6"
              iconBg="rgba(244,114,182,0.12)"
            >
              <div className="space-y-4">
                <p className="text-sm leading-relaxed" style={{ color: "#A8A8A8" }}>
                  Combine data e hora com um profissional que possua a especialidade «
                  <span style={{ color: "#F472B6" }}>{ESPECIALIDADE_AVALIACAO_CORPORAL}</span>
                  ». O período registrado equivale a 45&nbsp;min na agenda da academia.
                </p>
                {professoresCorp.length === 0 && !loadingProfessoresCorp ? (
                  <p className="text-sm rounded-xl px-4 py-3" style={{ background: "#1A1518", border: "1px solid #3f2f36", color: "#F87171" }}>
                    Nenhum professor ativo com essa especialidade. Em «Professores», edite o cadastro e
                    marque {ESPECIALIDADE_AVALIACAO_CORPORAL} nas especialidades.
                  </p>
                ) : null}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Data</FieldLabel>
                    <DateInputBr
                      inputClassName={IC}
                      valueIso={avCorpDataIso}
                      onChangeIso={setAvCorpDataIso}
                      disabled={saving || loadingEdit}
                      onFocus={focusCian}
                      onBlur={blurGray}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel required>Horário</FieldLabel>
                    <input
                      type="time"
                      step={300}
                      className={IC}
                      style={{ colorScheme: "dark" }}
                      value={avCorpHora}
                      onChange={(e) => setAvCorpHora(e.target.value)}
                      onFocus={focusCian}
                      onBlur={blurGray}
                      disabled={saving || loadingEdit}
                      required
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel required>Professor</FieldLabel>
                  <SelectField
                    value={avCorpProfessorId}
                    onChange={setAvCorpProfessorId}
                    disabled={saving || loadingEdit || loadingProfessoresCorp || professoresCorp.length === 0}
                    placeholder={
                      loadingProfessoresCorp
                        ? "Carregando professores…"
                        : professoresCorp.length === 0
                          ? "Nenhum disponível"
                          : "Selecione o professor"
                    }
                  >
                    {professoresCorp.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
            </CadastroFormAccordionSection>

            <CadastroFormAccordionSection
              value="cad-aluno-7"
              ordinal="7"
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
                  <DateInputBr
                    inputClassName={IC}
                    valueIso={today}
                    onChangeIso={() => {}}
                    readOnly
                    hideCalendarButton
                  />
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid #1E1E1E" }} />

                {/* REGISTRAR button */}
                <div className="flex justify-end">
                  <motion.div
                    className="w-full lg:w-fit"
                    whileHover={{ scale: saving || loadingEdit ? 1 : 1.02 }}
                    whileTap={{ scale: saving || loadingEdit ? 1 : 0.98 }}
                  >
                    <SavePrimaryButton
                      type="submit"
                      form="form-novo-aluno"
                      preset="hero"
                      loading={saving || loadingEdit}
                      className="w-full lg:w-fit"
                    >
                      {isEdit ? "Salvar alterações" : "Registrar aluno"}
                    </SavePrimaryButton>
                  </motion.div>
                </div>
              </div>
            </CadastroFormAccordionSection>
            </CadastroFormAccordion>

          </form>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
