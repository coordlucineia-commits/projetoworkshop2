/**
 * Cria o usuário Auth (lu.t@teste.com / lu1234) e vincula public.alunos.auth_user_id.
 *
 * Requer no .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso: npm run seed:aluno-lu
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

const ALUNO_EMAIL = "lu.t@teste.com";
const ALUNO_PASSWORD = process.env.LU_ALUNO_PASSWORD?.trim() || "lu1234";
const ALUNO_NOME = "Lu Teste";

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (service_role só para este script local).",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

function randomMatricula() {
  return "#" + String(Math.floor(1000 + Math.random() * 9000));
}

function randomCpf11() {
  let s = "";
  for (let i = 0; i < 11; i++) s += String(Math.floor(Math.random() * 10));
  return s;
}

async function main() {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: ALUNO_EMAIL,
    password: ALUNO_PASSWORD,
    email_confirm: true,
    user_metadata: { nome: ALUNO_NOME },
  });

  let userId = created?.user?.id ?? null;

  if (createErr) {
    const msg = createErr.message ?? "";
    if (/already|registered|exists/i.test(msg)) {
      console.warn("Usuário já existe em Auth; apenas vinculando alunos.auth_user_id…");
      userId = await findAuthUserIdByEmail(ALUNO_EMAIL);
      if (!userId) {
        console.error("Não foi possível localizar o usuário Auth pelo e-mail.");
        process.exit(1);
      }
    } else {
      console.error("createUser:", createErr);
      process.exit(1);
    }
  }

  const uidText = String(userId);

  const { data: aluno, error: selErr } = await supabase
    .from("alunos")
    .select("id")
    .eq("email", ALUNO_EMAIL)
    .maybeSingle();

  if (selErr) {
    console.error("Erro ao buscar aluno:", selErr.message);
    process.exit(1);
  }

  if (!aluno) {
    let matricula = randomMatricula();
    for (let i = 0; i < 15; i++) {
      const { data: clash } = await supabase
        .from("alunos")
        .select("id")
        .eq("matricula", matricula)
        .maybeSingle();
      if (!clash) break;
      matricula = randomMatricula();
    }

    let cpf = randomCpf11();
    for (let i = 0; i < 20; i++) {
      const { data: clash } = await supabase
        .from("alunos")
        .select("id")
        .eq("cpf", cpf)
        .maybeSingle();
      if (!clash) break;
      cpf = randomCpf11();
    }

    const { error: insErr } = await supabase.from("alunos").insert({
      nome: ALUNO_NOME,
      email: ALUNO_EMAIL,
      matricula,
      cpf,
      rg: "—",
      telefone: "",
      endereco: "",
      pin: String(Math.floor(1000 + Math.random() * 9000)),
      plano_id: null,
      auth_user_id: uidText,
      status_financeiro: "EM_DIA",
      status_matricula: "ATIVO",
      anamnese: {},
      parq: {},
      parq_has_sim: false,
      medidas: {},
    });

    if (insErr) {
      console.error("Erro ao inserir aluno:", insErr.message);
      process.exit(1);
    }
    console.log("Aluno criado com matrícula", matricula);
  } else {
    const { error: upErr } = await supabase
      .from("alunos")
      .update({ auth_user_id: uidText })
      .eq("email", ALUNO_EMAIL);

    if (upErr) {
      console.error("Erro ao atualizar alunos.auth_user_id:", upErr.message);
      process.exit(1);
    }
  }

  console.log("OK — usuário Auth:", uidText);
  console.log("Login:", ALUNO_EMAIL, "| Senha:", ALUNO_PASSWORD);
  console.log("Área esperada após sign-in: aluno → /aluno/dashboard");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
