/** Compara pelo nome cadastrado em `planos` (case-insensitive). */
export function planNameIncludes(planoNome: string | null | undefined, needle: string) {
  return (planoNome ?? "").toLowerCase().includes(needle.toLowerCase());
}

export function planHasPersonalSessions(planoNome: string | null | undefined): boolean {
  return (
    planNameIncludes(planoNome, "plus") ||
    planNameIncludes(planoNome, "elite")
  );
}

export function personalMonthlyQuota(planoNome: string | null | undefined): number {
  if (planNameIncludes(planoNome, "elite")) return 4;
  if (planNameIncludes(planoNome, "plus")) return 2;
  return 0;
}

export function planTierLabel(planoNome: string | null | undefined): string {
  if (planHasPersonalSessions(planoNome))
    return planNameIncludes(planoNome, "elite") ? "Elite" : "Plus";
  if (planNameIncludes(planoNome, "premium")) return "Premium";
  if (planNameIncludes(planoNome, "basic")) return "Basic";
  return planoNome?.trim() || "Sem plano";
}
