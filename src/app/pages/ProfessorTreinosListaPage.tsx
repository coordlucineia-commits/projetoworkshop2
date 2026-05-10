import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { ListChecks, Search } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";

type Ctx = { professorId: string };

function mergeAlunos(
  porAvaliacao: { id: string; nome: string }[],
  extraFromAgenda: { id: string; nome: string }[],
) {
  const m = new Map<string, { id: string; nome: string }>();
  for (const a of porAvaliacao) m.set(a.id, a);
  for (const a of extraFromAgenda) {
    if (!m.has(a.id)) m.set(a.id, a);
  }
  return [...m.values()].sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR"));
}

export function ProfessorTreinosListaPage() {
  const navigate = useNavigate();
  const { professorId } = useOutletContext<Ctx>();
  /** Todos os alunos ligados ao professor (avaliação + agenda) */
  const [todosVinculados, setTodosVinculados] = useState<{ id: string; nome: string }[]>([]);
  /** Alunos com plano ativo cadastrado por este professor (somem da fila “cadastro”) */
  const [alunosComPlanoAtivo, setAlunosComPlanoAtivo] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !professorId) return;
    const sb = getSupabase();

    const [{ data: porAvaliacao }, { data: agendaRows }, { data: ativos }] = await Promise.all([
      sb.from("alunos").select("id, nome").eq("professor_avaliacao_id", professorId),
      sb.from("avaliacoes_agenda").select("aluno_id").eq("professor_id", professorId),
      sb.from("planos_treino").select("aluno_id").eq("professor_id", professorId).eq("ativo", true),
    ]);

    const base = (porAvaliacao ?? []) as { id: string; nome: string }[];
    const agendaIds = [...new Set((agendaRows ?? []).map((r) => (r as { aluno_id: string }).aluno_id))].filter(
      Boolean,
    );

    let agendaAlunos: { id: string; nome: string }[] = [];
    if (agendaIds.length > 0) {
      const { data: alAg } = await sb.from("alunos").select("id, nome").in("id", agendaIds);
      agendaAlunos = (alAg ?? []) as { id: string; nome: string }[];
    }

    const merged = mergeAlunos(base, agendaAlunos);
    setTodosVinculados(merged);

    const comPlano = new Set(
      ((ativos ?? []) as { aluno_id: string }[]).map((r) => r.aluno_id).filter(Boolean),
    );
    setAlunosComPlanoAtivo(comPlano);
  }, [professorId]);

  useEffect(() => void load(), [load]);

  const cadastroLista = useMemo(
    () => todosVinculados.filter((a) => !alunosComPlanoAtivo.has(a.id)),
    [todosVinculados, alunosComPlanoAtivo],
  );

  const resultadosBusca = useMemo(() => {
    const q = busca.normalize("NFKD").replace(/\p{M}/gu, "").trim().toLowerCase();
    if (!q) return [];
    return todosVinculados.filter((a) => {
      const nome = (a.nome ?? "")
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLowerCase();
      return nome.includes(q);
    });
  }, [todosVinculados, busca]);

  return (
    <div className="px-4 md:px-10 py-8 pb-24 space-y-10 max-w-3xl">
      <h1 className="text-2xl font-black">Cadastro de Treinos</h1>
      <p className="text-sm -mt-6" style={{ color: "#888" }}>
        Monte o plano por dia da semana (ex.: segunda — braço, terça — peito). Após salvar, o treino fica disponível para
        o aluno em <span style={{ color: "#BBB" }}>Meu treino</span>.
      </p>

      <section className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#6B6B6B" }}>
          Cadastrar treino · alunos sem plano publicado
        </h2>
        <ul className="space-y-2">
          {cadastroLista.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 items-stretch md:flex-row md:flex-wrap md:justify-between md:items-center rounded-2xl px-6 py-4 border border-[#2A2A2A]"
              style={{ background: "#151515" }}
            >
              <span className="font-bold min-w-0" style={{ color: "#EEE" }}>
                {a.nome}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/professor/treinos/novo/${a.id}`)}
                className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-full text-sm transition-colors w-full md:w-fit shrink-0"
                style={{
                  background: "#00F9E4",
                  color: "#0A0A0A",
                  fontWeight: 700,
                }}
              >
                <ListChecks size={17} />
                Cadastrar treino
              </button>
            </li>
          ))}
          {cadastroLista.length === 0 && todosVinculados.length > 0 && (
            <p style={{ color: "#606060" }}>
              Nenhum aluno pendente nesta lista — todos já têm um treino ativo ligado ao seu cadastro. Use a pesquisa
              abaixo para revisar ou alterar o plano vigente de um aluno.
            </p>
          )}
          {todosVinculados.length === 0 && (
            <p style={{ color: "#606060" }}>
              Nenhum aluno encontrado como seu professor de avaliação ou na sua agenda de avaliações. Peça ao admin para
              vincular o aluno em &quot;professor de avaliação&quot; ou registre um horário na agenda de avaliações.
            </p>
          )}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#6B6B6B" }}>
          Pesquisar aluno por nome · editar treino atual
        </h2>
        <div className="rounded-2xl p-6 border border-[#2A2A2C]" style={{ background: "#111111" }}>
          <label className="block text-[11px] uppercase mb-3" style={{ color: "#6B6B6B" }}>
            Nome do aluno
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#393939] px-4" style={{ background: "#0D0D0D" }}>
              <Search size={18} style={{ color: "#6B6B6B" }} />
              <input
                className="flex-1 py-3 text-sm min-w-0 border-0 outline-none"
                style={{ background: "transparent", color: "#EEE" }}
                placeholder="Digite parte do nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </label>
          {!busca.trim() ? (
            <p className="text-xs mt-4" style={{ color: "#5A5A5A" }}>
              Os resultados são alunos seus (avaliação ou agenda). Abra um aluno para carregar o treino ativo, se já
              existir, e atualizar aqui antes de salvar novamente.
            </p>
          ) : resultadosBusca.length === 0 ? (
            <p className="text-sm mt-4" style={{ color: "#6B6B6B" }}>
              Nenhum aluno encontrado com esse nome nos seus vínculos.
            </p>
          ) : (
            <ul className="space-y-2 mt-4">
              {resultadosBusca.map((a) => (
                <li key={`s-${a.id}`}>
                  <button
                    type="button"
                    onClick={() => navigate(`/professor/treinos/novo/${a.id}`)}
                    className="w-full text-left rounded-xl px-4 py-4 border transition-colors hover:border-[#00F9E4] border-[#2A2A2A]"
                    style={{ background: "#151515", color: "#EEE" }}
                  >
                    <span className="font-bold">{a.nome}</span>
                    <span className="block text-[11px] uppercase mt-1" style={{ color: "#6B6B6B" }}>
                      {alunosComPlanoAtivo.has(a.id)
                        ? "Plano ativo — abrir para revisar/editar"
                        : "Sem plano ativo — abrir para cadastrar"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
