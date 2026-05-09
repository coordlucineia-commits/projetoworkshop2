/** Especialidade usada para filtrar professores que podem fazer avaliação corporal. */
export const ESPECIALIDADE_AVALIACAO_CORPORAL = "Avaliação Corporal";

/** Opções oficiais (checkbox no cadastro de professor); manter sincronizado com o admin. */
export const ESPECIALIDADES_PROFESSOR_OPTS = [
  "Musculação",
  "Pilates",
  "Box",
  "Dança",
  "Judô",
  "Lutas em geral",
  "Funcional",
  "Reabilitação",
  ESPECIALIDADE_AVALIACAO_CORPORAL,
  "Nutrição Esportiva",
  "Condicionamento Físico",
  "Outro",
] as const;

export type EspecialidadeProfessorLabel = (typeof ESPECIALIDADES_PROFESSOR_OPTS)[number];

/** Normaliza campo `professores.especialidades` (jsonb array). */
export function parseProfEspecialidadesJson(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((x): x is string => typeof x === "string");
}

export function professorTemAvaliacaoCorporal(especialidades: unknown): boolean {
  return parseProfEspecialidadesJson(especialidades).includes(ESPECIALIDADE_AVALIACAO_CORPORAL);
}
