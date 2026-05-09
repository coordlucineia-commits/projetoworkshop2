import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { Dumbbell, History } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database, Json } from "../../lib/database.types";
import { dowBrMonSun } from "../../lib/datetimeBr";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";

type Ctx = { alunoId: string };

const GRUPOS_TREINO = [
  { label: "Braço", value: "braço" },
  { label: "Peito", value: "peito" },
  { label: "Costas", value: "costas" },
  { label: "Abdômen", value: "abdomen" },
  { label: "Pernas", value: "pernas" },
  { label: "Ombro", value: "ombro" },
] as const;

function labelDoGrupo(slug: string | null | undefined): string {
  if (!slug) return "";
  return GRUPOS_TREINO.find((g) => g.value === slug)?.label ?? slug;
}

function parseRepsSeed(repStr: string): number {
  const m = /^(\d+)/.exec(String(repStr ?? "").trim());
  return m ? Number.parseInt(m[1]!, 10) : 12;
}

function parseKgSeed(carga: string | null | undefined): number {
  if (carga == null || !String(carga).trim()) return 0;
  const m = String(carga).replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return m ? Number.parseFloat(m[1]!) : 0;
}

type Cell = { reps: number; kg: number };

function parseRegistroSeries(raw: Json | undefined): Cell[] {
  if (!Array.isArray(raw)) return [];
  const out: Cell[] = [];
  for (const el of raw) {
    if (el && typeof el === "object" && !Array.isArray(el)) {
      const o = el as Record<string, unknown>;
      const reps = typeof o.reps === "number" && Number.isFinite(o.reps) ? o.reps : 0;
      const kg = typeof o.kg === "number" && Number.isFinite(o.kg) ? o.kg : 0;
      out.push({ reps, kg });
    }
  }
  return out;
}

function defaultSeriesDraft(ex: Px): { reps: string; kg: string }[] {
  const n = Math.max(1, Math.min(20, ex.series || 1));
  const r0 = parseRepsSeed(ex.repeticoes);
  const k0 = parseKgSeed(ex.carga_sugerida);
  return Array.from({ length: n }, () => ({
    reps: String(r0),
    kg: k0 > 0 ? String(k0).replace(".", ",") : "",
  }));
}

function mergeDraftWithSaved(
  ex: Px,
  saved: Cell[] | undefined,
): { reps: string; kg: string }[] {
  const draft = defaultSeriesDraft(ex);
  if (!saved || saved.length !== draft.length) return draft;
  return draft.map((d, i) => {
    const s = saved[i];
    if (!s) return d;
    return {
      reps: s.reps > 0 ? String(s.reps) : d.reps,
      kg: s.kg > 0 ? String(s.kg).replace(".", ",") : d.kg,
    };
  });
}

function parseDraftToCells(draft: { reps: string; kg: string }[]): Cell[] {
  return draft.map((d) => {
    const reps = Number.parseFloat(String(d.reps).replace(",", ".").trim()) || 0;
    const kg = Number.parseFloat(String(d.kg).replace(",", ".").trim()) || 0;
    return { reps, kg };
  });
}

function formatUltimoCelula(prev: Cell | undefined): string {
  if (!prev || (prev.reps <= 0 && prev.kg <= 0)) return "—";
  if (prev.kg <= 0) return `${prev.reps}`;
  const kgStr = Number.isInteger(prev.kg) ? String(prev.kg) : String(prev.kg).replace(".", ",");
  return `${prev.reps}×${kgStr}`;
}

type ExCat = Pick<
  Database["public"]["Tables"]["exercicios"]["Row"],
  "grupo_muscular" | "descricao_execucao" | "dicas_seguranca" | "nome"
> | null;

type Px = Database["public"]["Tables"]["planos_treino_exercicios"]["Row"] & {
  exercicios?: ExCat;
};

type Dia = Database["public"]["Tables"]["planos_treino_dias"]["Row"] & {
  planos_treino_exercicios?: Px[];
};

export function AlunoMeuTreinoPage() {
  const { alunoId } = useOutletContext<Ctx>();

  type PlanAgg = Pick<Database["public"]["Tables"]["planos_treino"]["Row"], "id"> & {
    planos_treino_dias?: Dia[];
  };

  const [plan, setPlan] = useState<PlanAgg | null>(null);
  const [sessId, setSessId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  /** Linhas reps/kg por exercício */
  const [seriesDraft, setSeriesDraft] = useState<Record<string, { reps: string; kg: string }[]>>({});
  /** Série marcada como feita no treino atual */
  const [setFeito, setSetFeito] = useState<Record<string, boolean[]>>({});
  const [ultimoPorEx, setUltimoPorEx] = useState<Record<string, Cell[]>>({});

  const [err, setErr] = useState<string | null>(null);
  const [finalizadoEm, setFinalizadoEm] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(false);

  const persistTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dataIso =
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !alunoId) return;
    setErr(null);
    const sb = getSupabase();
    const { data } = await sb
      .from("planos_treino")
      .select(
        "id, planos_treino_dias ( id, dia_semana, rotulo, planos_treino_exercicios ( *, exercicios ( grupo_muscular, descricao_execucao, dicas_seguranca, nome ) ) ) ",
      )
      .eq("aluno_id", alunoId)
      .eq("ativo", true)
      .maybeSingle();
    setPlan((data ?? null) as PlanAgg | null);
  }, [alunoId]);

  useEffect(() => void load(), [load]);

  const dow = dowBrMonSun();
  const diaHoje = plan?.planos_treino_dias?.find((d) => d.dia_semana === dow);

  const exercisesFingerprint =
    diaHoje?.planos_treino_exercicios
      ?.map((e) => `${e.id}:${e.ordem}`)
      .sort()
      .join(",") ?? "";

  const exs = useMemo(
    () => [...(diaHoje?.planos_treino_exercicios ?? [])].sort((a, b) => a.ordem - b.ordem),
    [plan?.id, diaHoje?.id, exercisesFingerprint],
  );

  type ItRow = Database["public"]["Tables"]["treino_sessao_itens"]["Row"];

  const fetchUltimos = useCallback(
    async (sb: ReturnType<typeof getSupabase>, ids: string[]) => {
      if (ids.length === 0 || !alunoId) return {} as Record<string, Cell[]>;
      const { data, error } = await sb
        .from("treino_sessao_itens")
        .select("plano_exercicio_id, registro_series, treino_sessoes!inner(data_ref, finalizado_em, aluno_id)")
        .in("plano_exercicio_id", ids)
        .eq("treino_sessoes.aluno_id", alunoId)
        .lt("treino_sessoes.data_ref", dataIso)
        .not("treino_sessoes.finalizado_em", "is", null);

      if (error) {
        console.warn(error.message);
        return {};
      }

      type R = {
        plano_exercicio_id: string;
        registro_series: Json;
        treino_sessoes: { data_ref: string; finalizado_em: string; aluno_id: string };
      };

      const rows = (data ?? []) as R[];
      const best = new Map<string, R>();
      const newer = (a: R["treino_sessoes"], b: R["treino_sessoes"]) => {
        if (a.data_ref !== b.data_ref) return a.data_ref > b.data_ref;
        return a.finalizado_em > b.finalizado_em;
      };

      for (const r of rows) {
        const cur = best.get(r.plano_exercicio_id);
        if (!cur || newer(r.treino_sessoes, cur.treino_sessoes)) best.set(r.plano_exercicio_id, r);
      }

      const out: Record<string, Cell[]> = {};
      best.forEach((r, pid) => {
        const cells = parseRegistroSeries(r.registro_series).filter((c) => c.reps > 0 || c.kg > 0);
        if (cells.length) out[pid] = cells;
      });
      return out;
    },
    [alunoId, dataIso],
  );

  useEffect(() => {
    async function hydrate() {
      if (!diaHoje?.id || !isSupabaseConfigured || !alunoId) return;

      const list = [...(diaHoje.planos_treino_exercicios ?? [])].sort((a, b) => a.ordem - b.ordem);
      if (list.length === 0) return;

      setHydrating(true);
      setErr(null);
      const sb = getSupabase();

      const { data: sid, error: e1 } = await sb.rpc("aluno_iniciar_ou_obter_sessao_treino", {
        p_plano_dia: diaHoje.id,
        p_data: dataIso,
      });
      if (e1) {
        setErr(e1.message);
        setHydrating(false);
        return;
      }
      const id = sid as unknown as string;
      setSessId(id);

      const { data: ses } = await sb
        .from("treino_sessoes")
        .select("id, finalizado_em")
        .eq("id", id)
        .maybeSingle();
      const fin =
        (
          ses as {
            finalizado_em: string | null;
          } | null
        )?.finalizado_em ?? null;
      setFinalizadoEm(fin ?? null);

      let { data: itens } = await sb.from("treino_sessao_itens").select("*").eq("sessao_id", id);
      let rows = ((itens ?? []) as ItRow[]) ?? [];

      const have = new Set(rows.map((i) => i.plano_exercicio_id));
      for (const ex of list) {
        if (!have.has(ex.id)) {
          const defaults = mergeDraftWithSaved(ex, undefined);
          const { error: insErr } = await sb.from("treino_sessao_itens").insert({
            sessao_id: id,
            plano_exercicio_id: ex.id,
            realizado: false,
            registro_series: parseDraftToCells(defaults),
          });
          if (insErr) setErr(insErr.message);
        }
      }

      ({ data: itens } = await sb.from("treino_sessao_itens").select("*").eq("sessao_id", id));
      rows = ((itens ?? []) as ItRow[]) ?? [];

      const map: Record<string, boolean> = {};
      const draftMap: Record<string, { reps: string; kg: string }[]> = {};
      const feitoMap: Record<string, boolean[]> = {};

      const ultimos = await fetchUltimos(sb, list.map((e) => e.id));

      for (const ex of list) {
        const row = rows.find((r) => r.plano_exercicio_id === ex.id);
        const realizado = row?.realizado ?? false;
        map[ex.id] = realizado;

        const savedCells = parseRegistroSeries(row?.registro_series);
        draftMap[ex.id] = mergeDraftWithSaved(ex, savedCells.length ? savedCells : undefined);

        const n = draftMap[ex.id]!.length;
        feitoMap[ex.id] = realizado ? Array.from({ length: n }, () => true) : Array.from({ length: n }, () => false);
      }

      setChecks(map);
      setSeriesDraft(draftMap);
      setSetFeito(feitoMap);
      setUltimoPorEx(ultimos);
      setHydrating(false);
    }
    void hydrate();
  }, [plan?.id, diaHoje?.id, exercisesFingerprint, dataIso, alunoId, fetchUltimos]);

  const allMarked =
    exs.length > 0 && !finalizadoEm && exs.every((ex) => checks[ex.id]) && Object.keys(seriesDraft).length > 0;

  const persistSeries = useCallback(
    async (planoItemId: string, draft: { reps: string; kg: string }[]) => {
      if (!sessId || finalizadoEm) return;
      const sb = getSupabase();
      const cells = parseDraftToCells(draft);
      const { error } = await sb
        .from("treino_sessao_itens")
        .update({ registro_series: cells })
        .eq("sessao_id", sessId)
        .eq("plano_exercicio_id", planoItemId);
      if (error) setErr(error.message);
    },
    [sessId, finalizadoEm],
  );

  const schedulePersist = useCallback(
    (planoItemId: string, draft: { reps: string; kg: string }[]) => {
      if (!planoItemId || finalizadoEm) return;
      window.clearTimeout(persistTimers.current[planoItemId]);
      persistTimers.current[planoItemId] = window.setTimeout(() => void persistSeries(planoItemId, draft), 480);
    },
    [finalizadoEm, persistSeries],
  );

  useEffect(() => {
    return () => {
      Object.values(persistTimers.current).forEach((t) => window.clearTimeout(t));
    };
  }, []);

  async function toggleItem(planoItemId: string, feito: boolean) {
    if (!sessId) return;
    const sb = getSupabase();
    const { error } = await sb.rpc("aluno_toggle_treino_item", {
      p_sessao: sessId,
      p_plano_item: planoItemId,
      p_feito: feito,
    });
    if (error) setErr(error.message);
    else setChecks((prev) => ({ ...prev, [planoItemId]: feito }));
  }

  function atualizarDraft(
    exId: string,
    setIdx: number,
    campo: "reps" | "kg",
    raw: string,
    ex: Px,
  ) {
    setSeriesDraft((prev) => {
      const next = [...(prev[exId] ?? mergeDraftWithSaved(ex, undefined))];
      if (!next[setIdx]) return prev;
      next[setIdx] = {
        ...next[setIdx]!,
        [campo]: campo === "kg" ? raw : raw.replace(/\D/g, "") || "",
      };
      schedulePersist(exId, next);
      return { ...prev, [exId]: next };
    });
  }

  function toggleSetLinha(ex: Px, setIdx: number) {
    if (finalizadoEm) return;
    const key = ex.id;
    const n = seriesDraft[key]?.length ?? ex.series;
    const cur = [...(setFeito[key] ?? Array.from({ length: n }, () => false))];
    while (cur.length < n) cur.push(false);
    cur[setIdx] = !cur[setIdx];
    setSetFeito((prev) => ({ ...prev, [key]: cur }));

    const allOn = cur.length > 0 && cur.every(Boolean);
    void toggleItem(key, allOn);
  }

  async function finalizar() {
    if (!sessId) return;
    const sb = getSupabase();
    const { error } = await sb.rpc("aluno_finalizar_sessao_treino", { p_sessao: sessId });
    if (error) setErr(error.message);
    else setFinalizadoEm(new Date().toISOString());
  }

  if (!plan) {
    return (
      <div className="px-6 py-10">
        <p style={{ color: "#AAA" }}>Nenhum plano ativo ainda.</p>
        <p className="text-sm mt-2" style={{ color: "#6B6B6B" }}>
          Seu professor publicará assim que concluir a avaliação.
        </p>
      </div>
    );
  }

  const inp =
    "w-full min-w-0 rounded-xl border border-[#303030] bg-[#1A1A1A] px-3 py-2.5 text-center text-sm text-white tabular-nums placeholder:text-[#505050] focus:outline-none focus:border-[#00F9E4] disabled:opacity-60";

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border py-8 pb-24 space-y-6">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black mb-2">Meu treino · hoje</h1>
          <p style={{ color: "#888" }}>
            Dia do calendário: <span style={{ color: "#00F9E4" }}>{diaHoje?.rotulo ?? "—"}</span>
          </p>
        </div>
        <Link
          className="text-xs mt-8 md:mt-0 uppercase font-bold underline"
          style={{ color: "#00F9E4" }}
          to="/aluno/meu-treino/historico"
        >
          Histórico
        </Link>
      </div>

      {hydrating ? (
        <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "#606060" }}>
          Carregando sessão…
        </p>
      ) : null}
      {err && <p className="text-sm text-red-400">{err}</p>}

      {!diaHoje && <p style={{ color: "#AAA" }}>Hoje é descanso ou não há fichas configuradas neste dia.</p>}

      {diaHoje && (
        <CadastroFormAccordion type="multiple" className="gap-4">
          {exs.map((ex) => {
            const grupo = labelDoGrupo(ex.exercicios?.grupo_muscular ?? undefined);
            const draft = seriesDraft[ex.id] ?? mergeDraftWithSaved(ex, undefined);
            const feitosLinha = setFeito[ex.id] ?? draft.map(() => false);
            const descPlano =
              `${ex.series}×${ex.repeticoes}${
                ex.tempo_descanso_segundos != null ? ` · descanso ${ex.tempo_descanso_segundos}s` : ""
              }${ex.equipamento ? ` · ${ex.equipamento}` : ""}`;
            const ultimoArr = ultimoPorEx[ex.id];
            const descricaoCat = String(ex.exercicios?.descricao_execucao ?? "").trim();
            const dicas = String(ex.exercicios?.dicas_seguranca ?? "").trim();
            const obsProfessor = String(ex.observacoes ?? "").trim();

            return (
              <CadastroFormAccordionSection
                key={ex.id}
                value={ex.id}
                preserveTitleCase
                title={ex.nome_exercicio}
                icon={<Dumbbell size={16} style={{ color: "#00F9E4" }} />}
                subtitle={
                  <>
                    {grupo ? (
                      <span className="block text-[11px]" style={{ color: "#888" }}>
                        {grupo}
                      </span>
                    ) : null}
                    <span className="block text-[11px] mt-0.5 font-mono uppercase tracking-wider" style={{ color: "#6B6B6B" }}>
                      {descPlano}
                    </span>
                  </>
                }
              >
                <div className="space-y-3">
                  <div className="hidden sm:grid sm:grid-cols-[2rem_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,5rem)_2.75rem] sm:gap-x-2 sm:items-center px-1 text-[10px] font-mono uppercase tracking-wider" style={{ color: "#6B6B6B" }}>
                    <span />
                    <span className="text-center">Reps</span>
                    <span />
                    <span className="text-center">Carga (kg)</span>
                    <span className="text-center">Último treino</span>
                    <span />
                  </div>

                  {draft.map((linha, ix) => (
                    <div key={ix} className="rounded-xl border border-[#252525] bg-[#121212] px-3 py-3 space-y-3">
                      <div className="flex items-center justify-between gap-3 sm:hidden">
                        <span className="font-bold text-sm text-white">Série {ix + 1}</span>
                        <div className="flex flex-1 min-w-0 items-center gap-2 justify-end">
                          <input
                            type="text"
                            inputMode="numeric"
                            disabled={!!finalizadoEm}
                            className={inp}
                            value={linha.reps}
                            onChange={(e) => atualizarDraft(ex.id, ix, "reps", e.target.value, ex)}
                            aria-label={`Série ${ix + 1} repetições`}
                          />
                          <span className="text-sm shrink-0" style={{ color: "#757575" }}>
                            ×
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            disabled={!!finalizadoEm}
                            className={inp}
                            value={linha.kg}
                            onChange={(e) => atualizarDraft(ex.id, ix, "kg", e.target.value, ex)}
                            aria-label={`Série ${ix + 1} carga kg`}
                          />
                        </div>
                      </div>
                      <div className="hidden sm:grid sm:grid-cols-[2rem_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(4rem,auto)_2.75rem] sm:gap-x-2 sm:items-center">
                        <span className="flex font-bold text-sm text-white items-center">{ix + 1}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          disabled={!!finalizadoEm}
                          className={inp}
                          value={linha.reps}
                          onChange={(e) => atualizarDraft(ex.id, ix, "reps", e.target.value, ex)}
                          aria-label={`Série ${ix + 1} repetições`}
                        />
                        <span className="flex text-sm justify-center shrink-0 items-center" style={{ color: "#757575" }}>
                          ×
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          disabled={!!finalizadoEm}
                          className={inp}
                          value={linha.kg}
                          onChange={(e) => atualizarDraft(ex.id, ix, "kg", e.target.value, ex)}
                          aria-label={`Série ${ix + 1} carga kg`}
                        />
                        <div className="text-center text-xs tabular-nums flex items-center justify-center min-h-[2.25rem]" style={{ color: "#9CA3AF" }}>
                          {formatUltimoCelula(ultimoArr?.[ix])}
                        </div>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            disabled={!!finalizadoEm}
                            onClick={() => toggleSetLinha(ex, ix)}
                            className="h-7 w-7 shrink-0 rounded-full border-2 transition-colors flex items-center justify-center"
                            style={{
                              borderColor: feitosLinha[ix] ? "#00F9E4" : "#4B5563",
                              background: feitosLinha[ix] ? "rgba(0,249,228,0.15)" : "transparent",
                            }}
                            aria-pressed={feitosLinha[ix]}
                            aria-label={`Série ${ix + 1} concluída`}
                          >
                            {feitosLinha[ix] ? (
                              <span className="h-3 w-3 rounded-full block" style={{ background: "#00F9E4" }} />
                            ) : null}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:hidden">
                        <div className="flex items-center gap-2 text-xs tabular-nums" style={{ color: "#9CA3AF" }}>
                          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#6B6B6B" }}>
                            Último treino
                          </span>
                          <span>{formatUltimoCelula(ultimoArr?.[ix])}</span>
                        </div>
                        <button
                          type="button"
                          disabled={!!finalizadoEm}
                          onClick={() => toggleSetLinha(ex, ix)}
                          className="h-7 w-7 shrink-0 rounded-full border-2 transition-colors flex items-center justify-center"
                          style={{
                            borderColor: feitosLinha[ix] ? "#00F9E4" : "#4B5563",
                            background: feitosLinha[ix] ? "rgba(0,249,228,0.15)" : "transparent",
                          }}
                          aria-pressed={feitosLinha[ix]}
                          aria-label={`Série ${ix + 1} concluída`}
                        >
                          {feitosLinha[ix] ? (
                            <span className="h-3 w-3 rounded-full block" style={{ background: "#00F9E4" }} />
                          ) : null}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-[#252525]">
                  <Link
                    to="/aluno/meu-treino/historico"
                    className="flex items-center justify-center gap-2 w-full py-2 text-xs font-black uppercase tracking-widest hover:underline"
                    style={{ color: "#00F9E4" }}
                  >
                    <History size={18} strokeWidth={2} aria-hidden />
                    Histórico da atividade
                  </Link>
                </div>

                {(descricaoCat || dicas || obsProfessor) && (
                  <div className="mt-4 pt-4 border-t border-[#252525] space-y-3 text-sm leading-relaxed" style={{ color: "#BFBFBF" }}>
                    <h3 className="text-xs font-mono uppercase tracking-widest" style={{ color: "#888" }}>
                      Como executar
                    </h3>
                    {descricaoCat ? (
                      <p className="whitespace-pre-wrap">{descricaoCat}</p>
                    ) : obsProfessor ? null : (
                      <p style={{ color: "#6B6B6B" }}>Este exercício está cadastrado sem descrição detalhada na biblioteca.</p>
                    )}
                    {obsProfessor ? (
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: "#888" }}>
                          Orientação do professor
                        </p>
                        <p className="whitespace-pre-wrap text-white">{obsProfessor}</p>
                      </div>
                    ) : null}
                    {dicas ? (
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: "#888" }}>
                          Segurança
                        </p>
                        <p className="whitespace-pre-wrap">{dicas}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </CadastroFormAccordionSection>
            );
          })}
        </CadastroFormAccordion>
      )}

      {finalizadoEm && (
        <p className="text-sm" style={{ color: "#22C55E" }}>
          Treino do dia registrado ({new Date(finalizadoEm).toLocaleString("pt-BR")}).
        </p>
      )}
      {!finalizadoEm && allMarked && (
        <button
          type="button"
          onClick={() => void finalizar()}
          className="w-full py-4 rounded-full font-black uppercase tracking-widest text-sm"
          style={{ background: "#00F9E4", color: "#0A0A0A" }}
        >
          Finalizar treino do dia
        </button>
      )}
    </div>
  );
}
