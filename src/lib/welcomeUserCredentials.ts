import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type WelcomeCredentialsResult = {
  emailSent?: boolean;
  email?: string;
  temporaryPassword?: string;
  message?: string;
  error?: string;
};

/**
 * Cria/atualiza usuário Supabase Auth, vincula professor ou aluno e envia e-mail com login e senha
 * (Edge Function `welcome-user-credentials`; requer deploy + RESEND_API_KEY para envio).
 */
export async function invokeWelcomeUserCredentials(
  sb: SupabaseClient<Database>,
  body: {
    kind: "professor" | "aluno";
    entity_id: string;
    password?: string;
  },
): Promise<WelcomeCredentialsResult> {
  const app_origin =
    typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";

  const { data, error } = await sb.functions.invoke("welcome-user-credentials", {
    body: {
      ...body,
      app_origin,
    },
  });

  const raw = data as (WelcomeCredentialsResult & { error?: string }) | null;

  if (error) {
    return {
      error:
        error.message ??
        "Erro ao chamar função welcome-user-credentials (confira deploy no Supabase e sessão válida).",
    };
  }
  if (raw && typeof raw === "object" && typeof raw.error === "string") {
    return { error: raw.error };
  }
  return raw ?? {};
}
