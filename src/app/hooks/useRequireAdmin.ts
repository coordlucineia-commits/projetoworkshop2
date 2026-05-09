/**
 * Guard da área `/dashboard`, `/alunos`, etc.: usuário institucional (admin LuTe OU colaborador ativo).
 * Ver `useRequireStaff` para a implementação.
 */
export { useRequireStaff, useRequireStaff as useRequireAdmin } from "./useRequireStaff";
