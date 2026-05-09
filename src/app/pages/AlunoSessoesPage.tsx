import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import {
  personalMonthlyQuota,
  planHasPersonalSessions,
  planTierLabel,
} from "../../lib/planHelpers";
import { PERSONAL_CANCEL_MIN_HOURS } from "../../lib/contentLabels";

type Ctx = { alunoId: string };
type Pers = Database["public"]["Tables"]["personal_sessoes"]["Row"];

type ProfOpt = { id: string; nome: string };

/** Próximo slot em horário cheio: 08–17, seg–sáb simplificado (MVP). */
function nextWorkingSlots(busy: Pers[]): Date[] {
  const slots: Date[] = [];
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  for (let dy = day; dy < day + 30 && slots.length < 48; dy++) {
    const x = new Date(y, m, dy);
    const wd = x.getDay();
    if (wd === 0) continue;
    if (slots.length >= 48) break;
    const base = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
    for (let hour = 8; hour <= 17; hour++) {
      const start = new Date(`${base}T${String(hour).padStart(2, "0")}:15:00`);
      const overlaps = busy.filter((b) => {
        const bs = new Date(b.inicio_at).getTime();
        const be = new Date(b.fim_at).getTime();
        const ours = start.getTime();
        return ours >= bs && ours < be + 600_000;
      }).length;
      if (overlaps < 3 && start.getTime() > Date.now() + 3_600_000) slots.push(start);
      if (slots.length >= 20) break;
    }
  }
  return slots;
}

const selectCls =
  "w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors border border-[#222222] bg-[#0D0D0D] text-[#F2F2F2] cursor-pointer";

function missingRpcError(msg: string | undefined): boolean {
  return /could not find|PGRST202|schema cache|404/i.test(msg ?? "");
}

export function AlunoSessoesPage() {
  const { alunoId } = useOutletContext<Ctx>();
  type AlRow = Pick<
    Database["public"]["Tables"]["alunos"]["Row"],
    "professor_acompanhamento_id"
  > & { planos: { nome: string } | null };
  const [al, setAl] = useState<AlRow | null>(null);
  const [professores, setProfessores] = useState<ProfOpt[]>([]);
  const [profSelecionado, setProfSelecionado] = useState("");
  const [lista, setLista] = useState<Pers[]>([]);
  const [slots, setSlots] = useState<Date[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [savingProf, setSavingProf] = useState(false);
  const [loadingProfs, setLoadingProfs] = useState(true);

  const planNome = al?.planos?.nome ?? null;
  const okPlan = planHasPersonalSessions(planNome);
  const lim = personalMonthlyQuota(planNome);

  const monthStartMs = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1).getTime();
  }, []);

  async function loadProfessores() {
    if (!isSupabaseConfigured) {
      setLoadingProfs(false);
      return;
    }
    setLoadingProfs(true);
    const sb = getSupabase();
    const { data, error } = await sb.from("professores").select("id, nome, ativo").eq("ativo", true).order("nome");
    setLoadingProfs(false);
    if (error) {
      setProfessores([]);
      return;
    }
    setProfessores(
      ((data ?? []) as { id: string; nome: string }[]).map((p) => ({ id: p.id, nome: p.nome })),
    );
  }

  async function reload() {
    if (!isSupabaseConfigured || !alunoId) return;
    const sb = getSupabase();
    const { data } = await sb
      .from("alunos")
      .select("professor_acompanhamento_id, planos(nome)")
      .eq("id", alunoId)
      .maybeSingle();
    const row = (data ?? null) as AlRow | null;
    setAl(row);

    const { data: ps } = await sb
      .from("personal_sessoes")
      .select("*")
      .eq("aluno_id", alunoId)
      .order("inicio_at");

    const arr = ((ps ?? []) as Pers[]) ?? [];
    const active = arr.filter((p) => p.status !== "cancelado");
    setLista(active);
  }

  useEffect(() => {
    void loadProfessores();
  }, []);

  useEffect(() => void reload(), [alunoId, monthStartMs]);

  useEffect(() => {
    if (al?.professor_acompanhamento_id) {
      setProfSelecionado((p) => p || al.professor_acompanhamento_id!);
    }
  }, [al?.professor_acompanhamento_id]);

  useEffect(() => {
    if (!profSelecionado || !isSupabaseConfigured) {
      setSlots([]);
      return;
    }
    let cancel = false;
    void (async () => {
      const sb = getSupabase();
      const { data: theirs } = await sb
        .from("personal_sessoes")
        .select("*")
        .eq("professor_id", profSelecionado)
        .neq("status", "cancelado");
      if (cancel) return;
      const b = ((theirs ?? []) as Pers[]) ?? [];
      setSlots(nextWorkingSlots(b));
    })();
    return () => {
      cancel = true;
    };
  }, [profSelecionado]);

  const agNest = lista.filter((l) => l.status === "agendado" && new Date(l.inicio_at).getTime() >= monthStartMs).length;
  const remaining = Math.max(lim - agNest, 0);

  const nomeProfAtual = useMemo(() => {
    const id = al?.professor_acompanhamento_id;
    if (!id) return null;
    return professores.find((p) => p.id === id)?.nome ?? null;
  }, [al?.professor_acompanhamento_id, professores]);

  async function salvarPersonalEscolhido() {
    setMsg(null);
    if (!profSelecionado.trim()) {
      toast.error("Selecione um professor.");
      return;
    }
    setSavingProf(true);
    const sb = getSupabase();
    const { error: rpcErr } = await sb.rpc("aluno_atualizar_personal_acompanhamento", {
      p_professor_id: profSelecionado.trim(),
    });
    if (rpcErr && !missingRpcError(rpcErr.message ?? "")) {
      setSavingProf(false);
      setMsg(rpcErr.message ?? "Não foi possível salvar o personal.");
      return;
    }
    if (rpcErr && missingRpcError(rpcErr.message)) {
      const { error: upErr } = await sb
        .from("alunos")
        .update({ professor_acompanhamento_id: profSelecionado.trim() })
        .eq("id", alunoId);
      if (upErr) {
        setSavingProf(false);
        setMsg(upErr.message ?? "Sem permissão para atualizar o cadastro.");
        return;
      }
    }
    setSavingProf(false);
    toast.success("Personal de acompanhamento atualizado.");
    await reload();
  }

  async function agendar(dt: Date) {
    setMsg(null);
    if (!profSelecionado.trim()) {
      toast.error("Selecione o professor no formulário.");
      return;
    }
    if (!planNome || !okPlan || remaining <= 0) return;
    const sb = getSupabase();
    const { error: rpcErr } = await sb.rpc("aluno_atualizar_personal_acompanhamento", {
      p_professor_id: profSelecionado.trim(),
    });
    if (rpcErr && !missingRpcError(rpcErr.message ?? "")) {
      setMsg(rpcErr.message ?? "Não foi possível confirmar o professor.");
      return;
    }
    if (rpcErr && missingRpcError(rpcErr.message)) {
      const { error: upErr } = await sb
        .from("alunos")
        .update({ professor_acompanhamento_id: profSelecionado.trim() })
        .eq("id", alunoId);
      if (upErr) {
        setMsg(upErr.message ?? "Não foi possível vincular o professor.");
        return;
      }
    }

    const fim = new Date(dt.getTime() + 3600_000);
    const row: Database["public"]["Tables"]["personal_sessoes"]["Insert"] = {
      aluno_id: alunoId,
      professor_id: profSelecionado.trim(),
      inicio_at: dt.toISOString(),
      fim_at: fim.toISOString(),
      status: "agendado",
    };
    const { error } = await sb.from("personal_sessoes").insert(row);
    if (error) setMsg(error.message);
    else {
      toast.success("Sessão agendada.");
      await reload();
    }
  }

  async function cancelar(id: string, inicio: string) {
    const diffH = (new Date(inicio).getTime() - Date.now()) / 3600_000;
    if (diffH < PERSONAL_CANCEL_MIN_HOURS) {
      if (!confirm(`Faltam menos de ${PERSONAL_CANCEL_MIN_HOURS}h. Cancelar assim mesmo — a sessão pode ser perdida?`))
        return;
    }
    await getSupabase()
      .from("personal_sessoes")
      .update({ status: "cancelado" })
      .eq("id", id);
    await reload();
  }

  if (!okPlan) {
    return (
      <div className="px-6 py-10 pb-24">
        <p style={{ color: "#AAA" }}>Sessões com personal ficam disponíveis nos planos Plus e Elite.</p>
        <p className="text-sm mt-2" style={{ color: "#606060" }}>
          Seu plano atual: <strong>{planTierLabel(planNome)}</strong>
        </p>
        <Link
          to="/aluno/dashboard"
          className="text-xs underline mt-6 inline-flex items-center gap-2"
          style={{ color: "#00F9E4" }}
        >
          <ArrowLeft size={16} className="shrink-0 text-primary" />
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border py-8 pb-24 space-y-6">
      <h1 className="text-2xl font-black">Personal</h1>
      <p className="text-sm" style={{ color: "#AAA" }}>
        Cota mensal: <strong style={{ color: "#00F9E4" }}>{remaining}</strong> de {lim}.
      </p>

      <section
        className="rounded-2xl p-5 space-y-4 border border-[#2A2A2A]"
        style={{ background: "#161616" }}
      >
        <h2 className="text-xs uppercase tracking-wider font-bold" style={{ color: "#00F9E4" }}>
          Agendamento · escolha do personal
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#A8A8A8" }}>
          Selecione um professor cadastrado. Os horários sugeridos são intervalos livres no calendário dele (aproximação
          MVP). Salve sua escolha como personal de acompanhamento antes ou ao agendar uma sessão.
        </p>
        {nomeProfAtual ? (
          <p className="text-xs font-mono" style={{ color: "#6B6B6B" }}>
            Personal atual no cadastro: <span style={{ color: "#E5E5E5" }}>{nomeProfAtual}</span>
          </p>
        ) : null}
        {loadingProfs ? (
          <p className="text-sm" style={{ color: "#6B6B6B" }}>
            Carregando professores…
          </p>
        ) : professores.length === 0 ? (
          <p className="text-sm" style={{ color: "#F87171" }}>
            Nenhum professor ativo encontrado.
          </p>
        ) : (
          <>
            <div>
              <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
                Professor
              </label>
              <select
                className={selectCls}
                value={profSelecionado}
                onChange={(e) => setProfSelecionado(e.target.value)}
              >
                <option value="">Selecione um professor</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={savingProf || !profSelecionado}
              onClick={() => void salvarPersonalEscolhido()}
              className="rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wide disabled:opacity-45"
              style={{ background: "#00F9E4", color: "#0A0A0A" }}
            >
              {savingProf ? "Salvando…" : "Salvar como meu personal"}
            </button>

            {profSelecionado ? (
              <div>
                <h3 className="text-xs uppercase tracking-wider mb-2 mt-2" style={{ color: "#606060" }}>
                  Horários sugeridos (livres para este professor)
                </h3>
                <div className="flex flex-wrap gap-3">
                  {slots.slice(0, 15).map((s) => (
                    <button
                      key={s.toISOString()}
                      type="button"
                      disabled={remaining <= 0}
                      className="px-5 py-2 rounded-full border border-[#2A2A2A] disabled:opacity-40"
                      style={{ background: "#141414", color: "#EEE" }}
                      onClick={() => void agendar(s)}
                    >
                      {s.toLocaleString("pt-BR", {
                        weekday: "short",
                        day: "numeric",
                        month: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  ))}
                </div>
                {slots.length === 0 ? (
                  <p className="text-xs mt-2" style={{ color: "#6B6B6B" }}>
                    Sem sugestões automáticas no período; tente outro professor ou fale com a recepção.
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </section>

      <h2 className="text-xs uppercase tracking-wider" style={{ color: "#606060" }}>
        Minhas sessões
      </h2>
      <ul className="space-y-4">
        {lista.map((l) => (
          <li
            key={l.id}
            className="flex flex-wrap gap-4 justify-between items-center rounded-2xl p-5 border border-[#2A2A2A]"
            style={{ background: "#161616" }}
          >
            <div>
              <p className="font-bold">{new Date(l.inicio_at).toLocaleString("pt-BR")}</p>
              <p className="text-[11px] uppercase mt-1" style={{ color: "#6B6B6B" }}>
                {l.status}
                {professores.find((p) => p.id === l.professor_id)?.nome
                  ? ` · ${professores.find((p) => p.id === l.professor_id)?.nome}`
                  : ""}
              </p>
            </div>
            {l.status === "agendado" && (
              <button
                type="button"
                className="text-[11px] uppercase font-bold"
                style={{ color: "#F87171" }}
                onClick={() => void cancelar(l.id, l.inicio_at)}
              >
                Cancelar
              </button>
            )}
          </li>
        ))}
      </ul>

      {lista.length === 0 ? (
        <p className="text-sm" style={{ color: "#6B6B6B" }}>
          Nenhuma sessão agendada ainda.
        </p>
      ) : null}

      <p className="text-[11px]" style={{ color: "#6B6B6B" }}>
        Regra LuTe Academy: ao cancelar com menos de {PERSONAL_CANCEL_MIN_HOURS}h de antecedência, você perde esta
        oportunidade do mês.
      </p>

      {msg && <p className="text-sm text-red-400">{msg}</p>}
      <Link to="/aluno/dashboard" className="text-xs underline inline-flex items-center gap-2" style={{ color: "#00F9E4" }}>
        <ArrowLeft size={16} className="shrink-0 text-primary" />
        Voltar
      </Link>
    </div>
  );
}
