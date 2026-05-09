import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router";
import { ChevronDown, ClipboardList, LayoutGrid, Trash2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { SavePrimaryButton } from "../components/SavePrimaryButton";

type Ctx = { professorId: string };

type Ex = Database["public"]["Tables"]["exercicios"]["Row"];

type Px = Pick<
  Database["public"]["Tables"]["planos_treino_exercicios"]["Insert"],
  | "nome_exercicio"
  | "series"
  | "repeticoes"
  | "carga_sugerida"
  | "observacoes"
  | "exercicio_id"
  | "ordem"
  | "equipamento"
  | "tempo_descanso_segundos"
>;

const ROTULOS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const DESCANSO_PADRAO_S = 60;

const GRUPOS_TREINO = [
  { label: "Braço", value: "braço" },
  { label: "Peito", value: "peito" },
  { label: "Costas", value: "costas" },
  { label: "Abdômen", value: "abdomen" },
  { label: "Pernas", value: "pernas" },
  { label: "Ombro", value: "ombro" },
] as const;

type DayPlan = {
  dia: number;
  rotulo: string;
  grupoMuscular: string;
  items: Px[];
  exercicios: Ex[];
  selExercicioId: string;
  draftSeries: string;
  draftRep: string;
  draftDescanso: string;
  loadingExercicios: boolean;
};

type DiazPlanoHydrate = {
  dia_semana: number;
  rotulo: string;
  planos_treino_exercicios?: PxRowHydrate[];
};

type PxRowHydrate = {
  nome_exercicio: string;
  exercicio_id: string | null;
  equipamento: string | null;
  series: number;
  repeticoes: string;
  tempo_descanso_segundos: number | null;
  carga_sugerida: string | null;
  observacoes: string | null;
  ordem: number;
};

function initialDayPlans(): DayPlan[] {
  return [1, 2, 3, 4, 5, 6, 7].map((dia) => ({
    dia,
    rotulo: ROTULOS[dia - 1]!,
    grupoMuscular: "",
    items: [],
    exercicios: [],
    selExercicioId: "",
    draftSeries: "3",
    draftRep: "12",
    draftDescanso: String(DESCANSO_PADRAO_S),
    loadingExercicios: false,
  }));
}

function labelDoGrupo(slug: string) {
  return GRUPOS_TREINO.find((g) => g.value === slug)?.label ?? slug;
}

/** Subtítulo do acordeão: conta exercícios e lista todos os grupos musculares presentes no dia (ordem = ordem na ficha). */
function resumoAccordionSubtitulo(d: DayPlan, grupoPorExercicioId: Map<string, string>): string {
  if (d.items.length === 0) return "Nenhum exercício";
  const ord = [...d.items].sort((a, b) => a.ordem - b.ordem);
  const jaGrupoSlug = new Set<string>();
  const labels: string[] = [];
  for (const it of ord) {
    if (!it.exercicio_id) continue;
    const slug = grupoPorExercicioId.get(it.exercicio_id);
    if (!slug || jaGrupoSlug.has(slug)) continue;
    jaGrupoSlug.add(slug);
    labels.push(labelDoGrupo(slug));
  }
  const diaNome = ROTULOS[d.dia - 1]!;
  if (labels.length > 0) {
    return `${d.items.length} exercício(s) · ${diaNome} — ${labels.join(" · ")}`;
  }
  return `${d.items.length} exercício(s) · ${d.rotulo}`;
}

function idsExerciciosJaNoDia(items: Px[]) {
  const s = new Set<string>();
  for (const it of items) {
    if (it.exercicio_id) s.add(it.exercicio_id);
  }
  return s;
}

function exerciciosDisponiveis(items: Px[], todos: Ex[]) {
  const usados = idsExerciciosJaNoDia(items);
  return todos.filter((e) => !usados.has(e.id));
}

const selectCn =
  "w-full rounded-xl px-4 py-2.5 text-sm border border-[#393939] min-h-[42px] appearance-none";
const selectStyle = { background: "#0D0D0D", color: "#EEEEEE" } as const;

export function ProfessorTreinoNovoPage() {
  const { professorId } = useOutletContext<Ctx>();
  const { id: alunoRouteId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [days, setDays] = useState<DayPlan[]>(initialDayPlans);
  const [openDia, setOpenDia] = useState<number | null>(1);
  const [hydrating, setHydrating] = useState(true);
  const [alunoNome, setAlunoNome] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [grupoPorExercicioId, setGrupoPorExercicioId] = useState<Map<string, string>>(() => new Map());

  const exIdsFingerprint = useMemo(() => {
    const s = new Set<string>();
    for (const dz of days) {
      for (const it of dz.items) {
        if (it.exercicio_id) s.add(it.exercicio_id);
      }
    }
    return [...s].sort().join(",");
  }, [days]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setGrupoPorExercicioId(new Map());
      return;
    }
    const ids = exIdsFingerprint.split(",").filter(Boolean);
    if (ids.length === 0) {
      setGrupoPorExercicioId(new Map());
      return;
    }

    let cancel = false;
    (async () => {
      const sb = getSupabase();
      const { data, error: eGrp } = await sb.from("exercicios").select("id, grupo_muscular").in("id", ids);
      if (cancel) return;
      if (eGrp) {
        console.error(eGrp);
        return;
      }
      const m = new Map<string, string>();
      ((data ?? []) as { id: string; grupo_muscular: string }[]).forEach((r) =>
        m.set(r.id, r.grupo_muscular),
      );
      setGrupoPorExercicioId(m);
    })();

    return () => {
      cancel = true;
    };
  }, [exIdsFingerprint]);

  const patchDay = useCallback((ix: number, partial: Partial<DayPlan>) => {
    setDays((prev) => prev.map((d, j) => (j === ix ? { ...d, ...partial } : d)));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !alunoRouteId || !professorId) {
      setHydrating(false);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      setHydrating(true);
      setErr(null);
      const sb = getSupabase();

      const [{ data: naluno }, planRes] = await Promise.all([
        sb.from("alunos").select("nome").eq("id", alunoRouteId).maybeSingle(),
        sb
          .from("planos_treino")
          .select(
            `planos_treino_dias (
              dia_semana,
              rotulo,
              planos_treino_exercicios (
                nome_exercicio,
                exercicio_id,
                equipamento,
                series,
                repeticoes,
                tempo_descanso_segundos,
                carga_sugerida,
                observacoes,
                ordem
              )
            )`,
          )
          .eq("aluno_id", alunoRouteId)
          .eq("professor_id", professorId)
          .eq("ativo", true)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      if (naluno?.nome) setAlunoNome(naluno.nome);

      const raw = planRes.data as
        | { planos_treino_dias?: DiazPlanoHydrate[] }
        | null
        | undefined;
      const errPlano = planRes.error;

      if (errPlano || !raw) {
        setDays(initialDayPlans());
        setOpenDia(1);
        setHydrating(false);
        return;
      }

      const diasAgg = [...(raw.planos_treino_dias ?? [])];

      const idsTodos = new Set<string>();
      for (const dz of diasAgg) {
        for (const px of dz.planos_treino_exercicios ?? []) {
          if (px.exercicio_id) idsTodos.add(px.exercicio_id);
        }
      }

      const grpMap = new Map<string, string>();
      if (idsTodos.size > 0) {
        const { data: grpRows } = await sb.from("exercicios").select("id, grupo_muscular").in("id", [...idsTodos]);
        ((grpRows ?? []) as { id: string; grupo_muscular: string }[]).forEach((row) =>
          grpMap.set(row.id, row.grupo_muscular),
        );
      }

      const libPorGrupo = new Map<string, Ex[]>();

      async function biblioteca(gs: string): Promise<Ex[]> {
        const valid = gs && GRUPOS_TREINO.some((g) => g.value === gs);
        if (!valid) return [];
        if (libPorGrupo.has(gs)) return libPorGrupo.get(gs)!;
        const { data: exRows, error: xer } = await sb
          .from("exercicios")
          .select("*")
          .eq("grupo_muscular", gs)
          .order("nome");
        if (xer) setErr(xer.message);
        const arr = (exRows ?? []) as Ex[];
        libPorGrupo.set(gs, arr);
        return arr;
      }

      const base: DayPlan[] = [...initialDayPlans()];
      for (let ix = 0; ix < 7; ix++) {
        const diaSem = ix + 1;
        const row = diasAgg.find((d) => d.dia_semana === diaSem);
        const itemsPx: Px[] = row
          ? [...(row.planos_treino_exercicios ?? [])]
              .sort((a, b) => a.ordem - b.ordem)
              .map<Px>((it) => ({
                nome_exercicio: it.nome_exercicio,
                exercicio_id: it.exercicio_id ?? null,
                equipamento: it.equipamento ?? null,
                series: typeof it.series === "number" ? it.series : Number(it.series) || 3,
                repeticoes: it.repeticoes ?? "12",
                tempo_descanso_segundos:
                  it.tempo_descanso_segundos != null ? Number(it.tempo_descanso_segundos) : null,
                carga_sugerida: it.carga_sugerida ?? null,
                observacoes: it.observacoes ?? null,
                ordem: it.ordem,
              }))
          : [];

        const primeiraId =
          [...itemsPx].sort((a, b) => a.ordem - b.ordem).find((it) => it.exercicio_id)?.exercicio_id ?? null;

        let grupoSlug = primeiraId ? (grpMap.get(primeiraId) ?? "") : "";
        if (grupoSlug && !GRUPOS_TREINO.some((g) => g.value === grupoSlug)) grupoSlug = "";

        const listaEx = grupoSlug ? await biblioteca(grupoSlug) : [];

        base[ix] = {
          dia: ix + 1,
          rotulo: (row?.rotulo ?? "").trim() || ROTULOS[ix]!,
          grupoMuscular: grupoSlug,
          items: itemsPx,
          exercicios: listaEx,
          selExercicioId: "",
          draftSeries: "3",
          draftRep: "12",
          draftDescanso: String(DESCANSO_PADRAO_S),
          loadingExercicios: false,
        };
      }

      if (cancelled) return;

      const firstIx = base.findIndex((d) => d.items.length > 0);
      setOpenDia(firstIx >= 0 ? base[firstIx]!.dia : 1);
      setDays(base);
      setHydrating(false);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [alunoRouteId, professorId]);

  const selectSyncKey = useMemo(
    () =>
      days
        .map((d) => {
          const itemIds = [...idsExerciciosJaNoDia(d.items)].sort().join(",");
          const libIds = [...d.exercicios.map((e) => e.id)].sort().join(",");
          return `${itemIds}|${d.selExercicioId}|${libIds}`;
        })
        .join(";"),
    [days],
  );

  useEffect(() => {
    setDays((prev) => {
      let changed = false;
      const next = prev.map((day) => {
        const disp = exerciciosDisponiveis(day.items, day.exercicios);
        if (day.selExercicioId && !disp.some((e) => e.id === day.selExercicioId)) {
          changed = true;
          return { ...day, selExercicioId: "" };
        }
        return day;
      });
      return changed ? next : prev;
    });
  }, [selectSyncKey]);

  const loadExerciciosDoGrupo = useCallback(async (dayIndex: number, grupoSlug: string) => {
    if (!isSupabaseConfigured || !grupoSlug) return;
    const sb = getSupabase();
    patchDay(dayIndex, { loadingExercicios: true, selExercicioId: "" });
    const { data, error } = await sb
      .from("exercicios")
      .select("*")
      .eq("grupo_muscular", grupoSlug)
      .order("nome");
    if (error) {
      setErr(error.message);
      patchDay(dayIndex, { loadingExercicios: false });
      return;
    }
    patchDay(dayIndex, {
      loadingExercicios: false,
      exercicios: (data ?? []) as Ex[],
      selExercicioId: "",
    });
  }, [patchDay]);

  function onGrupoChange(ix: number, slug: string) {
    const d = days[ix];
    if (!d) return;
    const label = slug ? labelDoGrupo(slug) : "";
    const rotulo = slug ? `${ROTULOS[d.dia - 1]!} — ${label}` : ROTULOS[d.dia - 1]!;
    setDays((prev) =>
      prev.map((day, j) =>
        j === ix
          ? {
              ...day,
              grupoMuscular: slug,
              rotulo,
              exercicios: [],
              selExercicioId: "",
            }
          : day,
      ),
    );
    setErr(null);
    if (slug) void loadExerciciosDoGrupo(ix, slug);
  }

  function adicionarExercicioAoDia(ix: number) {
    const d = days[ix];
    if (!d) return;
    const ex = d.exercicios.find((e) => e.id === d.selExercicioId);
    if (!ex) {
      setErr("Selecione um exercício na lista.");
      return;
    }
    if (d.items.some((it) => it.exercicio_id === ex.id)) {
      setErr("Este exercício já foi adicionado ao dia.");
      return;
    }
    const series = Math.max(1, Math.round(Number(d.draftSeries) || 0)) || 3;
    const repeticoes = d.draftRep.trim() || "12";
    const tempo =
      d.draftDescanso.trim() === ""
        ? null
        : Math.max(0, Math.round(Number(d.draftDescanso) || 0));

    setDays((prev) =>
      prev.map((day, j) =>
        j === ix
          ? {
              ...day,
              items: [
                ...day.items,
                {
                  nome_exercicio: ex.nome,
                  exercicio_id: ex.id,
                  equipamento: ex.equipamento,
                  series,
                  repeticoes,
                  tempo_descanso_segundos: tempo,
                  carga_sugerida: null,
                  observacoes: null,
                  ordem: day.items.length,
                },
              ],
              selExercicioId: "",
              draftSeries: "3",
              draftRep: "12",
              draftDescanso: String(DESCANSO_PADRAO_S),
            }
          : day,
      ),
    );
    setErr(null);
  }

  async function salvar() {
    if (saving) return;
    setErr(null);
    setSaving(true);
    try {
      if (!isSupabaseConfigured || !alunoRouteId) return;
      const sb = getSupabase();

      const diasComExercicios = days
        .filter((d) => d.items.length > 0)
        .map((d) => ({
          dia_semana: d.dia,
          rotulo: d.rotulo.trim() || ROTULOS[d.dia - 1]!,
          exercicios: d.items.map((it, ord) => ({
            exercicio_id: it.exercicio_id ?? null,
            nome_exercicio: it.nome_exercicio,
            series: typeof it.series === "number" ? it.series : 3,
            repeticoes: it.repeticoes ?? "12",
            equipamento: it.equipamento ?? null,
            tempo_descanso_segundos:
              typeof it.tempo_descanso_segundos === "number" ? it.tempo_descanso_segundos : null,
            carga_sugerida: it.carga_sugerida ?? null,
            observacoes: it.observacoes ?? null,
            ordem: ord,
          })),
        }));

      const { error: rpcErr } = await sb.rpc("salvar_plano_treino_professor", {
        p_aluno_id: alunoRouteId,
        p_titulo: `${alunoNome || "Treino"} · atualizado`,
        p_dias: diasComExercicios,
      });

      if (rpcErr) {
        setErr(rpcErr.message ?? "Erro ao salvar treino");
        return;
      }

      navigate("/professor/treinos");
    } finally {
      setSaving(false);
    }
  }

  if (!alunoRouteId) {
    return (
      <p className="p-10" style={{ color: "#AAA" }}>
        Informe um aluno na lista.
      </p>
    );
  }

  if (hydrating) {
    return (
      <div className="px-4 md:px-10 py-16 max-w-4xl mx-auto">
        <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#00F9E4" }}>
          Carregando
        </p>
        <p style={{ color: "#888" }}>Buscando ficha deste aluno…</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 py-8 pb-32 space-y-10 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-black">Cadastro de treino · {alunoNome || alunoRouteId.slice(0, 8)}</h1>
        <Link to="/professor/treinos" className="text-xs uppercase font-bold" style={{ color: "#9A9A9A" }}>
          Voltar
        </Link>
      </div>

      <CadastroFormAccordion defaultValue={["cad-treino-dias"]}>
        <CadastroFormAccordionSection
          value="cad-treino-visao"
          ordinal="1"
          title="Visão geral"
          subtitle="Cadastro semanal por dia e grupo muscular"
          icon={<ClipboardList size={16} style={{ color: "#00F9E4" }} />}
          iconColor="#00F9E4"
          iconBg="rgba(0,249,228,0.12)"
        >
          <p className="text-sm" style={{ color: "#888" }}>
            Escolha o foco muscular em cada dia e monte os exercícios um a um com séries, repetições e descanso entre
            as séries. Use os acordeões abaixo para organizar cada dia da semana.
          </p>
        </CadastroFormAccordionSection>

        <CadastroFormAccordionSection
          value="cad-treino-dias"
          ordinal="2"
          title="Plano por dia da semana"
          icon={<LayoutGrid size={16} style={{ color: "#FACC15" }} />}
          iconColor="#FACC15"
          iconBg="rgba(250,204,21,0.12)"
        >
      <div className="space-y-3">
        {days.map((d, ix) => {
          const aberto = openDia === d.dia;
          const disponiveis = exerciciosDisponiveis(d.items, d.exercicios);
          const selValido =
            d.selExercicioId && disponiveis.some((e) => e.id === d.selExercicioId)
              ? d.selExercicioId
              : "";
          return (
            <div
              key={d.dia}
              className="rounded-2xl border overflow-hidden transition-colors"
              style={{ borderColor: "#2A2A2A", background: "#111111" }}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#161616]"
                onClick={() => setOpenDia(aberto ? null : d.dia)}
              >
                <div className="min-w-0">
                  <span className="font-black block" style={{ color: "#EEE" }}>
                    {ROTULOS[d.dia - 1]!}
                  </span>
                  <span className="text-xs block mt-0.5 truncate" style={{ color: "#6B6B6B" }}>
                    {resumoAccordionSubtitulo(d, grupoPorExercicioId)}
                  </span>
                </div>
                <ChevronDown
                  size={22}
                  className="shrink-0 self-center text-primary transition-transform"
                  strokeWidth={2}
                  style={{
                    transform: aberto ? "rotate(180deg)" : undefined,
                  }}
                />
              </button>

              {aberto ? (
                <div className="px-5 pb-5 pt-2 space-y-5 border-t" style={{ borderColor: "#222" }}>
                  <label className="block text-[11px] uppercase tracking-wide" style={{ color: "#6B6B6B" }}>
                    Foco do treino (grupo muscular)
                    <select
                      className={`mt-2 w-full ${selectCn}`}
                      style={selectStyle}
                      value={d.grupoMuscular}
                      onChange={(e) => onGrupoChange(ix, e.target.value)}
                    >
                      <option value="">Selecione…</option>
                      {GRUPOS_TREINO.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {d.grupoMuscular ? (
                    <>
                      {d.loadingExercicios ? (
                        <p className="text-sm" style={{ color: "#6B6B6B" }}>
                          Carregando exercícios…
                        </p>
                      ) : (
                        <>
                          <label className="block text-[11px] uppercase tracking-wide" style={{ color: "#6B6B6B" }}>
                            Exercício ({labelDoGrupo(d.grupoMuscular)})
                            <select
                              className={`mt-2 ${selectCn}`}
                              style={selectStyle}
                              value={selValido}
                              onChange={(e) =>
                                patchDay(ix, {
                                  selExercicioId: e.target.value,
                                })
                              }
                            >
                              <option value="">
                                {disponiveis.length === 0
                                  ? "Todos os exercícios deste grupo já foram adicionados"
                                  : "Selecione um exercício"}
                              </option>
                              {disponiveis.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.nome}
                                </option>
                              ))}
                            </select>
                          </label>
                          {disponiveis.length === 0 && d.exercicios.length > 0 ? (
                            <p className="text-xs mt-2" style={{ color: "#6B6B6B" }}>
                              Remova um exercício da lista abaixo para voltar a incluí-lo.
                            </p>
                          ) : null}

                          {!!selValido && (
                            <div className="rounded-xl p-5 border border-[#2C2C2C]" style={{ background: "#0D0D0D" }}>
                              <div className="flex flex-nowrap items-end gap-3 overflow-x-auto pb-0.5">
                                <div className="min-w-[5.5rem] flex-1 shrink-0">
                                  <MiniField
                                    lab="Séries"
                                    v={d.draftSeries}
                                    setV={(nv) => patchDay(ix, { draftSeries: nv })}
                                    inputMode="numeric"
                                  />
                                </div>
                                <div className="min-w-[5.5rem] flex-1 shrink-0">
                                  <MiniField
                                    lab="Repetições"
                                    v={d.draftRep}
                                    setV={(nv) => patchDay(ix, { draftRep: nv })}
                                  />
                                </div>
                                <div className="min-w-[6.5rem] flex-1 shrink-0">
                                  <MiniField
                                    lab="Descanso (seg)"
                                    v={d.draftDescanso}
                                    setV={(nv) => patchDay(ix, { draftDescanso: nv })}
                                    inputMode="numeric"
                                  />
                                </div>
                                <SavePrimaryButton
                                  preset="toolbar"
                                  type="button"
                                  onClick={() => adicionarExercicioAoDia(ix)}
                                  className="shrink-0"
                                >
                                  Salvar
                                </SavePrimaryButton>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : null}

                  {d.items.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase font-bold tracking-wide" style={{ color: "#6B6B6B" }}>
                        Exercícios deste dia
                      </p>
                      <ul className="space-y-2">
                        {d.items.map((it, ji) => (
                          <li
                            key={`${it.exercicio_id}-${ji}-${it.nome_exercicio}`}
                            className="flex flex-wrap gap-4 justify-between items-center rounded-xl px-4 py-3 border border-[#2A2A2A]"
                            style={{ background: "#161616" }}
                          >
                            <div className="min-w-0">
                              <p className="font-bold truncate" style={{ color: "#EEE" }}>
                                {it.nome_exercicio}
                              </p>
                              <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
                                {it.series} séries × {it.repeticoes} reps
                                {it.tempo_descanso_segundos != null
                                  ? ` · descanso ${it.tempo_descanso_segundos}s`
                                  : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label="Remover exercício"
                              className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm uppercase transition-colors shrink-0 hover:opacity-90"
                              style={{
                                background: "#DC2626",
                                color: "#FAFAFA",
                                fontWeight: 700,
                                border: "none",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setDays((prev) =>
                                  prev.map((day, dj) =>
                                    dj === ix
                                      ? {
                                          ...day,
                                          items: day.items.filter((__, li) => li !== ji).map((row, ri) => ({
                                            ...row,
                                            ordem: ri,
                                          })),
                                        }
                                      : day,
                                  ),
                                )
                              }
                            >
                              <Trash2 size={17} strokeWidth={2.2} aria-hidden />
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
        </CadastroFormAccordionSection>
      </CadastroFormAccordion>

      {err && <p className="text-sm" style={{ color: "#F87171" }}>{err}</p>}
      <SavePrimaryButton preset="professorNav" loading={saving} onClick={() => void salvar()}>
        Salvar Treino
      </SavePrimaryButton>
    </div>
  );
}

function MiniField({
  lab,
  v,
  setV,
  inputMode,
}: {
  lab: string;
  v: string;
  setV: (s: string) => void;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="text-[11px] uppercase flex flex-col gap-2 min-w-0" style={{ color: "#6F6F6F" }}>
      {lab}
      <input
        className="rounded-xl px-4 py-2.5 text-sm border border-[#393939] w-full"
        style={{ background: "#111111", color: "#EEEEEE", minHeight: "42px" }}
        value={v}
        onChange={(e) => setV(e.target.value)}
        inputMode={inputMode}
      />
    </label>
  );
}
