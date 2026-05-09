export const REFEICOES_RECEITA_DB = [
  "cafe_manha",
  "lanche_manha",
  "almoco",
  "lanche_tarde",
  "jantar",
] as const;
export type RefeicaoReceitaDb = (typeof REFEICOES_RECEITA_DB)[number];

export const LABEL_REFEICAO: Record<RefeicaoReceitaDb, string> = {
  cafe_manha: "Café da manhã",
  lanche_manha: "Lanche da manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche da tarde",
  jantar: "Jantar",
};

export const CATEGORIA_RECEITA_DB = ["perda_peso", "ganho_massa"] as const;
export type CategoriaReceitaDb = (typeof CATEGORIA_RECEITA_DB)[number];
export const LABEL_CATEGORIA: Record<CategoriaReceitaDb, string> = {
  perda_peso: "Perda de peso",
  ganho_massa: "Ganho de massa",
};

export const GRUPOS_MUSCULARES_ADMIN = [
  "braço",
  "costas",
  "peito",
  "ombro",
  "abdomen",
  "pernas",
  "outro",
] as const;
export type GrupoMuscAdmin = (typeof GRUPOS_MUSCULARES_ADMIN)[number];
export const LABEL_GRUPO: Record<string, string> = {
  "braço": "Braço",
  costas: "Costas",
  peito: "Peito",
  ombro: "Ombro",
  abdomen: "Abdômen",
  pernas: "Pernas",
  outro: "Outro",
};

export const SALAS_AULA = ["Sala A", "Sala B"] as const;

export const PERSONAL_CANCEL_MIN_HOURS = 24;

export const WEEKDAY_BR_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

/** dia_semana 1=Segunda … 7=Domingo */
export function weekdayBrShortFromDow(dia: number): string {
  if (dia < 1 || dia > 7) return "?";
  return WEEKDAY_BR_SHORT[dia - 1]!;
}
