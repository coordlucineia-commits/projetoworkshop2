import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useStaffSession } from "../context/StaffSessionContext";
import { fetchLoginAreaAfterSignIn, pathForLoginArea } from "../../lib/authRedirect";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { getFirstAllowedStaffPath } from "../../lib/staffNavHome";

/** Rotas só para administrador institucional (super_admin + `is_admin`). Colaborador é redirecionado ao primeiro módulo permitido. */
export function useRequireSuperAdmin(): { ready: boolean; checking: boolean } {
  const navigate = useNavigate();
  const { loading, role, permissoes } = useStaffSession();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function redirectNonSuperAdmin() {
      const supabase = getSupabase();
      const areaTag = await fetchLoginAreaAfterSignIn(supabase);
      if (cancelled) return;
      if (areaTag === "professor") {
        navigate("/professor/dashboard", { replace: true });
        return;
      }
      if (areaTag === "aluno") {
        navigate("/aluno/dashboard", { replace: true });
        return;
      }
      const fallback =
        role === "colaborador" ? getFirstAllowedStaffPath("colaborador", permissoes) : null;
      navigate(fallback ?? "/login", { replace: true });
    }

    async function verify() {
      if (!isSupabaseConfigured || loading) return;
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate("/login", { replace: true });
        if (!cancelled) setChecking(false);
        return;
      }
      if (role !== "super_admin") {
        await redirectNonSuperAdmin();
        if (!cancelled) setChecking(false);
        return;
      }
      const { data: ok, error } = await supabase.rpc("is_admin", {
        uid: session.user.id,
      });
      if (cancelled) return;
      if (error || !ok) {
        await redirectNonSuperAdmin();
        setChecking(false);
        return;
      }
      setReady(true);
      setChecking(false);
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [navigate, loading, role, permissoes]);

  return { ready, checking: checking || loading };
}
