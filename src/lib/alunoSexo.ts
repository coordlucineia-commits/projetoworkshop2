/** Cadastro do aluno usa `F` para Feminino (NovoAlunoPage). Aceita texto legado. */
export function isSexoFemininoAluno(sexo: string | null | undefined): boolean {
  const t = (sexo ?? "").trim();
  if (!t) return false;
  if (t === "F" || /^feminino$/i.test(t)) return true;
  return false;
}
