import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useStaffSession } from "../context/StaffSessionContext";
import { fetchLoginAreaAfterSignIn, pathForLoginArea } from "../../lib/authRedirect";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

/**
 * Área administrativa da equipe: apenas quem resolve como `admin` ou `colaborador`
 * (`resolve_user_app_area`), com contexto `meu_staff_context` compatível.
 * Alunos/professores autenticados são enviados à respectiva URL.
 *
 * Observação: `useRequireAdmin` reexporta esta função (nome legado: “staff”, não apenas super-admin).
 */
export function useRequireStaff(): { ready: boolean; checking: boolean } {
  const navigate = useNavigate();
  const { loading: staffLoading, role } = useStaffSession();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!isSupabaseConfigured) {
        navigate("/login", { replace: true });
        if (!cancelled) setChecking(false);
        return;
      }
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate("/login", { replace: true });
        if (!cancelled) setChecking(false);
        return;
      }

      const area = await fetchLoginAreaAfterSignIn(supabase);
      if (cancelled) return;
      if (area === "aluno") {
        navigate("/aluno/dashboard", { replace: true });
        setChecking(false);
        return;
      }
      if (area === "professor") {
        navigate("/professor/dashboard", { replace: true });
        setChecking(false);
        return;
      }
      if (area !== "admin" && area !== "colaborador") {
        navigate("/login", { replace: true });
        setChecking(false);
        return;
      }

      if (staffLoading) {
        setChecking(true);
        return;
      }

      if (role === "super_admin" || role === "colaborador") {
        setReady(true);
        setChecking(false);
        return;
      }

      if (!cancelled) {
        navigate("/login", { replace: true });
        setChecking(false);
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [navigate, staffLoading, role]);

  return { ready, checking: checking || staffLoading };
}
