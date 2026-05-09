import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { parseStaffContext } from "../app/context/StaffSessionContext";
import { getFirstAllowedStaffPath } from "./staffNavHome";

export type LoginArea = "admin" | "colaborador" | "professor" | "aluno" | "none";

export function pathForLoginArea(area: LoginArea): string {
  switch (area) {
    case "admin":
      return "/dashboard";
    case "colaborador":
      return "/dashboard";
    case "professor":
      return "/professor/dashboard";
    case "aluno":
      return "/aluno/dashboard";
    default:
      return "/login";
  }
}

/** Após signIn — descobre perfil no banco e retorna área principal. */
export async function fetchLoginAreaAfterSignIn(
  supabase: SupabaseClient<Database>,
): Promise<LoginArea> {
  const { data, error } = await supabase.rpc("resolve_user_app_area");

  const raw =
    typeof data === "string" ? data.trim().toLowerCase() : String(data ?? "");
  if (error) console.warn("[resolve_user_app_area]", error.message);

  if (raw === "admin") return "admin";
  if (raw === "colaborador") return "colaborador";
  if (raw === "professor") return "professor";
  if (raw === "aluno") return "aluno";
  return "none";
}

export type LoginDestinationResult =
  | { ok: true; path: string }
  | { ok: false; code: "no_profile" | "no_colaborador_perm" };

/**
 * Caminho após login com senha correta: área conforme cadastro (aluno / professor / admin / colaborador).
 * Colaboradores vão à primeira rota liberada nas permissões (não exige módulo "dashboard").
 */
export async function resolveLoginDestination(
  supabase: SupabaseClient<Database>,
): Promise<LoginDestinationResult> {
  const area = await fetchLoginAreaAfterSignIn(supabase);
  if (area === "none") return { ok: false, code: "no_profile" };
  if (area === "aluno") return { ok: true, path: "/aluno/dashboard" };
  if (area === "professor") return { ok: true, path: "/professor/dashboard" };
  if (area === "admin") return { ok: true, path: "/dashboard" };

  const { data, error } = await supabase.rpc("meu_staff_context");
  if (error) {
    console.warn("[resolveLoginDestination] meu_staff_context", error.message);
    return { ok: false, code: "no_profile" };
  }
  const row = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  const parsed = parseStaffContext(row);
  if (parsed.role !== "colaborador") {
    return { ok: false, code: "no_profile" };
  }
  const path = getFirstAllowedStaffPath("colaborador", parsed.permissoes);
  if (!path) return { ok: false, code: "no_colaborador_perm" };
  return { ok: true, path };
}
