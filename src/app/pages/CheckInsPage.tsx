import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { AlunoAvatar } from "../components/AlunoAvatar";
import {
  Search,
  Sun,
  UserPlus,
  QrCode,
  Calendar,
  Clock,
  UserCheck,
  CalendarDays,
  Users,
  Download,
} from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateBr, startOfLocalDay, statusFinanceiroToLabel, timeOnlyBr } from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";

interface CheckIn {
  id: string;
  alunoNome: string;
  alunoFoto: string | null;
  statusFinanceiro: "Em dia" | "Vencendo" | "Em atraso";
  plano: string;
  data: string;
  horario: string;
  dataHora: string;
}

type AlunoMini = Pick<
  Database["public"]["Tables"]["alunos"]["Row"],
  "nome" | "foto" | "status_financeiro"
> & {
  planos: { nome: string } | null;
};

function inRangeFiltro(t: string, filtro: "hoje" | "semana" | "mes"): boolean {
  const d = new Date(t).getTime();
  const now = Date.now();
  if (Number.isNaN(d)) return false;
  if (filtro === "hoje") {
    const s = startOfLocalDay();
    return d >= s.getTime() && d <= now;
  }
  if (filtro === "semana") {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo.getTime();
  }
  const x = new Date(t);
  const c = new Date();
  return x.getFullYear() === c.getFullYear() && x.getMonth() === c.getMonth();
}

function countInRange(
  items: { dataHora: string }[],
  filtro: "hoje" | "semana" | "mes",
): number {
  return items.filter((c) => inRangeFiltro(c.dataHora, filtro)).length;
}

function peakHourRange(items: { dataHora: string }[]): string {
  if (items.length === 0) return "—";
  const byHour = new Map<number, number>();
  for (const c of items) {
    const h = new Date(c.dataHora).getHours();
    if (Number.isNaN(h)) continue;
    byHour.set(h, (byHour.get(h) ?? 0) + 1);
  }
  let bestH = 0;
  let bestC = 0;
  for (const [h, n] of byHour) {
    if (n > bestC) {
      bestC = n;
      bestH = h;
    }
  }
  if (bestC === 0) return "—";
  const start = String(bestH).padStart(2, "0") + ":00";
  const endH = (bestH + 1) % 24;
  const end = String(endH).padStart(2, "0") + ":00";
  return `${start}–${end}`;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Em dia":
      return { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" };
    case "Vencendo":
      return { bg: "rgba(251, 191, 36, 0.1)", text: "#FBBF24" };
    case "Em atraso":
      return { bg: "rgba(0, 249, 228, 0.1)", text: "#00F9E4" };
    default:
      return { bg: "rgba(154, 154, 154, 0.1)", text: "#9A9A9A" };
  }
}

export function CheckInsPage() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<"hoje" | "semana" | "mes">("hoje");
  const [busca, setBusca] = useState("");
  const [todos, setTodos] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      setTodos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("checkins")
      .select("id, data_hora, alunos ( nome, foto, status_financeiro, planos ( nome ) )")
      .gte("data_hora", from.toISOString())
      .order("data_hora", { ascending: false })
      .limit(2000);
    if (error) {
      setLoadError(error.message);
      setTodos([]);
      setLoading(false);
      return;
    }
    const list: CheckIn[] = (data ?? []).map((row) => {
      const a = row.alunos as AlunoMini | null;
      const nome = a?.nome ?? "Aluno";
      const pl = a?.planos?.nome;
      return {
        id: row.id,
        alunoNome: nome,
        alunoFoto: a?.foto ?? null,
        statusFinanceiro: a
          ? statusFinanceiroToLabel(a.status_financeiro)
          : "Em dia",
        plano: pl ? pl.toUpperCase() : "—",
        data: formatDateBr(row.data_hora),
        horario: timeOnlyBr(row.data_hora),
        dataHora: row.data_hora,
      };
    });
    setTodos(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const metricHoje = useMemo(() => countInRange(todos, "hoje"), [todos]);
  const metricSemana = useMemo(() => countInRange(todos, "semana"), [todos]);
  const metricMes = useMemo(() => countInRange(todos, "mes"), [todos]);
  const picoHoje = useMemo(
    () => peakHourRange(todos.filter((c) => inRangeFiltro(c.dataHora, "hoje"))),
    [todos],
  );

  const checkInsFiltrados = useMemo(() => {
    return todos.filter((checkIn) => {
      if (!inRangeFiltro(checkIn.dataHora, filtro)) return false;
      const termo = busca.toLowerCase();
      if (!termo) return true;
      return checkIn.alunoNome.toLowerCase().includes(termo);
    });
  }, [todos, filtro, busca]);

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-40 px-4 md:px-8 py-5 flex items-center justify-between"
          style={{
            background: "rgba(13, 13, 13, 0.8)",
            borderBottom: "1px solid #0A0A0A",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="min-w-0">
            <h1
              className="font-black tracking-tight text-lg md:text-xl mb-1"
              style={{ color: "#F2F2F2" }}
            >
              CHECK-INS
            </h1>
            <p
              className="hidden md:block font-mono text-sm uppercase tracking-widest"
              style={{ color: "#606060" }}
            >
              Histórico e controle de frequência
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              className="hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all"
              style={{
                background: "#1A1A1A",
                border: "1px solid #303030",
                color: "#F2F2F2",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#303030";
              }}
            >
              <Sun size={18} />
            </button>

            <button
              onClick={() => navigate("/cadastro")}
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                background: "#1A1A1A",
                border: "1px solid #303030",
                color: "#F2F2F2",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#303030";
              }}
            >
              <UserPlus size={14} />
              Novo Aluno
            </button>

            <button
              onClick={() => navigate("/cadastro")}
              className="md:hidden p-2 rounded-full transition-colors"
              style={{
                background: "#1A1A1A",
                border: "1px solid #303030",
                color: "#F2F2F2",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#303030";
              }}
            >
              <UserPlus size={16} />
            </button>

            <button
              onClick={() => navigate("/recepcao")}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap"
              style={{ background: "#00F9E4", color: "#0A0A0A" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 30px rgba(0, 249, 228, 0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <QrCode size={14} />
              <span className="hidden sm:inline">Ativar Recepção</span>
              <span className="sm:hidden">Recepção</span>
            </button>
          </div>
        </motion.header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 pb-20 md:pb-6">
          {/* Cards de Métricas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6"
          >
            {/* Card Hoje */}
            <div
              className="p-4 md:p-6 rounded-2xl"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(0, 249, 228, 0.1)",
                    border: "1px solid rgba(0, 249, 228, 0.2)",
                  }}
                >
                  <UserCheck size={20} style={{ color: "#00F9E4" }} />
                </div>
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#606060" }}
                >
                  Hoje
                </span>
              </div>
              <p
                className="font-black text-4xl mb-2"
                style={{ color: "#F2F2F2" }}
              >
                {loading ? "—" : metricHoje}
              </p>
              <p className="text-sm" style={{ color: "#A8A8A8" }}>
                Check-ins hoje
              </p>
            </div>

            {/* Card Semana */}
            <div
              className="p-4 md:p-6 rounded-2xl"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(74, 222, 128, 0.1)",
                    border: "1px solid rgba(74, 222, 128, 0.2)",
                  }}
                >
                  <CalendarDays size={20} style={{ color: "#4ADE80" }} />
                </div>
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#606060" }}
                >
                  Semana
                </span>
              </div>
              <p
                className="font-black text-4xl mb-2"
                style={{ color: "#F2F2F2" }}
              >
                {loading ? "—" : metricSemana}
              </p>
              <p className="text-sm" style={{ color: "#A8A8A8" }}>
                Esta semana
              </p>
            </div>

            {/* Card Mês */}
            <div
              className="p-4 md:p-6 rounded-2xl"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <Users size={20} style={{ color: "#8B5CF6" }} />
                </div>
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#606060" }}
                >
                  Mês
                </span>
              </div>
              <p
                className="font-black text-4xl mb-2"
                style={{ color: "#F2F2F2" }}
              >
                {loading ? "—" : metricMes}
              </p>
              <p className="text-sm" style={{ color: "#A8A8A8" }}>
                Este mês
              </p>
            </div>

            {/* Card Pico */}
            <div
              className="p-4 md:p-6 rounded-2xl"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(250, 204, 21, 0.1)",
                    border: "1px solid rgba(250, 204, 21, 0.2)",
                  }}
                >
                  <Clock size={20} style={{ color: "#FACC15" }} />
                </div>
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#606060" }}
                >
                  Pico
                </span>
              </div>
              <p
                className="font-black text-lg md:text-2xl mb-2 whitespace-nowrap"
                style={{ color: "#F2F2F2" }}
              >
                {loading ? "—" : picoHoje}
              </p>
              <p className="text-xs md:text-sm" style={{ color: "#A8A8A8" }}>
                Horário de pico
              </p>
            </div>
          </motion.div>

          {/* Histórico de Check-ins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6 rounded-2xl"
            style={{
              background: "#0D0D0D",
              border: "1px solid #303030",
            }}
          >
            {/* Cabeçalho */}
            <div className="mb-6">
              <h2
                className="font-black text-sm md:text-lg uppercase tracking-tight mb-4 md:mb-0"
                style={{ color: "#F2F2F2" }}
              >
                Histórico de Check-ins
              </h2>

              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {/* Filtros de período */}
                <button
                  onClick={() => setFiltro("hoje")}
                  className="px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all"
                  style={{
                    background: filtro === "hoje" ? "#00F9E4" : "#1A1A1A",
                    color: filtro === "hoje" ? "#0A0A0A" : "#606060",
                  }}
                >
                  Hoje
                </button>

                <button
                  onClick={() => setFiltro("semana")}
                  className="px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all"
                  style={{
                    background: filtro === "semana" ? "#00F9E4" : "#1A1A1A",
                    color: filtro === "semana" ? "#0A0A0A" : "#606060",
                  }}
                >
                  Semana
                </button>

                <button
                  onClick={() => setFiltro("mes")}
                  className="px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all"
                  style={{
                    background: filtro === "mes" ? "#00F9E4" : "#1A1A1A",
                    color: filtro === "mes" ? "#0A0A0A" : "#606060",
                  }}
                >
                  Mês
                </button>

                {/* Botão Baixar Relatório */}
                <button
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all"
                  style={{ background: "#00F9E4", color: "#0A0A0A" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 0 30px rgba(0, 249, 228, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "none";
                  }}
                >
                  <Download size={14} />
                  <span className="hidden md:inline">Baixar Relatório</span>
                  <span className="md:hidden">Relatório</span>
                </button>
              </div>
            </div>

            {loadError && (
              <div
                className="p-4 rounded-xl mb-4 text-sm"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#F87171",
                }}
              >
                {loadError}
              </div>
            )}

            {loading && (
              <div
                className="flex items-center justify-center py-12 gap-3"
                style={{ color: "#606060" }}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
                />
                <span className="font-mono text-xs uppercase tracking-widest">
                  Carregando check-ins…
                </span>
              </div>
            )}

            {!loading && !loadError && todos.length === 0 && (
              <div
                className="p-8 rounded-xl text-center mb-4"
                style={{ background: "#1A1A1A", border: "1px solid #303030" }}
              >
                <p className="font-bold mb-2" style={{ color: "#F2F2F2" }}>
                  Nenhum check-in registrado
                </p>
                <p className="text-sm mb-4" style={{ color: "#606060" }}>
                  Os check-ins aparecem após a recepção confirmar a presença.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/recepcao")}
                  className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{ background: "#00F9E4", color: "#0A0A0A" }}
                >
                  Abrir recepção
                </button>
              </div>
            )}

            {/* Barra de busca */}
            <div className="relative mb-6">
              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2"
                style={{ color: "#606060" }}
              />
              <input
                type="text"
                placeholder="Buscar por nome do aluno..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-full px-14 py-3 text-sm transition-colors"
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #303030",
                  color: "#FFFFFF",
                }}
                onFocus={(e) =>
                  ((e.currentTarget as HTMLInputElement).style.borderColor =
                    "#00F9E4")
                }
                onBlur={(e) =>
                  ((e.currentTarget as HTMLInputElement).style.borderColor =
                    "#303030")
                }
              />
            </div>

            {/* Lista de check-ins */}
            <div className="space-y-3">
              {!loading &&
                checkInsFiltrados.length === 0 &&
                todos.length > 0 && (
                  <p className="text-sm text-center py-6" style={{ color: "#606060" }}>
                    Nenhum check-in neste período com esse filtro.
                  </p>
                )}
              {checkInsFiltrados.map((checkIn, index) => (
                <motion.div
                  key={checkIn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                  style={{
                    background: "#1A1A1A",
                    border: "1px solid #303030",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#00F9E4";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor =
                      "#303030";
                  }}
                  onClick={() => navigate("/alunos")}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <AlunoAvatar
                      nome={checkIn.alunoNome}
                      src={checkIn.alunoFoto}
                      size={48}
                    />

                    {/* Info */}
                    <div>
                      <h3
                        className="font-bold text-base mb-1"
                        style={{ color: "#F2F2F2" }}
                      >
                        {checkIn.alunoNome}
                      </h3>

                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className="font-mono"
                          style={{
                            color: getStatusColor(checkIn.statusFinanceiro)
                              .text,
                          }}
                        >
                          {checkIn.statusFinanceiro}
                        </span>
                        <span style={{ color: "#606060" }}>•</span>
                        <span
                          className="font-mono uppercase tracking-widest"
                          style={{ color: "#606060" }}
                        >
                          {checkIn.plano}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Data e Horário */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} style={{ color: "#606060" }} />
                      <span className="text-sm" style={{ color: "#F2F2F2" }}>
                        {checkIn.data}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} style={{ color: "#606060" }} />
                      <span className="text-sm" style={{ color: "#A8A8A8" }}>
                        {checkIn.horario}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
