import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

/**
 * Registra check-in automático uma vez por dia para o aluno logado.
 * Retorna { registrado: boolean } — true se foi o primeiro check-in do dia.
 */
export function useAutoCheckin(alunoId: string | null): { registrado: boolean } {
  const [registrado, setRegistrado] = useState(false);

  useEffect(() => {
    if (!alunoId || !isSupabaseConfigured) return;

    const supabase = getSupabase();
    const hoje = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    const inicio = `${hoje}T00:00:00.000-03:00`;
    const fim = `${hoje}T23:59:59.999-03:00`;

    void supabase
      .from("checkins")
      .select("id")
      .eq("aluno_id", alunoId)
      .gte("data_hora", inicio)
      .lte("data_hora", fim)
      .limit(1)
      .then(({ data, error }) => {
        if (error) return;
        if (!data?.length) {
          void supabase
            .from("checkins")
            .insert({
              aluno_id: alunoId,
              data_hora: new Date().toISOString(),
              metodo: "LOGIN",
            })
            .then(({ error }) => {
              if (!error) setRegistrado(true);
            });
        }
      });
  }, [alunoId]);

  return { registrado };
}
