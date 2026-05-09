import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Search, MoreVertical, Sun, Plus, Dumbbell } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateBr } from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";
import { LABEL_GRUPO, GRUPOS_MUSCULARES_ADMIN } from "../../lib/contentLabels";
import { toast } from "sonner";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

type Row = Pick<
  Database["public"]["Tables"]["exercicios"]["Row"],
  "id" | "nome" | "grupo_muscular" | "equipamento" | "created_at" | "imagem_url"
>;

function ExercicioThumb({ url }: { url: string }) {
  const [broken, setBroken] = useState(false);
  const trimmed = url?.trim() ?? "";
  const looksHttp = /^https?:\/\//i.test(trimmed);
  const showImg = looksHttp && trimmed.length > 0 && !broken;

  if (!showImg) {
    return (
      <div
        className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(0, 249, 228, 0.08)",
          border: "1px solid rgba(0, 249, 228, 0.25)",
        }}
      >
        <Dumbbell size={22} style={{ color: "#00F9E4" }} />
      </div>
    );
  }

  return (
    <div
      className="shrink-0 w-12 h-12 rounded-full overflow-hidden"
      style={{
        border: "2px solid rgba(0, 249, 228, 0.35)",
      }}
    >
      <img
        src={trimmed}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

function exercicioBadgeId(id: string): string {
  const hex = id.replace(/-/g, "");
  const n = Number.parseInt(hex.slice(0, 8), 16) % 10000;
  return `#${String(n).padStart(4, "0")}`;
}

export function AdminExerciciosPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("exercicios");
  const [exercicios, setExercicios] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtGrupo, setFiltGrupo] = useState("");
  const [filtEquip, setFiltEquip] = useState("");
  const [filtOrdem, setFiltOrdem] = useState("recentes");
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [excluirAlvo, setExcluirAlvo] = useState<{ id: string; nome: string } | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      setExercicios([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await getSupabase()
      .from("exercicios")
      .select("id,nome,grupo_muscular,equipamento,created_at,imagem_url")
      .order("nome");
    if (error) {
      setLoadError(error.message);
      setExercicios([]);
    } else {
      setExercicios((data ?? []) as Row[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => void carregar(), [carregar]);

  useEffect(() => {
    if (!menuAbertoId) return;
    function fechar(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-exercicio-menu]")) setMenuAbertoId(null);
    }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuAbertoId]);

  const equipamentosOpts = useMemo(() => {
    const set = new Set<string>();
    for (const ex of exercicios) {
      const q = (ex.equipamento ?? "").trim();
      if (q) set.add(q);
    }
    return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [exercicios]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let list = exercicios.filter((ex) => {
      if (!termo) return true;
      const equip = (ex.equipamento ?? "").toLowerCase();
      return (ex.nome ?? "").toLowerCase().includes(termo) || equip.includes(termo);
    });

    if (filtGrupo) list = list.filter((ex) => ex.grupo_muscular === filtGrupo);
    if (filtEquip) list = list.filter((ex) => (ex.equipamento ?? "").trim() === filtEquip);

    const sorted = [...list];
    if (filtOrdem === "recentes") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filtOrdem === "antigos") {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (filtOrdem === "alfa") {
      sorted.sort((a, b) => (a.nome ?? "").localeCompare(b.nome ?? "", "pt-BR"));
    }
    return sorted;
  }, [exercicios, busca, filtGrupo, filtEquip, filtOrdem]);

  async function confirmarExclusaoExercicio() {
    if (!excluirAlvo) return;
    const { id } = excluirAlvo;
    setExcluindo(true);
    const { error } = await getSupabase().from("exercicios").delete().eq("id", id);
    setExcluindo(false);
    setExcluirAlvo(null);
    setMenuAbertoId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Exercício excluído.");
    await carregar();
  }

  const selectBtn =
    "flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-full text-xs md:text-sm transition-colors flex-1 min-w-0 appearance-none cursor-pointer font-[inherit]";

  if (checking || permGuard.checking || !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A] text-[#00F9E4]" style={{ fontFamily: "system-ui", fontSize: 12 }}>
        Verificando acesso...
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
              <span className="md:hidden">EXERCÍCIOS</span>
              <span className="hidden md:inline">EXERCÍCIOS · BIBLIOTECA</span>
            </h1>
            <p className="hidden md:block font-mono text-sm uppercase tracking-widest" style={{ color: "#606060" }}>
              GESTÃO COMPLETA DA BIBLIOTECA DE EXERCÍCIOS
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
              onClick={() => navigate("/exercicios/novo")}
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
              title="Novo exercício"
              aria-label="Novo exercício"
            >
              <Plus size={14} className="shrink-0" />
              <span className="hidden md:inline">Novo exercício</span>
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
                placeholder="Buscar exercício por nome ou equipamento..."
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
                  value={filtGrupo}
                  onChange={(e) => setFiltGrupo(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="">Grupo muscular ▾</option>
                  {GRUPOS_MUSCULARES_ADMIN.map((g) => (
                    <option key={g} value={g}>
                      {LABEL_GRUPO[g] ?? g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 min-w-0">
                <select
                  value={filtEquip}
                  onChange={(e) => setFiltEquip(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="">Equipamento ▾</option>
                  {equipamentosOpts.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
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
              <p className="font-mono text-xs uppercase tracking-widest">Carregando exercícios…</p>
            </div>
          )}

          {!loading && !loadError && exercicios.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl text-center"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
              }}
            >
              <Dumbbell size={48} style={{ color: "#303030" }} className="mb-4" />
              <h2 className="font-black text-lg mb-2" style={{ color: "#F2F2F2" }}>
                Nenhum exercício cadastrado
              </h2>
              <p className="text-sm mb-6 max-w-md" style={{ color: "#606060" }}>
                Cadastre o primeiro exercício da biblioteca. Os dados ficam salvos e aparecem nesta lista.
              </p>
              <button
                type="button"
                onClick={() => navigate("/exercicios/novo")}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                style={{ background: "#00F9E4", color: "#0A0A0A" }}
              >
                <Plus size={16} />
                Novo exercício
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            {!loading &&
              listaFiltrada.map((ex, index) => {
                const grupoLabel = LABEL_GRUPO[ex.grupo_muscular] ?? ex.grupo_muscular;
                const equipLabel = (ex.equipamento ?? "").trim() || "—";
                return (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => navigate(`/exercicios/editar/${ex.id}`)}
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
                        <ExercicioThumb url={ex.imagem_url ?? ""} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm md:text-base truncate" style={{ color: "#F2F2F2" }}>
                              {ex.nome}
                            </h3>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] md:text-xs font-mono shrink-0"
                              style={{
                                background: "rgba(0, 249, 228, 0.1)",
                                color: "#00F9E4",
                              }}
                            >
                              {exercicioBadgeId(ex.id)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
                            <span style={{ color: "#A8A8A8" }}>{grupoLabel}</span>
                            <span style={{ color: "#606060" }}>•</span>
                            <span style={{ color: "#606060" }}>{equipLabel}</span>
                            <span style={{ color: "#606060" }}>•</span>
                            <span style={{ color: "#606060" }}>Cadastro: {formatDateBr(ex.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <span
                          className="hidden sm:inline text-[10px] md:text-xs font-mono uppercase tracking-widest max-w-[140px] md:max-w-none truncate text-right"
                          style={{ color: "#6B6B6B" }}
                          title={equipLabel}
                        >
                          {equipLabel}
                        </span>

                        <div className="relative" data-exercicio-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAbertoId((cur) => (cur === ex.id ? null : ex.id));
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
                            {menuAbertoId === ex.id && (
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
                                    navigate(`/exercicios/editar/${ex.id}`);
                                  }}
                                >
                                  Editar exercício
                                </button>
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
                                    setMenuAbertoId(null);
                                    setExcluirAlvo({ id: ex.id, nome: ex.nome });
                                  }}
                                >
                                  Excluir exercício
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <span className="sm:hidden mt-3 block text-[10px] font-mono uppercase tracking-widest truncate" style={{ color: "#6B6B6B" }}>
                      {equipLabel}
                    </span>
                  </motion.div>
                );
              })}
          </div>

          {!loading && !loadError && exercicios.length > 0 && listaFiltrada.length === 0 && (
            <p className="text-center text-sm py-12" style={{ color: "#606060" }}>
              Nenhum resultado para os filtros atuais.
            </p>
          )}
        </main>
      </div>

      <MobileBottomNav />

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
              Excluir exercício?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#A8A8A8] text-sm leading-relaxed">
              {excluirAlvo ? (
                <>
                  Tem certeza de que deseja excluir{" "}
                  <span className="font-semibold text-[#F2F2F2]">&quot;{excluirAlvo.nome}&quot;</span>? Esta ação não
                  pode ser desfeita.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2 sm:justify-end flex-col-reverse sm:flex-row">
            <AlertDialogCancel
              disabled={excluindo}
              className="mt-0 border-[#303030] bg-[#1C1C1C] text-[#E5E5E5] hover:bg-[#2A2A2A] hover:text-white"
            >
              Não
            </AlertDialogCancel>
            <button
              type="button"
              disabled={excluindo}
              onClick={() => void confirmarExclusaoExercicio()}
              className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-bold transition-colors disabled:opacity-50"
              style={{ background: "#EF4444", color: "#FFFFFF" }}
            >
              {excluindo ? "Excluindo…" : "Sim"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
