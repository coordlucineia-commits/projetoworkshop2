import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchLoginAreaAfterSignIn, pathForLoginArea } from "../../lib/authRedirect";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

/** Rotas desconhecidas: público vai à landing; autenticado vai à homepage da sua área. */
export function PrivateFallbackRoute() {
  const navigate = useNavigate();
  const [hint, setHint] = useState("Redirecionando…");

  useEffect(() => {
    let cancel = false;
    void (async () => {
      if (!isSupabaseConfigured) {
        if (!cancel) navigate("/", { replace: true });
        return;
      }
      const sb = getSupabase();
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session?.user) {
        if (!cancel) navigate("/", { replace: true });
        return;
      }
      const area = await fetchLoginAreaAfterSignIn(sb);
      if (cancel) return;
      const path = pathForLoginArea(area);
      if (area === "none") {
        setHint("Sessão sem perfil vinculado. Entre novamente.");
        navigate("/login", { replace: true });
        return;
      }
      navigate(path, { replace: true });
    })();
    return () => {
      cancel = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center px-6" style={{ background: "#0A0A0A", color: "#606060", fontFamily: "monospace", fontSize: 11 }}>
      {hint}
    </div>
  );
}
