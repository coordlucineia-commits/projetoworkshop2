import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

type Ctx = { professorId: string };

export function ProfessorDashboardPage() {
  const { professorId } = useOutletContext<Ctx>();
  const [k, setK] = useState({ av: 0, sess: 0, aulas: 0 });

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured || !professorId) return;
      const sb = getSupabase();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today.getTime() + 86400000);

      const [{ count: ca }, { count: cs }, { count: cl }] = await Promise.all([
        sb
          .from("avaliacoes_agenda")
          .select("id", { count: "exact", head: true })
          .eq("professor_id", professorId)
          .gte("inicio_at", today.toISOString())
          .lt("inicio_at", end.toISOString())
          .eq("status", "agendado"),
        sb
          .from("personal_sessoes")
          .select("id", { count: "exact", head: true })
          .eq("professor_id", professorId)
          .gte("inicio_at", today.toISOString())
          .lt("inicio_at", end.toISOString())
          .neq("status", "cancelado"),
        sb
          .from("aulas_recorrentes")
          .select("id", { count: "exact", head: true })
          .eq("professor_id", professorId),
      ]);

      setK({
        av: ca ?? 0,
        sess: cs ?? 0,
        aulas: cl ?? 0,
      });
    }
    void load();
  }, [professorId]);

  return (
    <div className="px-4 md:px-10 py-8 space-y-8">
      <h1 className="text-3xl font-black">Resumo de hoje</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Avaliações físicas" value={k.av} />
        <Stat label="Sessões com alunos" value={k.sess} />
        <Stat label="Minhas turmas em grade" value={k.aulas} />
      </div>
      <nav className="flex flex-wrap gap-4 pt-10">
        <NavCard to="/professor/avaliacoes" title="Agenda avaliações" />
        <NavCard to="/professor/treinos" title="Treinos" />
        <NavCard to="/professor/sessoes" title="Sessões" />
      </nav>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl p-6 border border-[#2A2A2A]" style={{ background: "#161616" }}>
      <p className="text-[11px] uppercase tracking-wider" style={{ color: "#6B6B6B" }}>
        {label}
      </p>
      <p className="text-3xl font-black mt-4" style={{ color: "#00F9E4" }}>
        {value}
      </p>
    </div>
  );
}

function NavCard({ to, title }: { to: string; title: string }) {
  return (
    <Link
      to={to}
      className="flex-1 min-w-[140px] rounded-full py-6 text-center uppercase text-xs font-bold border border-[#2A2A2A]"
      style={{ background: "#151515", color: "#ccc" }}
    >
      {title}
    </Link>
  );
}
