import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, Link } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { dowBrMonSun } from "../../lib/datetimeBr";
import { planHasPersonalSessions, planTierLabel } from "../../lib/planHelpers";
import type { Database } from "../../lib/database.types";

type Ctx = { alunoId: string; checkinRegistrado: boolean };

export function AlunoDashboardPage() {
  const { alunoId, checkinRegistrado } = useOutletContext<Ctx>();
  const navigate = useNavigate();
  const [nome, setNome] = useState("Aluno");
  const [planoNome, setPlanoNome] = useState<string | null>(null);
  const [rotuloTreino, setRotuloTreino] = useState<string | null>(null);
  const [personalRest, setPersonalRest] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured || !alunoId) return;
      const sb = getSupabase();
      const dow = dowBrMonSun();

      const { data: row } = await sb
        .from("alunos")
        .select("nome, planos(nome)")
        .eq("id", alunoId)
        .maybeSingle();

      const al = row as unknown as {
        nome: string;
        planos: { nome: string } | null;
      } | null;
      if (al?.nome) setNome(al.nome);
      const plNome = al?.planos?.nome ?? null;
      setPlanoNome(plNome);

      const { data: p } = await sb
        .from("planos_treino")
        .select("id, planos_treino_dias ( dia_semana, rotulo )")
        .eq("aluno_id", alunoId)
        .eq("ativo", true)
        .maybeSingle();

      type PlanAgg = Database["public"]["Tables"]["planos_treino"]["Row"] & {
        planos_treino_dias?: Pick<
          Database["public"]["Tables"]["planos_treino_dias"]["Row"],
          "dia_semana" | "rotulo"
        >[];
      };

      const plan = (p ?? null) as PlanAgg | null;
      if (plan?.planos_treino_dias?.length) {
        const day = plan.planos_treino_dias.find((x) => x.dia_semana === dow);
        setRotuloTreino(day ? day.rotulo : "Descanso / outro dia");
      } else setRotuloTreino("Treino não cadastrado");

      let rest: number | null = null;
      if (planHasPersonalSessions(plNome)) {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const { data: ps } = await sb
          .from("personal_sessoes")
          .select("status")
          .eq("aluno_id", alunoId)
          .gte("inicio_at", start.toISOString());

        const rows = ((ps ?? []) as { status: string }[])
          .filter((x) => x.status === "agendado");
        let lim = 2;
        if (/elite/i.test(plNome ?? "")) lim = 4;
        rest = Math.max(lim - rows.length, 0);
      }
      setPersonalRest(rest);
    }
    void load();
  }, [alunoId]);

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border py-8">
      {checkinRegistrado && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest w-fit"
          style={{
            background: "rgba(34,197,94,0.12)",
            color: "#22C55E",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <CheckCircle2 size={14} />
          Presença registrada hoje!
        </motion.div>
      )}
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#6B6B6B" }}>
          Olá —
        </p>
        <h1 className="text-3xl font-black">{nome}</h1>
        <p className="text-sm mt-2" style={{ color: "#AAA" }}>
          Plano:{" "}
          <span style={{ color: "#00F9E4" }}>
            {planTierLabel(planoNome)}
          </span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <button
          type="button"
          onClick={() => navigate("/aluno/meu-treino")}
          className="rounded-2xl p-6 text-left border border-[#2A2A2A]"
          style={{ background: "#111111" }}
        >
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "#6B6B6B" }}>
            Próximo treino (dia)
          </p>
          <p className="text-lg font-bold">{rotuloTreino ?? "—"}</p>
        </button>

        <div className="rounded-2xl p-6 border border-[#2A2A2A]" style={{ background: "#111111" }}>
          <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "#6B6B6B" }}>
            Sessões personal (mês)
          </p>
          {personalRest == null ? (
            <p className="text-sm" style={{ color: "#AAA" }}>
              Plano atual não inclui personal.
            </p>
          ) : (
            <p className="text-lg font-bold" style={{ color: "#22C55E" }}>
              {personalRest} restantes
            </p>
          )}
          <Link to="/aluno/sessoes" className="text-[11px] mt-4 inline-block" style={{ color: "#00F9E4" }}>
            Agendar →
          </Link>
        </div>
      </div>

      <h2 className="text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "#6B6B6B" }}>
        Acesso rápido
      </h2>
      <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full min-w-0">
        <QuickBtn to="/aluno/aulas" label="Aulas" />
        <QuickBtn to="/aluno/meu-treino" label="Meu treino" />
        <QuickBtn to="/aluno/minhas-avaliacoes" label="Minhas avaliações" />
        <QuickBtn to="/aluno/sessoes" label="Personal" />
      </nav>
    </div>
  );
}

function QuickBtn({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-2xl py-6 text-center border border-[#2A2A2A] text-sm font-semibold uppercase tracking-wide transition-colors hover:border-[#00F9E4]"
      style={{ background: "#161616", color: "#EEE" }}
    >
      {label}
    </Link>
  );
}
