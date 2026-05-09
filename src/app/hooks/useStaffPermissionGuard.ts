import { useEffect } from "react";
import { useNavigate } from "react-router";
import { staffHasPerm, useStaffSession } from "../context/StaffSessionContext";
import type { StaffPermKey } from "../../lib/staffPermKeys";
import { getFirstAllowedStaffPath, type StaffHomeRole } from "../../lib/staffNavHome";

/**
 * Redireciona para a primeira rota administrativa permitida se faltar permissão (super-admin sempre autorizado).
 * Usar com useRequireStaff() já em ready.
 */
export function useStaffPermissionGuard(required: StaffPermKey): { checking: boolean } {
  const navigate = useNavigate();
  const { loading, role, permissoes } = useStaffSession();

  useEffect(() => {
    if (loading) return;
    if (!staffHasPerm(role, permissoes, required)) {
      const homeRole: StaffHomeRole =
        role === "super_admin" ? "super_admin" : role === "colaborador" ? "colaborador" : "none";
      const fallback = getFirstAllowedStaffPath(homeRole, permissoes);
      navigate(fallback ?? "/login", { replace: true });
    }
  }, [loading, role, permissoes, required, navigate]);

  return { checking: loading };
}
