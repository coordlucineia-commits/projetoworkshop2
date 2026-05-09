import { useEffect, useMemo, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { LABEL_GRUPO } from "../../lib/contentLabels";

type Ex = Database["public"]["Tables"]["exercicios"]["Row"];

export function AlunoExerciciosPage() {
  const [grupoSel, setGrupoSel] = useState<string | "todos">("todos");
  const [list, setList] = useState<Ex[]>([]);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) return;
      const { data } = await getSupabase().from("exercicios").select("*").order("nome");
      setList(((data ?? []) as Ex[]) ?? []);
    }
    void load();
  }, []);

  const grupos = useMemo(() => {
    const s = new Set<string>();
    for (const x of list) s.add(x.grupo_muscular);
    return Array.from(s).sort();
  }, [list]);

  const shown = grupoSel === "todos" ? list : list.filter((x) => x.grupo_muscular === grupoSel);

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border py-8 pb-24">
      <h1 className="text-2xl font-black mb-2">Biblioteca de exercícios</h1>
      <p className="text-sm mb-6" style={{ color: "#6B6B6B" }}>
        Organizado pelo grupo muscular cadastrado.
      </p>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setGrupoSel("todos")}
          className="px-4 py-2 rounded-full text-xs font-semibold uppercase"
          style={{
            border: grupoSel === "todos" ? "1px solid #00F9E4" : "1px solid #2A2A2A",
            color: grupoSel === "todos" ? "#00F9E4" : "#888",
          }}
        >
          Todos
        </button>
        {grupos.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGrupoSel(g)}
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              border: grupoSel === g ? "1px solid #00F9E4" : "1px solid #2A2A2A",
              color: grupoSel === g ? "#00F9E4" : "#888",
              background: "#111",
            }}
          >
            {LABEL_GRUPO[g] ?? g}
          </button>
        ))}
      </div>
      <div className="space-y-4 w-full max-w-full">
        {shown.map((e) => (
          <ExerciseCard key={e.id} x={e} />
        ))}
      </div>
    </div>
  );
}

function ExerciseCard({ x }: { x: Ex }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[#2A2A2A] overflow-hidden" style={{ background: "#141414" }}>
      <button type="button" className="w-full flex gap-4 p-4 text-left" onClick={() => setOpen(!open)}>
        <img src={x.imagem_url} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0" />
        <div>
          <p className="font-bold">{x.nome}</p>
          <p className="text-xs mt-2" style={{ color: "#6B6B6B" }}>
            {LABEL_GRUPO[x.grupo_muscular] ?? x.grupo_muscular} · {x.equipamento}
          </p>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm space-y-2 border-t border-[#2A2A2A]" style={{ color: "#AAA" }}>
          <p>{x.descricao_execucao}</p>
          <p style={{ color: "#F59E0B" }}>Segurança: {x.dicas_seguranca}</p>
        </div>
      )}
    </div>
  );
}
