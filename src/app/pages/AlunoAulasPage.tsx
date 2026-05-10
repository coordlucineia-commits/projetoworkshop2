import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { ArrowLeft, Bell } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { startOfWeek } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

type Ctx = { alunoId: string };

type Au = Database["public"]["Tables"]["aulas_recorrentes"]["Row"];
type InsRow = Pick<
  Database["public"]["Tables"]["aula_inscricoes"]["Row"],
  "aula_recorrente_id" | "id" | "status"
>;
type NotifRow = Pick<
  Database["public"]["Tables"]["aluno_notificacoes"]["Row"],
  "id" | "titulo" | "corpo" | "lida_em" | "created_at"
>;

/** Limite nacional de ocupação por turma (combinado ao max_vagas do cadastro). */
export function effectiveAulaParticipantCap(maxVagas: number): number {
  const n = Math.floor(Number(maxVagas));
  if (!Number.isFinite(n) || n < 1) return 20;
  return Math.min(n, 20);
}

export function AlunoAulasPage() {
  const { alunoId } = useOutletContext<Ctx>();
  const [aulas, setAulas] = useState<Au[]>([]);
  const [ins, setIns] = useState<InsRow[]>([]);
  const [notifs, setNotifs] = useState<NotifRow[]>([]);
  const [waitlistAula, setWaitlistAula] = useState<Au | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{
    id: string;
    aulaNome: string;
    isWaitlist: boolean;
  } | null>(null);

  const weekStartIso = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const semanaIso = weekStartIso.toISOString().slice(0, 10);

  async function loadNotifs(sb: ReturnType<typeof getSupabase>) {
    const { data } = await sb
      .from("aluno_notificacoes")
      .select("id, titulo, corpo, lida_em, created_at")
      .eq("aluno_id", alunoId)
      .order("created_at", { ascending: false })
      .limit(25);
    setNotifs((data ?? []) as NotifRow[]);
  }

  async function reload() {
    if (!isSupabaseConfigured || !alunoId) return;
    const sb = getSupabase();
    const [{ data: a }, { data: i }] = await Promise.all([
      sb.from("aulas_recorrentes").select("*").order("dia_semana").order("hora_inicio"),
      sb
        .from("aula_inscricoes")
        .select("id, aula_recorrente_id, status")
        .eq("aluno_id", alunoId)
        .eq("semana_inicio", semanaIso)
        .in("status", ["inscrito", "lista_espera"]),
    ]);
    setAulas(((a ?? []) as Au[]) ?? []);
    setIns(((i ?? []) as InsRow[]) ?? []);
    await loadNotifs(sb);
  }

  useEffect(() => void reload(), [alunoId, semanaIso]);

  async function countInscritos(aulaId: string): Promise<number> {
    const sb = getSupabase();
    const { count } = await sb
      .from("aula_inscricoes")
      .select("*", { count: "exact", head: true })
      .eq("aula_recorrente_id", aulaId)
      .eq("semana_inicio", semanaIso)
      .eq("status", "inscrito");
    return count ?? 0;
  }

  async function upsertInscricao(aulaId: string, status: "inscrito" | "lista_espera") {
    const sb = getSupabase();
    const { error } = await sb.from("aula_inscricoes").upsert(
      {
        aula_recorrente_id: aulaId,
        aluno_id: alunoId,
        semana_inicio: semanaIso,
        status,
      },
      { onConflict: "aula_recorrente_id,aluno_id,semana_inicio" },
    );
    return error ?? null;
  }

  async function tentarParticipar(aula: Au) {
    if (!isSupabaseConfigured || !alunoId) return;
    const cap = effectiveAulaParticipantCap(aula.max_vagas);
    const ocup = await countInscritos(aula.id);
    if (ocup >= cap) {
      setWaitlistAula(aula);
      return;
    }
    const err = await upsertInscricao(aula.id, "inscrito");
    if (err) {
      alert(err.message ?? "Não foi possível concluir a inscrição.");
      return;
    }
    await reload();
  }

  async function confirmarListaEspera() {
    if (!waitlistAula || !isSupabaseConfigured) return;
    const err = await upsertInscricao(waitlistAula.id, "lista_espera");
    if (err) {
      alert(err.message ?? "Não foi possível entrar na lista de espera.");
      return;
    }
    setWaitlistAula(null);
    await reload();
  }

  async function execCancel() {
    if (!cancelTarget || !isSupabaseConfigured) return;
    const sb = getSupabase();
    const { error: rpcErr } = await sb.rpc("aluno_cancelar_inscricao_aula_promover", {
      p_inscricao_id: cancelTarget.id,
    });

    const msg = rpcErr?.message ?? "";
    const missingFn = /could not find|schema cache|PGRST202|404/i.test(msg);

    if (missingFn) {
      const { error: upErr } = await sb.from("aula_inscricoes").update({ status: "cancelado" }).eq("id", cancelTarget.id);
      if (upErr) alert(upErr.message ?? "Erro ao cancelar.");
      setCancelTarget(null);
      await reload();
      return;
    }
    if (rpcErr) {
      alert(msg || "Erro ao cancelar.");
      return;
    }
    setCancelTarget(null);
    await reload();
  }

  async function marcarNotifLida(id: string) {
    const sb = getSupabase();
    await sb
      .from("aluno_notificacoes")
      .update({ lida_em: new Date().toISOString() })
      .eq("id", id)
      .eq("aluno_id", alunoId);
    await loadNotifs(sb);
  }

  const isInscrito = (id: string) => ins.some((x) => x.aula_recorrente_id === id && x.status === "inscrito");
  const isListaEspera = (id: string) =>
    ins.some((x) => x.aula_recorrente_id === id && x.status === "lista_espera");

  const naoLidas = notifs.filter((n) => !n.lida_em);

  return (
    <div className="mx-auto max-w-3xl w-full px-4 md:px-10 box-border py-8 pb-24">
      <h1 className="text-2xl font-black mb-2">Aulas · semana</h1>
      <p className="text-[11px] uppercase mb-6" style={{ color: "#6B6B6B" }}>
        Início segunda {weekStartIso.toLocaleDateString("pt-BR")}. Até 20 pessoas por turma conforme vagas cadastradas.
      </p>

      {naoLidas.length > 0 && (
        <section
          className="mb-10 rounded-2xl p-5 border overflow-hidden"
          style={{ borderColor: "#2A2A2A", background: "#121212" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} style={{ color: "#00F9E4" }} />
            <h2 className="text-sm font-black uppercase tracking-wide">Notificações</h2>
          </div>
          <ul className="space-y-3">
            {naoLidas.map((n) => (
              <li
                key={n.id}
                className="rounded-xl p-4 text-sm"
                style={{ background: "#161616", border: "1px solid #303030" }}
              >
                <p className="font-bold mb-1" style={{ color: "#F2F2F2" }}>
                  {n.titulo}
                </p>
                <p className="leading-relaxed mb-3" style={{ color: "#A8A8A8" }}>
                  {n.corpo}
                </p>
                <button
                  type="button"
                  className="text-[11px] font-bold uppercase tracking-wider underline"
                  style={{ color: "#00F9E4" }}
                  onClick={() => void marcarNotifLida(n.id)}
                >
                  Marcar como lida
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {[1, 2, 3, 4, 5, 6].map((dow) => {
        const dias = aulas.filter((a) => a.dia_semana === dow);
        if (!dias.length) return null;
        return (
          <section key={dow} className="mb-10">
            <h2 className="text-[11px] uppercase tracking-[0.2em] mb-4 font-bold">{nameDow(dow)}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {dias.map((a) => {
                const row = ins.find((x) => x.aula_recorrente_id === a.id);
                return (
                  <AulaCard
                    key={a.id}
                    aula={a}
                    inscricaoId={row?.id}
                    inscribed={isInscrito(a.id)}
                    waitlisted={isListaEspera(a.id)}
                    semanaIso={semanaIso}
                    onAskCancel={
                      row?.id
                        ? () =>
                            setCancelTarget({
                              id: row.id,
                              aulaNome: a.nome,
                              isWaitlist: row.status === "lista_espera",
                            })
                        : undefined
                    }
                    onJoin={() => void tentarParticipar(a)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      <Link
        className="text-xs underline uppercase font-bold mt-12 inline-flex items-center gap-2"
        style={{ color: "#00F9E4" }}
        to="/aluno/dashboard"
      >
        <ArrowLeft size={16} className="shrink-0 text-primary" />
        Voltar
      </Link>

      <AlertDialog open={waitlistAula != null} onOpenChange={(o) => !o && setWaitlistAula(null)}>
        <AlertDialogContent className="border-[#303030] bg-[#161616] text-[#F2F2F2] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase text-base font-black tracking-tight">
              Turma lotada
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#A8A8A8] text-sm leading-relaxed">
              Não há mais vagas para{" "}
              <span style={{ color: "#00F9E4" }}>{waitlistAula?.nome}</span>
              nesta semana (limite de 20 ocupantes quando houver vagas cadastradas). Deseja entrar na lista de espera?
              Você será notificado caso uma vaga seja liberada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#303030] bg-transparent font-bold text-[#AAA] uppercase text-xs rounded-full px-6">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full px-6 bg-[#00F9E4] font-bold text-[#0A0A0A] uppercase text-xs hover:opacity-90"
              onClick={() => void confirmarListaEspera()}
            >
              Entrar na lista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelTarget != null} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent className="border-[#303030] bg-[#161616] text-[#F2F2F2] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase text-base font-black tracking-tight">
              Confirmar cancelamento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#A8A8A8] text-sm leading-relaxed">
              Tem certeza que deseja cancelar{" "}
              {cancelTarget?.isWaitlist
                ? <>sua vaga na lista de espera de “{cancelTarget.aulaNome}”.</>
                : <>sua inscrição na turma “{cancelTarget?.aulaNome}”.</>}{" "}
              Se você estava confirmado e uma vaga for liberada, o próximo da lista poderá entrar automaticamente. Você
              pode tentar Participar novamente quando houver vaga.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#303030] bg-transparent font-bold text-[#AAA] uppercase text-xs rounded-full px-6">
              Manter
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full px-6 bg-[#EF4444] font-bold text-white uppercase text-xs hover:opacity-90"
              onClick={() => void execCancel()}
            >
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function nameDow(n: number) {
  const w = ["—", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  return w[n] ?? "?";
}

function AulaCard({
  aula,
  inscribed,
  waitlisted,
  inscricaoId,
  semanaIso,
  onAskCancel,
  onJoin,
}: {
  aula: Au;
  inscribed: boolean;
  waitlisted: boolean;
  inscricaoId?: string | undefined;
  semanaIso: string;
  onAskCancel?: () => void | undefined;
  onJoin: () => void;
}) {
  const [ocupacao, setOcupacao] = useState<number>(0);

  const cap = effectiveAulaParticipantCap(aula.max_vagas);

  useEffect(() => {
    async function load() {
      const sb = getSupabase();
      const { count } = await sb
        .from("aula_inscricoes")
        .select("*", { count: "exact", head: true })
        .eq("aula_recorrente_id", aula.id)
        .eq("semana_inicio", semanaIso)
        .eq("status", "inscrito");
      setOcupacao(Number(count ?? 0));
    }
    void load();
  }, [aula.id, semanaIso]);

  const livres = Math.max(cap - ocupacao, 0);

  return (
    <div
      className="rounded-2xl p-6 border flex flex-wrap justify-between gap-4 border-[#2A2A2A]"
      style={{ background: "#161616", borderLeft: `6px solid ${aula.cor}` }}
    >
      <div>
        <p className="text-lg font-black">{aula.nome}</p>
        <p className="text-[11px] mt-3 uppercase tracking-wider" style={{ color: "#6B6B6B" }}>
          {aula.sala} · {aula.hora_inicio.slice(0, 5)}–{aula.hora_fim.slice(0, 5)}
        </p>
        <p className="text-xs mt-2" style={{ color: "#AAA" }}>
          {livres} vaga{livres === 1 ? "" : "s"} · Capacidade {cap}
          {waitlisted ? (
            <span className="block mt-1 font-bold uppercase" style={{ color: "#FBBF24" }}>
              Você está na lista de espera
            </span>
          ) : null}
        </p>
      </div>
      {inscribed || waitlisted ? (
        <button
          type="button"
          className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm uppercase transition-colors shrink-0 self-start hover:opacity-90 disabled:opacity-40"
          style={{
            background: "#DC2626",
            color: "#FAFAFA",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
          disabled={!inscricaoId || !onAskCancel}
          onClick={() => onAskCancel?.()}
        >
          Cancelar
        </button>
      ) : (
        <button
          type="button"
          onClick={onJoin}
          className="px-6 min-h-[44px] md:min-h-0 inline-flex items-center justify-center rounded-full disabled:opacity-40 font-black text-xs uppercase"
          style={{ background: "#00F9E4", color: "#0A0A0A" }}
        >
          Participar
        </button>
      )}
    </div>
  );
}
