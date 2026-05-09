import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";
import {
  buildObservacoes,
  mapFormaPagamento,
  parseMoneyBr,
  parseDuracaoContratoKey,
  LABEL_DURACAO_CONTRATO,
  randomPin4,
  stripDigits,
  validateNovoAluno,
} from "./cadastroAluno";

export type CadastroAlunoPayload = {
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
  foto: string | null;
  anamnese: Record<string, string>;
  parq: Record<string, string>;
  parqHasSim: boolean;
  objetivo: string;
  jaTreinou: string;
  tempoPratica: string;
  vezesSemana: string;
  horarioPref: string;
  /** mensal | trimestral | semestral | anual */
  duracaoContrato: string;
  valorMensal: string;
  /** Valor total cobrado no pagamento (bruto menos desconto por duração). */
  valorPlano: string;
  /** UUID em `planos` ou null (valor manual sem catálogo). */
  planoCatalogoId: string | null;
  /** Nome exibido em observações quando houver vínculo com catálogo. */
  planoCatalogoNome: string | null;
  dataInicio: string;
  dataVenc: string;
  formaPagto: string;
  assinaturaPng: string | null;
  /** Agendamento inicial na matrícula (gravado em `avaliacoes_agenda`). */
  avaliacaoCorporal?: {
    professorId: string;
    dataYmd: string;
    hora: string;
  };
};

/** Medidas só com termo; dados corporais ficam para avaliações do professor. */
function medidasNovaInclusao(assinaturaPng: string | null): Json {
  return {
    corporais: { peso: null, altura_cm: null, imc: null, gordura_pct: null, texto: null },
    assinatura_termo: assinaturaPng,
  } as Json;
}

async function mergedMedidasAlunoPreserveCorporais(
  sb: SupabaseClient<Database>,
  alunoId: string,
  assinaturaPng: string | null,
): Promise<Json> {
  const { data } = await sb.from("alunos").select("medidas").eq("id", alunoId).maybeSingle();
  type M = { corporais?: unknown; assinatura_termo?: string | null };
  const prev = (data?.medidas ?? {}) as M;
  const corporaisVazio = {
    peso: null,
    altura_cm: null,
    imc: null,
    gordura_pct: null,
    texto: null,
  };
  const out: M = {
    ...prev,
    corporais: prev.corporais ?? corporaisVazio,
    assinatura_termo: assinaturaPng ?? prev.assinatura_termo ?? null,
  };
  return out as Json;
}

function normalizePlanoId(id: string | null | undefined): string | null {
  if (id == null) return null;
  const t = String(id).trim();
  return t.length ? t : null;
}

function descricaoContrato(duracaoContrato: string, dataInicio: string): string {
  const dk = parseDuracaoContratoKey(duracaoContrato);
  const nome = dk ? LABEL_DURACAO_CONTRATO[dk] : "Contrato";
  return `${nome} — início ${dataInicio}`;
}

export const MINUTOS_PADRAO_AVAL_CORPORAL = 45;

/** Interpreta data + hora no calendário/relógio local do navegador (matrícula). */
function intervaloIsoParaAgenda(
  dataYmd: string,
  horaHm: string,
  duracaoMinutos: number,
): { inicio_iso: string; fim_iso: string } {
  const dp = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataYmd.trim());
  const tp = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(horaHm.trim());
  if (!dp || !tp) throw new Error("Data ou horário da avaliação corporal inválidos.");
  const y = Number(dp[1]),
    mo = Number(dp[2]),
    d = Number(dp[3]);
  const hh = Number(tp[1]),
    mi = Number(tp[2]);
  const inicio = new Date(y, mo - 1, d, hh, mi, 0, 0);
  const fim = new Date(inicio.getTime() + duracaoMinutos * 60_000);
  return { inicio_iso: inicio.toISOString(), fim_iso: fim.toISOString() };
}

/** Intervalo UTC para `avaliacoes_agenda` (45 min, fuso local do navegador). */
export function intervaloIsoParaAvaliacaoCorporalAgenda(
  dataYmd: string,
  horaHm: string,
): { inicio_iso: string; fim_iso: string } {
  return intervaloIsoParaAgenda(dataYmd, horaHm, MINUTOS_PADRAO_AVAL_CORPORAL);
}

async function substituirAvaliacaoAgendaAgendada(
  sb: SupabaseClient<Database>,
  alunoId: string,
  slice: { professorId: string; dataYmd: string; hora: string },
): Promise<void> {
  const { inicio_iso, fim_iso } = intervaloIsoParaAgenda(
    slice.dataYmd,
    slice.hora,
    MINUTOS_PADRAO_AVAL_CORPORAL,
  );
  const { error: delErr } = await sb
    .from("avaliacoes_agenda")
    .delete()
    .eq("aluno_id", alunoId)
    .eq("status", "agendado");
  if (delErr) throw new Error(delErr.message);
  const { error: insErr } = await sb.from("avaliacoes_agenda").insert({
    aluno_id: alunoId,
    professor_id: slice.professorId.trim(),
    inicio_at: inicio_iso,
    fim_at: fim_iso,
    status: "agendado",
  });
  if (insErr) throw new Error(insErr.message);
}
async function gerarMatriculaUnica(
  sb: SupabaseClient<Database>,
): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const m = "#" + String(Math.floor(1000 + Math.random() * 9000));
    const { data } = await sb.from("alunos").select("id").eq("matricula", m).maybeSingle();
    if (!data) return m;
  }
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return "#" + suffix;
}

export async function salvarCadastroAluno(
  sb: SupabaseClient<Database>,
  p: CadastroAlunoPayload,
): Promise<{ alunoId: string; matricula: string; pin: string }> {
  const erros = validateNovoAluno({
    nome: p.nome,
    dataNasc: p.dataNasc,
    cpf: p.cpf,
    rg: p.rg,
    sexo: p.sexo,
    estadoCivil: p.estadoCivil,
    profissao: p.profissao,
    telefone: p.telefone,
    email: p.email,
    endereco: p.endereco,
    contatoEmergencia: p.contatoEmergencia,
    telEmergencia: p.telEmergencia,
    duracaoContrato: p.duracaoContrato,
    valorMensal: p.valorMensal,
    dataInicio: p.dataInicio,
    dataVenc: p.dataVenc,
    formaPagto: p.formaPagto,
  });
  if (erros.length) {
    throw new Error(erros[0]);
  }

  const forma = mapFormaPagamento(p.formaPagto);
  if (!forma) throw new Error("Forma de pagamento inválida.");

  if (!p.avaliacaoCorporal?.professorId?.trim() || !p.avaliacaoCorporal?.dataYmd?.trim() || !p.avaliacaoCorporal?.hora?.trim()) {
    throw new Error("Informe data, horário e professor para a avaliação corporal.");
  }

  const valor = parseMoneyBr(p.valorPlano);
  if (valor === null || valor <= 0) throw new Error("Valor total do contrato inválido.");

  const dk = parseDuracaoContratoKey(p.duracaoContrato);
  if (!dk) throw new Error("Duração do contrato inválida.");

  const planoFk = normalizePlanoId(p.planoCatalogoId);

  const matricula = await gerarMatriculaUnica(sb);
  const pin = randomPin4();

  const observacoes = buildObservacoes({
    profissao: p.profissao,
    contatoEmergencia: p.contatoEmergencia,
    telEmergencia: p.telEmergencia,
    objetivo: p.objetivo,
    jaTreinou: p.jaTreinou,
    tempoPratica: p.tempoPratica,
    vezesSemana: p.vezesSemana,
    horarioPref: p.horarioPref,
    planoCatalogoNome:
      planoFk && p.planoCatalogoNome?.trim() ? p.planoCatalogoNome.trim() : null,
    duracaoContrato: dk,
  });

  const medidas = medidasNovaInclusao(p.assinaturaPng);

  const { data: aluno, error: errAluno } = await sb
    .from("alunos")
    .insert({
      matricula,
      nome: p.nome.trim(),
      foto: p.foto,
      cpf: stripDigits(p.cpf),
      rg: p.rg.trim(),
      email: p.email.trim().toLowerCase(),
      telefone: p.telefone.trim(),
      endereco: p.endereco.trim(),
      data_nascimento: p.dataNasc,
      sexo: p.sexo || null,
      estado_civil: p.estadoCivil || null,
      pin,
      plano_id: planoFk,
      status_financeiro: "EM_DIA",
      status_matricula: "ATIVO",
      anamnese: p.anamnese as Json,
      parq: p.parq as Json,
      parq_has_sim: p.parqHasSim,
      medidas,
      observacoes: observacoes || null,
    })
    .select("id")
    .single();

  if (errAluno || !aluno) {
    throw new Error(errAluno?.message ?? "Falha ao salvar aluno.");
  }

  const refMes = p.dataVenc.length >= 7 ? `${p.dataVenc.slice(0, 7)}-01` : p.dataVenc;

  const { error: errPag } = await sb.from("pagamentos").insert({
    aluno_id: aluno.id,
    valor,
    data_vencimento: p.dataVenc,
    forma_pagamento: forma,
    status: "PENDENTE",
    descricao: descricaoContrato(p.duracaoContrato, p.dataInicio),
    referencia_mes: refMes,
  });

  if (errPag) {
    throw new Error(errPag.message);
  }

  await substituirAvaliacaoAgendaAgendada(sb, aluno.id, {
    professorId: p.avaliacaoCorporal!.professorId.trim(),
    dataYmd: p.avaliacaoCorporal!.dataYmd.trim(),
    hora: p.avaliacaoCorporal!.hora.trim(),
  });

  return { alunoId: aluno.id, matricula, pin };
}

export async function atualizarCadastroAluno(
  sb: SupabaseClient<Database>,
  alunoId: string,
  p: CadastroAlunoPayload,
): Promise<void> {
  const erros = validateNovoAluno({
    nome: p.nome,
    dataNasc: p.dataNasc,
    cpf: p.cpf,
    rg: p.rg,
    sexo: p.sexo,
    estadoCivil: p.estadoCivil,
    profissao: p.profissao,
    telefone: p.telefone,
    email: p.email,
    endereco: p.endereco,
    contatoEmergencia: p.contatoEmergencia,
    telEmergencia: p.telEmergencia,
    duracaoContrato: p.duracaoContrato,
    valorMensal: p.valorMensal,
    dataInicio: p.dataInicio,
    dataVenc: p.dataVenc,
    formaPagto: p.formaPagto,
  });
  if (erros.length) {
    throw new Error(erros[0]);
  }

  const forma = mapFormaPagamento(p.formaPagto);
  if (!forma) throw new Error("Forma de pagamento inválida.");

  if (!p.avaliacaoCorporal?.professorId?.trim() || !p.avaliacaoCorporal?.dataYmd?.trim() || !p.avaliacaoCorporal?.hora?.trim()) {
    throw new Error("Informe data, horário e professor para a avaliação corporal.");
  }

  const valor = parseMoneyBr(p.valorPlano);
  if (valor === null || valor <= 0) throw new Error("Valor total do contrato inválido.");

  const dk = parseDuracaoContratoKey(p.duracaoContrato);
  if (!dk) throw new Error("Duração do contrato inválida.");

  const planoFk = normalizePlanoId(p.planoCatalogoId);

  const observacoes = buildObservacoes({
    profissao: p.profissao,
    contatoEmergencia: p.contatoEmergencia,
    telEmergencia: p.telEmergencia,
    objetivo: p.objetivo,
    jaTreinou: p.jaTreinou,
    tempoPratica: p.tempoPratica,
    vezesSemana: p.vezesSemana,
    horarioPref: p.horarioPref,
    planoCatalogoNome:
      planoFk && p.planoCatalogoNome?.trim() ? p.planoCatalogoNome.trim() : null,
    duracaoContrato: dk,
  });

  const medidas = await mergedMedidasAlunoPreserveCorporais(sb, alunoId, p.assinaturaPng);

  const { error: errAluno } = await sb
    .from("alunos")
    .update({
      nome: p.nome.trim(),
      foto: p.foto,
      cpf: stripDigits(p.cpf),
      rg: p.rg.trim(),
      email: p.email.trim().toLowerCase(),
      telefone: p.telefone.trim(),
      endereco: p.endereco.trim(),
      data_nascimento: p.dataNasc,
      sexo: p.sexo || null,
      estado_civil: p.estadoCivil || null,
      plano_id: planoFk,
      anamnese: p.anamnese as Json,
      parq: p.parq as Json,
      parq_has_sim: p.parqHasSim,
      medidas,
      observacoes: observacoes || null,
    })
    .eq("id", alunoId);

  if (errAluno) {
    throw new Error(errAluno.message ?? "Falha ao atualizar aluno.");
  }

  const refMes = p.dataVenc.length >= 7 ? `${p.dataVenc.slice(0, 7)}-01` : p.dataVenc;

  const { data: pagRow } = await sb
    .from("pagamentos")
    .select("id")
    .eq("aluno_id", alunoId)
    .order("data_vencimento", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pagRow?.id) {
    const { error: errPag } = await sb
      .from("pagamentos")
      .update({
        valor,
        data_vencimento: p.dataVenc,
        forma_pagamento: forma,
        referencia_mes: refMes,
        descricao: descricaoContrato(p.duracaoContrato, p.dataInicio),
      })
      .eq("id", pagRow.id);
    if (errPag) throw new Error(errPag.message);
  } else {
    const { error: errPag } = await sb.from("pagamentos").insert({
      aluno_id: alunoId,
      valor,
      data_vencimento: p.dataVenc,
      forma_pagamento: forma,
      status: "PENDENTE",
      descricao: descricaoContrato(p.duracaoContrato, p.dataInicio),
      referencia_mes: refMes,
    });
    if (errPag) throw new Error(errPag.message);
  }

  await substituirAvaliacaoAgendaAgendada(sb, alunoId, {
    professorId: p.avaliacaoCorporal!.professorId.trim(),
    dataYmd: p.avaliacaoCorporal!.dataYmd.trim(),
    hora: p.avaliacaoCorporal!.hora.trim(),
  });
}
