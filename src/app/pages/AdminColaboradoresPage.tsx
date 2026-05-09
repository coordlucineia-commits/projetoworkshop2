import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { AlunoAvatar } from "../components/AlunoAvatar";
import { useRequireSuperAdmin } from "../hooks/useRequireSuperAdmin";
import { Search, MoreVertical, Sun, UserPlus } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { formatDateBr } from "../../lib/displayHelpers";
import { toast } from "sonner";

type Row = Database["public"]["Tables"]["colaboradores"]["Row"];

function badgeIdHex(id: string): string {
  const hex = id.replace(/-/g, "");
  const n = Number.parseInt(hex.slice(0, 8), 16) % 10000;
  return `#${String(n).padStart(4, "0")}`;
}

export function AdminColaboradoresPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireSuperAdmin();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtAcesso, setFiltAcesso] = useState("");
  const [filtSit, setFiltSit] = useState("");
  const [filtOrdem, setFiltOrdem] = useState("recentes");
  const [menuId, setMenuId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setErr("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    const { data, error } = await getSupabase().from("colaboradores").select("*").order("created_at", {
      ascending: false,
    });
    setLoading(false);
    if (error) {
      setErr(error.message);
      setRows([]);
      return;
    }
    setRows((data ?? []) as Row[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!menuId) return;
    function fechar(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-colab-menu]")) setMenuId(null);
    }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuId]);

  function isMod(r: Row, key: string) {
    const p = r.permissoes;
    return p && typeof p === "object" && !Array.isArray(p) && (p as Record<string, unknown>)[key] === true;
  }

  function acessoLabel(r: Row): string {
    return isMod(r, "dashboard") ? "COM DASHBOARD" : "SEM DASHBOARD";
  }

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    let list = [...rows];
    if (t) {
      list = list.filter(
        (r) =>
          r.nome.toLowerCase().includes(t) ||
          r.email.toLowerCase().includes(t) ||
          (r.telefone ?? "").toLowerCase().includes(t),
      );
    }
    if (filtSit === "ativo") list = list.filter((r) => r.ativo);
    if (filtSit === "inativo") list = list.filter((r) => !r.ativo);
    if (filtAcesso === "com_dashboard") list = list.filter((r) => isMod(r, "dashboard"));
    if (filtAcesso === "sem_dashboard") list = list.filter((r) => !isMod(r, "dashboard"));
    const sorted = [...list];
    if (filtOrdem === "recentes") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filtOrdem === "antigos") {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }
    return sorted;
  }, [rows, busca, filtSit, filtAcesso, filtOrdem]);

  async function desativar(r: Row) {
    if (!confirm(`Desativar o colaborador ${r.nome}?`)) return;
    const { error } = await getSupabase().from("colaboradores").update({ ativo: false }).eq("id", r.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Colaborador desativado.");
    setMenuId(null);
    await load();
  }

  const selectBtn =
    "flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors flex-1 min-w-0 appearance-none cursor-pointer font-[inherit]";

  if (checking || !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A]" style={{ fontFamily: "monospace", fontSize: 12 }}>
        <span style={{ color: "#00F9E4" }}>Verificando acesso…</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-40 px-4 md:px-8 py-5 flex items-center justify-between gap-3"
          style={{
            background: "rgba(13, 13, 13, 0.8)",
            borderBottom: "1px solid #0A0A0A",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="min-w-0">
            <h1 className="font-black tracking-tight text-lg md:text-xl mb-1" style={{ color: "#F2F2F2" }}>
              <span className="md:hidden">COLABORADORES</span>
              <span className="hidden md:inline">COLABORADORES · STAFF</span>
            </h1>
            <p className="hidden md:block font-mono text-sm uppercase tracking-widest" style={{ color: "#606060" }}>
              GESTÃO DE ACESSOS ADMINISTRATIVOS
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
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#303030";
              }}
              aria-label="Alternar tema"
            >
              <Sun size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/colaboradores/novo")}
              className="flex items-center justify-center gap-0 md:gap-2 p-2 md:px-5 md:py-2 rounded-full text-xs font-bold uppercase tracking-wider md:tracking-widest transition-all whitespace-nowrap"
              style={{
                background: "#1A1A1A",
                border: "1px solid #303030",
                color: "#F2F2F2",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#00F9E4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#303030";
              }}
              title="Novo colaborador"
              aria-label="Novo colaborador"
            >
              <UserPlus size={14} className="shrink-0" />
              <span className="hidden md:inline">Novo colaborador</span>
            </button>
          </div>
        </motion.header>

        <main className="px-4 md:px-10 flex-1 overflow-y-auto py-6 pb-24 md:pb-8">
          <div
            className="p-6 mb-6 rounded-2xl"
            style={{
              background: "#0D0D0D",
              border: "1px solid #303030",
            }}
          >
            <div className="relative mb-4">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#606060" }} />
              <input
                type="text"
                placeholder="Buscar colaborador por nome, e-mail ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-full px-14 py-3 text-sm transition-colors"
                style={{
                  background: "#1C1C1C",
                  border: "1px solid #303030",
                  color: "#FFFFFF",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#00F9E4";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLInputElement).style.borderColor = "#303030";
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <div className="relative flex-1 min-w-0">
                <select
                  value={filtAcesso}
                  onChange={(e) => setFiltAcesso(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="">Acesso ao dashboard ▾</option>
                  <option value="com_dashboard">Com dashboard</option>
                  <option value="sem_dashboard">Sem dashboard</option>
                </select>
              </div>

              <div className="relative flex-1 min-w-0">
                <select
                  value={filtSit}
                  onChange={(e) => setFiltSit(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="">Situação ▾</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="relative flex-1 min-w-0">
                <select
                  value={filtOrdem}
                  onChange={(e) => setFiltOrdem(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="recentes">Recentes ▾</option>
                  <option value="antigos">Mais antigos</option>
                  <option value="alfa">Alfabético</option>
                </select>
              </div>
            </div>
          </div>

          {err && (
            <div
              className="p-4 rounded-2xl mb-6 text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#F87171",
              }}
            >
              {err}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ color: "#606060" }}>
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
              />
              <p className="font-mono text-xs uppercase tracking-widest">Carregando colaboradores…</p>
            </div>
          )}

          {!loading && !err && rows.length === 0 && (
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
                Nenhum colaborador cadastrado
              </h2>
              <p className="text-sm mb-6 max-w-md" style={{ color: "#606060" }}>
                Cadastre o primeiro usuário da equipe com permissões por módulo. Somente administrador mestre pode gerenciar esta lista.
              </p>
              <button
                type="button"
                onClick={() => navigate("/colaboradores/novo")}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                style={{ background: "#00F9E4", color: "#0A0A0A" }}
              >
                <UserPlus size={16} />
                Cadastrar colaborador
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            {!loading &&
              lista.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(`/colaboradores/${r.id}`)}
                  className="p-4 md:p-5 rounded-2xl cursor-pointer transition-all relative"
                  style={{
                    background: "#111111",
                    border: "1px solid #222222",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#00F9E4";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#222222";
                  }}
                >
                  <div className="flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <AlunoAvatar nome={r.nome} src={r.foto} size={48} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm md:text-base truncate" style={{ color: "#F2F2F2" }}>
                            {r.nome}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] md:text-xs font-mono shrink-0"
                            style={{
                              background: "rgba(0, 249, 228, 0.1)",
                              color: "#00F9E4",
                            }}
                          >
                            {badgeIdHex(r.id)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
                          <span
                            className="font-mono"
                            style={{
                              color: r.ativo ? "#22C55E" : "#6B6B6B",
                            }}
                          >
                            {r.ativo ? "Ativo" : "Inativo"}
                          </span>
                          <span style={{ color: "#606060" }}>•</span>
                          <span style={{ color: "#606060" }}>Cadastro: {formatDateBr(r.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                      <span
                        className="hidden sm:inline text-[10px] md:text-xs font-mono uppercase tracking-widest max-w-[140px] md:max-w-none truncate text-right"
                        style={{ color: "#6B6B6B" }}
                        title={acessoLabel(r)}
                      >
                        {acessoLabel(r)}
                      </span>

                      <div className="relative" data-colab-menu>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuId((cur) => (cur === r.id ? null : r.id));
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0"
                          style={{ color: "#606060" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "#2A2A2A";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                          }}
                          aria-label="Menu de ações"
                        >
                          <MoreVertical size={16} />
                        </button>

                        <AnimatePresence>
                          {menuId === r.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-xl py-2 shadow-xl"
                              style={{
                                background: "#141414",
                                border: "1px solid #303030",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                style={{ color: "#E5E5E5" }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background = "#1F1F1F";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuId(null);
                                  navigate(`/colaboradores/${r.id}`);
                                }}
                              >
                                Ver perfil
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                style={{ color: "#E5E5E5" }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background = "#1F1F1F";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuId(null);
                                  navigate(`/colaboradores/${r.id}/editar`);
                                }}
                              >
                                Editar acesso
                              </button>
                              {r.ativo ? (
                                <button
                                  type="button"
                                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                                  style={{ color: "#F87171" }}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.08)";
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void desativar(r);
                                  }}
                                >
                                  Desativar colaborador
                                </button>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <span
                    className="sm:hidden mt-3 block text-[10px] font-mono uppercase tracking-widest truncate"
                    style={{ color: "#6B6B6B" }}
                  >
                    {acessoLabel(r)}
                  </span>
                </motion.div>
              ))}
          </div>

          {!loading && !err && rows.length > 0 && lista.length === 0 && (
            <p className="text-center text-sm py-12" style={{ color: "#606060" }}>
              Nenhum resultado para os filtros atuais.
            </p>
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
