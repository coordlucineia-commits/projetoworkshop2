import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./database.types";
import {
  buildMedidasJson,
  buildObservacoes,
  mapFormaPagamento,
  parseMoneyBr,
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
  peso: string;
  altura: string;
  imc: string;
  gordura: string;
  medidasTexto: string;
  tipoPlano: string;
  valorPlano: string;
  dataInicio: string;
  dataVenc: string;
  formaPagto: string;
  assinaturaPng: string | null;
};

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

function parseNumeroBr(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
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
    tipoPlano: p.tipoPlano,
    valorPlano: p.valorPlano,
    dataInicio: p.dataInicio,
    dataVenc: p.dataVenc,
    formaPagto: p.formaPagto,
  });
  if (erros.length) {
    throw new Error(erros[0]);
  }

  const forma = mapFormaPagamento(p.formaPagto);
  if (!forma) throw new Error("Forma de pagamento inválida.");

  const valor = parseMoneyBr(p.valorPlano);
  if (valor === null || valor <= 0) throw new Error("Valor do plano inválido.");

  const planoId = p.tipoPlano === "OUTRO" ? null : p.tipoPlano;
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
  });

  const medidas = buildMedidasJson({
    medidasTexto: p.medidasTexto,
    peso: p.peso,
    altura: p.altura,
    imc: p.imc,
    gordura: p.gordura,
    assinaturaPng: p.assinaturaPng,
  }) as Json;

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
      plano_id: planoId,
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

  const pesoN = parseNumeroBr(p.peso);
  const alturaN = parseNumeroBr(p.altura);
  if (pesoN !== null && alturaN !== null) {
    const gord = parseNumeroBr(p.gordura);
    await sb.from("avaliacoes").insert({
      aluno_id: aluno.id,
      peso: pesoN,
      altura: alturaN,
      percentual_gordura: gord,
      medidas: {},
      circunferencias: {},
      data_avaliacao: new Date().toISOString().slice(0, 10),
    });
  }

  const refMes = p.dataVenc.length >= 7 ? `${p.dataVenc.slice(0, 7)}-01` : p.dataVenc;

  const { error: errPag } = await sb.from("pagamentos").insert({
    aluno_id: aluno.id,
    valor,
    data_vencimento: p.dataVenc,
    forma_pagamento: forma,
    status: "PENDENTE",
    descricao: `Mensalidade — início ${p.dataInicio}`,
    referencia_mes: refMes,
  });

  if (errPag) {
    throw new Error(errPag.message);
  }

  return { alunoId: aluno.id, matricula, pin };
}
