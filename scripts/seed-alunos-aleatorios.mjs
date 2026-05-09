/**
 * Cria N alunos com dados fictícios (Auth + linha em public.alunos).
 *
 * Requer no .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Opcional:
 *   LUTE_DEMO_PASSWORD — senha para os logins (padrão: LuteDemo26)
 *   SEED_RANDOM_ALUNOS_COUNT — inteiro > 0 (padrão: 3 ou 1º arg da CLI)
 *
 * Uso: npm run seed:alunos-aleatorios
 *      node scripts/seed-alunos-aleatorios.mjs 5
 */

import { randomBytes } from "node:crypto";
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
const rawCount = process.argv[2] ?? process.env.SEED_RANDOM_ALUNOS_COUNT ?? "3";
const parsed = Number.parseInt(String(rawCount), 10);
const COUNT =
  Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 100) : 3;

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (service_role apenas local).",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PRIMEIROS = [
  "Marina",
  "Thiago",
  "Laura",
  "Rafael",
  "Juliana",
  "Gustavo",
  "Beatriz",
  "Lucas",
  "Camila",
  "Felipe",
  "Amanda",
  "Rodrigo",
];

const SEGUNDOS = [
  "Mendes",
  "Carvalho",
  "Freitas",
  "Barros",
  "Nogueira",
  "Ribeiro",
  "Martins",
  "Ferreira",
  "Monteiro",
  "Batista",
  "Teixeira",
  "Corrêa",
];

const CIDADES = [
  "Rua das Flores, 120 — Centro",
  "Av. Brasil, 452 — Vila Nova",
  "Alameda das Palmeiras, 88 — Jardins",
  "Rua do Comércio, 930 — República",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slug(s) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

function randomNomeCompleto() {
  return `${pick(PRIMEIROS)} ${pick(SEGUNDOS)} ${pick(SEGUNDOS)}`;
}

/** E-mail único por execução. */
function randomEmail(nome) {
  const id = randomBytes(4).toString("hex");
  return `seed.${slug(nome)}.${id}@luteacademy.seed`;
}

function randomDddTel() {
  const ddds = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "92"];
  const suf = String(10000 + Math.floor(Math.random() * 89999));
  return `(${pick(ddds)}) 9${suf.slice(0, 4)}-${suf.slice(4)}`;
}

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
  return "#R" + String(Math.floor(1000 + Math.random() * 9000));
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
  return `#R${Date.now()}`;
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

async function main() {
  console.log(`Criando ${COUNT} aluno(s) com dados aleatórios…`);
  console.log(`Senha de login (LUTE_DEMO_PASSWORD): "${DEMO_PW}"\n`);

  const criados = [];
  for (let i = 0; i < COUNT; i++) {
    const nome = randomNomeCompleto();
    const email = randomEmail(nome);
    try {
      const uid = await ensureAuthUser(email, DEMO_PW, { nome });
      const matricula = await uniqueMatricula();
      const cpf = await uniqueCpf();
      const pin = String(Math.floor(1000 + Math.random() * 9000));
      const { error } = await supabase.from("alunos").insert({
        nome,
        email,
        matricula,
        cpf,
        rg: String(100000000 + Math.floor(Math.random() * 899999999)),
        telefone: randomDddTel(),
        endereco: pick(CIDADES),
        data_nascimento: `${1975 + Math.floor(Math.random() * 30)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, "0")}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, "0")}`,
        sexo: pick(["M", "F", "O"]),
        estado_civil: pick(["solteiro", "casado", "divorciado", "viuvo", "outro"]),
        observacoes: `Cadastro automático (${new Date().toISOString().slice(0, 10)}).`,
        pin,
        plano_id: null,
        auth_user_id: uid,
        status_financeiro: "EM_DIA",
        status_matricula: "ATIVO",
        anamnese: {},
        parq: {},
        parq_has_sim: Math.random() < 0.2,
        medidas: {},
      });
      if (error) {
        console.error(`  ✗ ${email}:`, error.message);
        continue;
      }
      console.log(`  ✓ ${nome}`);
      console.log(`      ${email} | matrícula ${matricula} | PIN ${pin}`);
      criados.push({ nome, email, matricula });
    } catch (e) {
      console.error(`  ✗ falha (${email ?? nome}):`, e?.message ?? e);
    }
  }

  console.log(`\nConcluído: ${criados.length}/${COUNT}. Login na área do aluno → /login (e-mail acima).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
