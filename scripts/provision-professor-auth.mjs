/**
 * Cria usuário Auth para um e-mail já cadastrado em `public.professores` e define `auth_user_id`.
 * Resolve o caso em que o professor existe na base mas ainda não pode fazer login (auth_user_id nulo).
 *
 * Requer no .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   node scripts/provision-professor-auth.mjs anaclara@gmail.com
 *   node scripts/provision-professor-auth.mjs anaclara@gmail.com MinhaSenh@Forte123
 *
 * Senha sem segundo argumento: variável PROFESSOR_AUTH_PASSWORD no .env, ou padrão interno (≥6 caracteres).
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

const emailArg = process.argv[2]?.trim().toLowerCase();
const passwordArg = process.argv[3]?.trim();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const senha =
  passwordArg ||
  process.env.PROFESSOR_AUTH_PASSWORD?.trim() ||
  "ProfessorAuth2026";

if (!emailArg || !emailArg.includes("@")) {
  console.error("Uso: node scripts/provision-professor-auth.mjs <email-professor> [senha]");
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error(
    "Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (service_role — nunca commitar).",
  );
  process.exit(1);
}

if (senha.length < 6) {
  console.error("Senha com pelo menos 6 caracteres (regra típica do Supabase Auth).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findAuthUserIdByEmail(email) {
  const target = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (hit) return hit.id;
    if (users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function main() {
  const { data: prof, error: selErr } = await supabase
    .from("professores")
    .select("id, nome, email, auth_user_id")
    .eq("email", emailArg)
    .maybeSingle();

  if (selErr) {
    console.error("Erro ao buscar professor:", selErr.message);
    process.exit(1);
  }

  if (!prof) {
    console.error(`Nenhuma linha em professores com email: ${emailArg}`);
    process.exit(1);
  }

  let userId = prof.auth_user_id ?? null;

  if (userId) {
    const { error: pwdErr } = await supabase.auth.admin.updateUserById(userId, {
      password: senha,
    });
    if (pwdErr) {
      console.error("Professor já tinha auth_user_id; falha ao atualizar senha:", pwdErr.message);
      process.exit(1);
    }
    console.log("Senha atualizada para usuário já vinculado.");
    console.log("Login:", emailArg);
    return;
  }

  const nomeMeta = (prof.nome ?? "Professor").trim() || "Professor";

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: emailArg,
    password: senha,
    email_confirm: true,
    user_metadata: { nome: nomeMeta },
  });

  if (createErr) {
    const msg = createErr.message ?? "";
    if (/already|registered|exists/i.test(msg)) {
      console.warn("Usuário Auth já existia; vinculando professores.auth_user_id…");
      userId = await findAuthUserIdByEmail(emailArg);
      if (!userId) {
        console.error("Não foi possível localizar o usuário Auth pelo e-mail.");
        process.exit(1);
      }
      const { error: pwdErr } = await supabase.auth.admin.updateUserById(userId, {
        password: senha,
      });
      if (pwdErr) console.warn("Aviso: não foi possível atualizar senha:", pwdErr.message);
    } else {
      console.error("createUser:", createErr);
      process.exit(1);
    }
  } else {
    userId = created?.user?.id ?? null;
  }

  if (!userId) {
    console.error("Falha ao obter id do usuário Auth.");
    process.exit(1);
  }

  const { error: upErr } = await supabase
    .from("professores")
    .update({ auth_user_id: userId })
    .eq("id", prof.id);

  if (upErr) {
    console.error("Erro ao atualizar professores.auth_user_id:", upErr.message);
    process.exit(1);
  }

  console.log("OK — conta Auth criada/vinculada.");
  console.log("Usuário:", userId);
  console.log("Login:", emailArg);
  console.log("Área após sign-in: professor → /professor/dashboard");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
