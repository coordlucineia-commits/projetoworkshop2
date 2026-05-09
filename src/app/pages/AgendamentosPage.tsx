import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import {
  formatDateYmdToBr,
  maskPhoneBr,
  buildWhatsAppReminderPayload,
  openWhatsAppWithText,
} from "../../lib/visitasGuiadas";
import {
  Search,
  ArrowLeft,
  Sun,
  Calendar,
  MoreHorizontal,
  Bell,
  Check,
  Ban,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

type VisitaRow = Database["public"]["Tables"]["visitas_guiadas"]["Row"];

function badgeForStatus(s: string) {
  switch (s) {
    case "confirmado":
      return { label: "Confirmado", bg: "rgba(34, 197, 94, 0.15)", text: "#22C55E" };
    case "cancelado":
      return { label: "Cancelado", bg: "rgba(239, 68, 68, 0.15)", text: "#EF4444" };
    default:
      return {
        label: "Pendente",
        bg: "rgba(245, 158, 11, 0.18)",
        text: "#F59E0B",
      };
  }
}

/** Compara pelo calendário local (data_visita vem como YYYY-MM-DD). */
function dataVisitaToLocalMidnight(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).setHours(0, 0, 0, 0);
}

export function AgendamentosPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("agendamentos");
  const [rows, setRows] = useState<VisitaRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState<"hoje" | "semana" | "mes">(
    "hoje",
  );
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "pendente" | "confirmado" | "cancelado"
  >("todos");
  const [cancelTarget, setCancelTarget] = useState<VisitaRow | null>(null);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured || !ready) return;
    setLoading(true);
    setLoadError(null);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("visitas_guiadas")
      .select("*")
      .order("data_visita", { ascending: true })
      .order("horario", { ascending: true });
    if (error) {
      setLoadError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as VisitaRow[]);
    }
    setLoading(false);
  }, [ready]);

  useEffect(() => {
    if (ready) void carregar();
  }, [ready, carregar]);

  const todayStart = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  }, []);

  const weekEnd = todayStart + 7 * 24 * 60 * 60 * 1000;

  const startOfMonthTs = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1).setHours(0, 0, 0, 0);
  }, []);

  const kpis = useMemo(() => {
    const todayCount = rows.filter((r) => dataVisitaToLocalMidnight(r.data_visita) === todayStart).length;
    const weekCount = rows.filter((r) => {
      const ts = dataVisitaToLocalMidnight(r.data_visita);
      return ts >= todayStart && ts < weekEnd;
    }).length;
    const pend = rows.filter((r) => r.status === "pendente").length;
    const ok = rows.filter((r) => r.status === "confirmado").length;
    return { todayCount, weekCount, pend, ok };
  }, [rows, todayStart, weekEnd]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return rows.filter((r) => {
      if (filtroStatus !== "todos" && r.status !== filtroStatus) return false;

      const ts = dataVisitaToLocalMidnight(r.data_visita);
      if (filtroPeriodo === "hoje" && ts !== todayStart) return false;
      if (filtroPeriodo === "semana") {
        if (ts < todayStart || ts >= weekEnd) return false;
      }
      if (filtroPeriodo === "mes" && ts < startOfMonthTs) return false;

      if (!q) return true;
      const telShow = maskPhoneBr(r.telefone ?? "").toLowerCase();
      const telRaw = (r.telefone ?? "").toLowerCase();
      return (
        (r.nome_completo ?? "").toLowerCase().includes(q) ||
        telShow.includes(q) ||
        telRaw.includes(q)
      );
    });
  }, [rows, filtroPeriodo, filtroStatus, busca, todayStart, weekEnd, startOfMonthTs]);

  async function atualizarStatus(id: string, status: VisitaRow["status"]) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from("visitas_guiadas")
      .update({ status })
      .eq("id", id);
    if (error) setLoadError(error.message);
    else void carregar();
  }

  function enviarLembrete(row: VisitaRow) {
    const baseUrl = `${window.location.origin}`;
    const url = `${baseUrl.replace(/\/$/, "")}/confirmar-visita?id=${row.id}`;
    const text = buildWhatsAppReminderPayload({
      nome: row.nome_completo,
      dataVisitBr: formatDateYmdToBr(row.data_visita),
      horario: row.horario,
      confirmUrl: url,
    });
    openWhatsAppWithText(row.telefone, text);
    void (async () => {
      const supabase = getSupabase();
      await supabase.rpc("visitas_guiadas_marcar_lembrete", { p_id: row.id });
      void carregar();
    })();
  }

  if (!isSupabaseConfigured) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: "#0A0A0A", color: "#fff" }}
      >
        Configure Supabase no .env para usar agendamentos.
      </div>
    );
  }

  if (checking || permGuard.checking || !ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0A0A0A", color: "#9A9A9A" }}
      >
        Carregando…
      </div>
    );
  }

  const pillPeriodo = (id: typeof filtroPeriodo, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setFiltroPeriodo(id)}
      className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap"
      style={{
        ...(filtroPeriodo === id
          ? { background: "#00F9E4", color: "#0A0A0A" }
          : {
              background: "#1C1C1C",
              color: "#9A9A9A",
              border: "1px solid #2A2A2A",
            }),
      }}
    >
      {label}
    </button>
  );

  const pillStatus = (id: typeof filtroStatus, label: string) => (
    <button
      type="button"
      key={id}
      onClick={() => setFiltroStatus(id)}
      className="px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{
        ...(filtroStatus === id
          ? { background: "#00F9E4", color: "#0A0A0A" }
          : {
              background: "#161616",
              color: "#6B6B6B",
              border: "1px solid #2A2A2A",
            }),
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-40 px-4 md:px-8 py-5 flex items-center justify-between gap-4"
          style={{
            background: "rgba(13, 13, 13, 0.8)",
            borderBottom: "1px solid #0A0A0A",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="min-w-0">
            <h1 className="font-black tracking-tight text-lg md:text-xl mb-1 uppercase" style={{ color: "#F2F2F2" }}>
              Agendamentos
            </h1>
            <p className="hidden md:block font-mono text-xs uppercase tracking-widest" style={{ color: "#606060" }}>
              Gestão de visitas guiadas
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all"
              style={{
                background: "#1A1A1A",
                border: "1px solid #303030",
                color: "#F2F2F2",
              }}
            >
              <Sun size={18} />
            </button>
          </div>
        </motion.header>

        <main className="px-4 md:px-10 flex-1 overflow-y-auto py-6 pb-24 md:pb-8">
          {loadError ? (
            <p className="mb-4 text-sm text-red-400">{loadError}</p>
          ) : null}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6">
            {[
              { label: "Hoje", valor: kpis.todayCount, sub: "Visitas hoje", Icon: CalendarDays },
              { label: "Semana", valor: kpis.weekCount, sub: "Esta semana", Icon: Calendar },
              { label: "Pendentes", valor: kpis.pend, sub: "Aguardando confirmação", Icon: Calendar },
              { label: "Confirmadas", valor: kpis.ok, sub: "Confirmadas", Icon: Calendar },
            ].map((card, i) => (
              <div
                key={i}
                className="p-4 md:p-6 rounded-2xl"
                style={{
                  background: "#0D0D0D",
                  border: "1px solid #303030",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                    background: "rgba(0, 249, 228, 0.1)",
                    border: "1px solid rgba(0, 249, 228, 0.2)",
                  }}>
                    <card.Icon size={18} style={{ color: "#00F9E4" }} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#606060" }}>
                    {card.label}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-black text-white mb-1">{card.valor}</p>
                <p className="text-[11px] text-[#6B6B6B]">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="relative mb-5">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-[18px] text-[#6B6B6B]" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou telefone..."
                className="w-full pl-12 pr-5 py-3.5 rounded-full outline-none text-sm text-white placeholder-[#6B6B6B]"
                style={{
                  background: "#1C1C1C",
                  border: "1px solid #2A2A2A",
                  borderRadius: "9999px",
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {pillPeriodo("hoje", "Hoje")}
              {pillPeriodo("semana", "Semana")}
              {pillPeriodo("mes", "Mês")}
            </div>

            <div className="flex flex-wrap gap-2">
              {pillStatus("todos", "Todos")}
              {pillStatus("pendente", "Pendente")}
              {pillStatus("confirmado", "Confirmado")}
              {pillStatus("cancelado", "Cancelado")}
            </div>
          </div>

          {loading ? (
            <p className="text-[#606060] text-sm">Carregando agendamentos…</p>
          ) : (
            <div className="space-y-3">
              {filtrados.length === 0 ? (
                <p className="text-[#606060] text-sm">Nenhum agendamento encontrado.</p>
              ) : (
                filtrados.map((r) => {
                  const b = badgeForStatus(r.status);
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-start md:items-center gap-4 p-4 md:px-6 md:py-5"
                      style={{
                        borderRadius: "16px",
                        background: "#111111",
                        border: "1px solid #252525",
                      }}
                    >
                      <div className="flex-1 min-w-[200px] space-y-1">
                        <p className="font-bold text-white text-sm md:text-base">{r.nome_completo}</p>
                        <p className="text-xs text-[#AAAAAA]">{maskPhoneBr(r.telefone)}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                        <div>
                          <span className="text-[#6B6B6B] uppercase tracking-wide block mb-1">Data</span>
                          <span className="text-white font-semibold">{formatDateYmdToBr(r.data_visita)}</span>
                        </div>
                        <div>
                          <span className="text-[#6B6B6B] uppercase tracking-wide block mb-1">Horário</span>
                          <span className="text-white font-semibold">{r.horario}</span>
                        </div>
                        <div>
                          <span className="text-[#6B6B6B] uppercase tracking-wide block mb-1">Status</span>
                          <span
                            className="inline-block px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wide"
                            style={{ background: b.bg, color: b.text }}
                          >
                            {b.label}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-2 rounded-full hover:bg-[#1C1C1C]"
                            style={{ color: "#AAA" }}
                            aria-label="Ações"
                          >
                            <MoreHorizontal size={22} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[200px]" style={{ background: "#111111", borderColor: "#2A2A2A" }}>
                          <DropdownMenuItem
                            className="text-white focus:bg-[#1C1C1C] focus:text-[#00F9E4] cursor-pointer"
                            disabled={r.status !== "pendente"}
                            onClick={() => enviarLembrete(r)}
                          >
                            <Bell className="size-4 mr-2 shrink-0" />
                            Enviar lembrete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                          <DropdownMenuItem
                            className="text-white focus:bg-[#1C1C1C] focus:text-[#22C55E] cursor-pointer"
                            disabled={r.status === "confirmado" || r.status === "cancelado"}
                            onClick={() => void atualizarStatus(r.id, "confirmado")}
                          >
                            <Check className="size-4 mr-2 shrink-0 text-[#22C55E]" />
                            Marcar como confirmado
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                          <DropdownMenuItem
                            className="text-red-400 focus:bg-[#2a1515] focus:text-red-300 cursor-pointer"
                            disabled={r.status === "cancelado"}
                            onClick={() => setCancelTarget(r)}
                          >
                            <Ban className="size-4 mr-2 shrink-0" />
                            Cancelar agendamento
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>

        <MobileBottomNav />
      </div>

      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent className="border-[#2A2A2A] rounded-[16px]" style={{ background: "#111111" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase text-base font-black tracking-tight">
              Cancelar visita?
            </AlertDialogTitle>
            <p className="text-sm text-[#AAAAAA] leading-relaxed pt-2">
              {cancelTarget ? (
                <>
                  Tem certeza que deseja cancelar a visita de{" "}
                  <span className="text-white font-semibold">{cancelTarget.nome_completo}</span>{" "}
                  agendada para{" "}
                  <span className="text-white font-semibold">
                    {formatDateYmdToBr(cancelTarget.data_visita)}
                  </span>{" "}
                  às <span className="text-white font-semibold">{cancelTarget.horario}</span>?
                </>
              ) : null}
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel className="rounded-full bg-[#1C1C1C] text-white border-[#2A2A2A] hover:bg-[#252525] inline-flex items-center justify-center gap-2">
              <ArrowLeft size={16} className="shrink-0 text-primary" />
              Voltar
            </AlertDialogCancel>
            <button
              type="button"
              className="rounded-full px-5 py-2 text-sm font-bold uppercase bg-[#EF4444] hover:bg-[#dc2626] text-white"
              onClick={async () => {
                if (!cancelTarget) return;
                await atualizarStatus(cancelTarget.id, "cancelado");
                setCancelTarget(null);
              }}
            >
              Confirmar cancelamento
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
