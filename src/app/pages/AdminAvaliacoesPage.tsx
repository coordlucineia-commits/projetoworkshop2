import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { History, Loader2, Search, Trash2, ChevronDown, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { AdminPageFrame } from "../components/AdminPageFrame";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { DateInputBr } from "../components/DateInputBr";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateTimeBr } from "../../lib/displayHelpers";
import type { AgendaRowFull, AvaliacaoAlunoRow } from "../components/BlocoAvaliacaoCorporalAluno";
import { BlocoAvaliacaoCorporalAluno } from "../components/BlocoAvaliacaoCorporalAluno";
import { professorTemAvaliacaoCorporal } from "../../lib/professorEspecialidades";
import { intervaloIsoParaAvaliacaoCorporalAgenda, MINUTOS_PADRAO_AVAL_CORPORAL } from "../../lib/salvarCadastroAluno";
import { SavePrimaryButton } from "../components/SavePrimaryButton";

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors border border-[#222222] bg-[#0D0D0D] text-[#F2F2F2]";

type AgendaJoined = AgendaRowFull & {
  alunos?: { nome: string } | null;
  professores?: { id: string; nome: string } | null;
};

type AvalRowJoined = AvaliacaoAlunoRow & {
  alunos?: { nome: string } | null;
};

type ProfOpt = { id: string; nome: string };

function todayYmdSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function agendaDateYmdSaoPaulo(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function toYmdHmSaoPaulo(iso: string): { ymd: string; hm: string } {
  const d = new Date(iso);
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const pts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hh = (pts.find((x) => x.type === "hour")?.value ?? "09").padStart(2, "0");
  const mm = (pts.find((x) => x.type === "minute")?.value ?? "00").padStart(2, "0");
  return { ymd, hm: `${hh}:${mm}` };
}

function nomeNorm(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[minmax(140px,200px)_1fr] gap-2 py-2 text-sm border-b border-[#222222] last:border-b-0"
    >
      <span className="text-[11px] uppercase tracking-widest shrink-0" style={{ color: "#6B6B6B" }}>
        {label}
      </span>
      <div style={{ color: "#F2F2F2" }}>{children}</div>
    </div>
  );
}

export function AdminAvaliacoesPage() {
  const [todasLinhasAgenda, setTodasLinhasAgenda] = useState<AgendaJoined[]>([]);
  const [avHist, setAvHist] = useState<AvalRowJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [profOpts, setProfOpts] = useState<ProfOpt[]>([]);
  const [qAgenda, setQAgenda] = useState("");
  const [qHist, setQHist] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedHistId, setExpandedHistId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [draftDataIso, setDraftDataIso] = useState("");
  const [draftHora, setDraftHora] = useState("");
  const [draftProf, setDraftProf] = useState("");

  const agendasAgendadas = useMemo(() => todasLinhasAgenda.filter((g) => g.status === "agendado"), [todasLinhasAgenda]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const sb = getSupabase();
    const { data: agData, error: agErr } = await sb
      .from("avaliacoes_agenda")
      .select("id,inicio_at,fim_at,status,professor_id,aluno_id,alunos(nome),professores(id,nome)")
      .order("inicio_at", { ascending: true });
    if (agErr) toast.error(agErr.message);
    else setTodasLinhasAgenda((agData ?? []) as AgendaJoined[]);

    const { data: avData, error: avErr } = await sb
      .from("avaliacoes")
      .select("*, alunos(nome)")
      .order("data_avaliacao", { ascending: false })
      .order("created_at", { ascending: false });
    if (avErr) toast.error(avErr.message);
    else setAvHist((avData ?? []) as AvalRowJoined[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured) return;
      const { data } = await getSupabase()
        .from("professores")
        .select("id,nome,especialidades,ativo")
        .eq("ativo", true)
        .order("nome");
      if (cancelled) return;
      setProfOpts(
        ((data ?? []) as { id: string; nome: string; especialidades: unknown }[])
          .filter((p) => professorTemAvaliacaoCorporal(p.especialidades))
          .map((p) => ({ id: p.id, nome: p.nome })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hojeIso = todayYmdSaoPaulo();

  const listasAgenda = useMemo(() => {
    const q = qAgenda.trim();
    const nowMs = Date.now();
    const futuros = agendasAgendadas.filter((g) => new Date(g.inicio_at).getTime() > nowMs);
    const porNomeMatch = (g: AgendaJoined) => nomeNorm(g.alunos?.nome ?? "").includes(nomeNorm(q));

    if (!q) {
      const dia = agendasAgendadas.filter((g) => agendaDateYmdSaoPaulo(g.inicio_at) === hojeIso);
      return { titulo: "Agendamentos de hoje", rows: dia };
    }
    return {
      titulo: "Futuros encontrados pela pesquisa",
      rows: futuros.filter(porNomeMatch).sort((a, b) => new Date(a.inicio_at).getTime() - new Date(b.inicio_at).getTime()),
    };
  }, [agendasAgendadas, qAgenda, hojeIso]);

  const avaliacoesFiltradas = useMemo(() => {
    const q = qHist.trim();
    if (!q) return avHist;
    return avHist.filter((a) => nomeNorm(a.alunos?.nome ?? "").includes(nomeNorm(q)));
  }, [avHist, qHist]);

  const agendaCtxParaBlocos: AgendaRowFull[] = useMemo(
    () => todasLinhasAgenda.map(({ alunos: _a, professores: p, ...row }) => ({ ...row, professores: p ? { nome: p.nome } : null })),
    [todasLinhasAgenda],
  );

  const profNomeAgendaPorFicha = useCallback(
    (av: AvalRowJoined) => {
      if (!av.agenda_id) return "—";
      const g = agendaCtxParaBlocos.find((x) => x.id === av.agenda_id);
      return g?.professores?.nome?.trim() || "—";
    },
    [agendaCtxParaBlocos],
  );

  function toggleExpandHist(id: string) {
    setExpandedHistId((prev) => (prev === id ? null : id));
  }

  function toggleExpand(g: AgendaJoined) {
    if (expandedId === g.id) {
      setExpandedId(null);
      return;
    }
    const { ymd, hm } = toYmdHmSaoPaulo(g.inicio_at);
    setDraftDataIso(ymd);
    setDraftHora(hm);
    setDraftProf(g.professor_id ?? "");
    setExpandedId(g.id);
  }

  async function salvarEdicao(agendaId: string) {
    if (!isSupabaseConfigured) return;
    if (!draftProf.trim()) {
      toast.error("Selecione um professor.");
      return;
    }
    if (!draftDataIso.trim()) {
      toast.error("Informe a data.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draftHora.trim())) {
      toast.error("Horário inválido (use HH:mm).");
      return;
    }
    if (!profOpts.some((p) => p.id === draftProf)) {
      toast.error("Professor não disponível para avaliação corporal.");
      return;
    }

    let inicio_iso: string;
    let fim_iso: string;
    try {
      const r = intervaloIsoParaAvaliacaoCorporalAgenda(draftDataIso.trim(), draftHora.trim());
      inicio_iso = r.inicio_iso;
      fim_iso = r.fim_iso;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Data ou horário inválidos.");
      return;
    }
    if (new Date(inicio_iso).getTime() <= Date.now()) {
      toast.error("Informe uma data e hora futuras.");
      return;
    }

    setSavingId(agendaId);
    const { error } = await getSupabase()
      .from("avaliacoes_agenda")
      .update({ professor_id: draftProf.trim(), inicio_at: inicio_iso, fim_at: fim_iso })
      .eq("id", agendaId);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Agendamento atualizado.");
    setExpandedId(null);
    await loadAll();
  }

  async function excluirAgendamento(id: string) {
    if (!isSupabaseConfigured) return;
    if (!window.confirm("Excluir este agendamento de avaliação?")) return;
    const { error } = await getSupabase().from("avaliacoes_agenda").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Agendamento excluído.");
    setExpandedId(null);
    await loadAll();
  }

  if (loading) {
    return (
      <AdminPageFrame
        perm="alunos"
        title="Avaliações físicas"
        subtitle="Agenda e histórico de fichas."
      >
        <div className="flex items-center gap-3 text-sm py-16" style={{ color: "#6B6B6B" }}>
          <Loader2 className="animate-spin" size={20} />
          Carregando…
        </div>
      </AdminPageFrame>
    );
  }

  return (
    <AdminPageFrame
      perm="alunos"
      title="Avaliações físicas"
      subtitle="Gestão institucional: agenda igual à área do aluno (edição/remoção) e histórico somente leitura."
    >
      <CadastroFormAccordion defaultValue={[]} type="multiple">
        <CadastroFormAccordionSection
          value="adm-aval-agenda"
          ordinal="1"
          title="Agendamentos corporais"
          subtitle={listasAgenda.titulo + " · pesquisa por nome lista futuros"}
          icon={<CalendarClock size={16} style={{ color: "#00F9E4" }} />}
          iconColor="#00F9E4"
          iconBg="rgba(0,249,228,0.12)"
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: "#606060" }} />
              <input
                type="search"
                className={`${inputCls} pl-11`}
                placeholder="Pesquisar por nome do aluno (lista agendamentos futuros)…"
                value={qAgenda}
                onChange={(e) => setQAgenda(e.target.value)}
              />
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: "#6B6B6B" }}>
              Sem pesquisa: mostramos apenas o dia atual (fusão América/São Paulo). Com texto: todos os compromissos
              futuros cujo nome do aluno contém o trecho digitado ({MINUTOS_PADRAO_AVAL_CORPORAL} min por bloco na agenda).
            </p>

            {listasAgenda.rows.length === 0 ? (
              <p className="text-sm py-6" style={{ color: "#888" }}>
                {qAgenda.trim()
                  ? "Nenhum agendamento futuro encontrado para essa pesquisa."
                  : "Nenhum agendamento para hoje."}
              </p>
            ) : (
              <div className="space-y-2">
                {listasAgenda.rows.map((g) => {
                  const open = expandedId === g.id;
                  return (
                    <div key={g.id} className="rounded-xl overflow-hidden border border-[#2A2A2A]" style={{ background: "#111111" }}>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[#161616]"
                        onClick={() => toggleExpand(g)}
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate" style={{ color: "#F2F2F2" }}>
                            {g.alunos?.nome ?? "Aluno"}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                            {formatDateTimeBr(g.inicio_at)} · {g.professores?.nome?.trim() || "Professor —"}
                          </p>
                        </div>
                        <ChevronDown
                          size={20}
                          strokeWidth={2}
                          className="shrink-0 self-center text-primary transition-transform"
                          style={{ transform: open ? "rotate(180deg)" : undefined }}
                        />
                      </button>
                      {open ? (
                        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[#252525]">
                          <FieldRow label="Professor(a) atual">{g.professores?.nome?.trim() || "—"}</FieldRow>
                          <FieldRow label="Horário marcado">{formatDateTimeBr(g.inicio_at)}</FieldRow>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                                Data
                              </label>
                              <DateInputBr valueIso={draftDataIso} onChangeIso={setDraftDataIso} inputClassName={inputCls} />
                            </div>
                            <div>
                              <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                                Horário
                              </label>
                              <input
                                type="time"
                                step={300}
                                className={inputCls}
                                style={{ colorScheme: "dark" }}
                                value={draftHora}
                                onChange={(e) => setDraftHora(e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                              Professor(a)
                            </label>
                            <select
                              className={inputCls}
                              value={draftProf}
                              onChange={(e) => setDraftProf(e.target.value)}
                            >
                              <option value="">Selecione…</option>
                              {profOpts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.nome}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-2">
                            <SavePrimaryButton
                              preset="form"
                              loading={savingId === g.id}
                              onClick={() => void salvarEdicao(g.id)}
                            >
                              Salvar alterações
                            </SavePrimaryButton>
                            <button
                              type="button"
                              disabled={savingId === g.id}
                              onClick={() => void excluirAgendamento(g.id)}
                              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider disabled:opacity-50"
                              style={{
                                background: "rgba(248,113,113,0.12)",
                                color: "#F87171",
                                border: "1px solid rgba(248,113,113,0.25)",
                              }}
                            >
                              <Trash2 size={14} />
                              Excluir
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="adm-aval-historico"
          ordinal="2"
          title="Histórico de avaliações realizadas"
          subtitle="Mesma lista que agendamentos; ao abrir, só visualização · somente leitura"
          icon={<History size={16} style={{ color: "#94A3B8" }} />}
          iconColor="#94A3B8"
          iconBg="rgba(148,163,184,0.12)"
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: "#606060" }} />
              <input
                type="search"
                className={`${inputCls} pl-11`}
                placeholder="Pesquisar por nome do aluno…"
                value={qHist}
                onChange={(e) => setQHist(e.target.value)}
              />
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: "#6B6B6B" }}>
              Lista do mais recente para o mais antigo. Ao expandir uma linha, confira dados e médidas como no agendamento;
              não há edição nem exclusão.
            </p>
            {avaliacoesFiltradas.length === 0 ? (
              <p className="text-sm py-6" style={{ color: "#888" }}>
                Nenhuma ficha encontrada para o filtro.
              </p>
            ) : (
              <div className="space-y-2">
                {avaliacoesFiltradas.map((av) => {
                  const open = expandedHistId === av.id;
                  const profNome = profNomeAgendaPorFicha(av);
                  return (
                    <div key={av.id} className="rounded-xl overflow-hidden border border-[#2A2A2A]" style={{ background: "#111111" }}>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[#161616]"
                        onClick={() => toggleExpandHist(av.id)}
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate" style={{ color: "#F2F2F2" }}>
                            {av.alunos?.nome ?? "Aluno"}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                            {formatDateTimeBr(av.data_avaliacao)} · {profNome}
                          </p>
                        </div>
                        <ChevronDown
                          size={20}
                          strokeWidth={2}
                          className="shrink-0 self-center text-primary transition-transform"
                          style={{ transform: open ? "rotate(180deg)" : undefined }}
                        />
                      </button>
                      {open ? (
                        <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[#252525]">
                          <FieldRow label="Professor(a) (agenda vinculada)">{profNome}</FieldRow>
                          <FieldRow label="Data da avaliação">{formatDateTimeBr(av.data_avaliacao)}</FieldRow>
                          <BlocoAvaliacaoCorporalAluno variant="embedded" av={av} agendas={agendaCtxParaBlocos} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CadastroFormAccordionSection>
      </CadastroFormAccordion>
    </AdminPageFrame>
  );
}
