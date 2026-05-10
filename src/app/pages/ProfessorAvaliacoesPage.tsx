import { useCallback, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";

type Ctx = { professorId: string };

type AgendaRow = Database["public"]["Tables"]["avaliacoes_agenda"]["Row"] & {
  alunos: { nome: string } | null;
};

export function ProfessorAvaliacoesPage() {
  const { professorId } = useOutletContext<Ctx>();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AgendaRow[]>([]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    const { data } = await sb
      .from("avaliacoes_agenda")
      .select("*, alunos ( nome ) ")
      .or(`professor_id.eq.${professorId},professor_id.is.null`)
      .order("inicio_at");
    const r = ((((data ?? []) as unknown[]) ?? []) ?? []) as AgendaRow[];
    setRows(r.slice(0, 100));
  }, [professorId]);

  useEffect(() => void load(), [load]);

  async function attachSelf(id: string) {
    await getSupabase().from("avaliacoes_agenda").update({ professor_id: professorId }).eq("id", id);
    await load();
  }

  return (
    <div className="px-4 md:px-10 py-8 pb-24 space-y-6 max-w-3xl">
      <h1 className="text-2xl font-black">Agenda de Avaliações</h1>
      <p className="text-sm" style={{ color: "#888" }}>
        Toque no aluno ou em &quot;Registrar medidas&quot; para abrir a ficha de avaliação corporal (peso,
        circunferências, etc.). Os dados ficam visíveis para o aluno em Meu perfil.
      </p>

      <ul className="space-y-4">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl p-6 flex flex-col gap-4 md:flex-row md:flex-wrap md:justify-between md:items-center border border-[#2A2A2A]"
            style={{ background: "#151515" }}
          >
            <button
              type="button"
              className="text-left min-w-0 w-full md:flex-1"
              onClick={() => navigate(`/professor/avaliacoes/registrar/${r.id}`)}
              style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
            >
              <p className="font-bold text-lg">{r.alunos?.nome ?? "Aluno"}</p>
              <p className="text-sm mt-2" style={{ color: "#888" }}>
                {new Date(r.inicio_at).toLocaleString("pt-BR")} — {r.status}
              </p>
            </button>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full md:w-auto shrink-0">
              {!r.professor_id && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void attachSelf(r.id);
                  }}
                  className="rounded-full px-5 py-2 text-xs uppercase font-black text-[#0A0A0A] w-full sm:w-auto"
                  style={{ background: "#AAA" }}
                >
                  Eu atendo
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(`/professor/avaliacoes/registrar/${r.id}`)}
                className="rounded-full px-7 py-3 text-xs uppercase font-black text-[#0A0A0A] w-full sm:w-auto md:py-2"
                style={{ background: "#00F9E4" }}
              >
                Registrar medidas
              </button>
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p style={{ color: "#6B6B6B" }}>Nenhum agendamento por aqui ainda.</p>}
    </div>
  );
}
