/**
 * Redefine a senha de um usuário Supabase Auth pelo e-mail (admin API).
 *
 * Requer no .env: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   node scripts/reset-auth-email-password.mjs lu.t@teste.com
 *   node scripts/reset-auth-email-password.mjs lu.t@teste.com NovaSenhaForte123
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

if (!emailArg || !emailArg.includes("@")) {
  console.error("Uso: node scripts/reset-auth-email-password.mjs <email> [novaSenha]");
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error("Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.");
  process.exit(1);
}

const novaSenha =
  passwordArg ||
  process.env.LU_ALUNO_PASSWORD?.trim() ||
  "lu1234";

if (novaSenha.length < 6) {
  console.error("A senha deve ter pelo menos 6 caracteres (regra típica do Supabase Auth).");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findAuthUserId(targetEmail) {
  const target = targetEmail.trim().toLowerCase();
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
  const uid = await findAuthUserId(emailArg);
  if (!uid) {
    console.error(`Nenhum usuário Auth encontrado para: ${emailArg}`);
    process.exit(1);
  }
  const { error } = await supabase.auth.admin.updateUserById(uid, {
    password: novaSenha,
  });
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`Senha redefinida para ${emailArg}`);
  if (!passwordArg) {
    console.log('Senha usada: variável LU_ALUNO_PASSWORD no .env, ou "lu1234".');
    console.log("Para definir na hora: node scripts/reset-auth-email-password.mjs EMAIL NOVASENHA");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
