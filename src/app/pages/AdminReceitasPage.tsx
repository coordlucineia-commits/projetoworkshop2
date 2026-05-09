import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Search, MoreVertical, Sun, Plus, UtensilsCrossed } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateBr } from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";
import { LABEL_CATEGORIA, LABEL_REFEICAO } from "../../lib/contentLabels";
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
  Database["public"]["Tables"]["receitas"]["Row"],
  "id" | "nome" | "categoria" | "refeicao" | "created_at" | "imagem_url"
>;

function ReceitaThumb({ url }: { url: string }) {
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
        <UtensilsCrossed size={22} style={{ color: "#00F9E4" }} />
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

function receitaBadgeId(id: string): string {
  const hex = id.replace(/-/g, "");
  const n = Number.parseInt(hex.slice(0, 8), 16) % 10000;
  return `#${String(n).padStart(4, "0")}`;
}

export function AdminReceitasPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("receitas");
  const [receitas, setReceitas] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtCat, setFiltCat] = useState("");
  const [filtRefeicao, setFiltRefeicao] = useState("");
  const [filtOrdem, setFiltOrdem] = useState("recentes");
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [excluirAlvo, setExcluirAlvo] = useState<{ id: string; nome: string } | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoadError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
      setReceitas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const { data, error } = await getSupabase()
      .from("receitas")
      .select("id,nome,categoria,refeicao,created_at,imagem_url")
      .order("nome");
    if (error) {
      setLoadError(error.message);
      setReceitas([]);
    } else {
      setReceitas((data ?? []) as Row[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => void carregar(), [carregar]);

  useEffect(() => {
    if (!menuAbertoId) return;
    function fechar(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-receita-menu]")) setMenuAbertoId(null);
    }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, [menuAbertoId]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let list = receitas.filter((r) => {
      if (!termo) return true;
      return r.nome.toLowerCase().includes(termo);
    });

    if (filtCat) list = list.filter((r) => r.categoria === filtCat);
    if (filtRefeicao) list = list.filter((r) => r.refeicao === filtRefeicao);

    const sorted = [...list];
    if (filtOrdem === "recentes") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filtOrdem === "antigos") {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (filtOrdem === "alfa") {
      sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }
    return sorted;
  }, [receitas, busca, filtCat, filtRefeicao, filtOrdem]);

  async function confirmarExclusaoReceita() {
    if (!excluirAlvo) return;
    const { id } = excluirAlvo;
    setExcluindo(true);
    const { error } = await getSupabase().from("receitas").delete().eq("id", id);
    setExcluindo(false);
    setExcluirAlvo(null);
    setMenuAbertoId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Receita excluída.");
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
              <span className="md:hidden">RECEITAS</span>
              <span className="hidden md:inline">RECEITAS · CARDÁPIO</span>
            </h1>
            <p className="hidden md:block font-mono text-sm uppercase tracking-widest" style={{ color: "#606060" }}>
              GESTÃO COMPLETA DAS RECEITAS E REFEIÇÕES
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
              onClick={() => navigate("/receitas/nova")}
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
              title="Nova receita"
              aria-label="Nova receita"
            >
              <Plus size={14} className="shrink-0" />
              <span className="hidden md:inline">Nova receita</span>
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
                placeholder="Buscar receita por nome..."
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
                  value={filtCat}
                  onChange={(e) => setFiltCat(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="">Categoria ▾</option>
                  <option value="perda_peso">{LABEL_CATEGORIA.perda_peso}</option>
                  <option value="ganho_massa">{LABEL_CATEGORIA.ganho_massa}</option>
                </select>
              </div>

              <div className="relative flex-1 min-w-0">
                <select
                  value={filtRefeicao}
                  onChange={(e) => setFiltRefeicao(e.target.value)}
                  className={selectBtn + " w-full"}
                  style={{
                    background: "#1C1C1C",
                    border: "1px solid #303030",
                    color: "#A8A8A8",
                  }}
                >
                  <option value="">Refeição ▾</option>
                  {Object.entries(LABEL_REFEICAO).map(([v, lbl]) => (
                    <option key={v} value={v}>
                      {lbl}
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
              <p className="font-mono text-xs uppercase tracking-widest">Carregando receitas…</p>
            </div>
          )}

          {!loading && !loadError && receitas.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl text-center"
              style={{
                background: "#0D0D0D",
                border: "1px solid #303030",
              }}
            >
              <UtensilsCrossed size={48} style={{ color: "#303030" }} className="mb-4" />
              <h2 className="font-black text-lg mb-2" style={{ color: "#F2F2F2" }}>
                Nenhuma receita cadastrada
              </h2>
              <p className="text-sm mb-6 max-w-md" style={{ color: "#606060" }}>
                Cadastre a primeira receita do cardápio. Os dados ficam salvos e aparecem nesta lista.
              </p>
              <button
                type="button"
                onClick={() => navigate("/receitas/nova")}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                style={{ background: "#00F9E4", color: "#0A0A0A" }}
              >
                <Plus size={16} />
                Nova receita
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            {!loading &&
              listaFiltrada.map((r, index) => {
                const catLabel = LABEL_CATEGORIA[r.categoria as keyof typeof LABEL_CATEGORIA] ?? r.categoria;
                const refLabel = LABEL_REFEICAO[r.refeicao as keyof typeof LABEL_REFEICAO] ?? r.refeicao;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => navigate(`/receitas/editar/${r.id}`)}
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
                        <ReceitaThumb url={r.imagem_url ?? ""} />

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
                              {receitaBadgeId(r.id)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
                            <span style={{ color: "#A8A8A8" }}>{catLabel}</span>
                            <span style={{ color: "#606060" }}>•</span>
                            <span style={{ color: "#606060" }}>{refLabel}</span>
                            <span style={{ color: "#606060" }}>•</span>
                            <span style={{ color: "#606060" }}>Cadastro: {formatDateBr(r.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <span
                          className="hidden sm:inline text-[10px] md:text-xs font-mono uppercase tracking-widest max-w-[140px] md:max-w-none truncate text-right"
                          style={{ color: "#6B6B6B" }}
                          title={refLabel}
                        >
                          {refLabel}
                        </span>

                        <div className="relative" data-receita-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAbertoId((cur) => (cur === r.id ? null : r.id));
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
                            {menuAbertoId === r.id && (
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
                                    navigate(`/receitas/editar/${r.id}`);
                                  }}
                                >
                                  Editar receita
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
                                    setExcluirAlvo({ id: r.id, nome: r.nome });
                                  }}
                                >
                                  Excluir receita
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <span className="sm:hidden mt-3 block text-[10px] font-mono uppercase tracking-widest truncate" style={{ color: "#6B6B6B" }}>
                      {refLabel}
                    </span>
                  </motion.div>
                );
              })}
          </div>

          {!loading && !loadError && receitas.length > 0 && listaFiltrada.length === 0 && (
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
              Excluir receita?
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
              onClick={() => void confirmarExclusaoReceita()}
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
