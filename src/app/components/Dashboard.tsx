import { useState, useEffect, useId, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  UserPlus,
  TrendingUp,
  Activity,
  Clock,
  ChevronDown,
  ArrowRight,
  Filter,
  Sun,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminSidebar } from "./AdminSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { AlunoAvatar } from "./AlunoAvatar";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { initialsFromName, startOfLocalDay, statusFinanceiroToLabel, timeAgoPt } from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";

interface DashboardProps {
  onLogout?: () => void;
}

type AlunoRow = Database["public"]["Tables"]["alunos"]["Row"] & {
  planos: { nome: string } | null;
};

function buildCumulativeByMonth(created: string[], months: Date[]): { month: string; members: number }[] {
  return months.map((endOfMonth) => {
    const t = endOfMonth.getTime();
    const m = endOfMonth.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const label = m.replace(".", "");
    const count = created.filter((c) => new Date(c).getTime() <= t).length;
    return { month: label, members: count };
  });
}

function endOfMonth(y: number, m: number) {
  return new Date(y, m + 1, 0, 23, 59, 59, 999);
}

const planColors: Record<string, { bg: string; text: string; border: string }> = {
  PREMIUM: { bg: "rgba(0,249,228,0.12)", text: "#00F9E4", border: "rgba(0,249,228,0.25)" },
  BASIC: { bg: "rgba(154,154,154,0.12)", text: "#9A9A9A", border: "rgba(154,154,154,0.2)" },
  ELITE: { bg: "rgba(139,92,246,0.12)", text: "#8B5CF6", border: "rgba(139,92,246,0.25)" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  "Em dia": { label: "Em dia", color: "#4ADE80", bg: "rgba(74,222,128,0.12)", icon: CheckCircle2 },
  "Vencendo": { label: "Vencendo", color: "#FACC15", bg: "rgba(250,204,21,0.12)", icon: AlertCircle },
  "Em atraso": { label: "Em atraso", color: "#EF4444", bg: "rgba(239,68,68,0.12)", icon: XCircle },
};

function PlanBadge({ plan }: { plan: string }) {
  const cfg = planColors[plan] || planColors.BASIC;
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-mono"
      style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig["Em dia"];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-[10px] border text-sm"
        style={{ background: "#1C1C1C", borderColor: "#2A2A2A", color: "#fff" }}
      >
        <p className="text-[#9A9A9A] text-xs mb-1">{label}</p>
        <p style={{ color: "#00F9E4" }} className="font-bold">
          {payload[0].value} membros
        </p>
      </div>
    );
  }
  return null;
};

type RecentMember = {
  name: string;
  plan: string;
  status: "Em dia" | "Vencendo" | "Em atraso";
  lastSeen: string;
  foto: string | null;
};

type Tourist = {
  name: string;
  plan: string;
  detail: string;
  color: string;
};

export function Dashboard({ onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const dashPerm = useStaffPermissionGuard("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ativos, setAtivos] = useState(0);
  const [bloqueados, setBloqueados] = useState(0);
  const [inativosCount, setInativosCount] = useState(0);
  const [checkinsHoje, setCheckinsHoje] = useState(0);
  const [freqMedia, setFreqMedia] = useState(0);
  const [memberGrowth, setMemberGrowth] = useState<{ month: string; members: number }[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [growthPct, setGrowthPct] = useState(0);
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [totalTuristas, setTotalTuristas] = useState(0);
  const [novosMes, setNovosMes] = useState(0);

  const uid = useId();
  const gradientId = `members-${uid.replace(/:/g, "")}`;

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const carregar = useCallback(async () => {
    if (!ready) return;
    if (!isSupabaseConfigured) {
      setLoadError("Configure o Supabase no .env");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    const s = getSupabase();
    const { data: aRows, error: e1 } = await s
      .from("alunos")
      .select("id, nome, foto, created_at, status_matricula, status_financeiro, planos(nome)");
    const { data: cRows, error: e2 } = await s.from("checkins").select("aluno_id, data_hora");
    if (e1 || e2) {
      setLoadError((e1 ?? e2)!.message);
      setIsLoading(false);
      return;
    }
    const alunos = (aRows ?? []) as AlunoRow[];
    const checkins = cRows ?? [];

    const lastByAluno = new Map<string, string>();
    for (const c of checkins) {
      const cur = lastByAluno.get(c.aluno_id);
      const t = c.data_hora;
      if (!cur || new Date(t) > new Date(cur)) lastByAluno.set(c.aluno_id, t);
    }

    let at = 0;
    let bl = 0;
    let ina = 0;
    for (const a of alunos) {
      if (a.status_matricula === "ATIVO") at++;
      else if (a.status_matricula === "BLOQUEADO") bl++;
      else ina++;
    }
    setAtivos(at);
    setBloqueados(bl);
    setInativosCount(ina);

    const sDay = startOfLocalDay();
    setCheckinsHoje(
      checkins.filter((c) => {
        const t = new Date(c.data_hora).getTime();
        return t >= sDay.getTime();
      }).length,
    );

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const checkins7d = checkins.filter((c) => new Date(c.data_hora) >= weekAgo).length;
    setFreqMedia(at > 0 ? Math.round((checkins7d / at) * 10) / 10 : 0);

    const now = new Date();
    const monthStarts: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthStarts.push(d);
    }
    const monthEnds = monthStarts.map((st) => endOfMonth(st.getFullYear(), st.getMonth()));
    const created = alunos.map((a) => a.created_at);
    const series = buildCumulativeByMonth(created, monthEnds);
    setMemberGrowth(series);
    const lastTotal = alunos.length;
    setTotalMembers(lastTotal);
    const firstM = series[0]?.members ?? 0;
    setGrowthPct(firstM > 0 ? Math.round(((series[11]?.members ?? 0) - firstM) / firstM * 100) : 0);

    const sortedRecent = alunos
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setRecentMembers(
      sortedRecent.map((a) => ({
        name: a.nome,
        plan: a.planos?.nome?.toUpperCase() ?? "—",
        status: statusFinanceiroToLabel(a.status_financeiro),
        lastSeen: lastByAluno.get(a.id) ? timeAgoPt(lastByAluno.get(a.id)) : "Sem check-in",
        foto: a.foto,
      })),
    );

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const t10 = tenDaysAgo.getTime();
    const turistaAlunos: { a: AlunoRow; days: number }[] = [];
    for (const a of alunos) {
      if (a.status_matricula !== "ATIVO") continue;
      const last = lastByAluno.get(a.id);
      if (!last) {
        turistaAlunos.push({ a, days: 9999 });
        continue;
      }
      const lastT = new Date(last).getTime();
      if (lastT < t10) {
        turistaAlunos.push({ a, days: Math.floor((Date.now() - lastT) / 86400000) });
      }
    }
    turistaAlunos.sort((x, y) => y.days - x.days);
    setTotalTuristas(turistaAlunos.length);
    const colors = ["#00F9E4", "#9A9A9A", "#8B5CF6"];
    setTourists(
      turistaAlunos.slice(0, 3).map((t, i) => ({
        name: t.a.nome,
        plan: t.a.planos?.nome?.toUpperCase() ?? "—",
        detail:
          t.days >= 9999
            ? "Nunca fez check-in"
            : `Último check-in: há ${t.days} dia${t.days === 1 ? "" : "s"}`,
        color: colors[i % colors.length]!,
      })),
    );

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setNovosMes(alunos.filter((a) => new Date(a.created_at) >= firstOfMonth).length);

    setIsLoading(false);
  }, [ready]);

  useEffect(() => {
    void carregar();
  }, [carregar, ready]);

  if (checking || dashPerm.checking || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
          />
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#00F9E4" }}>
            Carregando...
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div
            className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
          />
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#00F9E4" }}>
            Carregando...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex overflow-x-hidden"
      style={{ background: "#0A0A0A", color: "#F5F5F5", fontFamily: "Inter, sans-serif", maxWidth: "100%", width: "100%" }}
    >
      <AdminSidebar />

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{
            background: "#111111",
            borderBottom: "1px solid #1E1E1E",
          }}
        >
          {/* Title */}
          <div>
            <h1 className="font-black uppercase tracking-tight text-lg md:text-xl leading-tight">DASHBOARD</h1>
            <p className="hidden md:block text-xs mt-0.5" style={{ color: "#606060" }}>
              Visão Geral — {todayLabel}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <Filter size={14} style={{ color: "#606060" }} />
              <select
                className="text-sm rounded-full px-4 py-1.5 appearance-none cursor-pointer transition-colors outline-none"
                style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#A8A8A8" }}
              >
                <option>Mês</option>
                <option>Semana</option>
                <option>Ano</option>
              </select>
              <select
                className="text-sm rounded-full px-4 py-1.5 appearance-none cursor-pointer transition-colors outline-none"
                style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#A8A8A8" }}
              >
                <option>Ativos</option>
                <option>Todos</option>
                <option>Inativos</option>
              </select>
            </div>

            <button
              className="hidden md:block p-2 rounded-full transition-colors"
              style={{ color: "#606060" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1C1C1C")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
            >
              <Sun size={18} />
            </button>

            <button
              onClick={() => navigate("/cadastro")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all"
              style={{ background: "transparent", border: "1px solid #2A2A2A", color: "#F5F5F5" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#00F9E4";
                (e.currentTarget as HTMLButtonElement).style.color = "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A2A";
                (e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5";
              }}
            >
              <UserPlus size={14} />
              Novo Aluno
            </button>

            <button
              onClick={() => navigate("/cadastro")}
              className="md:hidden p-2 rounded-full transition-colors"
              style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#F5F5F5" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#303030";
              }}
            >
              <UserPlus size={16} />
            </button>

          </div>
        </motion.header>

        {/* Scrollable content */}
        <main className="px-4 md:px-10 flex-1 overflow-y-auto py-5 space-y-4 pb-20 md:pb-5">
          {loadError && (
            <div
              className="p-3 rounded-[12px] text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#F87171",
              }}
            >
              {loadError}
            </div>
          )}

          {/* ── ROW 1: 4 Metric Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: "ativos",
                label: "ATIVOS",
                value: String(ativos),
                sub: "Alunos ativos",
                icon: TrendingUp,
                iconColor: "#4ADE80",
                iconBg: "rgba(74,222,128,0.1)",
                iconBorder: "rgba(74,222,128,0.2)",
              },
              {
                id: "inativos",
                label: "INATIVOS",
                value: String(bloqueados + inativosCount),
                sub: `${bloqueados} bloqueado(s), ${inativosCount} inativo(s)`,
                icon: XCircle,
                iconColor: "#FACC15",
                iconBg: "rgba(250,204,21,0.1)",
                iconBorder: "rgba(250,204,21,0.2)",
              },
              {
                id: "hoje",
                label: "HOJE",
                value: String(checkinsHoje),
                sub: "Check-ins hoje",
                icon: ClipboardCheck,
                iconColor: "#00F9E4",
                iconBg: "rgba(0,249,228,0.1)",
                iconBorder: "rgba(0,249,228,0.2)",
              },
              {
                id: "freq",
                label: "FREQUÊNCIA",
                value: String(freqMedia),
                valueExtra: "x/sem",
                sub: "Média check-ins / ativo (7d)",
                icon: Activity,
                iconColor: "#8B5CF6",
                iconBg: "rgba(139,92,246,0.1)",
                iconBorder: "rgba(139,92,246,0.2)",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
                className="rounded-[16px] p-5 relative transition-all duration-200 cursor-default group"
                style={{
                  background: "#0D0D0D",
                  border: "1px solid #303030",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "#3A3A3A")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "#303030")
                }
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{
                      background: stat.iconBg,
                      border: `1px solid ${stat.iconBorder}`,
                    }}
                  >
                    <stat.icon size={16} style={{ color: stat.iconColor }} />
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: "#606060" }}
                  >
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-black text-4xl leading-none tracking-tight" style={{ color: "#F2F2F2" }}>
                    {stat.value}
                  </span>
                  {stat.valueExtra && (
                    <span className="text-sm" style={{ color: "#606060" }}>
                      {stat.valueExtra}
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: "#A8A8A8" }}>
                  {stat.sub}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── ROW 2: Turistas + Novos ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Turistas highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="rounded-[16px] p-5 col-span-1 relative"
              style={{
                background: "linear-gradient(134deg, rgba(0,249,228,0.18) 0%, rgba(0,249,228,0.05) 100%)",
                border: "1px solid rgba(0,249,228,0.3)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: "#00F9E4" }}
                >
                  <Clock size={16} style={{ color: "#0A0A0A" }} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#00F9E4" }}>
                  {totalTuristas}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-black text-4xl leading-none tracking-tight" style={{ color: "#F2F2F2" }}>
                  {totalTuristas}
                </span>
              </div>
              <p className="text-sm leading-snug" style={{ color: "rgba(242,242,242,0.7)" }}>
                Turistas 10+ dias sem check-in
              </p>
            </motion.div>

            {/* Novos */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.33 }}
              className="rounded-[16px] p-5 col-span-1"
              style={{ background: "#0D0D0D", border: "1px solid #303030" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: "rgba(0,249,228,0.1)", border: "1px solid rgba(0,249,228,0.2)" }}
                >
                  <UserPlus size={16} style={{ color: "#00F9E4" }} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#606060" }}>
                  NOVOS
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-black text-4xl leading-none tracking-tight" style={{ color: "#F2F2F2" }}>
                  {novosMes}
                </span>
              </div>
              <p className="text-sm" style={{ color: "#A8A8A8" }}>
                Novos este mês
              </p>
            </motion.div>
          </div>

          {/* ── Growth Chart ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="rounded-[16px] p-5"
            style={{ background: "#0D0D0D", border: "1px solid #303030" }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg leading-tight">
                  +{totalMembers} {totalMembers === 1 ? "MEMBRO" : "MEMBROS"}
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "#9A9A9A" }}>
                  Crescimento nos últimos 12 meses
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(0,249,228,0.1)", color: "#00F9E4", border: "1px solid rgba(0,249,228,0.2)" }}
              >
                <TrendingUp size={12} />
                {growthPct >= 0 ? "+" : ""}
                {growthPct}%
              </span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={memberGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F9E4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00F9E4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="transparent"
                  tick={{ fill: "#606060", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: "#606060", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#2A2A2A", strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="members"
                  stroke="#00F9E4"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: "#00F9E4", stroke: "#0A0A0A", strokeWidth: 2 }}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #1E1E1E" }}>
              <button
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: "#606060" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
              >
                Últimos 12 meses
                <ChevronDown size={14} className="shrink-0 text-primary" />
              </button>
              <button
                className="flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ color: "#00F9E4" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#33FFEE")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
              >
                Ver todos os membros
                <ArrowRight size={14} className="shrink-0 text-primary" />
              </button>
            </div>
          </motion.div>

          {/* ── Bottom Row: Alunos Recentes + Turistas panel ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pb-4">
            {/* Alunos Recentes */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44 }}
              className="lg:col-span-2 rounded-[16px] p-5"
              style={{ background: "#0D0D0D", border: "1px solid #303030" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase tracking-tight text-sm">ALUNOS RECENTES</h3>
                <button
                  className="text-sm transition-colors"
                  style={{ color: "#00F9E4" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#33FFEE")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                >
                  Ver todos →
                </button>
              </div>

              <div className="space-y-1">
                {recentMembers.length === 0 && (
                  <p className="text-sm py-4" style={{ color: "#606060" }}>
                    Nenhum aluno cadastrado ainda.
                  </p>
                )}
                {recentMembers.map((member, i) => (
                  <motion.div
                    key={member.name + i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3 px-3 py-3 rounded-[12px] cursor-pointer transition-all duration-200 group"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = "#161616")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                    }
                    onClick={() => navigate("/alunos")}
                  >
                    <AlunoAvatar nome={member.name} src={member.foto} size={40} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm truncate">{member.name}</span>
                        <StatusBadge status={member.status} />
                      </div>
                      <p className="text-xs" style={{ color: "#606060" }}>
                        {member.lastSeen}
                      </p>
                    </div>

                    {/* Plan */}
                    <div className="flex items-center gap-2 shrink-0">
                      <PlanBadge plan={member.plan} />
                      <ArrowRight
                        size={14}
                        className="shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Turistas Detail Panel */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-[16px] p-5"
              style={{
                background: "linear-gradient(160deg, rgba(0,249,228,0.1) 0%, rgba(0,249,228,0.03) 100%)",
                border: "1px solid rgba(0,249,228,0.2)",
              }}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                    style={{ background: "#00F9E4" }}
                  >
                    <Clock size={14} style={{ color: "#0A0A0A" }} />
                  </div>
                  <span className="font-black uppercase tracking-tight text-sm">TURISTAS</span>
                </div>
                <span className="font-mono text-[10px]" style={{ color: "#606060" }}>
                  ...
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: "#606060" }}>
                Sem check-in há 10+ dias
              </p>

              <div className="space-y-3">
                {tourists.length === 0 && (
                  <p className="text-xs" style={{ color: "#606060" }}>
                    Nenhum aluno ativo com 10+ dias sem check-in.
                  </p>
                )}
                {tourists.map((t, i) => (
                  <motion.div
                    key={t.name + i}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.07 }}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                    onClick={() => navigate("/alunos")}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                      style={{ background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}
                    >
                      {initialsFromName(t.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-bold truncate">{t.name}</span>
                        <PlanBadge plan={t.plan} />
                      </div>
                      <p className="text-[11px]" style={{ color: "#606060" }}>
                        {t.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid rgba(0,249,228,0.15)", paddingTop: "12px", marginTop: "12px" }}>
                <button
                  className="w-full text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                  style={{ color: "#00F9E4" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#33FFEE")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                >
                  Ver todos os {totalTuristas} turista{totalTuristas === 1 ? "" : "s"}
                  <ArrowRight size={13} className="shrink-0 text-primary" />
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}