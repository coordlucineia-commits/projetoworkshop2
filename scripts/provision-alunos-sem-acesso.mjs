/**
 * Provisiona credenciais Auth para TODOS os alunos que não têm auth_user_id
 * (ou cujo usuário Auth não existe mais) e redefine senha para alunos já vinculados.
 *
 * Requer no .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   node scripts/provision-alunos-sem-acesso.mjs
 *   node scripts/provision-alunos-sem-acesso.mjs --reset-all   (redefine senha até para vinculados)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// ── carrega .env local ────────────────────────────────────────────────────────
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

const RESET_ALL = process.argv.includes("--reset-all");

// ── helpers ───────────────────────────────────────────────────────────────────
const CHARS_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const CHARS_LOWER = "abcdefghjkmnpqrstuvwxyz";
const CHARS_DIGIT = "23456789";

/** Gera senha legível de 8 caracteres: Aa000000 */
function gerarSenha() {
  const r = () => Math.floor(Math.random() * 1e9);
  const u = CHARS_UPPER[r() % CHARS_UPPER.length];
  const l = CHARS_LOWER[r() % CHARS_LOWER.length];
  const d1 = CHARS_DIGIT[r() % CHARS_DIGIT.length];
  const d2 = CHARS_DIGIT[r() % CHARS_DIGIT.length];
  const d3 = CHARS_DIGIT[r() % CHARS_DIGIT.length];
  const d4 = CHARS_DIGIT[r() % CHARS_DIGIT.length];
  const d5 = CHARS_DIGIT[r() % CHARS_DIGIT.length];
  const d6 = CHARS_DIGIT[r() % CHARS_DIGIT.length];
  return `${u}${l}${d1}${d2}${d3}${d4}${d5}${d6}`;
}

async function findAuthUserByEmail(supabase, email) {
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (users.length < 200) break;
    page++;
  }
  return null;
}

// ── main ──────────────────────────────────────────────────────────────────────
const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Busca todos os alunos
  const { data: alunos, error: selErr } = await supabase
    .from("alunos")
    .select("id, nome, email, auth_user_id, status_matricula")
    .order("nome");

  if (selErr) {
    console.error("Erro ao buscar alunos:", selErr.message);
    process.exit(1);
  }

  console.log(`\nTotal de alunos encontrados: ${alunos.length}\n`);

  const resultados = [];

  for (const aluno of alunos) {
    const { id, nome, email, auth_user_id } = aluno;
    let status = "";
    let senhaGerada = "";
    let userId = auth_user_id;

    try {
      if (!auth_user_id || RESET_ALL) {
        // ── Caso 1: sem auth_user_id → tenta criar ou encontrar ─────────────
        const existente = await findAuthUserByEmail(supabase, email);

        if (existente && !auth_user_id) {
          // usuário existe em Auth mas aluno não está vinculado
          userId = existente.id;
          senhaGerada = gerarSenha();
          await supabase.auth.admin.updateUserById(userId, { password: senhaGerada });
          const { error: upErr } = await supabase
            .from("alunos")
            .update({ auth_user_id: userId })
            .eq("id", id);
          if (upErr) throw upErr;
          status = "vinculado (usuário Auth já existia) + senha redefinida";
        } else if (!existente) {
          // precisa criar usuário
          senhaGerada = gerarSenha();
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password: senhaGerada,
            email_confirm: true,
            user_metadata: { nome },
          });
          if (createErr) throw createErr;
          userId = created.user.id;
          const { error: upErr } = await supabase
            .from("alunos")
            .update({ auth_user_id: userId })
            .eq("id", id);
          if (upErr) throw upErr;
          status = "criado no Auth + auth_user_id atualizado";
        } else if (RESET_ALL && existente) {
          // --reset-all: redefine senha de quem já tem vínculo
          userId = existente.id;
          senhaGerada = gerarSenha();
          await supabase.auth.admin.updateUserById(userId, { password: senhaGerada });
          status = "senha redefinida";
        }
      } else {
        // ── Caso 2: já tem auth_user_id → confirma existência ───────────────
        const existente = await findAuthUserByEmail(supabase, email);
        if (existente) {
          status = "OK (já vinculado, usuário Auth confirmado)";
          senhaGerada = "(senha existente — use --reset-all para redefinir)";
        } else {
          // auth_user_id preenchido mas usuário não existe → recria
          senhaGerada = gerarSenha();
          const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email,
            password: senhaGerada,
            email_confirm: true,
            user_metadata: { nome },
          });
          if (createErr) throw createErr;
          userId = created.user.id;
          const { error: upErr } = await supabase
            .from("alunos")
            .update({ auth_user_id: userId })
            .eq("id", id);
          if (upErr) throw upErr;
          status = "RECRIADO (auth_user_id estava dangling) + atualizado";
        }
      }
    } catch (err) {
      status = `ERRO: ${err.message ?? err}`;
      senhaGerada = "—";
    }

    resultados.push({ nome, email, auth_user_id: userId, senha: senhaGerada, status });
    console.log(`[${nome}] ${status}`);
  }

  // ── imprime tabela final ──────────────────────────────────────────────────
  console.log("\n" + "═".repeat(90));
  console.log("TABELA DE CREDENCIAIS — ALUNOS");
  console.log("═".repeat(90));
  console.log(
    padR("Nome", 30) +
    padR("E-mail", 32) +
    padR("Senha gerada", 18) +
    "Observação"
  );
  console.log("─".repeat(90));
  for (const r of resultados) {
    console.log(
      padR(r.nome, 30) +
      padR(r.email, 32) +
      padR(r.senha, 18) +
      r.status
    );
  }
  console.log("═".repeat(90));
  console.log("\nANOTE as senhas acima — elas não ficam armazenadas em texto plano.\n");
}

function padR(str, n) {
  return String(str ?? "").padEnd(n).slice(0, n);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
