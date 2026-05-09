import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { AlunoAvatar } from "../components/AlunoAvatar";
import { Search, MoreVertical, Sun, UserPlus } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateBr } from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";
import { toast } from "sonner";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import { ESPECIALIDADES_PROFESSOR_OPTS } from "../../lib/professorEspecialidades";

type ProfRow = Database["public"]["Tables"]["professores"]["Row"];

function professorBadgeId(id: string): string {
  const hex = id.replace(/-/g, "");
  const n = Number.parseInt(hex.slice(0, 8), 16) % 10000;
  return `#${String(n).padStart(4, "0")}`;
}

function parseEspecialidades(json: ProfRow["especialidades"]): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((x): x is string => typeof x === "string");
}

function areaLabel(area: string): string {
  const a = area?.toLowerCase() ?? "";
  if (a === "professor") return "PROFESSOR";
  if (a === "personal") return "PERSONAL";
  if (a === "ambos") return "AMBOS";
  return area?.toUpperCase() ?? "—";
}

export function AdminProfessoresPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("professores");
  const [professores, setProfessores] = useState<ProfRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtEsp, setFiltEsp] = useState("");
  const [filtSit, setFiltSit] = useState("");
  const [filtOrdem, setFiltOrdem] = useState("recentes");
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      setProfessores([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await getSupabase().from("professores").select("*");
    if (error) {
      setLoadError(error.message);
      setProfessores([]);
    } else {
      setProfessores((data ?? []) as ProfRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => void carregar(), [carregar]);

  useEffect(() => {
    if (!menuAbertoId) return;
    function fechar(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-prof-menu]")) setMenuAbertoId(null);
    }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuAbertoId]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let list = professores.filter((p) => {
      if (!termo) return true;
      const esp = parseEspecialidades(p.especialidades).join(" ").toLowerCase();
      return (
        p.nome.toLowerCase().includes(termo) ||
        (p.email ?? "").toLowerCase().includes(termo) ||
        esp.includes(termo)
      );
    });

    if (filtEsp) {
      list = list.filter((p) => parseEspecialidades(p.especialidades).includes(filtEsp));
    }
    if (filtSit === "ativo") list = list.filter((p) => p.ativo);
    if (filtSit === "inativo") list = list.filter((p) => !p.ativo);

    const sorted = [...list];
    if (filtOrdem === "recentes") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filtOrdem === "antigos") {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (filtOrdem === "alfa") {
      sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }
    return sorted;
  }, [professores, busca, filtEsp, filtSit, filtOrdem]);

  async function desativarProfessor(id: string, nome: string) {
    if (!confirm(`Desativar o cadastro de ${nome}? Ele deixará de aparecer como ativo.`)) return;
    const { error } = await getSupabase().from("professores").update({ ativo: false }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Professor desativado.");
    setMenuAbertoId(null);
    await carregar();
  }

  const selectBtn =
    "flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors flex-1 min-w-0 appearance-none cursor-pointer font-[inherit]";

  if (checking || permGuard.checking || !ready) {
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
              <span className="md:hidden">PROFESSORES</span>
              <span className="hidden md:inline">PROFESSORES · PERSONAL</span>
            </h1>
            <p className="hidden md:block font-mono text-sm uppercase tracking-widest" style={{ color: "#606060" }}>
              GESTÃO COMPLETA DA EQUIPE TÉCNICA
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
              onClick={() => navigate("/professores/novo")}
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
              title="Novo professor"
              aria-label="Novo professor"
            >
              <UserPlus size={14} className="shrink-0" />
              <span className="hidden md:inline">Novo professor</span>
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
                placeholder="Buscar professor por nome, email ou especialidade..."
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
                  value={filtEsp}
                  onChange={(e) => setFiltEsp(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="">Especialidade ▾</option>
                  {ESPECIALIDADES_PROFESSOR_OPTS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
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
            <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ color: "#606060" }}>
              <div
                className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
              />
              <p className="font-mono text-xs uppercase tracking-widest">Carregando professores…</p>
            </div>
          )}

          {!loading && !loadError && professores.length === 0 && (
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
                Nenhum professor cadastrado
              </h2>
              <p className="text-sm mb-6 max-w-md" style={{ color: "#606060" }}>
                Cadastre o primeiro membro da equipe técnica. Os dados ficam salvos e aparecem nesta lista.
              </p>
              <button
                type="button"
                onClick={() => navigate("/professores/novo")}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                style={{ background: "#00F9E4", color: "#0A0A0A" }}
              >
                <UserPlus size={16} />
                Cadastrar professor
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            {!loading &&
              listaFiltrada.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(`/professores/${p.id}`)}
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
                      <AlunoAvatar nome={p.nome} src={p.foto} size={48} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm md:text-base truncate" style={{ color: "#F2F2F2" }}>
                            {p.nome}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] md:text-xs font-mono shrink-0"
                            style={{
                              background: "rgba(0, 249, 228, 0.1)",
                              color: "#00F9E4",
                            }}
                          >
                            {professorBadgeId(p.id)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
                          <span
                            className="font-mono"
                            style={{
                              color: p.ativo ? "#22C55E" : "#6B6B6B",
                            }}
                          >
                            {p.ativo ? "Ativo" : "Inativo"}
                          </span>
                          <span style={{ color: "#606060" }}>•</span>
                          <span style={{ color: "#606060" }}>
                            Cadastro: {formatDateBr(p.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                      <span
                        className="hidden sm:inline text-[10px] md:text-xs font-mono uppercase tracking-widest max-w-[100px] md:max-w-none truncate text-right"
                        style={{ color: "#6B6B6B" }}
                        title={areaLabel(p.area_atuacao)}
                      >
                        {areaLabel(p.area_atuacao)}
                      </span>

                      <div className="relative" data-prof-menu>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuAbertoId((cur) => (cur === p.id ? null : p.id));
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
                          {menuAbertoId === p.id && (
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
                                  setMenuAbertoId(null);
                                  navigate(`/professores/${p.id}`);
                                }}
                              >
                                Ver perfil público
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
                                  setMenuAbertoId(null);
                                  navigate(`/professores/editar/${p.id}`);
                                }}
                              >
                                Editar cadastro
                              </button>
                              {p.ativo ? (
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
                                    void desativarProfessor(p.id, p.nome);
                                  }}
                                >
                                  Desativar professor
                                </button>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <span className="sm:hidden mt-3 block text-[10px] font-mono uppercase tracking-widest truncate" style={{ color: "#6B6B6B" }}>
                    {areaLabel(p.area_atuacao)}
                  </span>
                </motion.div>
              ))}
          </div>

          {!loading && !loadError && professores.length > 0 && listaFiltrada.length === 0 && (
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
