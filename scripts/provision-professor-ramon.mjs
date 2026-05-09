/**
 * Cria o usuário Auth (ramon@luteacademy.com.br) e associa auth_user_id em public.professores.
 *
 * Requer no .env (ou variáveis de ambiente):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Dashboard → Settings → API → service_role — nunca commitar)
 *
 * Uso: npm run seed:professor-ramon
 *
 * Senha padrão: 1234 — o Supabase costuma exigir mínimo de 6 caracteres.
 * Se createUser falhar, em Authentication → Providers → Email ajuste "Minimum password length"
 * para 4 ou defina `RAMON_PASSWORD` no `.env` com senha de 6+ caracteres.
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

const RAMON_EMAIL = "ramon@luteacademy.com.br";
/** `.env`: `RAMON_PASSWORD=...` (recommended ≥6 chars unless Dashboard Email min length is 4). */
const RAMON_PASSWORD = process.env.RAMON_PASSWORD?.trim() || "1234";

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

async function main() {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: RAMON_EMAIL,
    password: RAMON_PASSWORD,
    email_confirm: true,
    user_metadata: { nome: "Ramon" },
  });

  let userId = created?.user?.id ?? null;

  if (createErr) {
    const msg = createErr.message ?? "";
    if (/already|registered|exists/i.test(msg)) {
      console.warn("Usuário já existe em Auth; apenas vinculando professores.auth_user_id…");
      userId = await findAuthUserIdByEmail(RAMON_EMAIL);
      if (!userId) {
        console.error("Não foi possível localizar o usuário Auth pelo e-mail.");
        process.exit(1);
      }
    } else {
      console.error("createUser:", createErr);
      console.error(
        "\nSe o erro for política de senha (tamanho mínimo), no Dashboard: Authentication → Providers → Email,\nou use senha com ≥6 caracteres e altere RAMON_PASSWORD neste script.",
      );
      process.exit(1);
    }
  }

  const uidText = String(userId);

  const { data: prof, error: selErr } = await supabase
    .from("professores")
    .select("id")
    .eq("email", RAMON_EMAIL)
    .maybeSingle();

  if (selErr) {
    console.error("Erro ao buscar professor:", selErr.message);
    process.exit(1);
  }

  if (!prof) {
    const { error: insErr } = await supabase.from("professores").insert({
      nome: "Ramon",
      email: RAMON_EMAIL,
      ativo: true,
      area_atuacao: "ambos",
      especialidades: [],
      horario_trabalho: {},
      auth_user_id: uidText,
    });
    if (insErr) {
      console.error("Erro ao inserir professor:", insErr.message);
      process.exit(1);
    }
  } else {
    const { error: upErr } = await supabase
      .from("professores")
      .update({ auth_user_id: uidText })
      .eq("email", RAMON_EMAIL);

    if (upErr) {
      console.error("Erro ao atualizar professores.auth_user_id:", upErr.message);
      process.exit(1);
    }
  }

  console.log("OK — usuário Auth:", uidText);
  console.log("Login:", RAMON_EMAIL, "| Área esperada após sign-in: professor → /professor/dashboard");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
