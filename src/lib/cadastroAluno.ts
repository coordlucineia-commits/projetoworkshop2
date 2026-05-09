import type { Database, Json } from "./database.types";

export type PlanoRow = Database["public"]["Tables"]["planos"]["Row"];

export function stripDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/** Converte "1.234,56" ou "1234,56" ou "1234.56" para número. */
export function parseMoneyBr(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const normalized = t.replace(/\./g, "").replace(",", ".");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

const FORMA_MAP: Record<string, Database["public"]["Enums"]["forma_pagamento"]> =
  {
    PIX: "PIX",
    CARTAO_CREDITO: "CARTAO_CREDITO",
    CARTAO_DEBITO: "CARTAO_DEBITO",
    DINHEIRO: "DINHEIRO",
    BOLETO: "BOLETO",
    TRANSFERENCIA: "TRANSFERENCIA",
  };

export function mapFormaPagamento(
  v: string,
): Database["public"]["Enums"]["forma_pagamento"] | null {
  return FORMA_MAP[v] ?? null;
}

export type DuracaoContratoKey = "mensal" | "trimestral" | "semestral" | "anual";

export const MESES_CONTRATO: Record<DuracaoContratoKey, number> = {
  mensal: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

export const LABEL_DURACAO_CONTRATO: Record<DuracaoContratoKey, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

/** Fração aplicada sobre o subtotal (meses × mensalidade): mensal sem desconto; demais conforme combinado. */
export const DESCONTO_CONTRATO: Record<DuracaoContratoKey, number> = {
  mensal: 0,
  trimestral: 0.1,
  semestral: 0.15,
  anual: 0.2,
};

export function multiplicadorAposDesconto(duracaoKey: DuracaoContratoKey): number {
  return 1 - DESCONTO_CONTRATO[duracaoKey];
}

/** Subtotal sem desconto: meses × valor mensal. */
export function subtotalContratoBruto(valorMes: number, dk: DuracaoContratoKey): number {
  return valorMes * MESES_CONTRATO[dk];
}

/** Total a cobrar: subtotal menos desconto da duração. */
export function valorTotalContratoLiquido(valorMes: number, dk: DuracaoContratoKey): number {
  return Number((subtotalContratoBruto(valorMes, dk) * multiplicadorAposDesconto(dk)).toFixed(2));
}

export function textoResumoDesconto(dk: DuracaoContratoKey): string {
  const d = DESCONTO_CONTRATO[dk];
  if (d <= 0) return "Sem desconto sobre o pacote mensal.";
  const pct = Math.round(d * 100);
  return `${pct}% de desconto sobre o valor bruto (${LABEL_DURACAO_CONTRATO[dk]}).`;
}

/**
 * Data de término = mesma rodada civil após acrescentar N meses (N = período contratado).
 * Ex.: 2026-01-05 + mensal → 2026-02-05; + trimestral → 2026-04-05.
 */
export function dataTerminoPorDataInicioEDuracao(
  isoStart: string | null | undefined,
  dk: DuracaoContratoKey,
): string | null {
  if (!isoStart || isoStart.length < 10) return null;
  const months = MESES_CONTRATO[dk];
  const slice = isoStart.slice(0, 10).split("-");
  const y = Number(slice[0]);
  const m = Number(slice[1]);
  const day = Number(slice[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return null;
  const dt = new Date(y, m - 1, day);
  dt.setMonth(dt.getMonth() + months);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

/** Normaliza chave vindas das observações. */
export function parseDuracaoContratoKey(raw: string | null | undefined): DuracaoContratoKey | "" {
  const k = (raw ?? "").trim().toLowerCase();
  if (k === "mensal" || k === "trimestral" || k === "semestral" || k === "anual") return k;
  return "";
}

export function buildObservacoes(parts: {
  profissao: string;
  contatoEmergencia: string;
  telEmergencia: string;
  objetivo: string;
  jaTreinou: string;
  tempoPratica: string;
  vezesSemana: string;
  horarioPref: string;
  /** Chave técnica: mensal | trimestral | semestral | anual */
  duracaoContrato?: DuracaoContratoKey;
  /** Nome do plano do catálogo (para observações quando houver vínculo) */
  planoCatalogoNome?: string | null;
}): string {
  const lines = [
    parts.profissao && `Profissão: ${parts.profissao}`,
    (parts.contatoEmergencia || parts.telEmergencia) &&
      `Emergência: ${parts.contatoEmergencia}${parts.telEmergencia ? ` — ${parts.telEmergencia}` : ""}`,
    parts.objetivo && `Objetivo principal: ${parts.objetivo}`,
    parts.jaTreinou && `Já treinou antes: ${parts.jaTreinou}`,
    parts.tempoPratica && `Tempo de prática: ${parts.tempoPratica}`,
    parts.vezesSemana && `Frequência desejada: ${parts.vezesSemana}`,
    parts.horarioPref && `Horário preferido: ${parts.horarioPref}`,
    parts.planoCatalogoNome?.trim() && `Plano: ${parts.planoCatalogoNome.trim()}`,
    parts.duracaoContrato &&
      `Contrato: ${parts.duracaoContrato}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildMedidasJson(parts: {
  medidasTexto: string;
  peso: string;
  altura: string;
  imc: string;
  gordura: string;
  assinaturaPng: string | null;
}): Json {
  return {
    corporais: {
      peso: parts.peso || null,
      altura_cm: parts.altura || null,
      imc: parts.imc || null,
      gordura_pct: parts.gordura || null,
      texto: parts.medidasTexto || null,
    },
    assinatura_termo: parts.assinaturaPng,
  };
}

export function validateNovoAluno(input: {
  nome: string;
  dataNasc: string;
  cpf: string;
  rg: string;
  sexo: string;
  estadoCivil: string;
  profissao: string;
  telefone: string;
  email: string;
  endereco: string;
  contatoEmergencia: string;
  telEmergencia: string;
  duracaoContrato: string;
  /** Valor da mensalidade base (informado antes de aplicar meses). */
  valorMensal: string;
  dataInicio: string;
  dataVenc: string;
  formaPagto: string;
}): string[] {
  const errs: string[] = [];
  const req = [
    ["Nome completo", input.nome],
    ["Data de nascimento", input.dataNasc],
    ["CPF", input.cpf],
    ["RG", input.rg],
    ["Sexo", input.sexo],
    ["Estado civil", input.estadoCivil],
    ["Profissão", input.profissao],
    ["Telefone", input.telefone],
    ["E-mail", input.email],
    ["Endereço", input.endereco],
    ["Contato de emergência", input.contatoEmergencia],
    ["Telefone de emergência", input.telEmergencia],
    ["Duração do contrato", input.duracaoContrato],
    ["Valor mensal base", input.valorMensal],
    ["Data de início", input.dataInicio],
    ["Data de vencimento", input.dataVenc],
    ["Forma de pagamento", input.formaPagto],
  ] as const;
  for (const [label, v] of req) {
    if (!String(v).trim()) errs.push(`${label} é obrigatório.`);
  }
  if (stripDigits(input.cpf).length !== 11) {
    errs.push("CPF deve conter 11 dígitos.");
  }
  const email = input.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.push("E-mail inválido.");
  }
  const valorMes = parseMoneyBr(input.valorMensal);
  if (valorMes === null || valorMes <= 0) {
    errs.push("Valor mensal inválido.");
  }
  const forma = mapFormaPagamento(input.formaPagto);
  if (!forma) errs.push("Forma de pagamento inválida.");
  if (parseDuracaoContratoKey(input.duracaoContrato) === "") {
    errs.push("Informe a duração do contrato (mensal a anual).");
  }
  return errs;
}

export function randomPin4(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/** Formata apenas dígitos do CPF para exibição no formulário (00.000.000-00). */
export function formatCpfBr(digitsRaw: string): string {
  const n = digitsRaw.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export type ParsedObservacoes = {
  profissao: string;
  contatoEmergencia: string;
  telEmergencia: string;
  objetivo: string;
  jaTreinou: string;
  tempoPratica: string;
  vezesSemana: string;
  horarioPref: string;
  /** Chave Contrato: — para recalcular valor mensal ao editar */
  duracaoContrato: DuracaoContratoKey | "";
  /** Linha opcional Plano: no texto de observações */
  planCatalogoNome: string;
};

const OBS_EMPTY: ParsedObservacoes = {
  profissao: "",
  contatoEmergencia: "",
  telEmergencia: "",
  objetivo: "",
  jaTreinou: "",
  tempoPratica: "",
  vezesSemana: "",
  horarioPref: "",
  duracaoContrato: "",
  planCatalogoNome: "",
};

/** Reverte `buildObservacoes` para preencher o cadastro na edição. */
export function parseObservacoes(obs: string | null): ParsedObservacoes {
  if (!obs?.trim()) return { ...OBS_EMPTY };
  const out = { ...OBS_EMPTY };
  for (const line of obs.split("\n")) {
    const t = line.trim();
    if (t.startsWith("Profissão: "))
      out.profissao = t.slice("Profissão: ".length).trim();
    else if (t.startsWith("Emergência: ")) {
      const rest = t.slice("Emergência: ".length);
      const sep = rest.indexOf(" — ");
      if (sep >= 0) {
        out.contatoEmergencia = rest.slice(0, sep).trim();
        out.telEmergencia = rest.slice(sep + 3).trim();
      } else {
        out.contatoEmergencia = rest.trim();
      }
    } else if (t.startsWith("Objetivo principal: "))
      out.objetivo = t.slice("Objetivo principal: ".length).trim();
    else if (t.startsWith("Já treinou antes: "))
      out.jaTreinou = t.slice("Já treinou antes: ".length).trim();
    else if (t.startsWith("Tempo de prática: "))
      out.tempoPratica = t.slice("Tempo de prática: ".length).trim();
    else if (t.startsWith("Frequência desejada: "))
      out.vezesSemana = t.slice("Frequência desejada: ".length).trim();
    else if (t.startsWith("Horário preferido: "))
      out.horarioPref = t.slice("Horário preferido: ".length).trim();
    else if (t.startsWith("Plano: "))
      out.planCatalogoNome = t.slice("Plano: ".length).trim();
    else if (t.startsWith("Contrato: ")) {
      const dk = parseDuracaoContratoKey(t.slice("Contrato: ".length));
      if (dk) out.duracaoContrato = dk;
    }
  }
  return out;
}

/** Normaliza JSON de anamnese/PAR-Q para strings no formulário. */
export function jsonRecordToFormStrings(j: Json): Record<string, string> {
  if (!j || typeof j !== "object" || Array.isArray(j)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(j as Record<string, unknown>)) {
    out[k] = v == null ? "" : String(v);
  }
  return out;
}
