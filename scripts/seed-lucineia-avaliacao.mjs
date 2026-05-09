/**
 * Preenche e grava avaliação corporal fictícia para aluna Lucineia Tenório (≈168 cm / 70 kg),
 * atualiza data/hora do slot em avaliacoes_agenda e insere avaliacoes.medidas (schema_version 2).
 *
 * Requer no .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Opcional:
 *   LUCINEIA_AGENDA_ID  — UUID exato da linha avaliacoes_agenda (prioritário sobre busca por nome)
 *
 * Uso:
 *   npm run seed:lucineia-avaliacao
 *
 * Flags:
 *   --replace  — remove avaliacões existentes vinculadas ao mesmo agenda_id antes de inserir
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const MINUTES_BLOCK = 45;

function loadDotEnv() {
  const p = join(process.cwd(), ".env");
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadDotEnv();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const forcedAgendaId = process.env.LUCINEIA_AGENDA_ID?.trim();
const doReplace = process.argv.includes("--replace");

if (!url || !serviceKey) {
  console.error("Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** 18/06/2026 09:30 BRT (America/São Paulo → ISO UTC nos updates) */
const INICIO_BRT_ISO = "2026-06-18T09:30:00-03:00";

function isoFimPlus45(inicioIso) {
  const t = new Date(inicioIso).getTime() + MINUTES_BLOCK * 60 * 1000;
  return new Date(t).toISOString();
}

const dataAvaliacaoYmd = "2026-06-18"; // yyyy-mm-dd (data “clínica” da avaliação)

/** IMC ~24,81 */
const peso = 70;
const altura = 168;
const imc = Number((peso / (altura / 100) ** 2).toFixed(2));
const pctGord = 28.5;
const massaMagra = Number((peso * (1 - pctGord / 100)).toFixed(1));

/** JSON compatível com buildMedidasInsertJson(schema 2). */
const medidas = {
  schema_version: 2,
  reavaliacao_em: "2026-12-10",
  objetivos: ["EMAGRECIMENTO", "CONDICIONAMENTO"],
  historico_atividade_fisica: "MODERADAMENTE ATIVO — 2× A 3× POR SEMANA",
  cirurgias: false,
  medicamentos: false,
  fraturas: false,
  artrose: false,
  dores_coluna: false,
  composicao_corporal: {
    mm_triceps: 16,
    mm_peito: 12,
    mm_axilar_media: 13,
    mm_subescapular: 14,
    mm_suprailiaca: 17,
    mm_abdome: 21,
    mm_coxa: 22,
    mm_panturrilha: 10,
    massa_gordura_kg: 19.9,
    pct_massa_magra: 71.5,
    massa_muscular_kg: 42,
  },
  antropometria: {
    ombro_cm: 104,
    torax_inspirado_cm: 92,
    torax_expirado_cm: 88,
    peito_cm: 90,
    cintura_escapular_cm: 97,
    cintura_cm: 76,
    abdome_cm: 81,
    quadril_cm: 103,
    pescoco_cm: 35,
  },
  bilaterais: {
    coxa_relaxada_d_cm: 58,
    coxa_relaxada_e_cm: 58.5,
    coxa_contraida_d_cm: 55,
    coxa_contraida_e_cm: 55.5,
    panturrilha_d_cm: 36,
    panturrilha_e_cm: 36.2,
    braco_relaxado_d_cm: 28,
    braco_relaxado_e_cm: 28,
    braco_contraido_d_cm: 30.5,
    braco_contraido_e_cm: 31,
    antebraco_d_cm: 24,
    antebraco_e_cm: 24,
  },
  flexibilidade: { metodo: "WELLS", resultado: 38 },
};

const observacoes =
  "Dados fictícios de exemplo (Lucineia, 168 cm, 70 kg). Objetivos: composição corporal e condicionamento.";

async function main() {
  let agendaId = forcedAgendaId;

  if (!agendaId) {
    const { data: rows, error: eAl } = await supabase.from("alunos").select("id,nome").ilike("nome", "%lucineia%");
    if (eAl) throw eAl;
    const aluno = rows?.find((r) =>
      String(r.nome ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .includes("tenorio"),
    ) ?? rows?.[0];
    if (!aluno?.id) {
      console.error(
        'Aluna não encontrada (ilike nome "%lucineia%"). Cadastre a aluna Lucineia ou defina LUCINEIA_AGENDA_ID.',
      );
      process.exit(1);
    }

    console.log("Aluno:", aluno.id, aluno.nome);

    const { data: agendas, error: eAg } = await supabase
      .from("avaliacoes_agenda")
      .select("id,inicio_at,status,professor_id,aluno_id")
      .eq("aluno_id", aluno.id)
      .order("inicio_at", { ascending: false })
      .limit(8);

    if (eAg) throw eAg;
    const pick =
      agendas?.find((x) => x.status === "realizado") ||
      agendas?.find((x) => x.status === "agendado") ||
      agendas?.[0];
    if (!pick?.id) {
      console.error("Nenhuma linha avaliacoes_agenda para esta aluna. Crie um agendamento no app primeiro.");
      process.exit(1);
    }
    agendaId = pick.id;
    console.log("Agenda escolhida:", agendaId, "status atual:", pick.status, "was inicio:", pick.inicio_at);
  }

  if (doReplace) {
    const { error: delErr } = await supabase.from("avaliacoes").delete().eq("agenda_id", agendaId);
    if (delErr) throw delErr;
    console.log("Avaliacoes antigas neste agenda_id removidas (--replace).");
  } else {
    const { data: existed } = await supabase.from("avaliacoes").select("id").eq("agenda_id", agendaId).maybeSingle();
    if (existed?.id) {
      console.error(
        "Já existe avaliacao para este agenda_id. Rode novamente com --replace ou limpe pela UI / SQL.",
      );
      process.exit(2);
    }
  }

  const fimIso = isoFimPlus45(INICIO_BRT_ISO);

  const { error: updErr } = await supabase
    .from("avaliacoes_agenda")
    .update({
      inicio_at: INICIO_BRT_ISO,
      fim_at: fimIso,
      status: "realizado",
    })
    .eq("id", agendaId);

  if (updErr) throw updErr;

  const { data: ag } = await supabase.from("avaliacoes_agenda").select("aluno_id,professor_id").eq("id", agendaId).single();
  if (!ag?.aluno_id) throw new Error("Agenda sem aluno_id");

  if (!ag.professor_id) console.warn("Aviso: professor_id era null nesta agenda; vínculo na UI pode ser necessário.");

  const payload = {
    aluno_id: ag.aluno_id,
    agenda_id: agendaId,
    data_avaliacao: dataAvaliacaoYmd,
    peso,
    altura,
    imc,
    percentual_gordura: pctGord,
    massa_magra: massaMagra,
    circunferencias: {},
    medidas,
    observacoes,
  };

  const { error: insErr } = await supabase.from("avaliacoes").insert(payload);
  if (insErr) throw insErr;

  console.log(
    `\nSucesso • agenda ${agendaId}\nNova data agenda (exibida como BRT): 18/06/2026 09:30 (slot ${MINUTES_BLOCK} min)\ndata_avaliacao (coluna da ficha): ${dataAvaliacaoYmd}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
