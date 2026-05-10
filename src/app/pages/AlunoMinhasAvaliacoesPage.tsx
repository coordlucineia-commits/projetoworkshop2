import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useOutletContext } from "react-router";
import { CalendarPlus, History, Ruler } from "lucide-react";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateBr, formatDateTimeBr } from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";
import {
  ESPECIALIDADE_AVALIACAO_CORPORAL,
  professorTemAvaliacaoCorporal,
} from "../../lib/professorEspecialidades";
import { isoYmdSomente, ymdSaoPauloFromInstant } from "../../lib/datetimeBr";
import {
  intervaloIsoParaAvaliacaoCorporalAgenda,
  MINUTOS_PADRAO_AVAL_CORPORAL,
} from "../../lib/salvarCadastroAluno";
import { DateInputBr } from "../components/DateInputBr";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import {
  BlocoAvaliacaoCorporalAluno,
  type AgendaRowFull,
  type AvaliacaoAlunoRow,
} from "../components/BlocoAvaliacaoCorporalAluno";

type Ctx = { alunoId: string; checkinRegistrado: boolean };

type ProfOpt = { id: string; nome: string };

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDataAvalIso(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(ymd).trim());
  if (!m) return null;
  const y = Number(m[1]),
    mo = Number(m[2]),
    day = Number(m[3]);
  return startOfDay(new Date(y, mo - 1, day));
}

function ultimaReferenciaAvaliacao(fichas: AvaliacaoAlunoRow[], agendas: AgendaRowFull[]): Date | null {
  let max = 0;
  for (const f of fichas) {
    const d = parseDataAvalIso(isoYmdSomente(f.data_avaliacao));
    if (d) max = Math.max(max, d.getTime());
  }
  for (const g of agendas) {
    if (g.status !== "realizado") continue;
    const d = parseDataAvalIso(ymdSaoPauloFromInstant(g.inicio_at));
    if (d) max = Math.max(max, d.getTime());
  }
  return max > 0 ? new Date(max) : null;
}

function dataLiberadaProximoAgendamento(ultima: Date): Date {
  const d = new Date(ultima);
  d.setMonth(d.getMonth() + 3);
  return startOfDay(d);
}

function msParaInicioAgendamento(g: AgendaRowFull): number {
  return new Date(g.inicio_at).getTime() - Date.now();
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

const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors border border-[#222222]";

export function AlunoMinhasAvaliacoesPage() {
  const { alunoId } = useOutletContext<Ctx>();
  const [agendas, setAgendas] = useState<AgendaRowFull[]>([]);
  const [avaliacoesList, setAvaliacoesList] = useState<AvaliacaoAlunoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profOpts, setProfOpts] = useState<ProfOpt[]>([]);
  const [loadingProfs, setLoadingProfs] = useState(true);
  const [showAgendar, setShowAgendar] = useState(false);
  const [dataIso, setDataIso] = useState("");
  const [horaHm, setHoraHm] = useState("");
  const [profId, setProfId] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<string | undefined>(undefined);

  const agendaAgendada = useMemo(() => agendas.find((g) => g.status === "agendado") ?? null, [agendas]);
  const podeEditarOuExcluir = useMemo(() => {
    if (!agendaAgendada) return false;
    return msParaInicioAgendamento(agendaAgendada) >= 24 * 60 * 60 * 1000;
  }, [agendaAgendada]);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured || !alunoId) return;
    const sb = getSupabase();
    const [rAg, rAv] = await Promise.all([
      sb
        .from("avaliacoes_agenda")
        .select("id, inicio_at, fim_at, status, professores ( nome ), aluno_id, professor_id, created_at")
        .eq("aluno_id", alunoId)
        .order("inicio_at", { ascending: false }),
      sb.from("avaliacoes").select("*").eq("aluno_id", alunoId).order("created_at", { ascending: false }),
    ]);
    setAgendas((rAg.data ?? []) as AgendaRowFull[]);
    setAvaliacoesList(((rAv.data ?? []) as AvaliacaoAlunoRow[]) ?? []);
  }, [alunoId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !alunoId) return;
    let cancel = false;
    void (async () => {
      await reload();
      if (cancel) return;
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [alunoId, reload]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isSupabaseConfigured) {
        setLoadingProfs(false);
        return;
      }
      setLoadingProfs(true);
      const sb = getSupabase();
      const { data, error } = await sb
        .from("professores")
        .select("id, nome, especialidades, ativo")
        .eq("ativo", true)
        .order("nome");
      if (cancelled) return;
      setLoadingProfs(false);
      if (error) {
        setProfOpts([]);
        return;
      }
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

  const ultimaRef = useMemo(() => ultimaReferenciaAvaliacao(avaliacoesList, agendas), [avaliacoesList, agendas]);
  const podeAgendar = useMemo(() => {
    if (agendaAgendada) return true;
    const now = new Date();
    const ref = ultimaRef;
    if (!ref) return true;
    return now.getTime() >= dataLiberadaProximoAgendamento(ref).getTime();
  }, [agendaAgendada, ultimaRef]);

  const motivoBotaoOculto = useMemo(() => {
    const ref = ultimaRef;
    if (ref && !podeAgendar) {
      const lib = dataLiberadaProximoAgendamento(ref);
      return `Novo autoagendamento liberado em ${formatDateBr(lib.toISOString())} (${formatDateBr(ref.toISOString())} foi a referência anterior; intervalo de 3 meses).`;
    }
    return null;
  }, [ultimaRef, podeAgendar]);

  function abrirReagendar() {
    if (!agendaAgendada) {
      setShowAgendar(true);
      return;
    }
    const ini = new Date(agendaAgendada.inicio_at);
    const ymd = `${ini.getFullYear()}-${String(ini.getMonth() + 1).padStart(2, "0")}-${String(ini.getDate()).padStart(2, "0")}`;
    const hm = `${String(ini.getHours()).padStart(2, "0")}:${String(ini.getMinutes()).padStart(2, "0")}`;
    setDataIso(ymd);
    setHoraHm(hm);
    setProfId(agendaAgendada.professor_id ?? "");
    setShowAgendar(true);
  }

  async function salvarAgendamento() {
    if (!isSupabaseConfigured || !alunoId) return;
    if (!profId.trim()) {
      toast.error("Selecione um professor.");
      return;
    }
    if (!dataIso.trim()) {
      toast.error("Informe a data.");
      return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horaHm.trim())) {
      toast.error("Horário inválido (use HH:mm).");
      return;
    }
    if (!profOpts.some((p) => p.id === profId)) {
      toast.error("Professor não disponível para avaliação corporal.");
      return;
    }
    let inicio_iso: string;
    let fim_iso: string;
    try {
      const r = intervaloIsoParaAvaliacaoCorporalAgenda(dataIso.trim(), horaHm.trim());
      inicio_iso = r.inicio_iso;
      fim_iso = r.fim_iso;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Data ou horário inválidos.");
      return;
    }
    const inicioMs = new Date(inicio_iso).getTime();
    if (inicioMs <= Date.now()) {
      toast.error("Escolha data e hora futuras.");
      return;
    }

    const ref = ultimaReferenciaAvaliacao(avaliacoesList, agendas);
    if (!agendaAgendada && ref && Date.now() < dataLiberadaProximoAgendamento(ref).getTime()) {
      toast.error(`Aguarde até ${formatDateBr(dataLiberadaProximoAgendamento(ref).toISOString())} para um novo agendamento.`);
      return;
    }
    if (agendaAgendada && !podeEditarOuExcluir) {
      toast.error("Reagendamento só é permitido com no mínimo 24h de antecedência.");
      return;
    }

    setSalvando(true);
    const sb = getSupabase();
    const { error } = agendaAgendada
      ? await sb
          .from("avaliacoes_agenda")
          .update({ professor_id: profId.trim(), inicio_at: inicio_iso, fim_at: fim_iso })
          .eq("id", agendaAgendada.id)
      : await sb.from("avaliacoes_agenda").insert({
          aluno_id: alunoId,
          professor_id: profId.trim(),
          inicio_at: inicio_iso,
          fim_at: fim_iso,
          status: "agendado",
        });
    setSalvando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      agendaAgendada
        ? "Solicitação atualizada!"
        : `Agendamento registrado (${MINUTOS_PADRAO_AVAL_CORPORAL} min na agenda).`,
    );
    setShowAgendar(false);
    setDataIso("");
    setHoraHm("");
    setProfId("");
    await reload();
  }

  async function excluirSolicitacao() {
    if (!isSupabaseConfigured || !alunoId) return;
    if (!agendaAgendada) return;
    if (!podeEditarOuExcluir) {
      toast.error("Exclusão só é permitida com no mínimo 24h de antecedência.");
      return;
    }
    const sb = getSupabase();
    const { error } = await sb.from("avaliacoes_agenda").delete().eq("id", agendaAgendada.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Solicitação removida.");
    setShowAgendar(false);
    setDataIso("");
    setHoraHm("");
    setProfId("");
    await reload();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl w-full px-0 md:px-10 box-border mt-6 pb-24">
        <p className="text-sm font-mono uppercase" style={{ color: "#6B6B6B" }}>
          Carregando…
        </p>
      </div>
    );
  }

  const historicoAgendas = agendas.filter((g) => g.status !== "agendado");

  return (
    <div className="mx-auto max-w-3xl w-full px-0 md:px-10 box-border mt-6 pb-24">
      <div className="mb-6">
        <h1 className="font-black text-2xl md:text-3xl tracking-tight" style={{ color: "#F2F2F2" }}>
          Minhas avaliações
        </h1>
        <p className="text-xs mt-1 font-mono uppercase tracking-widest" style={{ color: "#606060" }}>
          Agenda, pendências e informações gerais de cada ficha
        </p>
      </div>

      <CadastroFormAccordion
        type="single"
        collapsible
        value={accordionOpen}
        onValueChange={(v) => setAccordionOpen(v || undefined)}
        className="w-full mb-2"
      >
        <CadastroFormAccordionSection
          value="pend"
          ordinal="1"
          title="Avaliação pendente"
          icon={<CalendarPlus size={16} style={{ color: "#00F9E4" }} />}
          iconColor="#00F9E4"
          iconBg="rgba(0,249,228,0.12)"
        >
            <div className="space-y-4">
              <p className="text-sm" style={{ color: "#6B6B6B" }}>
                {motivoBotaoOculto
                  ? motivoBotaoOculto
                  : ultimaRef && podeAgendar
                    ? `Referência mais recente: ${formatDateBr(ultimaRef.toISOString())}. Novo período disponível conforme intervalo de 3 meses.`
                    : "Escolha um professor e solicite seu horário."}
              </p>

              {agendaAgendada ? (
                <div className="rounded-xl p-4 space-y-1 text-sm" style={{ background: "#111111", border: "1px solid #252525" }}>
                  <FieldLine label="Professor(a)">{agendaAgendada.professores?.nome?.trim() || "—"}</FieldLine>
                  <FieldLine label="Início">{formatDateTimeBr(agendaAgendada.inicio_at)}</FieldLine>
                  <FieldLine label="Fim">{formatDateTimeBr(agendaAgendada.fim_at)}</FieldLine>
                  <FieldLine label="Status">{agendaAgendada.status}</FieldLine>
                  <div className="flex flex-wrap gap-3 pt-3">
                    <button
                      type="button"
                      disabled={!podeEditarOuExcluir}
                      onClick={() => abrirReagendar()}
                      className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-45"
                      style={{
                        background: "rgba(0,249,228,0.12)",
                        color: "#00F9E4",
                        border: "1px solid rgba(0,249,228,0.25)",
                      }}
                    >
                      Editar / reagendar
                    </button>
                    <button
                      type="button"
                      disabled={!podeEditarOuExcluir}
                      onClick={() => void excluirSolicitacao()}
                      className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest disabled:opacity-45"
                      style={{
                        background: "rgba(248,113,113,0.10)",
                        color: "#F87171",
                        border: "1px solid rgba(248,113,113,0.25)",
                      }}
                    >
                      Excluir solicitação
                    </button>
                  </div>
                  {!podeEditarOuExcluir ? (
                    <p className="text-xs pt-2" style={{ color: "#888" }}>
                      Alterações ficam disponíveis somente até 24h antes do horário marcado.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {podeAgendar ? (
                <button
                  type="button"
                  onClick={() => (showAgendar ? setShowAgendar(false) : abrirReagendar())}
                  className="flex items-center gap-2 shrink-0 rounded-full px-5 py-3 text-sm font-bold transition-colors uppercase tracking-wide w-fit"
                  style={{ background: "#00F9E4", color: "#0A0A0A" }}
                >
                  <CalendarPlus size={18} />
                  {showAgendar ? "Fechar" : agendaAgendada ? "Reagendar avaliação" : "Agendar avaliação"}
                </button>
              ) : null}

              {showAgendar ? (
                <div className="rounded-xl p-4 space-y-4" style={{ background: "#111111", border: "1px solid #252525" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "#A8A8A8" }}>
                    Você mesmo escolhe o professor cadastrado com a especialidade «{ESPECIALIDADE_AVALIACAO_CORPORAL}». O
                    período equivale a {MINUTOS_PADRAO_AVAL_CORPORAL} min na academia.
                  </p>
                  {loadingProfs ? (
                    <p className="text-sm" style={{ color: "#6B6B6B" }}>
                      Carregando professores…
                    </p>
                  ) : profOpts.length === 0 ? (
                    <p
                      className="text-sm rounded-xl px-4 py-3"
                      style={{ background: "#1A1518", border: "1px solid #3f2f36", color: "#F87171" }}
                    >
                      Nenhum professor ativo com essa especialidade. Fale com a recepção.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                            Data
                          </label>
                          <DateInputBr
                            valueIso={dataIso}
                            onChangeIso={setDataIso}
                            inputClassName={inputCls}
                            inputStyle={{ background: "#0D0D0D", color: "#F2F2F2" }}
                            disabled={salvando}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                            Horário
                          </label>
                          <input
                            type="time"
                            step={300}
                            className={inputCls}
                            style={{ background: "#0D0D0D", color: "#F2F2F2", colorScheme: "dark" }}
                            value={horaHm}
                            onChange={(e) => setHoraHm(e.target.value)}
                            disabled={salvando}
                            onFocus={(e) => {
                              (e.target as HTMLInputElement).style.borderColor = "#00F9E4";
                            }}
                            onBlur={(e) => {
                              (e.target as HTMLInputElement).style.borderColor = "#222222";
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                          Professor(a)
                        </label>
                        <select
                          className={inputCls}
                          style={{ background: "#0D0D0D", color: "#F2F2F2", cursor: "pointer" }}
                          value={profId}
                          disabled={salvando}
                          onChange={(e) => setProfId(e.target.value)}
                        >
                          <option value="">Selecione</option>
                          {profOpts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <SavePrimaryButton preset="form" loading={salvando} onClick={() => void salvarAgendamento()}>
                          Confirmar
                        </SavePrimaryButton>
                        {agendaAgendada ? (
                          <button
                            type="button"
                            disabled={salvando || !podeEditarOuExcluir}
                            onClick={() => void excluirSolicitacao()}
                            className="rounded-full px-6 py-2.5 text-sm font-bold uppercase tracking-wide disabled:opacity-45"
                            style={{
                              background: "rgba(248,113,113,0.10)",
                              color: "#F87171",
                              border: "1px solid rgba(248,113,113,0.25)",
                            }}
                          >
                            Excluir
                          </button>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="med"
          ordinal="2"
          title="Informações gerais"
          subtitle="Valores da última ficha salva — atualizam a cada nova avaliação"
          icon={<Ruler size={16} style={{ color: "#4ADE80" }} />}
          iconColor="#4ADE80"
          iconBg="rgba(74,222,128,0.12)"
        >
            {avaliacoesList.length === 0 ? (
              <p className="text-sm" style={{ color: "#888" }}>
                Ainda não há fichas registradas. Quando o professor salvar uma avaliação, peso, estatura, IMC, gordura e
                massa magra aparecem aqui, atualizados a cada nova avaliação.
              </p>
            ) : (
              avaliacoesList.map((av) => <BlocoAvaliacaoCorporalAluno key={av.id} av={av} agendas={agendas} />)
            )}
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="hist"
          ordinal="3"
          title="Histórico de avaliações"
          subtitle="Slots na agenda já concluídos"
          icon={<History size={16} style={{ color: "#94A3B8" }} />}
          iconColor="#94A3B8"
          iconBg="rgba(148,163,184,0.12)"
        >
            {historicoAgendas.length === 0 ? (
              <p className="text-sm" style={{ color: "#888" }}>
                Nenhum histórico encontrado (apenas pendências aparecem na seção 1).
              </p>
            ) : (
              <div className="space-y-3">
                {historicoAgendas.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl p-4 space-y-2"
                    style={{ background: "#111111", border: "1px solid #252525" }}
                  >
                    <FieldLine label="Professor(a)">{g.professores?.nome?.trim() || "—"}</FieldLine>
                    <FieldLine label="Início">{formatDateTimeBr(g.inicio_at)}</FieldLine>
                    <FieldLine label="Fim">{formatDateTimeBr(g.fim_at)}</FieldLine>
                    <FieldLine label="Status">{g.status}</FieldLine>
                  </div>
                ))}
              </div>
            )}
        </CadastroFormAccordionSection>
      </CadastroFormAccordion>
    </div>
  );
}
