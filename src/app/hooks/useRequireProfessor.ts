import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchLoginAreaAfterSignIn, pathForLoginArea } from "../../lib/authRedirect";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

/** Login + apenas professor/personal cadastrado em `professores` (`resolve_user_app_area` = professor). */
export function useRequireProfessor(): {
  ok: boolean;
  checking: boolean;
  professorId: string | null;
} {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const [professorId, setProfessorId] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    async function run() {
      if (!isSupabaseConfigured) {
        navigate("/login", { replace: true });
        setChecking(false);
        return;
      }
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        setChecking(false);
        return;
      }

      const areaTag = await fetchLoginAreaAfterSignIn(supabase);
      if (cancel) return;
      if (areaTag !== "professor") {
        navigate(pathForLoginArea(areaTag), { replace: true });
        setChecking(false);
        return;
      }

      const { data: pid } = await supabase.rpc("meu_professor_id");
      if (cancel) return;
      const id = pid as unknown as string | null;
      if (!id) {
        navigate("/login", { replace: true });
        setChecking(false);
        return;
      }
      setProfessorId(id);
      setOk(true);
      setChecking(false);
    }
    void run();
    return () => {
      cancel = true;
    };
  }, [navigate]);

  return { ok, checking, professorId };
}
