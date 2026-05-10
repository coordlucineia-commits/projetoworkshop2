import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { ArrowLeft, Activity, ClipboardList, Columns2, Heart, Ruler, Waves } from "lucide-react";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateTimeBrSaoPaulo } from "../../lib/displayHelpers";
import type { Database, Json } from "../../lib/database.types";
import { ymdSaoPauloFromInstant } from "../../lib/datetimeBr";
import {
  buildMedidasInsertJson,
  parseMedidasPayloadFromJson,
  emptyAvaliacaoMedidasPayload,
  FLEXIBILIDADE_METODO_SUGESTOES,
  HISTORICO_ATIVIDADE_FISICA,
  KEYS_ANTROPOMETRIA_CM,
  KEYS_BILATERAIS,
  KEYS_COMP_CORP_DECIMAL,
  OBJETIVOS_AVALIACAO,
  SCHEMA_VERSION,
  type AvaliacaoMedidasPayload,
  type ObjetivoAvaliacao,
} from "../../lib/avaliacaoCorporalMedidas";
import { DateInputBr } from "../components/DateInputBr";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { SavePrimaryButton } from "../components/SavePrimaryButton";

type Ctx = { professorId: string };

type AgendaRow = Database["public"]["Tables"]["avaliacoes_agenda"]["Row"] & {
  alunos: { nome: string } | null;
};

type AvalRow = Database["public"]["Tables"]["avaliacoes"]["Row"];

const INPUT =
  "w-full bg-[#1A1A1A] border border-[#303030] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#606060] focus:outline-none focus:border-[#00F9E4]";

const SEL = INPUT + " appearance-none cursor-pointer";

const TRI_EMPTY = "";

function mkStrKeys<const T extends readonly (readonly [string, ...unknown[]])[]>(keys: T): Record<T[number][0], string> {
  return Object.fromEntries(keys.map(([k]) => [k, ""])) as Record<T[number][0], string>;
}

function parseNum(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

/** Estatura inteira em cm */
function parseEstaturaCm(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function calcImc(pesoKg: number | null, alturaCm: number | null): number | null {
  if (pesoKg == null || alturaCm == null || alturaCm <= 0) return null;
  const h = alturaCm / 100;
  return Number((pesoKg / (h * h)).toFixed(2));
}

function numToPtStr(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "";
  return String(v).replace(".", ",");
}

function parseStrMap(keys: typeof KEYS_COMP_CORP_DECIMAL, obj: Partial<Record<string, number | null>> | undefined): Record<string, string> {
  const map = mkStrKeys(keys);
  if (!obj) return map as Record<string, string>;
  for (const [k] of keys) {
    const n = obj[k];
    map[k as string] = n != null && Number.isFinite(n) ? numToPtStr(n) : "";
  }
  return map as Record<string, string>;
}

function mergeStrMapsIntoNums(
  keys: readonly (readonly [string, string, string])[],
  strs: Record<string, string>,
): Partial<Record<string, number | null>> {
  const out: Partial<Record<string, number | null>> = {};
  for (const [k] of keys) {
    const parsed = parseNum(strs[k] ?? "");
    if (parsed !== null) out[k] = parsed;
  }
  return out;
}

function TriSelect({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: boolean | null;
  disabled?: boolean;
  onChange: (v: boolean | null) => void;
}) {
  const sv = value === true ? "sim" : value === false ? "nao" : TRI_EMPTY;
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
        {label}
      </span>
      <select
        disabled={disabled}
        className={SEL}
        value={sv}
        onChange={(e) => {
          const x = e.target.value;
          if (x === "sim") onChange(true);
          else if (x === "nao") onChange(false);
          else onChange(null);
        }}
      >
        <option value={TRI_EMPTY}>—</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>
    </label>
  );
}

export function ProfessorAvaliacaoRegistrarPage() {
  const { professorId } = useOutletContext<Ctx>();
  const { agendaId } = useParams<{ agendaId: string }>();
  const navigate = useNavigate();

  const [agenda, setAgenda] = useState<AgendaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingAvaliacaoId, setExistingAvaliacaoId] = useState<string | null>(null);

  const [reavIso, setReavIso] = useState("");
  const [pesoStr, setPesoStr] = useState("");
  const [alturaStr, setAlturaStr] = useState("");
  const [gorduraStr, setGorduraStr] = useState("");
  const [massaMagraStr, setMassaMagraStr] = useState("");
  const [obs, setObs] = useState("");

  const [compStr, setCompStr] = useState(() => mkStrKeys(KEYS_COMP_CORP_DECIMAL) as Record<string, string>);
  const [anthroStr, setAnthroStr] = useState(() => mkStrKeys(KEYS_ANTROPOMETRIA_CM) as Record<string, string>);
  const [bilatStr, setBilatStr] = useState(() => mkStrKeys(KEYS_BILATERAIS) as Record<string, string>);

  const [objetivos, setObjetivos] = useState<ObjetivoAvaliacao[]>([]);
  const [histAf, setHistAf] = useState("");
  const [cirurgias, setCirurgias] = useState<boolean | null>(null);
  const [medicamentos, setMedicamentos] = useState<boolean | null>(null);
  const [fraturas, setFraturas] = useState<boolean | null>(null);
  const [artrose, setArtrose] = useState<boolean | null>(null);
  const [doresColuna, setDoresColuna] = useState<boolean | null>(null);

  const [flexMetodo, setFlexMetodo] = useState("");
  const [flexResultStr, setFlexResultStr] = useState("");

  const imcPreview = useMemo(
    () => calcImc(parseNum(pesoStr), parseEstaturaCm(alturaStr)),
    [pesoStr, alturaStr],
  );

  useEffect(() => {
    if (!agendaId || !isSupabaseConfigured) return;
    let cancel = false;
    void (async () => {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("avaliacoes_agenda")
        .select("*, alunos ( nome ) ")
        .eq("id", agendaId)
        .maybeSingle();

      if (cancel) return;
      if (error || !data) {
        toast.error(error?.message ?? "Agendamento não encontrado.");
        navigate("/professor/avaliacoes");
        setLoading(false);
        return;
      }

      const row = data as unknown as AgendaRow;
      if (row.professor_id != null && row.professor_id !== professorId) {
        toast.error("Este agendamento pertence a outro professor.");
        navigate("/professor/avaliacoes");
        setLoading(false);
        return;
      }

      if (row.professor_id == null) {
        await sb.from("avaliacoes_agenda").update({ professor_id: professorId }).eq("id", agendaId).is("professor_id", null);
        row.professor_id = professorId;
      }

      setAgenda(row);

      const hojeIso = ymdSaoPauloFromInstant(new Date().toISOString());

      const { data: av } = await sb
        .from("avaliacoes")
        .select("*")
        .eq("agenda_id", agendaId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancel) return;
      if (av) {
        setExistingAvaliacaoId(av.id);
        const r = av as AvalRow;
        setPesoStr(r.peso != null ? numToPtStr(r.peso) : "");
        setAlturaStr(r.altura != null ? String(Math.round(Number(r.altura))) : "");
        setGorduraStr(r.percentual_gordura != null ? numToPtStr(r.percentual_gordura) : "");
        setMassaMagraStr(r.massa_magra != null ? numToPtStr(r.massa_magra) : "");
        setObs(r.observacoes ?? "");

        const parsed = parseMedidasPayloadFromJson(r.medidas);
        if (parsed) {
          setReavIso((parsed.reavaliacao_em ?? "").trim().slice(0, 10) || hojeIso);
          setObjetivos(parsed.objetivos);
          setHistAf(parsed.historico_atividade_fisica);
          setCirurgias(parsed.cirurgias);
          setMedicamentos(parsed.medicamentos);
          setFraturas(parsed.fraturas);
          setArtrose(parsed.artrose);
          setDoresColuna(parsed.dores_coluna);
          setFlexMetodo(parsed.flexibilidade_metodo);
          setFlexResultStr(parsed.flexibilidade_resultado != null ? numToPtStr(parsed.flexibilidade_resultado) : "");
          setCompStr(parseStrMap(KEYS_COMP_CORP_DECIMAL, parsed.composicao_corporal));
          setAnthroStr(parseStrMap(KEYS_ANTROPOMETRIA_CM, parsed.antropometria));
          setBilatStr(parseStrMap(KEYS_BILATERAIS, parsed.bilaterais));
        } else {
          const fallback = emptyAvaliacaoMedidasPayload();
          setReavIso((fallback.reavaliacao_em ?? "").trim().slice(0, 10) || hojeIso);
          setCompStr(parseStrMap(KEYS_COMP_CORP_DECIMAL, fallback.composicao_corporal));
          setAnthroStr(parseStrMap(KEYS_ANTROPOMETRIA_CM, fallback.antropometria));
          setBilatStr(parseStrMap(KEYS_BILATERAIS, fallback.bilaterais));
        }
      } else if (!cancel) {
        setExistingAvaliacaoId(null);
        setReavIso(hojeIso);
      }

      setLoading(false);
    })();

    return () => {
      cancel = true;
    };
  }, [agendaId, professorId, navigate]);

  async function submit() {
    if (!agendaId || !agenda || !isSupabaseConfigured || existingAvaliacaoId) return;

    const isRetro = agenda.status !== "agendado";

    setSaving(true);
    const peso = parseNum(pesoStr);
    const altura = parseEstaturaCm(alturaStr);
    const imc = calcImc(peso, altura);
    const pctGord = parseNum(gorduraStr);
    const massaMagra = parseNum(massaMagraStr);

    const dataReavIso = ymdSaoPauloFromInstant(new Date().toISOString());

    const payloadSlices: Omit<AvaliacaoMedidasPayload, "schema_version"> = {
      reavaliacao_em: dataReavIso,
      objetivos,
      historico_atividade_fisica: histAf,
      cirurgias,
      medicamentos,
      fraturas,
      artrose,
      dores_coluna: doresColuna,
      composicao_corporal: mergeStrMapsIntoNums(KEYS_COMP_CORP_DECIMAL, compStr),
      antropometria: mergeStrMapsIntoNums(KEYS_ANTROPOMETRIA_CM, anthroStr),
      bilaterais: mergeStrMapsIntoNums(KEYS_BILATERAIS, bilatStr),
      flexibilidade_metodo: flexMetodo,
      flexibilidade_resultado: parseNum(flexResultStr),
    };

    const mediadaBuilt: AvaliacaoMedidasPayload = {
      schema_version: SCHEMA_VERSION,
      ...payloadSlices,
    };

    const mediadaInsert = buildMedidasInsertJson(mediadaBuilt);

    const sb = getSupabase();
    const { data: inserted, error: insErr } = await sb
      .from("avaliacoes")
      .insert({
        aluno_id: agenda.aluno_id,
        agenda_id: agendaId,
        data_avaliacao: ymdSaoPauloFromInstant(agenda.inicio_at),
        peso,
        altura,
        imc,
        percentual_gordura: pctGord,
        massa_magra: massaMagra,
        circunferencias: {} as Json,
        medidas: mediadaInsert,
        observacoes: obs.trim() || null,
      })
      .select("id")
      .single();

    if (insErr) {
      toast.error(insErr.message);
      setSaving(false);
      return;
    }

    if (!isRetro) {
      const { error: upAg } = await sb
        .from("avaliacoes_agenda")
        .update({ status: "realizado", professor_id: professorId })
        .eq("id", agendaId);
      setSaving(false);
      if (upAg) {
        toast.error(upAg.message);
        return;
      }
    } else {
      setSaving(false);
    }

    if (inserted?.id) setExistingAvaliacaoId(inserted.id);

    const { error: rpcPersonalErr } = await sb.rpc("professor_vincular_personal_apos_avaliacao", {
      p_aluno_id: agenda.aluno_id,
    });
    if (rpcPersonalErr && !/could not find|PGRST202|schema cache/i.test(rpcPersonalErr.message ?? "")) {
      toast.error(
        rpcPersonalErr.message ??
          "Avaliação salva, mas não foi possível vincular você como personal de acompanhamento automaticamente.",
      );
      navigate("/professor/avaliacoes");
      return;
    }

    toast.success(isRetro ? "Medidas salvas no histórico do aluno." : "Avaliação corporal salva.");
    navigate("/professor/avaliacoes");
  }

  function goTreinoAluno() {
    if (!agenda) return;
    navigate(`/professor/treinos/novo/${agenda.aluno_id}`);
  }

  function toggleObjetivo(o: ObjetivoAvaliacao) {
    setObjetivos((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));
  }

  if (loading) {
    return (
      <div className="px-0 md:px-10 py-16 font-mono text-xs uppercase tracking-widest" style={{ color: "#606060" }}>
        Carregando…
      </div>
    );
  }

  if (!agenda) return null;

  const readOnlyExisting = Boolean(existingAvaliacaoId);
  const retroSemFicha = !existingAvaliacaoId && agenda.status !== "agendado";

  function gridNum(
    keys: readonly (readonly [string, string, string])[],
    strs: Record<string, string>,
    setStrs: Dispatch<SetStateAction<Record<string, string>>>,
  ) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {keys.map(([key, label, unit]) => (
          <label key={key} className="block">
            <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
              {label} ({unit})
            </span>
            <input
              disabled={readOnlyExisting}
              className={INPUT}
              inputMode="decimal"
              value={strs[key] ?? ""}
              onChange={(e) => setStrs((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder="—"
            />
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="px-0 md:px-10 py-8 pb-24 max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/professor/avaliacoes")}
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
        style={{ color: "#888" }}
      >
        <ArrowLeft size={16} className="shrink-0 text-primary" />
        Voltar à agenda
      </button>

      <header className="mb-8">
        <h1 className="text-2xl font-black">Avaliação corporal</h1>
        <p className="text-lg font-bold mt-2" style={{ color: "#F2F2F2" }}>
          {agenda.alunos?.nome ?? "Aluno"}
        </p>
        <p className="text-sm mt-1" style={{ color: "#888" }}>
          {formatDateTimeBrSaoPaulo(agenda.inicio_at)} · {agenda.status}
        </p>
      </header>

      {retroSemFicha && (
        <div
          className="rounded-2xl p-4 mb-6 text-sm"
          style={{
            border: "1px solid rgba(250,204,21,0.35)",
            background: "rgba(250,204,21,0.08)",
            color: "#FEF3C7",
          }}
        >
          Horário já estava como realizado. Você pode registrar as medidas para constar no perfil do aluno.
        </div>
      )}

      {existingAvaliacaoId && (
        <div
          className="rounded-2xl p-4 mb-6 text-sm"
          style={{
            border: "1px solid rgba(34,197,94,0.35)",
            background: "rgba(34,197,94,0.08)",
            color: "#BBF7D0",
          }}
        >
          Registro somente leitura — medidas já salvas para este agendamento.
        </div>
      )}

      {!readOnlyExisting && (
        <p className="text-xs mb-6 font-mono uppercase tracking-wider" style={{ color: "#606060" }}>
          Preencha as medidas realizadas durante a avaliação. Campos opcionais podem ficar em branco.
        </p>
      )}

      <CadastroFormAccordion type="single" collapsible defaultValue="cad-aval-1">
      <CadastroFormAccordionSection
        value="cad-aval-1"
        ordinal="1"
        title="Informações gerais"
        icon={<ClipboardList size={16} style={{ color: "#00F9E4" }} />}
        iconColor="#00F9E4"
        iconBg="rgba(0,249,228,0.12)"
      >
            <div className="space-y-4 pb-2">
              <div>
                <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                  Data da avaliação
                </span>
                <p className="text-[11px] mb-2 leading-relaxed" style={{ color: "#555" }}>
                  Preenchida automaticamente com a data de hoje. O professor não pode alterar.
                </p>
                <DateInputBr
                  readOnly
                  hideCalendarButton
                  valueIso={reavIso}
                  onChangeIso={() => {}}
                  inputClassName={INPUT}
                  wrapperClassName="flex gap-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                    Peso (kg)
                  </span>
                  <input
                    disabled={readOnlyExisting}
                    className={INPUT}
                    inputMode="decimal"
                    value={pesoStr}
                    onChange={(e) => setPesoStr(e.target.value)}
                    placeholder="—"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                    Estatura (cm)
                  </span>
                  <input
                    disabled={readOnlyExisting}
                    className={INPUT}
                    inputMode="numeric"
                    value={alturaStr}
                    onChange={(e) => setAlturaStr(e.target.value)}
                    placeholder="—"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                    IMC (calculado)
                  </span>
                  <input
                    readOnly
                    disabled
                    className={INPUT + " opacity-90 cursor-not-allowed"}
                    value={imcPreview != null ? numToPtStr(imcPreview) : ""}
                    placeholder="—"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                    % gordura (%)
                  </span>
                  <input
                    disabled={readOnlyExisting}
                    className={INPUT}
                    inputMode="decimal"
                    value={gorduraStr}
                    onChange={(e) => setGorduraStr(e.target.value)}
                    placeholder="—"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                    Massa magra (kg)
                  </span>
                  <input
                    disabled={readOnlyExisting}
                    className={INPUT}
                    inputMode="decimal"
                    value={massaMagraStr}
                    onChange={(e) => setMassaMagraStr(e.target.value)}
                    placeholder="—"
                  />
                </label>
              </div>
            </div>
      </CadastroFormAccordionSection>

      <CadastroFormAccordionSection
        value="cad-aval-2"
        ordinal="2"
        title="Composição corporal"
        icon={<Activity size={16} style={{ color: "#A78BFA" }} />}
        iconColor="#A78BFA"
        iconBg="rgba(167,139,250,0.12)"
      >
            <div className="space-y-4 pb-2">
              <p className="text-[11px]" style={{ color: "#6B6B6B" }}>
                Demais métricas de composição (além de % gordura e massa magra na seção anterior).
              </p>
              {gridNum(KEYS_COMP_CORP_DECIMAL, compStr, setCompStr)}
            </div>
      </CadastroFormAccordionSection>

      <CadastroFormAccordionSection
        value="cad-aval-3"
        ordinal="3"
        title="Anamnese"
        icon={<Heart size={16} style={{ color: "#EF4444" }} />}
        iconColor="#EF4444"
        iconBg="rgba(239,68,68,0.12)"
      >
            <div className="space-y-5 pb-2">
              <div>
                <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                  Objetivos (múltiplos)
                </span>
                <div className="flex flex-col gap-2">
                  {OBJETIVOS_AVALIACAO.map((o) => (
                    <label key={o} className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        disabled={readOnlyExisting}
                        checked={objetivos.includes(o)}
                        onChange={() => toggleObjetivo(o)}
                        className="size-4 rounded border-[#303030]"
                      />
                      <span className="text-sm" style={{ color: "#DDD" }}>
                        {o}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                  Histórico de atividade física
                </span>
                <select
                  disabled={readOnlyExisting}
                  className={SEL}
                  value={histAf}
                  onChange={(e) => setHistAf(e.target.value)}
                >
                  <option value="">— Selecionar —</option>
                  {HISTORICO_ATIVIDADE_FISICA.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TriSelect label="Cirurgias" value={cirurgias} disabled={readOnlyExisting} onChange={setCirurgias} />
                <TriSelect label="Medicamentos" value={medicamentos} disabled={readOnlyExisting} onChange={setMedicamentos} />
                <TriSelect label="Fraturas" value={fraturas} disabled={readOnlyExisting} onChange={setFraturas} />
                <TriSelect label="Artrose" value={artrose} disabled={readOnlyExisting} onChange={setArtrose} />
                <TriSelect label="Dores na coluna" value={doresColuna} disabled={readOnlyExisting} onChange={setDoresColuna} />
              </div>
            </div>
      </CadastroFormAccordionSection>

      <CadastroFormAccordionSection
        value="cad-aval-4"
        ordinal="4"
        title="Antropometria"
        icon={<Ruler size={16} style={{ color: "#4ADE80" }} />}
        iconColor="#4ADE80"
        iconBg="rgba(74,222,128,0.12)"
      >
            {gridNum(KEYS_ANTROPOMETRIA_CM, anthroStr, setAnthroStr)}
      </CadastroFormAccordionSection>

      <CadastroFormAccordionSection
        value="cad-aval-5"
        ordinal="5"
        title="Medidas bilaterais"
        icon={<Columns2 size={16} style={{ color: "#FACC15" }} />}
        iconColor="#FACC15"
        iconBg="rgba(250,204,21,0.12)"
      >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
              <fieldset className="space-y-2 border border-[#303030] rounded-xl p-4">
                <legend className="px-2 text-[11px] uppercase font-bold tracking-wider" style={{ color: "#888" }}>
                  Coxa relaxada
                </legend>
                {gridNum(KEYS_BILATERAIS.filter(([k]) => k.startsWith("coxa_relaxada")), bilatStr, setBilatStr)}
              </fieldset>
              <fieldset className="space-y-2 border border-[#303030] rounded-xl p-4">
                <legend className="px-2 text-[11px] uppercase font-bold tracking-wider" style={{ color: "#888" }}>
                  Coxa contraída
                </legend>
                {gridNum(KEYS_BILATERAIS.filter(([k]) => k.startsWith("coxa_contraida")), bilatStr, setBilatStr)}
              </fieldset>
              <fieldset className="space-y-2 border border-[#303030] rounded-xl p-4">
                <legend className="px-2 text-[11px] uppercase font-bold tracking-wider" style={{ color: "#888" }}>
                  Panturrilha
                </legend>
                {gridNum(KEYS_BILATERAIS.filter(([k]) => k.includes("panturrilha")), bilatStr, setBilatStr)}
              </fieldset>
              <fieldset className="space-y-2 border border-[#303030] rounded-xl p-4">
                <legend className="px-2 text-[11px] uppercase font-bold tracking-wider" style={{ color: "#888" }}>
                  Braço relaxado
                </legend>
                {gridNum(KEYS_BILATERAIS.filter(([k]) => k.startsWith("braco_relaxado")), bilatStr, setBilatStr)}
              </fieldset>
              <fieldset className="space-y-2 border border-[#303030] rounded-xl p-4">
                <legend className="px-2 text-[11px] uppercase font-bold tracking-wider" style={{ color: "#888" }}>
                  Braço contraído
                </legend>
                {gridNum(KEYS_BILATERAIS.filter(([k]) => k.startsWith("braco_contraido")), bilatStr, setBilatStr)}
              </fieldset>
              <fieldset className="space-y-2 border border-[#303030] rounded-xl p-4">
                <legend className="px-2 text-[11px] uppercase font-bold tracking-wider" style={{ color: "#888" }}>
                  Antebraço
                </legend>
                {gridNum(KEYS_BILATERAIS.filter(([k]) => k.startsWith("antebraco")), bilatStr, setBilatStr)}
              </fieldset>
            </div>
      </CadastroFormAccordionSection>

      <CadastroFormAccordionSection
        value="cad-aval-6"
        ordinal="6"
        title="Flexibilidade"
        icon={<Waves size={16} style={{ color: "#22D3EE" }} />}
        iconColor="#22D3EE"
        iconBg="rgba(34,211,238,0.12)"
      >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
              <label className="block">
                <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                  Método
                </span>
                <input
                  disabled={readOnlyExisting}
                  className={INPUT}
                  list="flex-metodos-suggestions"
                  value={flexMetodo}
                  onChange={(e) => setFlexMetodo(e.target.value)}
                  placeholder="Ex.: Wells"
                />
                <datalist id="flex-metodos-suggestions">
                  {FLEXIBILIDADE_METODO_SUGESTOES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                  Resultado
                </span>
                <input
                  disabled={readOnlyExisting}
                  className={INPUT}
                  inputMode="decimal"
                  value={flexResultStr}
                  onChange={(e) => setFlexResultStr(e.target.value)}
                  placeholder="—"
                />
              </label>
            </div>
      </CadastroFormAccordionSection>
      </CadastroFormAccordion>

      <label className="block mt-10">
        <span className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
          Observações
        </span>
        <textarea
          disabled={readOnlyExisting}
          rows={4}
          className={INPUT + " resize-none min-h-[100px]"}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap gap-3 mt-10">
        {!readOnlyExisting && (
          <SavePrimaryButton preset="formWide" loading={saving} loadingLabel="Salvando…" onClick={() => void submit()}>
            Salvar avaliação
          </SavePrimaryButton>
        )}
        <button
          type="button"
          onClick={goTreinoAluno}
          className="rounded-full px-6 py-3 text-xs font-black uppercase border border-[#303030]"
          style={{ color: "#AAA" }}
        >
          Treino · aluno
        </button>
      </div>
    </div>
  );
}
