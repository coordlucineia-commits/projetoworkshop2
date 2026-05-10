import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { planTierLabel } from "../../lib/planHelpers";

type Ctx = { professorId: string };

type SessionRow = Database["public"]["Tables"]["personal_sessoes"]["Row"];

export function ProfessorSessoesPage() {
  const { professorId } = useOutletContext<Ctx>();

  type Disp = SessionRow & { alunoNome: string; planoNome?: string };

  const [rows, setRows] = useState<Disp[]>([]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !professorId) return;
    const sb = getSupabase();
    const { data } = await sb
      .from("personal_sessoes")
      .select("*, alunos ( nome, plano_id ) ")
      .eq("professor_id", professorId)
      .order("inicio_at");
    type Raw = SessionRow & { alunos?: { nome?: string | null; plano_id?: string | null } | null };
    const base = ((((data ?? []) as Raw[]) ?? []) ?? []) as Raw[];

    const out: Disp[] = [];
    const planIds = [...new Set(base.map((x) => x.alunos?.plano_id).filter(Boolean) as string[])];

    const planMap = new Map<string, string>();
    for (const pid of planIds) {
      const { data: p } = await sb.from("planos").select("nome").eq("id", pid).maybeSingle();
      if (p?.nome) planMap.set(pid, p.nome);
    }

    for (const raw of base) {
      const planoNome = raw.alunos?.plano_id ? planMap.get(raw.alunos.plano_id) : undefined;

      const alunoNome = raw.alunos?.nome ?? "";
      const { alunos: _omit, ...rest } = raw;
      out.push({ ...rest, alunoNome, planoNome });
    }
    setRows(out);
  }, [professorId]);

  useEffect(() => void load(), [load]);

  async function marca(id: string, st: SessionRow["status"]) {
    await getSupabase().from("personal_sessoes").update({ status: st }).eq("id", id);

    await load();
  }

  return (
    <div className="px-0 md:px-10 py-8 pb-24 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-black px-4 md:px-0">Sessões Agendadas</h1>

      <ul className="space-y-5 px-4 md:px-0">
        {rows.map((r) => (
          <li key={r.id} className="rounded-3xl px-8 py-7 border flex flex-wrap justify-between gap-6 items-start border-[#2A2A2A]" style={{ background: "#151515", color: "#EEE" }}>
            <div className="min-w-0">
              <p className="font-black text-xl">{r.alunoNome}</p>

              <p className="text-[11px] uppercase mt-3" style={{ color: "#717171" }}>
                {planTierLabel(r.planoNome ?? null)}
              </p>
              <p className="text-sm mt-4" style={{ color: "#A3A3A3" }}>
                {new Date(r.inicio_at).toLocaleString("pt-BR")} até{" "}
                {new Date(r.fim_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-[11px] mt-8 uppercase tracking-widest font-bold">{r.status}</p>
            </div>
            {r.status === "agendado" && (
              <button
                type="button"
                onClick={() => void marca(r.id, "realizado")}
                className="text-[11px] font-black uppercase rounded-full shrink-0 px-8 py-3 border-2"
                style={{
                  borderColor: "#00F9E4",
                  color: "#00F9E4",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Marcar realizada
              </button>
            )}
          </li>
        ))}
      </ul>
      {!rows.length && <p style={{ color: "#5C5C5C" }}>Nenhuma sessão encontrada nesta agenda.</p>}
    </div>
  );
}
