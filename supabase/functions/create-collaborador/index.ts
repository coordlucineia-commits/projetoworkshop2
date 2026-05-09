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

/** Senha temporária forte (usuário redefine no primeiro login). */
function randomPassword(length = 14): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (x) => chars[x % chars.length]).join("");
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

    const { data: adm, error: admErr } = await admin.rpc("is_admin", { uid: callerId });
    if (admErr || !adm) {
      return json(403, { error: "Apenas o administrador master pode criar colaboradores." });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "JSON inválido." });
    }

    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const telefone = typeof body.telefone === "string" ? body.telefone.trim() : null;
    const cpf = typeof body.cpf === "string" ? body.cpf.trim() : null;
    const rg = typeof body.rg === "string" ? body.rg.trim() : null;
    const data_nascimento =
      typeof body.data_nascimento === "string" && body.data_nascimento.trim()
        ? body.data_nascimento.trim()
        : null;
    const endereco = typeof body.endereco === "string" ? body.endereco.trim() : null;
    const foto = typeof body.foto === "string" ? body.foto : null;
    const permissoes = body.permissoes && typeof body.permissoes === "object" ? body.permissoes : {};

    const appOrigin =
      typeof body.app_origin === "string" && body.app_origin.startsWith("http")
        ? body.app_origin.trim().replace(/\/+$/, "")
        : "";

    if (!nome || !email || !email.includes("@")) {
      return json(400, {
        error: "Informe nome completo e um e-mail válido.",
      });
    }

    const tempPassword = randomPassword(14);

    const { data: novo, error: cErr } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { nome, force_password_change: true },
    });

    if (cErr || !novo.user) {
      const msg =
        (cErr as { message?: string } | undefined)?.message ?? "Erro ao criar usuário de autenticação.";
      return json(409, { error: msg });
    }

    const authUserId = novo.user.id;

    const row = {
      auth_user_id: authUserId,
      nome,
      email,
      telefone,
      cpf,
      rg,
      data_nascimento,
      endereco,
      foto,
      permissoes,
      ativo: true,
      criado_por: callerId,
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insErr } = await admin
      .from("colaboradores")
      .insert(row)
      .select("id")
      .maybeSingle();

    if (insErr || !inserted?.id) {
      await admin.auth.admin.deleteUser(authUserId).catch(() => {});
      const msg =
        (insErr as { message?: string } | undefined)?.message ?? "Erro ao salvar colaborador.";
      return json(422, { error: msg });
    }

    const loginUrl = appOrigin ? `${appOrigin}/login` : "";
    const loginHref = loginUrl ? encodeURI(loginUrl) : "";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:24px;">
  <p>Olá${nome ? `, <strong>${escapeHtml(nome)}</strong>` : ""}.</p>
  <p>Sua conta de <strong>colaborador</strong> na <strong>LuTe Academy</strong> foi criada. Use os dados abaixo para entrar no painel:</p>
  <ul style="line-height:1.8;">
    <li><strong>E-mail (login):</strong> ${escapeHtml(email)}</li>
    <li><strong>Senha temporária:</strong> ${escapeHtml(tempPassword)}</li>
  </ul>
  <p><strong>Link de acesso:</strong> ${
    loginHref
      ? `<a href="${loginHref}" style="color:#00F9E4">${escapeHtml(loginUrl)}</a>`
      : escapeHtml("(acesse o site da academia e use a página de login)")
  }</p>
  <p style="color:#888;font-size:14px;">No primeiro acesso com esta senha, o sistema pedirá que você <strong>crie uma nova senha definitiva</strong>.</p>
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
        subject: "LuTe Academy — acesso ao painel (colaborador)",
        html,
      });
    }

    return json(200, {
      id: inserted.id,
      emailSent,
      email,
      temporaryPassword: emailSent ? undefined : tempPassword,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno.";
    return json(500, { error: msg });
  }
});
