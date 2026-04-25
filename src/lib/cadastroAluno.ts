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

export function buildObservacoes(parts: {
  profissao: string;
  contatoEmergencia: string;
  telEmergencia: string;
  objetivo: string;
  jaTreinou: string;
  tempoPratica: string;
  vezesSemana: string;
  horarioPref: string;
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
  tipoPlano: string;
  valorPlano: string;
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
    ["Tipo de plano", input.tipoPlano],
    ["Valor do plano", input.valorPlano],
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
  const valor = parseMoneyBr(input.valorPlano);
  if (valor === null || valor <= 0) {
    errs.push("Valor do plano inválido.");
  }
  const forma = mapFormaPagamento(input.formaPagto);
  if (!forma) errs.push("Forma de pagamento inválida.");
  return errs;
}

export function randomPin4(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
