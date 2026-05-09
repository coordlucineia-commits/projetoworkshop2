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

/** Senha temporária de 8 caracteres — fácil de comunicar em tela/toast */
function randomTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const all = upper + lower + digits;
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  // Garante pelo menos 1 maiúscula, 1 minúscula, 1 dígito
  return (
    upper[arr[0] % upper.length] +
    lower[arr[1] % lower.length] +
    digits[arr[2] % digits.length] +
    Array.from({ length: 5 }, (_, i) => all[arr[3 + i] % all.length]).join("")
  );
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

async function findAuthUserId(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (hit) return hit.id;
    if (users.length < 200) break;
    page++;
  }
  return null;
}

async function sendResend(opts: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: opts.from, to: [opts.to], subject: opts.subject, html: opts.html }),
  });
  return res.ok;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!url || !serviceKey) return json(500, { error: "Função não configurada." });

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return json(400, { error: "JSON inválido." }); }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const appOrigin = typeof body.app_origin === "string" && body.app_origin.startsWith("http")
      ? body.app_origin.trim().replace(/\/+$/, "") : "";

    if (!email || !email.includes("@")) return json(400, { error: "Informe um e-mail válido." });

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authUserId = await findAuthUserId(admin, email);
    if (!authUserId) {
      // Não revelamos se o e-mail existe (segurança)
      return json(200, { sent: true });
    }

    const tempPassword = randomTempPassword();

    const mergedMeta = await getMergedMetadata(admin, authUserId, { force_password_change: true });

    const { error: updErr } = await admin.auth.admin.updateUserById(authUserId, {
      password: tempPassword,
      user_metadata: mergedMeta,
    });
    if (updErr) return json(500, { error: "Não foi possível redefinir a senha. Tente novamente." });

    const loginUrl = appOrigin ? `${appOrigin}/login` : "";
    const resendKey = Deno.env.get("RESEND_API_KEY")?.trim() ?? "";
    const from = Deno.env.get("RESEND_FROM_EMAIL")?.trim() || "LuTe Academy <onboarding@resend.dev>";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family:system-ui,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:32px;max-width:520px;margin:0 auto;">
  <div style="text-align:center;margin-bottom:24px;">
    <span style="font-size:22px;font-weight:900;letter-spacing:-1px;">Lu<span style="color:#00F9E4;">Te</span> Academy</span>
  </div>
  <p>Recebemos uma solicitação de recuperação de senha para o e-mail abaixo. Use esse mesmo endereço como <strong>login</strong>, com a senha temporária:</p>
  <p style="font-size:15px;margin:12px 0;"><strong>${escapeHtml(email)}</strong></p>
  <div style="background:#111;border:1px solid #2A2A2A;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
    <p style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Senha temporária</p>
    <p style="font-size:28px;font-weight:900;letter-spacing:4px;color:#00F9E4;margin:0;font-family:monospace;">${escapeHtml(tempPassword)}</p>
  </div>
  ${loginUrl ? `<p style="text-align:center;"><a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#00F9E4;color:#0A0A0A;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px;">Ir para o login</a></p>` : ""}
  <p style="color:#888;font-size:13px;margin-top:24px;">Ao entrar com esta senha, você será solicitado a criar uma nova senha definitiva.</p>
  <p style="color:#555;font-size:12px;">Se você não solicitou a recuperação, ignore este e-mail.</p>
</body>
</html>`;

    let emailSent = false;
    let tempPasswordForResponse: string | undefined;

    if (resendKey) {
      emailSent = await sendResend({ apiKey: resendKey, from, to: email, subject: "LuTe Academy — recuperação de senha", html });
    } else {
      // Sem Resend: retorna a senha para o app exibir no toast (ambiente dev/sem e-mail configurado)
      tempPasswordForResponse = tempPassword;
    }

    return json(200, { sent: true, emailSent, tempPassword: tempPasswordForResponse });
  } catch (e) {
    return json(500, { error: e instanceof Error ? e.message : "Erro interno." });
  }
});
