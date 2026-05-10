import { useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  Printer,
  User2,
  Heart,
  AlertTriangle,
  Target,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import {
  formatDateBr,
  formaPagamentoToLabel,
  statusPagamentoToLabel,
} from "../../lib/displayHelpers";
import {
  formatCpfBr,
  jsonRecordToFormStrings,
  LABEL_DURACAO_CONTRATO,
  buildObservacoes,
  parseObservacoes,
  stripDigits,
  type DuracaoContratoKey,
} from "../../lib/cadastroAluno";
import { maskPhoneBr } from "../../lib/visitasGuiadas";
import { AlunoAvatar } from "../components/AlunoAvatar";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import type { Database, Json } from "../../lib/database.types";
import {
  ANAMNESE_ITENS,
  PARQ_ITENS,
  labelEstadoCivil,
  labelJaTreinou,
  labelSexo,
  labelVezesSemana,
} from "../../lib/alunoCadastroDisplay";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";

type Ctx = { alunoId: string; checkinRegistrado: boolean };
type StatusMatricula = Database["public"]["Enums"]["status_matricula"];

type PlanoJoin = { nome: string; preco: number; descricao: string } | null;
type AlunoCadastroRow = Pick<
  Database["public"]["Tables"]["alunos"]["Row"],
  | "nome"
  | "email"
  | "telefone"
  | "foto"
  | "matricula"
  | "data_nascimento"
  | "cpf"
  | "rg"
  | "created_at"
  | "status_matricula"
  | "endereco"
  | "sexo"
  | "estado_civil"
  | "observacoes"
  | "anamnese"
  | "parq"
  | "parq_has_sim"
  | "medidas"
> & { planos: PlanoJoin };

type PagRow = Database["public"]["Tables"]["pagamentos"]["Row"];

type MedidasAluno = {
  assinatura_termo?: string | null;
};

function statusMatriculaBadgeStyles(s: StatusMatricula): { text: string; bg: string; fg: string } {
  switch (s) {
    case "ATIVO":
      return { text: "ATIVO", bg: "rgba(34,197,94,0.15)", fg: "#22C55E" };
    case "BLOQUEADO":
      return { text: "BLOQUEADO", bg: "rgba(248,113,113,0.12)", fg: "#F87171" };
    case "INATIVO":
    default:
      return { text: "INATIVO", bg: "rgba(107,107,107,0.2)", fg: "#6B6B6B" };
  }
}

function parseMedidas(j: Json): MedidasAluno {
  if (!j || typeof j !== "object" || Array.isArray(j)) return {};
  return j as MedidasAluno;
}

function FieldLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[minmax(160px,220px)_1fr] gap-2 py-2.5 border-b border-[#222222] last:border-b-0 text-sm"
      style={{ borderColor: "#222222" }}
    >
      <span className="text-[11px] uppercase tracking-widest shrink-0" style={{ color: "#6B6B6B" }}>
        {label}
      </span>
      <div style={{ color: "#F2F2F2" }}>{children}</div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: ElementType;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: "#6B6B6B" }} />
        <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export function AlunoPerfilPage() {
  const { alunoId } = useOutletContext<Ctx>();

  const [aluno, setAluno] = useState<AlunoCadastroRow | null>(null);
  const [pagamento, setPagamento] = useState<PagRow | null>(null);
  const [accordionOpen, setAccordionOpen] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const [editingTel, setEditingTel] = useState(false);
  const [telValue, setTelValue] = useState("");
  const [telSaving, setTelSaving] = useState(false);
  const [telMsg, setTelMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [editingEmerg, setEditingEmerg] = useState(false);
  const [emergNome, setEmergNome] = useState("");
  const [emergTel, setEmergTel] = useState("");
  const [emergSaving, setEmergSaving] = useState(false);
  const [emergMsg, setEmergMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [senhaSaving, setSenhaSaving] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !alunoId) return;
    let cancel = false;

    async function run() {
      const sb = getSupabase();
      const [rAluno, rPag] = await Promise.all([
        sb
          .from("alunos")
          .select(
            "nome, email, telefone, foto, matricula, data_nascimento, cpf, rg, created_at, status_matricula, endereco, sexo, estado_civil, observacoes, anamnese, parq, parq_has_sim, medidas, planos ( nome, preco, descricao )",
          )
          .eq("id", alunoId)
          .maybeSingle(),
        sb
          .from("pagamentos")
          .select(
            "valor, data_vencimento, forma_pagamento, status, descricao, referencia_mes, created_at",
          )
          .eq("aluno_id", alunoId)
          .order("created_at", { ascending: true }),
      ]);

      if (cancel) return;

      if (rAluno.data) {
        const row = rAluno.data as unknown as AlunoCadastroRow;
        setAluno(row);
        setTelValue(row.telefone ?? "");
        const obsP = parseObservacoes(row.observacoes);
        setEmergNome(obsP.contatoEmergencia);
        setEmergTel(maskPhoneBr(obsP.telEmergencia));
      }

      const pags = (rPag.data ?? []) as PagRow[];
      setPagamento(pags[0] ?? null);

      setLoading(false);
    }

    void run();
    return () => {
      cancel = true;
    };
  }, [alunoId]);

  async function salvarTelefone() {
    if (!isSupabaseConfigured || !alunoId) return;
    setTelSaving(true);
    setTelMsg(null);
    const { error } = await getSupabase()
      .from("alunos")
      .update({ telefone: telValue.trim() || null })
      .eq("id", alunoId);
    setTelSaving(false);
    if (error) {
      setTelMsg({ ok: false, text: "Erro ao salvar telefone." });
    } else {
      setAluno((prev) => (prev ? { ...prev, telefone: telValue.trim() || null } : prev));
      setEditingTel(false);
      setTelMsg({ ok: true, text: "Telefone atualizado!" });
      setTimeout(() => setTelMsg(null), 3000);
    }
  }

  async function salvarEmergencia() {
    if (!isSupabaseConfigured || !alunoId || !aluno) return;
    setEmergSaving(true);
    setEmergMsg(null);
    const nome = emergNome.trim();
    const telD = stripDigits(emergTel);
    if (nome.length < 2) {
      setEmergSaving(false);
      setEmergMsg({ ok: false, text: "Informe nome do contato de emergência." });
      return;
    }
    if (telD.length < 10) {
      setEmergSaving(false);
      setEmergMsg({ ok: false, text: "Informe um telefone de emergência válido." });
      return;
    }
    const base = parseObservacoes(aluno.observacoes);
    const novoObs = buildObservacoes({
      profissao: base.profissao,
      contatoEmergencia: nome,
      telEmergencia: telD,
      objetivo: base.objetivo,
      jaTreinou: base.jaTreinou,
      tempoPratica: base.tempoPratica,
      vezesSemana: base.vezesSemana,
      horarioPref: base.horarioPref,
      duracaoContrato: base.duracaoContrato ? base.duracaoContrato : undefined,
      planoCatalogoNome: base.planCatalogoNome?.trim() || null,
    });
    const { error } = await getSupabase()
      .from("alunos")
      .update({ observacoes: novoObs })
      .eq("id", alunoId);
    setEmergSaving(false);
    if (error) {
      setEmergMsg({ ok: false, text: "Não foi possível salvar o contato." });
      return;
    }
    setAluno((prev) => (prev ? { ...prev, observacoes: novoObs } : prev));
    setEditingEmerg(false);
    setEmergMsg({ ok: true, text: "Contato atualizado!" });
    setTimeout(() => setEmergMsg(null), 3200);
  }

  async function alterarSenha() {
    setSenhaMsg(null);
    if (!senha || senha.length < 6) {
      setSenhaMsg({ ok: false, text: "A senha deve ter ao menos 6 caracteres." });
      return;
    }
    if (senha !== confirmarSenha) {
      setSenhaMsg({ ok: false, text: "As senhas não coincidem." });
      return;
    }
    setSenhaSaving(true);
    const { error } = await getSupabase().auth.updateUser({ password: senha });
    setSenhaSaving(false);
    if (error) {
      setSenhaMsg({ ok: false, text: error.message });
    } else {
      setSenha("");
      setConfirmarSenha("");
      setSenhaMsg({ ok: true, text: "Senha alterada com sucesso!" });
      setTimeout(() => setSenhaMsg(null), 4000);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: "#606060" }}>
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
        />
        <p className="font-mono text-xs uppercase tracking-widest">Carregando perfil…</p>
      </div>
    );
  }

  if (!aluno) {
    return (
      <div
        className="flex items-center justify-center py-16 px-6 text-center rounded-2xl mx-4 md:mx-8 mt-8"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}
      >
        <p style={{ color: "#A8A8A8" }}>Perfil não encontrado.</p>
      </div>
    );
  }

  const parsed = parseObservacoes(aluno.observacoes);
  const dk: DuracaoContratoKey | "" = parsed.duracaoContrato;
  const anamnese = jsonRecordToFormStrings(aluno.anamnese as Json);
  const parq = jsonRecordToFormStrings(aluno.parq as Json);
  const medidas = parseMedidas(aluno.medidas as Json);
  const assinatura = medidas.assinatura_termo?.trim() || null;
  const sigSrc =
    assinatura &&
    (assinatura.startsWith("data:") ? assinatura : `data:image/png;base64,${assinatura}`);

  const matBadge = statusMatriculaBadgeStyles(aluno.status_matricula);
  const cpfFmt = aluno.cpf?.trim() ? formatCpfBr(aluno.cpf) : "—";
  const nasc =
    aluno.data_nascimento && !Number.isNaN(Date.parse(aluno.data_nascimento))
      ? formatDateBr(aluno.data_nascimento)
      : "—";

  const planoNome = aluno.planos?.nome ?? null;

  const parqTemSim = Boolean(aluno.parq_has_sim);

  return (
    <div className="mx-auto max-w-3xl w-full px-0 md:px-10 box-border aluno-perfil-print-root py-6 pb-24 md:pb-8 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-black text-2xl md:text-3xl tracking-tight" style={{ color: "#F2F2F2" }}>
            Meu perfil
          </h1>
          <p className="text-xs mt-1 font-mono uppercase tracking-widest" style={{ color: "#606060" }}>
            Ficha de cadastro
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="aluno-no-print inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
          style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#F2F2F2" }}
        >
          <Printer size={16} />
          Imprimir
        </button>
      </div>

      {/* Resumo rápido */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 md:p-6 rounded-2xl mb-6"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}
      >
        <div className="flex items-start gap-4 min-w-0">
          <AlunoAvatar nome={aluno.nome} src={aluno.foto} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-xl md:text-2xl mb-2 truncate" style={{ color: "#F2F2F2" }}>
              {aluno.nome}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{ background: matBadge.bg, color: matBadge.fg }}
              >
                {matBadge.text}
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{ background: "#00F9E4", color: "#0A0A0A" }}
              >
                ALUNO
              </span>
            </div>
            <p className="text-xs font-mono" style={{ color: "#6B6B6B" }}>
              Matrícula {aluno.matricula}
            </p>
          </div>
        </div>
      </motion.div>

      <CadastroFormAccordion
        type="single"
        collapsible
        value={accordionOpen}
        onValueChange={(v) => setAccordionOpen(v || undefined)}
        className="w-full mb-2"
      >
        <CadastroFormAccordionSection
          value="cad-1"
          ordinal="1"
          title="Dados pessoais"
          icon={<User2 size={16} style={{ color: "#00F9E4" }} />}
          iconColor="#00F9E4"
          iconBg="rgba(0,249,228,0.12)"
        >
          <div className="text-[#e5e5e5]">
          <FieldLine label="Nome completo">{aluno.nome}</FieldLine>
          <FieldLine label="Data de nascimento">{nasc}</FieldLine>
          <FieldLine label="CPF">{cpfFmt}</FieldLine>
          <FieldLine label="RG">{aluno.rg?.trim() || "—"}</FieldLine>
          <FieldLine label="Sexo">{labelSexo(aluno.sexo)}</FieldLine>
          <FieldLine label="Estado civil">{labelEstadoCivil(aluno.estado_civil)}</FieldLine>
          <FieldLine label="Profissão">{parsed.profissao.trim() || "—"}</FieldLine>
          <FieldLine label="E-mail">
            <span className="break-all">{aluno.email}</span>
            <p className="text-[11px] mt-1" style={{ color: "#555" }}>
              Alteração de e-mail ou nome: recepção.
            </p>
          </FieldLine>
          <FieldLine label="Telefone">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {editingTel ? (
                <>
                  <input
                    type="tel"
                    value={telValue}
                    onChange={(e) => setTelValue(e.target.value)}
                    placeholder="(xx) 9xxxx-xxxx"
                    autoFocus
                    className="flex-1 min-w-[200px] max-w-full bg-transparent text-sm outline-none rounded-lg px-2 py-1 border border-[#333]"
                    style={{ color: "#E0E0E0", caretColor: "#00F9E4" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void salvarTelefone();
                      if (e.key === "Escape") {
                        setEditingTel(false);
                        setTelValue(aluno.telefone ?? "");
                      }
                    }}
                  />
                  <SavePrimaryButton
                    preset="inline"
                    type="button"
                    loading={telSaving}
                    loadingLabel="…"
                    onClick={() => void salvarTelefone()}
                  >
                    OK
                  </SavePrimaryButton>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTel(false);
                      setTelValue(aluno.telefone ?? "");
                    }}
                    style={{ color: "#555" }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span>{aluno.telefone?.trim() || "—"}</span>
                  <button
                    type="button"
                    onClick={() => setEditingTel(true)}
                    className="aluno-no-print shrink-0"
                    style={{ color: "#00F9E4" }}
                    title="Editar telefone"
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
            </div>
            <AnimatePresence>
              {telMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 mt-2 text-[11px] aluno-no-print"
                  style={{ color: telMsg.ok ? "#22C55E" : "#F87171" }}
                >
                  {telMsg.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {telMsg.text}
                </motion.p>
              )}
            </AnimatePresence>
          </FieldLine>
          <FieldLine label="Endereço">{aluno.endereco?.trim() || "—"}</FieldLine>
          <FieldLine label="Contato de emergência (obrigatório)">
            <div className="flex items-start gap-2 flex-wrap min-w-0">
              {editingEmerg ? (
                <>
                  <div className="flex flex-col gap-2 min-w-[140px] flex-1">
                    <input
                      type="text"
                      value={emergNome}
                      onChange={(e) => setEmergNome(e.target.value)}
                      placeholder="Nome da pessoa"
                      autoFocus
                      className="w-full bg-transparent text-sm outline-none rounded-lg px-2 py-1 border border-[#333]"
                      style={{ color: "#E0E0E0", caretColor: "#00F9E4" }}
                    />
                    <input
                      type="tel"
                      value={emergTel}
                      onChange={(e) => setEmergTel(maskPhoneBr(e.target.value))}
                      placeholder="Telefone"
                      inputMode="tel"
                      className="w-full bg-transparent text-sm outline-none rounded-lg px-2 py-1 border border-[#333]"
                      style={{ color: "#E0E0E0", caretColor: "#00F9E4" }}
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <SavePrimaryButton
                      preset="inline"
                      type="button"
                      loading={emergSaving}
                      loadingLabel="…"
                      onClick={() => void salvarEmergencia()}
                    >
                      OK
                    </SavePrimaryButton>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEmerg(false);
                        setEmergNome(parsed.contatoEmergencia);
                        setEmergTel(maskPhoneBr(parsed.telEmergencia));
                        setEmergMsg(null);
                      }}
                      style={{ color: "#555" }}
                      title="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="min-w-0 break-words">
                    {parsed.contatoEmergencia?.trim()
                      ? `${parsed.contatoEmergencia}${parsed.telEmergencia ? ` — ${maskPhoneBr(parsed.telEmergencia)}` : ""}`
                      : "— (obrigatório — edite para preencher)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingEmerg(true)}
                    className="aluno-no-print shrink-0"
                    style={{ color: "#00F9E4" }}
                    title="Editar contato"
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
            </div>
            <AnimatePresence>
              {emergMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 mt-2 text-[11px] aluno-no-print"
                  style={{ color: emergMsg.ok ? "#22C55E" : "#F87171" }}
                >
                  {emergMsg.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {emergMsg.text}
                </motion.p>
              )}
            </AnimatePresence>
          </FieldLine>
          <FieldLine label="Data do cadastro (sistema)">{formatDateBr(aluno.created_at)}</FieldLine>
        </div>
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="cad-2"
          ordinal="2"
          title="Dados de saúde (Anamnese básica)"
          icon={<Heart size={16} style={{ color: "#EF4444" }} />}
          iconColor="#EF4444"
          iconBg="rgba(239,68,68,0.12)"
        >
        <div className="space-y-0">
          {ANAMNESE_ITENS.map((q) => (
            <FieldLine key={q.key} label={q.label}>
              {(anamnese[q.key] ?? "").trim() || "—"}
            </FieldLine>
          ))}
        </div>
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="cad-3"
          ordinal="3"
          title="Questionário PAR-Q (Prontidão para atividade física)"
          icon={<AlertTriangle size={16} style={{ color: "#FACC15" }} />}
          iconColor="#FACC15"
          iconBg="rgba(250,204,21,0.12)"
        >
        <p className="text-xs mb-4 font-mono uppercase tracking-wider" style={{ color: "#606060" }}>
          Respostas registradas no cadastro (SIM / NÃO).
        </p>
        <div className="space-y-0">
          {PARQ_ITENS.map((q) => (
            <FieldLine key={q.key} label={q.label}>
              {(parq[q.key] ?? "").trim() || "—"}
            </FieldLine>
          ))}
        </div>
        {parqTemSim && (
          <div
            className="mt-4 flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
            <p className="text-sm leading-relaxed" style={{ color: "#CFCFCF" }}>
              Foi registrada pelo menos uma resposta <strong style={{ color: "#EF4444" }}>SIM</strong> no
              PAR-Q. Recomenda-se avaliação médica antes de iniciar atividades físicas.
            </p>
          </div>
        )}
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="cad-4"
          ordinal="4"
          title="Objetivos do aluno"
          icon={<Target size={16} style={{ color: "#00F9E4" }} />}
          iconColor="#00F9E4"
          iconBg="rgba(0,249,228,0.12)"
        >
        <div>
          <FieldLine label="Objetivo principal">{parsed.objetivo.trim() || "—"}</FieldLine>
          <FieldLine label="Já treinou antes?">{labelJaTreinou(parsed.jaTreinou)}</FieldLine>
          <FieldLine label="Tempo de prática">{parsed.tempoPratica.trim() || "—"}</FieldLine>
          <FieldLine label="Frequência desejada">{labelVezesSemana(parsed.vezesSemana)}</FieldLine>
          <FieldLine label="Horário preferido">{parsed.horarioPref.trim() || "—"}</FieldLine>
        </div>
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="cad-5"
          ordinal="5"
          title="Plano contratado"
          icon={<CreditCard size={16} style={{ color: "#4ADE80" }} />}
          iconColor="#4ADE80"
          iconBg="rgba(74,222,128,0.12)"
        >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={Mail} label="Plano (catálogo)">
              <p className="text-sm mt-0.5">{planoNome ?? "—"}</p>
              {parsed.planCatalogoNome ? (
                <p className="text-[11px] mt-1" style={{ color: "#6B6B6B" }}>
                  Ref. cadastro: {parsed.planCatalogoNome}
                </p>
              ) : null}
              {aluno.planos?.preco != null && (
                <p className="text-xs mt-2" style={{ color: "#AAA" }}>
                  Preço de referência no catálogo:{" "}
                  {Number(aluno.planos.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                  /mês
                </p>
              )}
            </InfoCard>
            <InfoCard icon={Calendar} label="Duração do contrato (cadastro)">
              <p className="text-sm" style={{ color: "#F2F2F2" }}>
                {dk ? LABEL_DURACAO_CONTRATO[dk] : "—"}
              </p>
            </InfoCard>
          </div>

          <p
            className="text-[12px] leading-relaxed rounded-xl px-4 py-3"
            style={{
              background: "rgba(0,249,228,0.06)",
              border: "1px solid rgba(0,249,228,0.22)",
              color: "#AAA",
            }}
          >
            <span className="font-semibold uppercase tracking-wide text-[10px]" style={{ color: "#00F9E4" }}>
              Observação importante
            </span>
            {" — "}Para alteração de plano ou renovação de contrato procure a{" "}
            <span style={{ color: "#E5E5E5", fontWeight: 700 }}>recepção</span>.
          </p>

          <div className="rounded-xl p-4" style={{ background: "#111111", border: "1px solid #222222" }}>
            <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: "#6B6B6B" }}>
              Pagamento vinculado ao cadastro
            </p>
            {pagamento ? (
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span style={{ color: "#AAA" }}>Valor (contrato)</span>
                  <span className="font-bold font-mono" style={{ color: "#00F9E4" }}>
                    {pagamento.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <FieldLine label="Forma de pagamento">
                  {formaPagamentoToLabel(pagamento.forma_pagamento)}
                </FieldLine>
                <FieldLine label="Status">{statusPagamentoToLabel(pagamento.status)}</FieldLine>
                <FieldLine label="Data de vencimento">{formatDateBr(pagamento.data_vencimento)}</FieldLine>
                <FieldLine label="Descrição">{pagamento.descricao?.trim() || "—"}</FieldLine>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#888" }}>
                Não foi possível carregar os dados de pagamento (permissão ou cadastro antigo). Em caso de
                dúvida, fale com a recepção.
              </p>
            )}
          </div>
        </div>
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="cad-6"
          ordinal="6"
          title="Termo de responsabilidade (assinatura)"
          icon={<FileCheck size={16} style={{ color: "#A78BFA" }} />}
          iconColor="#A78BFA"
          iconBg="rgba(167,139,250,0.12)"
        >
            {sigSrc ? (
              <div>
                <p className="text-xs mb-3" style={{ color: "#6B6B6B" }}>
                  Imagem da assinatura registrada no cadastro.
                </p>
                <img
                  src={sigSrc}
                  alt="Assinatura do termo de responsabilidade"
                  className="max-w-full max-h-40 object-contain rounded-lg border border-[#333] bg-black p-2"
                />
              </div>
            ) : (
              <p className="text-sm" style={{ color: "#888" }}>
                Nenhuma assinatura armazenada para este cadastro.
              </p>
            )}
        </CadastroFormAccordionSection>
      </CadastroFormAccordion>

      {/* Senha */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="aluno-no-print p-5 md:p-6 rounded-2xl mb-8"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} style={{ color: "#6B6B6B" }} />
          <h3 className="font-black text-lg uppercase tracking-tight" style={{ color: "#F2F2F2" }}>
            Alterar senha
          </h3>
        </div>

        <p className="text-xs mb-5" style={{ color: "#555" }}>
          Mínimo de 6 caracteres. O acesso atual permanece válido até o próximo login.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "#111111", border: "1px solid #222222", color: "#F2F2F2" }}
                onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#00F9E4")}
                onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#222222")}
              />
              <button
                type="button"
                onClick={() => setShowSenha((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#555" }}
              >
                {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
              Confirmar nova senha
            </label>
            <div className="relative">
              <input
                type={showConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "#111111", border: "1px solid #222222", color: "#F2F2F2" }}
                onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#00F9E4")}
                onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#222222")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void alterarSenha();
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmar((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#555" }}
              >
                {showConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void alterarSenha()}
          disabled={senhaSaving || !senha || !confirmarSenha}
          className="px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
          style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#F2F2F2" }}
        >
          {senhaSaving ? "Salvando…" : "Alterar senha"}
        </button>

        <AnimatePresence>
          {senhaMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 mt-3 text-xs"
              style={{ color: senhaMsg.ok ? "#22C55E" : "#F87171" }}
            >
              {senhaMsg.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {senhaMsg.text}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
