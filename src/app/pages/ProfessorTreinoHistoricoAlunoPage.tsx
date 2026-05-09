import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";

type Ctx = { professorId: string };

type Ses = Database["public"]["Tables"]["treino_sessoes"]["Row"] & {
  planos_treino_dias?: Pick<
    Database["public"]["Tables"]["planos_treino_dias"]["Row"],
    "rotulo"
  > | null;
};

/** Histórico de finalizações de treino vista pelo professor para o aluno. */
export function ProfessorTreinoHistoricoAlunoPage() {
  const { professorId } = useOutletContext<Ctx>();
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<Ses[]>([]);
  const [nome, setNome] = useState("");

  useEffect(() => {
    async function run() {
      if (!id || !isSupabaseConfigured) return;
      const sb = getSupabase();
      const { data: a } = await sb.from("alunos").select("nome").eq("id", id).maybeSingle();
      if (a?.nome) setNome(a.nome);

      const { data } = await sb
        .from("treino_sessoes")
        .select("*, planos_treino_dias (rotulo)")
        .eq("aluno_id", id)
        .order("finalizado_em", { ascending: false })
        .limit(80);
      setRows(((data ?? []) as Ses[]) ?? []);
    }
    void run();


  }, [id, professorId]);

  return (
    <div className="px-4 md:px-10 py-8 pb-24 max-w-xl">
      <Link
        to="/professor/treinos"
        style={{ color: "#00F9E4", fontSize: "11px" }}
        className="uppercase font-bold inline-flex items-center gap-2"
      >
        <ArrowLeft size={16} className="shrink-0 text-primary" />
        Voltar aos treinos
      </Link>
      <h1 className="text-2xl font-black mt-6 mb-8">Histórico · {nome || id}</h1>
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl p-6 border border-[#292929]" style={{ background: "#151515", color: "#EEE" }}>
            <p className="font-bold">{r.planos_treino_dias?.rotulo ?? "Dia"}</p>
            <p className="text-[11px] mt-4 uppercase tracking-wider" style={{ color: "#6B6B6B" }}>
              {new Date(`${r.data_ref}T12:00:00`).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-xs mt-2" style={{ color: r.finalizado_em ? "#22C55E" : "#F59E0B" }}>
              {r.finalizado_em
                ? `Finalizado · ${new Date(r.finalizado_em).toLocaleString("pt-BR")}`
                : "Em progresso"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
