import { FormEvent, useCallback, useEffect, useState } from "react";
import { AdminPageFrame } from "../components/AdminPageFrame";
import { useStaffSession } from "../context/StaffSessionContext";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { SALAS_AULA, WEEKDAY_BR_SHORT } from "../../lib/contentLabels";
import { Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const DAYS: { dia: number; label: string }[] = WEEKDAY_BR_SHORT.map(
  (lbl, idx) => ({ dia: idx + 1, label: lbl }),
);

type Row = Database["public"]["Tables"]["aulas_recorrentes"]["Row"];
type Prof = Pick<Database["public"]["Tables"]["professores"]["Row"], "id" | "nome">;

const inputCls =
  "w-full rounded-full px-5 py-2.5 text-sm border border-[#2A2A2A] bg-[#141414] text-[#EEEEEE] outline-none focus:border-[#00F9E4] transition-colors";
const selectCls =
  "w-full rounded-full px-5 py-2.5 text-sm border border-[#2A2A2A] bg-[#141414] text-[#EEEEEE] outline-none focus:border-[#00F9E4] transition-colors appearance-none cursor-pointer";
const labelCls = "text-[10px] uppercase tracking-widest mb-2 block opacity-65";

export function AdminAulasPage() {
  const { role } = useStaffSession();
  const [aulas, setAulas] = useState<Row[]>([]);
  const [profs, setProfs] = useState<Prof[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [nome, setNome] = useState("Pilates");
  const [sala, setSala] = useState<"Sala A" | "Sala B">("Sala A");
  const [dia_semana, setDia] = useState<number>(2);
  const [hora_inicio, setIni] = useState("07:00");
  const [hora_fim, setFim] = useState("08:00");
  const [professor_id, setPid] = useState<string>("");
  const [max_vagas, setMax] = useState(18);
  const [cor, setCor] = useState("#00F9E4");
  const [excluirAlvo, setExcluirAlvo] = useState<{ id: string; nome: string } | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const [{ data: a }, { data: p }] = await Promise.all([
      getSupabase()
        .from("aulas_recorrentes")
        .select("*")
        .order("dia_semana")
        .order("hora_inicio"),
      getSupabase().from("professores").select("id,nome").eq("ativo", true),
    ]);
    setAulas(((a ?? []) as Row[]).sort(
      (x, y) =>
        x.dia_semana - y.dia_semana ||
        x.hora_inicio.localeCompare(y.hora_inicio),
    ));
    setProfs((p ?? []) as Prof[]);
  }, []);

  useEffect(() => void load(), [load]);

  async function criar(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!nome.trim()) {
      setErr("Informe o nome da aula.");
      return;
    }
    const { error } = await getSupabase().from("aulas_recorrentes").insert({
      nome: nome.trim(),
      sala,
      dia_semana,
      hora_inicio: hora_inicio.length === 5 ? hora_inicio + ":00" : hora_inicio,
      hora_fim: hora_fim.length === 5 ? hora_fim + ":00" : hora_fim,
      professor_id: professor_id || null,
      max_vagas,
      cor,
    });
    if (error) setErr(error.message);
    else await load();
  }

  async function confirmarExclusaoAula() {
    if (!excluirAlvo) return;
    const { id } = excluirAlvo;
    setExcluindo(true);
    const { error } = await getSupabase().from("aulas_recorrentes").delete().eq("id", id);
    setExcluindo(false);
    setExcluirAlvo(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Aula removida da grade.");
    await load();
  }

  return (
    <AdminPageFrame
      perm="aulas"
      title="Calendário de aulas · Salas A e B"
      subtitle="Grade semanal recorrente configurada pela academia."
    >
      <div className="grid xl:grid-cols-[420px_1fr] gap-10">
        {/* ── Formulário nova aula ── */}
        <form
          onSubmit={criar}
          className="rounded-3xl border border-[#292929] p-8 bg-[#101010] space-y-5 self-start"
        >
          <h3
            className="text-[11px] uppercase tracking-[0.25em] mb-6"
            style={{ color: "#6F6F6F" }}
          >
            Nova aula
          </h3>

          {err && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3">
              {err}
            </p>
          )}

          {/* Nome */}
          <div>
            <label className={labelCls}>Nome da aula</label>
            <input
              className={inputCls}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Pilates, Yoga, Funcional..."
              required
            />
          </div>

          {/* Sala */}
          <div>
            <label className={labelCls}>Sala</label>
            <select
              className={selectCls}
              value={sala}
              onChange={(e) => setSala(e.target.value as "Sala A" | "Sala B")}
            >
              {SALAS_AULA.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Dia da semana */}
          <div>
            <label className={labelCls}>Dia da semana</label>
            <select
              className={selectCls}
              value={dia_semana}
              onChange={(e) => setDia(Number(e.target.value))}
            >
              {DAYS.map((d) => (
                <option key={d.dia} value={d.dia}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Início</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-[1]" size={16} style={{ color: "#00F9E4" }} />
                <input
                  type="time"
                  className={`${inputCls} pl-11`}
                  value={hora_inicio}
                  onChange={(e) => setIni(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Fim</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-[1]" size={16} style={{ color: "#00F9E4" }} />
                <input
                  type="time"
                  className={`${inputCls} pl-11`}
                  value={hora_fim}
                  onChange={(e) => setFim(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Professor */}
          <div>
            <label className={labelCls}>Professor (opcional)</label>
            <select
              className={selectCls}
              value={professor_id}
              onChange={(e) => setPid(e.target.value)}
            >
              <option value="">— sem professor —</option>
              {profs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Vagas */}
          <div>
            <label className={labelCls}>Máx. vagas</label>
            <input
              type="number"
              min={1}
              max={100}
              className={inputCls}
              value={max_vagas}
              onChange={(e) => setMax(Number(e.target.value))}
            />
          </div>

          {/* Cor */}
          <div>
            <label className={labelCls}>Cor de identificação</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-10 h-10 rounded-full border border-[#2A2A2A] bg-[#141414] cursor-pointer p-0.5"
              />
              <span className="text-sm font-mono" style={{ color: "#EEEEEE" }}>
                {cor}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
            style={{ background: "#00F9E4", color: "#0A0A0A" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 24px rgba(0,249,228,0.35)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            + Adicionar aula
          </button>
        </form>

        {/* ── Grade semanal ── */}
        <div className="space-y-10">
          {SALAS_AULA.map((nomeSala) => {
            const aulasNaSala = aulas.filter((a) => a.sala === nomeSala);
            return (
              <div key={nomeSala}>
                <h3
                  className="text-xs uppercase tracking-[0.3em] font-bold mb-4"
                  style={{ color: "#00F9E4" }}
                >
                  {nomeSala}
                </h3>

                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map(({ dia, label }) => {
                    const aulasNoDia = aulasNaSala.filter(
                      (a) => a.dia_semana === dia,
                    );
                    return (
                      <div key={dia} className="min-w-0">
                        {/* Cabeçalho do dia */}
                        <div
                          className="text-center text-[10px] uppercase tracking-widest font-bold mb-2 py-1 rounded-lg"
                          style={{
                            color: "#6F6F6F",
                            background: "#141414",
                            border: "1px solid #1E1E1E",
                          }}
                        >
                          {label}
                        </div>

                        {/* Blocos de aula */}
                        <div className="space-y-2">
                          {aulasNoDia.length === 0 && (
                            <div
                              className="h-16 rounded-xl flex items-center justify-center text-[10px]"
                              style={{
                                color: "#3A3A3A",
                                border: "1px dashed #222",
                              }}
                            >
                              —
                            </div>
                          )}
                          {aulasNoDia.map((aula) => (
                            <div
                              key={aula.id}
                              className="rounded-xl p-2 relative group"
                              style={{
                                background: "#111111",
                                border: "1px solid #1E1E1E",
                                borderLeft: `3px solid ${aula.cor}`,
                              }}
                            >
                              <p
                                className="text-[11px] font-bold leading-tight truncate"
                                style={{ color: "#F0F0F0" }}
                              >
                                {aula.nome}
                              </p>
                              <p
                                className="text-[10px] mt-0.5 font-mono"
                                style={{ color: "#888" }}
                              >
                                {aula.hora_inicio.slice(0, 5)}–
                                {aula.hora_fim.slice(0, 5)}
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: "#555" }}
                              >
                                {aula.max_vagas} vagas
                              </p>

                              {role === "super_admin" && (
                              <button
                                type="button"
                                onClick={() => setExcluirAlvo({ id: aula.id, nome: aula.nome })}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full"
                                style={{
                                  background: "rgba(239,68,68,0.15)",
                                  color: "#EF4444",
                                }}
                                title="Remover"
                              >
                                <Trash2 size={10} />
                              </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {aulas.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-3xl"
              style={{
                border: "1px dashed #2A2A2A",
                color: "#444",
              }}
            >
              <p className="text-sm">Nenhuma aula cadastrada ainda.</p>
              <p className="text-xs mt-1">
                Use o formulário ao lado para criar a primeira.
              </p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={excluirAlvo !== null}
        onOpenChange={(open) => {
          if (!open && !excluindo) setExcluirAlvo(null);
        }}
      >
        <AlertDialogContent
          className="max-w-md border-[#303030] bg-[#141414] text-[#F2F2F2] sm:max-w-md"
          style={{ border: "1px solid #303030" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black tracking-tight text-white">
              Remover aula da grade?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#A8A8A8] text-sm leading-relaxed">
              {excluirAlvo ? (
                <>
                  Tem certeza de que deseja remover{" "}
                  <span className="font-semibold text-[#F2F2F2]">&quot;{excluirAlvo.nome}&quot;</span> do calendário
                  recorrente? Esta ação não pode ser desfeita.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2 sm:justify-end flex-col-reverse sm:flex-row">
            <AlertDialogCancel
              disabled={excluindo}
              className="mt-0 rounded-full border-[#303030] bg-[#1C1C1C] text-[#E5E5E5] hover:bg-[#2A2A2A] hover:text-white"
            >
              Não
            </AlertDialogCancel>
            <button
              type="button"
              disabled={excluindo}
              onClick={() => void confirmarExclusaoAula()}
              className="inline-flex min-h-[42px] items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold uppercase transition-colors disabled:opacity-50"
              style={{ background: "#EF4444", color: "#FFFFFF" }}
            >
              {excluindo ? "Removendo…" : "Sim"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageFrame>
  );
}
