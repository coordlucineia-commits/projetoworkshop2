import { FormEvent, useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ChevronDown, UtensilsCrossed, ClipboardList, Activity } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { LABEL_CATEGORIA, LABEL_REFEICAO, REFEICOES_RECEITA_DB, CATEGORIA_RECEITA_DB } from "../../lib/contentLabels";

type Ins = Database["public"]["Tables"]["receitas"]["Insert"];

const IC =
  "w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-full px-5 py-3 text-white text-sm placeholder:text-[#606060] focus:outline-none transition-all";

const TA =
  "w-full min-h-[120px] rounded-[24px] px-5 py-4 text-sm bg-[#1C1C1C] border border-[#2A2A2A] text-white placeholder:text-[#606060] focus:outline-none transition-all resize-y";

function focusCian(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "#00F9E4";
}
function blurGray(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "#2A2A2A";
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "#A8A8A8" }}>
      {children}
      {required ? <span style={{ color: "#00F9E4" }}> *</span> : null}
    </label>
  );
}

function SectionCard({
  icon,
  iconColor,
  iconBg,
  number,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] overflow-hidden"
      style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}
    >
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: `2px solid ${iconColor}` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <h2 className="font-black uppercase tracking-tight text-base text-white">
          {number}. {title}
        </h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </motion.div>
  );
}

export function AdminReceitaFormPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("receitas");
  const editMatch = useMatch("/receitas/editar/:id");
  const editId = editMatch?.params?.id ?? "";
  const isEdit = Boolean(editId);
  const [editReady, setEditReady] = useState(!editId);

  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<Ins["categoria"]>("perda_peso");
  const [refeicao, setRefeicao] = useState<Ins["refeicao"]>("cafe_manha");
  const [imagem_url, setImagemUrl] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [modo_preparo, setModo_preparo] = useState("");
  const [calorias, setCalorias] = useState(320);
  const [proteinas_g, setP] = useState(28);
  const [carboidratos_g, setC] = useState(35);
  const [gorduras_g, setG] = useState(12);
  const [imgLoadError, setImgLoadError] = useState(false);

  useEffect(() => {
    setImgLoadError(false);
  }, [imagem_url]);

  useEffect(() => {
    if (!editId || !isSupabaseConfigured) {
      setEditReady(true);
      return;
    }
    let cancelled = false;
    setEditReady(false);
    void (async () => {
      const { data, error } = await getSupabase().from("receitas").select("*").eq("id", editId).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error(error?.message ?? "Receita não encontrada.");
        navigate("/receitas");
        setEditReady(true);
        return;
      }
      const r = data as Database["public"]["Tables"]["receitas"]["Row"];
      setNome(r.nome);
      setCategoria(r.categoria as Ins["categoria"]);
      setRefeicao(r.refeicao as Ins["refeicao"]);
      setImagemUrl(r.imagem_url);
      setIngredientes(r.ingredientes);
      setModo_preparo(r.modo_preparo);
      setCalorias(r.calorias);
      setP(Number(r.proteinas_g));
      setC(Number(r.carboidratos_g));
      setG(Number(r.gorduras_g));
      setEditReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [editId, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!isSupabaseConfigured) {
      toast.error("Configure Supabase no .env");
      return;
    }
    if (!nome.trim() || !imagem_url.trim()) {
      setErr("Nome e URL da imagem são obrigatórios.");
      return;
    }

    const row: Omit<Database["public"]["Tables"]["receitas"]["Insert"], "id"> = {
      nome: nome.trim(),
      categoria: categoria!,
      refeicao: refeicao!,
      imagem_url: imagem_url.trim(),
      ingredientes: ingredientes.trim(),
      modo_preparo: modo_preparo.trim(),
      calorias,
      proteinas_g,
      carboidratos_g,
      gorduras_g,
    };

    setSending(true);
    const sb = getSupabase();
    const { error } = isEdit
      ? await sb.from("receitas").update(row).eq("id", editId)
      : await sb.from("receitas").insert(row);
    setSending(false);

    if (error) {
      setErr(error.message);
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Receita atualizada." : "Receita cadastrada.");
    navigate("/receitas");
  }

  const urlTrim = imagem_url.trim();
  const urlLooksHttp = /^https?:\/\//i.test(urlTrim);
  const showImageInCircle = urlLooksHttp && !imgLoadError;

  if (checking || permGuard.checking || !ready || (isEdit && !editReady)) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A] text-[#00F9E4]" style={{ fontFamily: "system-ui", fontSize: 12 }}>
        {checking || permGuard.checking || !ready ? "Verificando acesso..." : "Carregando receita..."}
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#0A0A0A", color: "#F5F5F5", maxWidth: "100%", width: "100%" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="flex items-center justify-between px-4 md:px-6 py-4 shrink-0"
          style={{ background: "#111111", borderBottom: "1px solid #1E1E1E" }}
        >
          <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <button
              type="button"
              onClick={() => navigate("/receitas")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer"
            >
              Receitas
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }}>{isEdit ? "Editar Receita" : "Nova Receita"}</span>
          </div>
          <div className="md:hidden flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest min-w-0">
            <button
              type="button"
              onClick={() => navigate("/receitas")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer shrink-0"
            >
              Receitas
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }} className="truncate">
              {isEdit ? "Editar Receita" : "Nova Receita"}
            </span>
          </div>
        </header>

        <div
          className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:px-6 py-3 shrink-0"
          style={{ background: "#090909", borderBottom: "1px solid #1E1E1E" }}
        >
          <div className="flex justify-start min-w-0">
            <button
              type="button"
              onClick={() => navigate("/receitas")}
              className="flex items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-wider transition-colors bg-transparent border-none cursor-pointer"
              style={{ color: "#606060" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#606060";
              }}
            >
              <ArrowLeft size={16} className="shrink-0 text-primary" />
              <span className="text-xs md:text-sm font-mono uppercase tracking-wider">VOLTAR</span>
            </button>
          </div>

          <h1
            className="text-center font-black uppercase tracking-tight text-[10px] sm:text-xs md:text-lg leading-tight min-w-0 line-clamp-2 px-1"
            style={{ color: "#F2F2F2" }}
          >
            {isEdit ? "EDITAR RECEITA / CARDÁPIO" : "CADASTRAR NOVA RECEITA / CARDÁPIO"}
          </h1>

          <div className="flex justify-end">
            <SavePrimaryButton type="submit" form="form-receita" preset="form" loading={sending}>
              Salvar receita
            </SavePrimaryButton>
          </div>
        </div>

        <main className="px-4 md:px-10 flex-1 overflow-y-auto pb-24 md:pb-8 min-w-0">
          <div className="w-[95%] mx-auto min-w-0 px-0 md:px-2 py-6 box-border">
            <form id="form-receita" onSubmit={onSubmit} className="w-full space-y-5 box-border">
              {err && <p className="text-sm text-red-400">{err}</p>}

              <SectionCard
                number="1"
                title="Identificação e mídia"
                icon={<UtensilsCrossed size={16} style={{ color: "#00F9E4" }} />}
                iconColor="#00F9E4"
                iconBg="rgba(0,249,228,0.12)"
              >
                <div className="space-y-5">
                  <div className="flex flex-col items-center gap-3 pb-2">
                    <FieldLabel required>Imagem da receita</FieldLabel>
                    <div
                      className="relative rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                      style={{
                        width: "120px",
                        height: "120px",
                        border: showImageInCircle ? "2px solid #00F9E4" : "2px dashed #2A2A2A",
                        background: "#1C1C1C",
                      }}
                    >
                      {showImageInCircle ? (
                        <img
                          src={urlTrim}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={() => setImgLoadError(true)}
                        />
                      ) : (
                        <span className="w-full h-full flex flex-col items-center justify-center gap-2 px-3">
                          <UtensilsCrossed size={32} style={{ color: "#606060" }} />
                          <span className="text-xs text-center leading-tight" style={{ color: "#606060" }}>
                            Cole a URL abaixo
                          </span>
                        </span>
                      )}
                    </div>
                    <input
                      type="url"
                      className={IC}
                      value={imagem_url}
                      onChange={(e) => setImagemUrl(e.target.value)}
                      placeholder="https://..."
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                    <p className="text-xs text-center" style={{ color: "#606060" }}>
                      Link direto para imagem (https…). A pré-visualização atualiza ao colar a URL.
                    </p>
                  </div>

                  <div>
                    <FieldLabel required>Nome da receita</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex.: Bowl proteico de frango"
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <FieldLabel required>Categoria</FieldLabel>
                      <div className="relative">
                        <select
                          className={`${IC} appearance-none cursor-pointer pr-10`}
                          style={{ color: "#F5F5F5" }}
                          value={categoria ?? ""}
                          onChange={(e) => setCategoria(e.target.value as Ins["categoria"])}
                          onFocus={focusCian}
                          onBlur={blurGray}
                        >
                          {CATEGORIA_RECEITA_DB.map((k) => (
                            <option key={k} value={k}>
                              {LABEL_CATEGORIA[k]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0 text-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel required>Refeição</FieldLabel>
                      <div className="relative">
                        <select
                          className={`${IC} appearance-none cursor-pointer pr-10`}
                          style={{ color: "#F5F5F5" }}
                          value={refeicao ?? ""}
                          onChange={(e) => setRefeicao(e.target.value as Ins["refeicao"])}
                          onFocus={focusCian}
                          onBlur={blurGray}
                        >
                          {REFEICOES_RECEITA_DB.map((k) => (
                            <option key={k} value={k}>
                              {LABEL_REFEICAO[k]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0 text-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                number="2"
                title="Ingredientes e preparo"
                icon={<ClipboardList size={16} style={{ color: "#00F9E4" }} />}
                iconColor="#00F9E4"
                iconBg="rgba(0,249,228,0.12)"
              >
                <div className="space-y-5">
                  <div>
                    <FieldLabel>Ingredientes</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: "#6B6B6B" }}>
                      Lista em texto livre ou um ingrediente por linha.
                    </p>
                    <textarea
                      className={TA}
                      value={ingredientes}
                      onChange={(e) => setIngredientes(e.target.value)}
                      placeholder="Ex.: 200g de frango…"
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel>Modo de preparo</FieldLabel>
                    <textarea
                      className={TA}
                      value={modo_preparo}
                      onChange={(e) => setModo_preparo(e.target.value)}
                      placeholder="Passo a passo…"
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                number="3"
                title="Informação nutricional"
                icon={<Activity size={16} style={{ color: "#00F9E4" }} />}
                iconColor="#00F9E4"
                iconBg="rgba(0,249,228,0.12)"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <FieldLabel>Calorias</FieldLabel>
                    <input
                      type="number"
                      className={IC}
                      value={calorias}
                      onChange={(e) => setCalorias(Number(e.target.value))}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel>Proteínas (g)</FieldLabel>
                    <input
                      type="number"
                      step="0.01"
                      className={IC}
                      value={proteinas_g}
                      onChange={(e) => setP(Number(e.target.value))}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel>Carboidratos (g)</FieldLabel>
                    <input
                      type="number"
                      step="0.01"
                      className={IC}
                      value={carboidratos_g}
                      onChange={(e) => setC(Number(e.target.value))}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel>Gorduras (g)</FieldLabel>
                    <input
                      type="number"
                      step="0.01"
                      className={IC}
                      value={gorduras_g}
                      onChange={(e) => setG(Number(e.target.value))}
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>
              </SectionCard>
            </form>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
