/** Chaves gravadas em `avaliacoes.circunferencias` (JSON). Labels para UI. */
export const CIRC_KEYS = [
  ["busto_cm", "Busto"],
  ["cintura_cm", "Cintura"],
  ["quadril_cm", "Quadril"],
  ["braco_esquerdo_cm", "Braço esquerdo"],
  ["braco_direito_cm", "Braço direito"],
  ["antebraco_esq_cm", "Antebraço esquerdo"],
  ["antebraco_dir_cm", "Antebraço direito"],
  ["coxa_esquerda_cm", "Coxa esquerda"],
  ["coxa_direita_cm", "Coxa direita"],
  ["panturrilha_esq_cm", "Panturrilha esquerda"],
  ["panturrilha_dir_cm", "Panturrilha direita"],
] as const;

export type CircKey = (typeof CIRC_KEYS)[number][0];

export function parseCircJson(j: unknown): Partial<Record<CircKey, number | null>> {
  if (!j || typeof j !== "object" || Array.isArray(j)) return {};
  const o = j as Record<string, unknown>;
  const out: Partial<Record<CircKey, number | null>> = {};
  for (const [k] of CIRC_KEYS) {
    const v = o[k];
    if (v == null || v === "") {
      out[k] = null;
      continue;
    }
    const n = typeof v === "number" ? v : Number.parseFloat(String(v));
    out[k] = Number.isFinite(n) ? n : null;
  }
  return out;
}

export function formatCm(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} cm`;
}
