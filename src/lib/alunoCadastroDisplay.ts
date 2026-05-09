/**
 * Rótulos alinhados ao cadastro em `NovoAlunoPage` (anamnese, PAR-Q, objetivos).
 */

export const OBJETIVOS_ALUNO_OPÇÕES = [
  "Emagrecimento",
  "Hipertrofia",
  "Condicionamento Físico",
  "Reabilitação",
  "Saúde Geral",
  "Outro",
] as const;

export type AnamneseItem = {
  key: string;
  label: string;
  options?: string[];
};

/** Mesma ordem e chaves do formulário de cadastro. */
export const ANAMNESE_ITENS: AnamneseItem[] = [
  { key: "doenca", label: "Possui alguma doença diagnosticada?" },
  { key: "cardiaco", label: "Problemas cardíacos?" },
  { key: "pressao", label: "Pressão alta ou baixa?", options: ["NÃO", "ALTA", "BAIXA"] },
  { key: "diabetes", label: "Possui diabetes?" },
  { key: "desmaios", label: "Desmaios ou tonturas frequentes?" },
  { key: "respiratorio", label: "Problemas respiratórios?" },
  { key: "articular", label: "Problemas articulares?" },
  { key: "cirurgia", label: "Já realizou cirurgia?" },
  { key: "medicacao", label: "Faz uso de medicação contínua?" },
  { key: "gestante", label: "Está gestante?", options: ["SIM", "NÃO", "N/A"] },
  { key: "limitacao", label: "Possui limitação física?" },
  { key: "recomMedica", label: "Possui recomendação médica para prática de exercícios?" },
];

export const PARQ_ITENS: { key: string; label: string }[] = [
  { key: "p1", label: "Algum médico já disse que você possui problema cardíaco?" },
  { key: "p2", label: "Sente dor no peito ao realizar atividade física?" },
  { key: "p3", label: "Sentiu dor no peito no último mês?" },
  {
    key: "p4",
    label: "Perde o equilíbrio por tontura ou já perdeu a consciência?",
  },
  {
    key: "p5",
    label: "Possui problema ósseo ou articular que pode piorar com exercício?",
  },
  {
    key: "p6",
    label: "Seu médico já recomendou restrição de atividade física?",
  },
];

export function labelSexo(v: string | null | undefined): string {
  const s = (v ?? "").trim().toUpperCase();
  if (s === "F") return "Feminino";
  if (s === "M") return "Masculino";
  if (s === "O") return "Outro";
  return v?.trim() || "—";
}

export function labelEstadoCivil(v: string | null | undefined): string {
  const m: Record<string, string> = {
    solteiro: "Solteiro(a)",
    casado: "Casado(a)",
    divorciado: "Divorciado(a)",
    viuvo: "Viúvo(a)",
    outro: "Outro",
  };
  const k = (v ?? "").trim().toLowerCase();
  return m[k] ?? (v?.trim() || "—");
}

export function labelJaTreinou(v: string | null | undefined): string {
  const k = (v ?? "").trim().toLowerCase();
  if (k === "sim") return "Sim";
  if (k === "nao" || k === "não") return "Não";
  return v?.trim() || "—";
}

const VEZES_LABEL: Record<string, string> = {
  "1": "1× por semana",
  "2": "2× por semana",
  "3": "3× por semana",
  "4": "4× por semana",
  "5": "5× por semana",
  "6": "6× por semana",
  "7": "Todos os dias",
};

export function labelVezesSemana(v: string | null | undefined): string {
  const k = (v ?? "").trim();
  return VEZES_LABEL[k] ?? (k ? k : "—");
}
