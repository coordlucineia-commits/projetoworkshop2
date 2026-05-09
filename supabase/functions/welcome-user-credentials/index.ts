import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function randomPassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => chars[x % chars.length]).join("");
}

async function getMergedMetadata(
  admin: ReturnType<typeof createClient>,
  userId: string,
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) throw error;
  const prev = data.user?.user_metadata;
  const base =
    typeof prev === "object" && prev !== null && !Array.isArray(prev)
      ? { ...(prev as Record<string, unknown>) }
      : {};
  return { ...base, ...patch };
}

async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (hit) return hit.id;
    if (users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function sendViaResend(opts: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  return res.ok;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { error: "Não autorizado." });
    }

    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!url || !serviceKey) {
      return json(500, { error: "Função não configurada (SERVICE_ROLE)." });
    }

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const jwt = authHeader.slice(7).trim();
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user?.id) {
      return json(401, { error: "Token inválido." });
    }

    const callerId = userData.user.id;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "JSON inválido." });
    }

    const kindRaw = body.kind;
    const kind = kindRaw === "professor" || kindRaw === "aluno" ? kindRaw : null;
    const entityId = typeof body.entity_id === "string" ? body.entity_id.trim() : "";
    const appOrigin =
      typeof body.app_origin === "string" && body.app_origin.startsWith("http")
        ? body.app_origin.trim().replace(/\/+$/, "")
        : "";
    const explicitPassword =
      typeof body.password === "string" && body.password.length >= 8 ? body.password : "";

    if (!kind || !entityId) {
      return json(400, { error: "Informe kind ('professor'|'aluno') e entity_id." });
    }

    const perm = kind === "professor" ? "professores" : "alunos";
    const { data: allowed, error: rpcErr } = await admin.rpc("caller_can_issue_credentials", {
      p_uid: callerId,
      p_perm: perm,
    });

    if (rpcErr || allowed !== true) {
      return json(403, { error: "Sem permissão para criar credenciais neste módulo." });
    }

    let email = "";
    let nome = "";
    let authUserIdExisting: string | null = null;

    if (kind === "professor") {
      const { data: row, error: fr } = await admin.from("professores").select("id,email,nome,auth_user_id").eq("id", entityId).maybeSingle();
      if (fr || !row?.email) {
        return json(404, { error: "Professor não encontrado." });
      }
      email = String(row.email).trim().toLowerCase();
      nome = String(row.nome ?? "").trim();
      authUserIdExisting = row.auth_user_id?.trim() ? String(row.auth_user_id) : null;
    } else {
      const { data: row, error: fr } = await admin.from("alunos").select("id,email,nome,auth_user_id").eq("id", entityId).maybeSingle();
      if (fr || !row?.email) {
        return json(404, { error: "Aluno não encontrado." });
      }
      email = String(row.email).trim().toLowerCase();
      nome = String(row.nome ?? "").trim();
      authUserIdExisting = row.auth_user_id?.trim() ? String(row.auth_user_id) : null;
    }

    if (!email || !email.includes("@")) {
      return json(422, { error: "E-mail da pessoa inválido." });
    }

    const password =
      explicitPassword ||
      (kind === "professor" ? randomPassword(12) : randomPassword(10));

    let authUserId = authUserIdExisting;

    if (!authUserId) {
      const { data: novo, error: cErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nome: nome || undefined, force_password_change: true },
      });

      if (novo?.user?.id) {
        authUserId = novo.user.id;
      } else {
        const existing = await findAuthUserIdByEmail(admin, email);
        if (!existing) {
          const msg =
            (cErr as { message?: string } | undefined)?.message ??
            "Não foi possível criar usuário de autenticação.";
          return json(409, { error: msg });
        }
        authUserId = existing;
        const mergedMeta = await getMergedMetadata(admin, existing, {
          ...(nome ? { nome } : {}),
          force_password_change: true,
        });
        const { error: upErr } = await admin.auth.admin.updateUserById(existing, {
          password,
          email_confirm: true,
          user_metadata: mergedMeta,
        });
        if (upErr) {
          return json(409, { error: upErr.message ?? "E-mail já usado por outra conta Auth." });
        }
      }

      if (kind === "professor") {
        await admin
          .from("professores")
          .update({
            auth_user_id: authUserId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entityId);
      } else {
        await admin.from("alunos").update({ auth_user_id: authUserId }).eq("id", entityId);
      }
    } else {
      const mergedMeta = await getMergedMetadata(admin, authUserId, { force_password_change: true });
      await admin.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
        user_metadata: mergedMeta,
      });
    }

    const areaLabel =
      kind === "professor" ? "área do professor/personal" : "área do aluno";
    const loginUrl = appOrigin ? `${appOrigin}/login` : "";
    const loginHref = loginUrl ? encodeURI(loginUrl) : "";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px;">
  <p>Olá${nome ? `, <strong>${escapeHtml(nome)}</strong>` : ""}.</p>
  <p>Sua conta na <strong>LuTe Academy</strong> foi criada. Use os dados abaixo para entrar na <strong>${areaLabel}</strong>:</p>
  <ul style="line-height:1.8;">
    <li><strong>E-mail (login):</strong> ${escapeHtml(email)}</li>
    <li><strong>Senha temporária:</strong> ${escapeHtml(password)}</li>
  </ul>
  <p><strong>Link de acesso:</strong> ${
    loginHref
      ? `<a href="${loginHref}" style="color:#00F9E4">${escapeHtml(loginUrl)}</a>`
      : escapeHtml("(acesse o site da academia e use a página de login)")
  }</p>
  <p style="color:#888;font-size:14px;">No primeiro acesso com esta senha, você será direcionado para <strong>criar uma nova senha definitiva</strong>.</p>
</body>
</html>`;

    const resendKey = Deno.env.get("RESEND_API_KEY")?.trim() ?? "";
    const from =
      Deno.env.get("RESEND_FROM_EMAIL")?.trim() ||
      "LuTe Academy <onboarding@resend.dev>";

    let emailSent = false;
    if (resendKey) {
      emailSent = await sendViaResend({
        apiKey: resendKey,
        from,
        to: email,
        subject: "LuTe Academy — seus dados de acesso",
        html,
      });
    }

    return json(200, {
      emailSent,
      email,
      temporaryPassword: emailSent ? undefined : password,
      message: emailSent
        ? "E-mail enviado com login e senha."
        : "Credenciais criadas. Configure RESEND_API_KEY no projeto para envio automático de e-mail; use a senha temporária retornada para informar o usuário.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno.";
    return json(500, { error: msg });
  }
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
