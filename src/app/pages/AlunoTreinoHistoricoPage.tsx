import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { ArrowLeft } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";

type Ctx = { alunoId: string };

type Ses = Database["public"]["Tables"]["treino_sessoes"]["Row"] & {
  planos_treino_dias?: Pick<
    Database["public"]["Tables"]["planos_treino_dias"]["Row"],
    "rotulo"
  > | null;
};

export function AlunoTreinoHistoricoPage() {
  const { alunoId } = useOutletContext<Ctx>();
  const [rows, setRows] = useState<Ses[]>([]);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured || !alunoId) return;
      const sb = getSupabase();
      const { data } = await sb
        .from("treino_sessoes")
        .select("*, planos_treino_dias (rotulo)")
        .eq("aluno_id", alunoId)
        .order("finalizado_em", { ascending: false })
        .limit(60);
      setRows(((data ?? []) as Ses[]) ?? []);
    }
    void load();
  }, [alunoId]);

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border py-8 pb-24">
      <Link to="/aluno/meu-treino" className="text-xs font-bold uppercase inline-flex items-center gap-2" style={{ color: "#00F9E4" }}>
        <ArrowLeft size={16} className="shrink-0 text-primary" />
        Voltar ao treino
      </Link>
      <h1 className="text-2xl font-black mt-6 mb-4">Histórico</h1>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl p-5 border border-[#2A2A2A]" style={{ background: "#131313" }}>
            <p className="font-bold">{r.planos_treino_dias?.rotulo ?? "Treino"}</p>
            <p className="text-[11px] mt-3 uppercase" style={{ color: "#6B6B6B" }}>
              Data {new Date(`${r.data_ref}T12:00:00`).toLocaleDateString("pt-BR")}
            </p>
            {r.finalizado_em ? (
              <p className="text-sm mt-2" style={{ color: "#22C55E" }}>
                Finalizado {new Date(r.finalizado_em).toLocaleString("pt-BR")}
              </p>
            ) : (
              <p className="text-sm mt-2" style={{ color: "#F59E0B" }}>
                Em progresso
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
