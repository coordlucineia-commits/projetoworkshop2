/**
 * Seed de demonstração: 10 alunos fictícios, 1 colaborador (somente recepção), 3 professores.
 *
 * Requer no .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Opcional:
 *   LUTE_DEMO_PASSWORD  — senha para todos os logins criados (mín. 6 caracteres recomendado)
 *
 * Uso: npm run seed:lute-demo
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

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

const DEMO_PW = process.env.LUTE_DEMO_PASSWORD?.trim() || "LuteDemo26";

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.");
  if (url && !serviceKey && process.env.VITE_SUPABASE_ANON_KEY) {
    console.error(
      "\nNota: você tem VITE_SUPABASE_ANON_KEY, mas o seed precisa de SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role). A chave anon não cria usuários em Auth.",
    );
  }
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ALUNOS = [
  { nome: "Ana Carolina Silva", email: "demo.aluno.01@luteacademy.test" },
  { nome: "Bruno Martins Oliveira", email: "demo.aluno.02@luteacademy.test" },
  { nome: "Carla Fernandes Lima", email: "demo.aluno.03@luteacademy.test" },
  { nome: "Diego Souza Rocha", email: "demo.aluno.04@luteacademy.test" },
  { nome: "Elisa Prado Nunes", email: "demo.aluno.05@luteacademy.test" },
  { nome: "Felipe Ramos Costa", email: "demo.aluno.06@luteacademy.test" },
  { nome: "Gabriela Azevedo Lima", email: "demo.aluno.07@luteacademy.test" },
  { nome: "Henrique Lopes Dias", email: "demo.aluno.08@luteacademy.test" },
  { nome: "Isabela Moura Santos", email: "demo.aluno.09@luteacademy.test" },
  { nome: "João Victor Almeida", email: "demo.aluno.10@luteacademy.test" },
];

const COLAB_RECEPCAO = {
  nome: "Mariana Recepção Demo",
  email: "demo.recepcao@luteacademy.test",
};

const PROFESSES = [
  {
    nome: "Carla Andrade Personal",
    email: "demo.prof.01@luteacademy.test",
    area_atuacao: "personal",
    especialidades: ["Pilates", "Funcional"],
  },
  {
    nome: "Eduardo Martins",
    email: "demo.prof.02@luteacademy.test",
    area_atuacao: "professor",
    especialidades: ["Musculação", "Condicionamento Físico"],
  },
  {
    nome: "Helena Dias",
    email: "demo.prof.03@luteacademy.test",
    area_atuacao: "ambos",
    especialidades: ["Box", "Judô"],
  },
];

const PERM_RECEPCAO = {
  dashboard: true,
  alunos: false,
  checkins: false,
  agendamentos: false,
  professores: false,
  receitas: false,
  exercicios: false,
  aulas: false,
  recepcao: true,
  configuracoes: false,
};

async function findAuthUserIdByEmail(email) {
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (hit) return hit.id;
    if (users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function ensureAuthUser(email, password, user_metadata) {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata,
  });
  let userId = created?.user?.id ?? null;

  if (createErr) {
    const msg = createErr.message ?? "";
    if (/already|registered|exists/i.test(msg)) {
      userId = await findAuthUserIdByEmail(email);
      if (!userId) throw new Error(`Usuário Auth não encontrado: ${email}`);
    } else {
      throw createErr;
    }
  }
  return String(userId);
}

function randomMatricula() {
  return "#D" + String(Math.floor(1000 + Math.random() * 9000));
}

function randomCpf11() {
  let s = "";
  for (let i = 0; i < 11; i++) s += String(Math.floor(Math.random() * 10));
  return s;
}

async function uniqueMatricula() {
  for (let i = 0; i < 20; i++) {
    const m = randomMatricula();
    const { data } = await supabase.from("alunos").select("id").eq("matricula", m).maybeSingle();
    if (!data) return m;
  }
  return `#D${Date.now()}`;
}

async function uniqueCpf() {
  for (let i = 0; i < 45; i++) {
    const c = randomCpf11();
    const [aRes, pRes, cRes] = await Promise.all([
      supabase.from("alunos").select("id").eq("cpf", c).maybeSingle(),
      supabase.from("professores").select("id").eq("cpf", c).maybeSingle(),
      supabase.from("colaboradores").select("id").eq("cpf", c).maybeSingle(),
    ]);
    if (!aRes.data && !pRes.data && !cRes.data) return c;
  }
  return `${Date.now()}`.slice(-11).padStart(11, "0");
}

async function seedAlunos() {
  console.log("\n--- Alunos (10) ---");
  for (const a of ALUNOS) {
    const uid = await ensureAuthUser(a.email, DEMO_PW, { nome: a.nome });
    const { data: exist } = await supabase.from("alunos").select("id").eq("email", a.email).maybeSingle();

    const matricula = exist ? null : await uniqueMatricula();
    const cpf = exist ? null : await uniqueCpf();

    if (!exist) {
      const { error } = await supabase.from("alunos").insert({
        nome: a.nome,
        email: a.email,
        matricula,
        cpf,
        rg: "000000000",
        telefone: "(11) 90000-" + String(1000 + Math.floor(Math.random() * 8999)),
        endereco: "Endereço fictício para demo",
        pin: String(Math.floor(1000 + Math.random() * 9000)),
        plano_id: null,
        auth_user_id: uid,
        status_financeiro: "EM_DIA",
        status_matricula: "ATIVO",
        anamnese: {},
        parq: {},
        parq_has_sim: false,
        medidas: {},
      });
      if (error) {
        console.error(`  ✗ ${a.email}:`, error.message);
        continue;
      }
      console.log(`  ✓ ${a.nome} | ${a.email}`);
    } else {
      const { error } = await supabase.from("alunos").update({ auth_user_id: uid }).eq("email", a.email);
      if (error) console.error(`  ✗ atualizar auth ${a.email}:`, error.message);
      else console.log(`  ↻ já existia; auth vinculado | ${a.email}`);
    }
  }
}

async function seedColaboradorRecepcao() {
  console.log("\n--- Colaborador recepção ---");
  const uid = await ensureAuthUser(COLAB_RECEPCAO.email, DEMO_PW, {
    nome: COLAB_RECEPCAO.nome,
  });

  const { data: row } = await supabase.from("colaboradores").select("id").eq("email", COLAB_RECEPCAO.email).maybeSingle();

  if (!row) {
    const cpfColab = await uniqueCpf();
    const { error } = await supabase.from("colaboradores").insert({
      auth_user_id: uid,
      nome: COLAB_RECEPCAO.nome,
      email: COLAB_RECEPCAO.email,
      telefone: "(11) 98888-1111",
      cpf: cpfColab,
      rg: "MG-12.345.678",
      data_nascimento: "1990-05-15",
      endereco: "LuTe Academy — Recepção (demo)",
      permissoes: PERM_RECEPCAO,
      ativo: true,
    });
    if (error) {
      console.error("  ✗", error.message);
      return;
    }
    console.log(`  ✓ ${COLAB_RECEPCAO.nome} | ${COLAB_RECEPCAO.email}`);
  } else {
    const { error } = await supabase
      .from("colaboradores")
      .update({
        auth_user_id: uid,
        permissoes: PERM_RECEPCAO,
        ativo: true,
      })
      .eq("email", COLAB_RECEPCAO.email);
    if (error) console.error("  ✗ atualizar:", error.message);
    else console.log(`  ↻ atualizado permissões/login | ${COLAB_RECEPCAO.email}`);
  }
}

async function seedProfessores() {
  console.log("\n--- Professores (3) ---");
  for (const p of PROFESSES) {
    const uid = await ensureAuthUser(p.email, DEMO_PW, { nome: p.nome });
    const { data: prof } = await supabase.from("professores").select("id").eq("email", p.email).maybeSingle();

    const payloadBase = {
      nome: p.nome,
      email: p.email,
      ativo: true,
      area_atuacao: p.area_atuacao,
      especialidades: p.especialidades,
      horario_trabalho: {},
      telefone: "(11) 97777-" + String(2000 + Math.floor(Math.random() * 6999)),
      cpf: await uniqueCpf(),
      rg: "SP-dummy",
      data_nascimento: "1988-06-01",
      endereco: "São Paulo — demo",
      auth_user_id: uid,
    };

    if (!prof) {
      const { error } = await supabase.from("professores").insert(payloadBase);
      if (error) {
        console.error(`  ✗ ${p.email}:`, error.message);
        continue;
      }
      console.log(`  ✓ ${p.nome} | ${p.email}`);
    } else {
      const { error } = await supabase
        .from("professores")
        .update({
          nome: payloadBase.nome,
          auth_user_id: uid,
          ativo: true,
          area_atuacao: payloadBase.area_atuacao,
          especialidades: payloadBase.especialidades,
          horario_trabalho: {},
        })
        .eq("email", p.email);
      if (error) console.error(`  ✗ atualizar ${p.email}:`, error.message);
      else console.log(`  ↻ atualizado | ${p.email}`);
    }
  }
}

async function main() {
  console.log("LuTe demo seed — senha única:");
  console.log(`  LUTE_DEMO_PASSWORD = "${DEMO_PW}" (altere no .env se quiser)`);
  await seedAlunos();
  await seedColaboradorRecepcao();
  await seedProfessores();
  console.log("\nConcluído. Áreas após login:");
  console.log("  Alunos   → área /aluno/…");
  console.log("  Colaborador recepção → /dashboard (somente dashboard + modo recepção na UI)");
  console.log("  Professores → /professor/dashboard");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
