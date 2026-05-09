import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import { useStaffSession } from "../context/StaffSessionContext";
import { motion, AnimatePresence } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  Sun,
  UserPlus,
  Edit2,
  Mail,
  Phone,
  Calendar,
  Users,
} from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import {
  formatDateBr,
  formatDateTimeBr,
  formaPagamentoToLabel,
  statusFinanceiroToLabel,
  statusPagamentoToLabel,
} from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";
import { AlunoAvatar } from "../components/AlunoAvatar";
import { planTierLabel, planHasPersonalSessions } from "../../lib/planHelpers";

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  telefone: string;
  plano: string;
  planoTier: string;
  planoHasPersonal: boolean;
  statusFinanceiro: "Em dia" | "Vencendo" | "Em atraso";
  statusMatricula: "ATIVO" | "BLOQUEADO" | "INATIVO";
  dataCadastro: string;
  dataInicio: string;
  ultimoCheckin: string;
  totalCheckins: number;
  avatar: string | null;
  professorAvaliacao: { id: string; nome: string } | null;
  professorAcompanhamento: { id: string; nome: string } | null;
  pagamentos: {
    data: string;
    status: "Pago" | "Atrasado" | "Pendente" | "Cancelado";
    forma: string;
    valor: number;
  }[];
}

type PlanoRow = Database["public"]["Tables"]["planos"]["Row"];
type AlunoRow = Database["public"]["Tables"]["alunos"]["Row"];
type PagRow = Database["public"]["Tables"]["pagamentos"]["Row"];
type ProfRef = { id: string; nome: string } | null;

type AlunoRawRow = AlunoRow & {
  planos: PlanoRow | null;
  pagamentos: PagRow[] | null;
  professor_avaliacao: ProfRef;
  professor_acompanhamento: ProfRef;
};

function buildAlunoList(
  rows: AlunoRawRow[],
  checkinMap: Map<string, { count: number; last: string | null }>,
): Aluno[] {
  return rows.map((row) => {
    const st = checkinMap.get(row.id) ?? { count: 0, last: null };
    const planoNome = row.planos?.nome ?? null;
    const pags = (row.pagamentos ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(b.data_vencimento).getTime() -
          new Date(a.data_vencimento).getTime(),
      )
      .map((p) => ({
        data: formatDateBr(p.data_vencimento),
        status: statusPagamentoToLabel(p.status),
        forma: formaPagamentoToLabel(p.forma_pagamento),
        valor: p.valor,
      }));

    return {
      id: row.id,
      nome: row.nome,
      matricula: row.matricula.startsWith("#")
        ? row.matricula
        : `#${row.matricula}`,
      email: row.email,
      telefone: row.telefone ?? "—",
      plano: planoNome?.toUpperCase() ?? "—",
      planoTier: planTierLabel(planoNome),
      planoHasPersonal: planHasPersonalSessions(planoNome),
      statusFinanceiro: statusFinanceiroToLabel(row.status_financeiro),
      statusMatricula: row.status_matricula,
      dataCadastro: formatDateBr(row.created_at),
      dataInicio: formatDateBr(row.created_at),
      ultimoCheckin: st.last
        ? formatDateTimeBr(st.last)
        : "Nenhum check-in",
      totalCheckins: st.count,
      avatar: row.foto,
      professorAvaliacao: row.professor_avaliacao ?? null,
      professorAcompanhamento: row.professor_acompanhamento ?? null,
      pagamentos: pags,
    };
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "Em dia":
      return { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" };
    case "Vencendo":
      return { bg: "rgba(251, 191, 36, 0.1)", text: "#FBBF24" };
    case "Em atraso":
      return { bg: "rgba(0, 249, 228, 0.1)", text: "#00F9E4" };
    case "Pago":
      return { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" };
    case "Atrasado":
      return { bg: "rgba(0, 249, 228, 0.1)", text: "#00F9E4" };
    case "Pendente":
      return { bg: "rgba(251, 191, 36, 0.1)", text: "#FBBF24" };
    case "Cancelado":
      return { bg: "rgba(154, 154, 154, 0.15)", text: "#9A9A9A" };
    case "ATIVO":
      return { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" };
    case "BLOQUEADO":
      return { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" };
    case "INATIVO":
      return { bg: "rgba(154, 154, 154, 0.1)", text: "#9A9A9A" };
    default:
      return { bg: "rgba(154, 154, 154, 0.1)", text: "#9A9A9A" };
  }
}

export function AlunosPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("alunos");
  const { role } = useStaffSession();

  const [view, setView] = useState<"lista" | "perfil">("lista");
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [busca, setBusca] = useState("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      setAlunos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const supabase = getSupabase();
    const selectStr =
      role === "super_admin"
        ? "*, planos(nome, preco), pagamentos(*), professor_avaliacao:professores!professor_avaliacao_id(id,nome), professor_acompanhamento:professores!professor_acompanhamento_id(id,nome)"
        : "*, planos(nome, preco), professor_avaliacao:professores!professor_avaliacao_id(id,nome), professor_acompanhamento:professores!professor_acompanhamento_id(id,nome)";

    const { data: alunosRaw, error: e1 } = await supabase
      .from("alunos")
      .select(selectStr)
      .order("created_at", { ascending: false });
    if (e1) {
      setLoadError(e1.message);
      setAlunos([]);
      setLoading(false);
      return;
    }
    const rows = (alunosRaw ?? []) as AlunoRawRow[];
    const ids = rows.map((r) => r.id);
    const checkinMap = new Map<string, { count: number; last: string | null }>();
    if (ids.length > 0) {
      const { data: chRows, error: e2 } = await supabase
        .from("checkins")
        .select("aluno_id, data_hora")
        .in("aluno_id", ids);
      if (!e2 && chRows) {
        for (const id of ids) {
          const mine = chRows
            .filter((c) => c.aluno_id === id)
            .map((c) => new Date(c.data_hora).getTime());
          if (mine.length === 0) {
            checkinMap.set(id, { count: 0, last: null });
          } else {
            const last = new Date(Math.max(...mine)).toISOString();
            checkinMap.set(id, { count: mine.length, last });
          }
        }
      }
    }
    setAlunos(buildAlunoList(rows, checkinMap));
    setLoading(false);
  }, [role]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = busca.toLowerCase();
    return (
      (aluno.nome ?? "").toLowerCase().includes(termo) ||
      (aluno.email ?? "").toLowerCase().includes(termo) ||
      (aluno.telefone ?? "").toLowerCase().includes(termo)
    );
  });

  const verPerfil = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setView("perfil");
  };

  const voltarLista = () => {
    setView("lista");
    setAlunoSelecionado(null);
  };

  if (checking || permGuard.checking || !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A] text-[#00F9E4]" style={{ fontFamily: "monospace", fontSize: 12 }}>
        Verificando acesso...
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
              ALUNOS
            </h1>
            <p
              className="hidden md:block font-mono text-sm uppercase tracking-widest"
              style={{ color: "#606060" }}
            >
              Gestão completa da base de membros
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
          </div>
        </motion.header>

        {/* Content */}
        <main className="px-4 md:px-10 flex-1 overflow-y-auto py-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            {view === "lista" ? (
              <motion.div
                key="lista"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Barra de busca e filtros */}
                <div
                  className="p-6 mb-6 rounded-2xl"
                  style={{
                    background: "#0D0D0D",
                    border: "1px solid #303030",
                  }}
                >
                  {/* Input de busca */}
                  <div className="relative mb-4">
                    <Search
                      size={18}
                      className="absolute left-5 top-1/2 -translate-y-1/2"
                      style={{ color: "#606060" }}
                    />
                    <input
                      type="text"
                      placeholder="Buscar aluno por nome, email ou telefone..."
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

                  {/* Filtros */}
                  <div className="flex gap-2 md:gap-3">
                    <button
                      className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors flex-1"
                      style={{
                        background: "#1A1A1A",
                        border: "1px solid #303030",
                        color: "#A8A8A8",
                      }}
                    >
                      Planos
                      <ChevronDown size={14} className="md:w-4 md:h-4 shrink-0 text-primary" />
                    </button>

                    <button
                      className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors flex-1"
                      style={{
                        background: "#1A1A1A",
                        border: "1px solid #303030",
                        color: "#A8A8A8",
                      }}
                    >
                      Mês
                      <ChevronDown size={14} className="md:w-4 md:h-4 shrink-0 text-primary" />
                    </button>

                    <button
                      className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors flex-1"
                      style={{
                        background: "#1A1A1A",
                        border: "1px solid #303030",
                        color: "#A8A8A8",
                      }}
                    >
                      Recentes
                      <ChevronDown size={14} className="md:w-4 md:h-4 shrink-0 text-primary" />
                    </button>
                  </div>
                </div>

                {loadError && (
                  <div
                    className="p-4 rounded-2xl mb-6 text-sm"
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
                    className="flex flex-col items-center justify-center py-20 gap-4"
                    style={{ color: "#606060" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
                    />
                    <p className="font-mono text-xs uppercase tracking-widest">Carregando alunos…</p>
                  </div>
                )}

                {!loading && !loadError && alunos.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl text-center"
                    style={{
                      background: "#0D0D0D",
                      border: "1px solid #303030",
                    }}
                  >
                    <UserPlus size={48} style={{ color: "#303030" }} className="mb-4" />
                    <h2 className="font-black text-lg mb-2" style={{ color: "#F2F2F2" }}>
                      Nenhum aluno cadastrado
                    </h2>
                    <p className="text-sm mb-6 max-w-md" style={{ color: "#606060" }}>
                      Comece povoando a base com o cadastro do primeiro aluno. Todas as informações serão
                      salvas no banco e aparecerão aqui.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/cadastro")}
                      className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                      style={{ background: "#00F9E4", color: "#0A0A0A" }}
                    >
                      <UserPlus size={16} />
                      Cadastrar primeiro aluno
                    </button>
                  </motion.div>
                )}

                {/* Lista de alunos */}
                <div className="space-y-3">
                  {!loading &&
                    alunosFiltrados.map((aluno, index) => (
                    <motion.div
                      key={aluno.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => verPerfil(aluno)}
                      className="p-5 rounded-2xl cursor-pointer transition-all"
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
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <AlunoAvatar nome={aluno.nome} src={aluno.avatar} size={48} />

                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className="font-bold text-base"
                                style={{ color: "#F2F2F2" }}
                              >
                                {aluno.nome}
                              </h3>
                              <span
                                className="px-2 py-0.5 rounded text-xs font-mono"
                                style={{
                                  background: "rgba(0, 249, 228, 0.1)",
                                  color: "#00F9E4",
                                }}
                              >
                                {aluno.matricula}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span
                                className="font-mono"
                                style={{
                                  color: getStatusColor(aluno.statusFinanceiro)
                                    .text,
                                }}
                              >
                                {aluno.statusFinanceiro}
                              </span>
                              <span style={{ color: "#606060" }}>•</span>
                              <span style={{ color: "#606060" }}>
                                Cadastro: {aluno.dataCadastro}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className="text-xs font-mono uppercase tracking-widest"
                            style={{ color: "#606060" }}
                          >
                            {aluno.plano}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                            style={{ color: "#606060" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "#2A2A2A";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "transparent";
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="perfil"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {alunoSelecionado && (
                  <>
                    {/* Voltar para lista */}
                    <button
                      onClick={voltarLista}
                      className="flex items-center gap-2 mb-6 text-sm transition-colors"
                      style={{ color: "#A8A8A8" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#00F9E4")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color =
                          "#A8A8A8")
                      }
                    >
                      <ChevronLeft size={18} className="shrink-0 text-primary" />
                      Voltar para lista
                    </button>

                    {/* Card de cabeçalho do aluno */}
                    <div
                      className="p-6 rounded-2xl mb-6"
                      style={{
                        background: "#0D0D0D",
                        border: "1px solid #303030",
                      }}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <AlunoAvatar
                            nome={alunoSelecionado.nome}
                            src={alunoSelecionado.avatar}
                            size={64}
                          />

                          <div>
                            <h2
                              className="font-black text-2xl mb-2"
                              style={{ color: "#F2F2F2" }}
                            >
                              {alunoSelecionado.nome}
                            </h2>

                            <div className="flex items-center gap-2">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                                style={{
                                  background: getStatusColor(
                                    alunoSelecionado.statusMatricula
                                  ).bg,
                                  color: getStatusColor(
                                    alunoSelecionado.statusMatricula
                                  ).text,
                                }}
                              >
                                {alunoSelecionado.statusMatricula}
                              </span>

                              <span
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{
                                  background: getStatusColor(
                                    alunoSelecionado.statusFinanceiro
                                  ).bg,
                                  color: getStatusColor(
                                    alunoSelecionado.statusFinanceiro
                                  ).text,
                                }}
                              >
                                {alunoSelecionado.statusFinanceiro}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all"
                            style={{
                              background: "#25D366",
                              color: "#FFFFFF",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.transform =
                                "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.transform =
                                "scale(1)";
                            }}
                          >
                            WhatsApp
                          </button>

                          <button
                            type="button"
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                            style={{
                              background: "transparent",
                              color: "#606060",
                            }}
                            title="Editar cadastro do aluno"
                            aria-label="Editar cadastro do aluno"
                            onClick={() =>
                              navigate(`/cadastro/editar/${alunoSelecionado.id}`)
                            }
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "#2A2A2A";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "transparent";
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Grid de informações */}
                      <div className="grid grid-cols-3 gap-4">
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Mail size={14} style={{ color: "#606060" }} />
                            <span
                              className="text-xs uppercase tracking-widest"
                              style={{ color: "#606060" }}
                            >
                              Email
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: "#F2F2F2" }}>
                            {alunoSelecionado.email}
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Phone size={14} style={{ color: "#606060" }} />
                            <span
                              className="text-xs uppercase tracking-widest"
                              style={{ color: "#606060" }}
                            >
                              Telefone
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: "#F2F2F2" }}>
                            {alunoSelecionado.telefone}
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} style={{ color: "#606060" }} />
                            <span
                              className="text-xs uppercase tracking-widest"
                              style={{ color: "#606060" }}
                            >
                              Plano
                            </span>
                          </div>
                          <p
                            className="text-sm font-mono"
                            style={{ color: "#F2F2F2" }}
                          >
                            {alunoSelecionado.plano}
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <span
                            className="text-xs uppercase tracking-widest block mb-2"
                            style={{ color: "#606060" }}
                          >
                            Data de Início
                          </span>
                          <p className="text-sm" style={{ color: "#F2F2F2" }}>
                            {alunoSelecionado.dataInicio}
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <span
                            className="text-xs uppercase tracking-widest block mb-2"
                            style={{ color: "#606060" }}
                          >
                            Último Check-in
                          </span>
                          <p className="text-sm" style={{ color: "#F2F2F2" }}>
                            {alunoSelecionado.ultimoCheckin}
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <span
                            className="text-xs uppercase tracking-widest block mb-2"
                            style={{ color: "#606060" }}
                          >
                            Total de Check-ins
                          </span>
                          <p
                            className="text-sm font-mono"
                            style={{ color: "#F2F2F2" }}
                          >
                            {alunoSelecionado.totalCheckins}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Responsáveis */}
                    <div
                      className="p-6 rounded-2xl mb-6"
                      style={{
                        background: "#0D0D0D",
                        border: "1px solid #303030",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Users size={16} style={{ color: "#606060" }} />
                        <h3
                          className="font-black text-lg uppercase tracking-tight"
                          style={{ color: "#F2F2F2" }}
                        >
                          Responsáveis
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Plano tier */}
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <span
                            className="text-xs uppercase tracking-widest block mb-2"
                            style={{ color: "#606060" }}
                          >
                            Plano
                          </span>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#00F9E4" }}
                          >
                            {alunoSelecionado.planoTier}
                          </p>
                        </div>

                        {/* Professor de Avaliação */}
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <span
                            className="text-xs uppercase tracking-widest block mb-2"
                            style={{ color: "#606060" }}
                          >
                            Prof. de Avaliação
                          </span>
                          {alunoSelecionado.professorAvaliacao ? (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/professores/${alunoSelecionado.professorAvaliacao!.id}`,
                                )
                              }
                              className="text-sm font-semibold text-left transition-colors"
                              style={{ color: "#F2F2F2" }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.color =
                                  "#00F9E4";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.color =
                                  "#F2F2F2";
                              }}
                            >
                              {alunoSelecionado.professorAvaliacao.nome}
                            </button>
                          ) : (
                            <p className="text-sm" style={{ color: "#606060" }}>
                              —
                            </p>
                          )}
                        </div>

                        {/* Personal de Acompanhamento (apenas Plus/Elite) */}
                        <div
                          className="p-4 rounded-xl"
                          style={{
                            background: "#1A1A1A",
                            border: "1px solid #303030",
                          }}
                        >
                          <span
                            className="text-xs uppercase tracking-widest block mb-2"
                            style={{ color: "#606060" }}
                          >
                            Personal de Acomp.
                          </span>
                          {alunoSelecionado.planoHasPersonal ? (
                            alunoSelecionado.professorAcompanhamento ? (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/professores/${alunoSelecionado.professorAcompanhamento!.id}`,
                                  )
                                }
                                className="text-sm font-semibold text-left transition-colors"
                                style={{ color: "#F2F2F2" }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = "#00F9E4";
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLButtonElement
                                  ).style.color = "#F2F2F2";
                                }}
                              >
                                {alunoSelecionado.professorAcompanhamento.nome}
                              </button>
                            ) : (
                              <p
                                className="text-sm"
                                style={{ color: "#606060" }}
                              >
                                Não atribuído
                              </p>
                            )
                          ) : (
                            <p
                              className="text-xs italic"
                              style={{ color: "#444" }}
                            >
                              Disponível no plano Plus/Elite
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {role === "super_admin" && (
                    <div
                      className="p-6 rounded-2xl"
                      style={{
                        background: "#0D0D0D",
                        border: "1px solid #303030",
                      }}
                    >
                      <h3
                        className="font-black text-lg mb-4 uppercase tracking-tight"
                        style={{ color: "#F2F2F2" }}
                      >
                        Histórico de Pagamentos
                      </h3>

                      <div className="space-y-3">
                        {alunoSelecionado.pagamentos.length === 0 && (
                          <p className="text-sm" style={{ color: "#606060" }}>
                            Nenhum pagamento registrado ainda.
                          </p>
                        )}
                        {alunoSelecionado.pagamentos.map((pagamento, idx) => (
                          <div
                            key={idx}
                            className="p-5 rounded-xl flex items-center justify-between"
                            style={{
                              background: "#1A1A1A",
                              border: "1px solid #303030",
                            }}
                          >
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span
                                  className="font-bold"
                                  style={{ color: "#F2F2F2" }}
                                >
                                  {pagamento.data}
                                </span>
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-bold"
                                  style={{
                                    background: getStatusColor(pagamento.status)
                                      .bg,
                                    color: getStatusColor(pagamento.status)
                                      .text,
                                  }}
                                >
                                  {pagamento.status}
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: "#606060" }}>
                                {pagamento.forma}
                              </p>
                            </div>

                            <span
                              className="font-mono font-bold"
                              style={{ color: "#F2F2F2" }}
                            >
                              R$ {pagamento.valor.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
