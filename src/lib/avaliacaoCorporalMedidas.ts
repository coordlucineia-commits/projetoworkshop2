/**
 * Estrutura `avaliacoes.medidas` com `schema_version: 2`.
 * Campos físicos continuam também em colunas onde já existiam (peso, altura, % gordura, massa magra).
 */
import type { Json } from "./database.types";

export const SCHEMA_VERSION = 2 as const;

/** Objetivos — multiselect */
export const OBJETIVOS_AVALIACAO = ["EMAGRECIMENTO", "HIPERTROFIA", "FORTALECIMENTO", "CONDICIONAMENTO"] as const;
export type ObjetivoAvaliacao = (typeof OBJETIVOS_AVALIACAO)[number];

/** Histórico de atividade física */
export const HISTORICO_ATIVIDADE_FISICA = [
  "INATIVO — NUNCA TREINOU",
  "INATIVO — PAROU HÁ MAIS DE 6 MESES",
  "POUCO ATIVO — 1× OU MENOS POR SEMANA",
  "MODERADAMENTE ATIVO — 2× A 3× POR SEMANA",
  "REGULARMENTE ATIVO — 4× OU MAIS POR SEMANA",
] as const;

/** Sugestões de método de flexibilidade (aceita texto livre na UI). */
export const FLEXIBILIDADE_METODO_SUGESTOES = ["WELLS", "SIT-AND-REACH", "BAQUE", "OUTRO"] as const;

/** Chaves em `medidas.composicao_corporal` (além das colunas `% gordura` e `massa magra`). */
export const KEYS_COMP_CORP_DECIMAL = [
  ["massa_gordura_kg", "Massa gordura", "Kg"],
  ["pct_massa_magra", "% massa magra", "%"],
  ["massa_muscular_kg", "Massa muscular", "Kg"],
  ["mm_biceps", "Bíceps", "mm"],
  ["mm_triceps", "Tríceps", "mm"],
  ["mm_peito", "Peito (dobra)", "mm"],
  ["mm_axilar_media", "Axilar média", "mm"],
  ["mm_subescapular", "Subescapular", "mm"],
  ["mm_suprailiaca", "Suprailíaca", "mm"],
  ["mm_abdome", "Abdôme (dobra)", "mm"],
  ["mm_coxa", "Coxa (dobra)", "mm"],
  ["mm_panturrilha", "Panturrilha (dobra)", "mm"],
  ["mm_punho", "Punho", "mm"],
  ["mm_femur", "Fêmur", "mm"],
  ["mm_umero", "Úmero", "mm"],
  ["mm_tornozelo", "Tornozelo", "mm"],
] as const;

export const KEYS_ANTROPOMETRIA_CM = [
  ["ombro_cm", "Ombro", "cm"],
  ["torax_inspirado_cm", "Tórax inspirado", "cm"],
  ["torax_expirado_cm", "Tórax expirado", "cm"],
  ["peito_cm", "Peito", "cm"],
  ["cintura_escapular_cm", "Cintura escapular", "cm"],
  ["cintura_cm", "Cintura", "cm"],
  ["abdome_cm", "Abdôme", "cm"],
  ["quadril_cm", "Quadril", "cm"],
  ["pescoco_cm", "Pescoço", "cm"],
] as const;

export const KEYS_BILATERAIS = [
  ["coxa_relaxada_d_cm", "Coxa relaxada direita", "cm"],
  ["coxa_relaxada_e_cm", "Coxa relaxada esquerda", "cm"],
  ["coxa_contraida_d_cm", "Coxa contraída direita", "cm"],
  ["coxa_contraida_e_cm", "Coxa contraída esquerda", "cm"],
  ["panturrilha_d_cm", "Panturrilha direita", "cm"],
  ["panturrilha_e_cm", "Panturrilha esquerda", "cm"],
  ["braco_relaxado_d_cm", "Braço relaxado direito", "cm"],
  ["braco_relaxado_e_cm", "Braço relaxado esquerdo", "cm"],
  ["braco_contraido_d_cm", "Braço contraído direito", "cm"],
  ["braco_contraido_e_cm", "Braço contraído esquerdo", "cm"],
  ["antebraco_d_cm", "Antebraço direito", "cm"],
  ["antebraco_e_cm", "Antebraço esquerdo", "cm"],
] as const;

export interface AvaliacaoMedidasPayload {
  schema_version: typeof SCHEMA_VERSION;
  /** yyyy-mm-dd */
  reavaliacao_em: string | null;
  objetivos: ObjetivoAvaliacao[];
  historico_atividade_fisica: string;
  /** tri-state gravado como true | false | null */
  cirurgias: boolean | null;
  medicamentos: boolean | null;
  fraturas: boolean | null;
  artrose: boolean | null;
  dores_coluna: boolean | null;
  composicao_corporal: Partial<Record<(typeof KEYS_COMP_CORP_DECIMAL)[number][0], number | null>>;
  antropometria: Partial<Record<(typeof KEYS_ANTROPOMETRIA_CM)[number][0], number | null>>;
  bilaterais: Partial<Record<(typeof KEYS_BILATERAIS)[number][0], number | null>>;
  flexibilidade_metodo: string;
  flexibilidade_resultado: number | null;
}

export function emptyAvaliacaoMedidasPayload(): AvaliacaoMedidasPayload {
  return {
    schema_version: SCHEMA_VERSION,
    reavaliacao_em: null,
    objetivos: [],
    historico_atividade_fisica: "",
    cirurgias: null,
    medicamentos: null,
    fraturas: null,
    artrose: null,
    dores_coluna: null,
    composicao_corporal: {},
    antropometria: {},
    bilaterais: {},
    flexibilidade_metodo: "",
    flexibilidade_resultado: null,
  };
}

/** Lê objeto `medidas` da linha avaliacoes; só retorna dados se for schema v2. */
export function parseMedidasPayloadFromJson(medidas: Json | null | undefined): AvaliacaoMedidasPayload | null {
  if (!medidas || typeof medidas !== "object" || Array.isArray(medidas)) return null;
  const m = medidas as Record<string, unknown>;
  const svRaw = m.schema_version ?? m.schemaVersion;
  if (Number(svRaw) !== SCHEMA_VERSION) return null;

  const pluckNumMap = (
    keys: readonly (readonly [string, string, string])[],
    src: Record<string, unknown> | undefined,
  ): Partial<Record<string, number | null>> => {
    const out: Partial<Record<string, number | null>> = {};
    if (!src) return out;
    for (const [k] of keys) {
      const raw = src[k];
      if (raw == null || raw === "") continue;
      const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
      if (Number.isFinite(n)) out[k] = n;
    }
    return out;
  };

  const ccSrc =
    m.composicao_corporal && typeof m.composicao_corporal === "object" && !Array.isArray(m.composicao_corporal)
      ? (m.composicao_corporal as Record<string, unknown>)
      : m.composicaoCorporal && typeof m.composicaoCorporal === "object" && !Array.isArray(m.composicaoCorporal)
        ? (m.composicaoCorporal as Record<string, unknown>)
        : undefined;

  const antSrc =
    m.antropometria && typeof m.antropometria === "object" && !Array.isArray(m.antropometria)
      ? (m.antropometria as Record<string, unknown>)
      : undefined;

  const bilSrc =
    m.bilaterais && typeof m.bilaterais === "object" && !Array.isArray(m.bilaterais)
      ? (m.bilaterais as Record<string, unknown>)
      : undefined;

  let reavIso: string | null = null;
  const ra = (m.reavaliacao_em ?? m.reavaliacaoEm) as string | undefined;
  if (typeof ra === "string" && /^\d{4}-\d{2}-\d{2}/.test(ra.trim())) {
    reavIso = ra.trim().slice(0, 10);
  }

  const objRaw = m.objetivos;
  let objetivos: ObjetivoAvaliacao[] = [];
  if (Array.isArray(objRaw)) {
    objetivos = objRaw.filter((x): x is ObjetivoAvaliacao => typeof x === "string" && (OBJETIVOS_AVALIACAO as readonly string[]).includes(x));
  }

  const hist = (m.historico_atividade_fisica ?? m.historicoAtividadeFisica) as string | undefined;

  function pluckTri(key: string): boolean | null {
    const x = m[key];
    if (x === true || x === false) return x;
    if (x == null || x === "") return null;
    return null;
  }

  const flexMeta = typeof m.flexibilidade === "object" && !Array.isArray(m.flexibilidade) ? (m.flexibilidade as Record<string, unknown>) : {};

  let flexResult: number | null = null;
  const frRaw = flexMeta.resultado ?? flexMeta.flexibilidade_resultado ?? m.flexibilidade_resultado ?? m.flexibilidadeResultado;
  if (frRaw != null && frRaw !== "") {
    const n = typeof frRaw === "number" ? frRaw : Number.parseFloat(String(frRaw));
    if (Number.isFinite(n)) flexResult = n;
  }

  const flexMetodo = String(flexMeta.metodo ?? flexMeta.flexibilidade_metodo ?? m.flexibilidade_metodo ?? m.flexibilidadeMetodo ?? "").trim();

  return {
    schema_version: SCHEMA_VERSION,
    reavaliacao_em: reavIso,
    objetivos,
    historico_atividade_fisica: typeof hist === "string" ? hist : "",
    cirurgias: pluckTri("cirurgias"),
    medicamentos: pluckTri("medicamentos"),
    fraturas: pluckTri("fraturas"),
    artrose: pluckTri("artrose"),
    dores_coluna: pluckTri("dores_coluna"),
    composicao_corporal: pluckNumMap(KEYS_COMP_CORP_DECIMAL, ccSrc),
    antropometria: pluckNumMap(KEYS_ANTROPOMETRIA_CM, antSrc),
    bilaterais: pluckNumMap(KEYS_BILATERAIS, bilSrc),
    flexibilidade_metodo: flexMetodo,
    flexibilidade_resultado: flexResult,
  };
}

/** Monta objeto JSON gravado em `medidas`; campos totalmente vazios viram `{}` dentro de cada seção quando possível. */
export function buildMedidasInsertJson(p: AvaliacaoMedidasPayload): Json {
  const trimmedObjetivos = p.objetivos.length ? [...p.objetivos] : undefined;
  const hist = p.historico_atividade_fisica.trim();

  function cleanNumRecord<T extends string>(keys: readonly (readonly [T, string, string])[], rec: Partial<Record<T, number | null>>): Record<string, number> | undefined {
    const out: Record<string, number> = {};
    let any = false;
    for (const [k] of keys) {
      const v = rec[k];
      if (v == null || Number.isNaN(v)) continue;
      out[k] = v;
      any = true;
    }
    return any ? out : undefined;
  }

  const flex: Record<string, unknown> = {};
  const fm = p.flexibilidade_metodo.trim();
  if (fm) flex.metodo = fm;
  if (p.flexibilidade_resultado != null && Number.isFinite(p.flexibilidade_resultado)) {
    flex.resultado = p.flexibilidade_resultado;
  }

  const anamBase: Record<string, unknown> = {};
  const boolKeys = ["cirurgias", "medicamentos", "fraturas", "artrose", "dores_coluna"] as const;
  for (const bk of boolKeys) {
    const v = p[bk];
    if (v === true || v === false) anamBase[bk] = v;
  }
  if (trimmedObjetivos) anamBase.objetivos = trimmedObjetivos;
  if (hist) anamBase.historico_atividade_fisica = hist;

  const out: Record<string, unknown> = {
    schema_version: SCHEMA_VERSION,
  };

  if (p.reavaliacao_em) out.reavaliacao_em = p.reavaliacao_em;

  const cc = cleanNumRecord(KEYS_COMP_CORP_DECIMAL as readonly [string, string, string][], p.composicao_corporal as Partial<Record<string, number | null>>);
  if (cc) out.composicao_corporal = cc;

  const ant = cleanNumRecord(KEYS_ANTROPOMETRIA_CM as readonly [string, string, string][], p.antropometria as Partial<Record<string, number | null>>);
  if (ant) out.antropometria = ant;

  const bil = cleanNumRecord(KEYS_BILATERAIS as readonly [string, string, string][], p.bilaterais as Partial<Record<string, number | null>>);
  if (bil) out.bilaterais = bil;

  if (Object.keys(anamBase).length) Object.assign(out, anamBase);
  if (Object.keys(flex).length) out.flexibilidade = flex;

  return out as Json;
}
