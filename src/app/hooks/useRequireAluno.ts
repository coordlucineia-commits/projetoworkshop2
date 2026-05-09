import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchLoginAreaAfterSignIn, pathForLoginArea } from "../../lib/authRedirect";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

/** Login + apenas perfil cuja área RPC é `aluno`. Professores/staff são redirecionados ao app correspondente. */
export function useRequireAluno(): {
  ok: boolean;
  checking: boolean;
  alunoId: string | null;
} {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alunoId, setAlunoId] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    async function run() {
      try {
        if (!isSupabaseConfigured) {
          navigate("/login", { replace: true });
          return;
        }
        const supabase = getSupabase();
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();
        if (cancel) return;
        if (userErr || !user) {
          navigate("/login", { replace: true });
          return;
        }

        const areaTag = await fetchLoginAreaAfterSignIn(supabase);
        if (cancel) return;
        if (areaTag !== "aluno") {
          navigate(pathForLoginArea(areaTag), { replace: true });
          return;
        }

        let id: string | null = null;
        const { data: aid, error: aidErr } = await supabase.rpc("meu_aluno_id");
        if (cancel) return;
        if (aidErr) {
          console.warn("[useRequireAluno] meu_aluno_id", aidErr.message);
        }
        if (aid != null && String(aid).trim() !== "") {
          id = String(aid).trim();
        }

        if (!id && user.email) {
          const em = user.email.trim().toLowerCase();
          const { data: row, error: rowErr } = await supabase.from("alunos").select("id").ilike("email", em).maybeSingle();
          if (cancel) return;
          if (rowErr) {
            console.warn("[useRequireAluno] alunos fallback", rowErr.message);
          }
          id = row?.id ?? null;
        }

        if (!id) {
          navigate("/login", { replace: true });
          return;
        }
        setAlunoId(id);
        setOk(true);
      } catch (e) {
        console.error("[useRequireAluno]", e);
        if (!cancel) navigate("/login", { replace: true });
      } finally {
        if (!cancel) setChecking(false);
      }
    }
    void run();
    return () => {
      cancel = true;
    };
  }, [navigate]);

  return { ok, checking, alunoId };
}
