import { FormEvent, useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ChevronDown, Dumbbell, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { LABEL_GRUPO, GRUPOS_MUSCULARES_ADMIN } from "../../lib/contentLabels";

type Ins = Database["public"]["Tables"]["exercicios"]["Insert"];

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

export function AdminExercicioFormPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("exercicios");
  const editMatch = useMatch("/exercicios/editar/:id");
  const editId = editMatch?.params?.id ?? "";
  const isEdit = Boolean(editId);
  const [editReady, setEditReady] = useState(!editId);

  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [nome, setNome] = useState("");
  const [grupo_muscular, setGrupo] = useState<Ins["grupo_muscular"]>("braço");
  const [equipamento, setEquip] = useState("");
  const [imagem_url, setImagemUrl] = useState("");
  const [descricao_execucao, setDesc] = useState("");
  const [dicas_seguranca, setDicas] = useState("");
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
      const { data, error } = await getSupabase().from("exercicios").select("*").eq("id", editId).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error(error?.message ?? "Exercício não encontrado.");
        navigate("/exercicios");
        setEditReady(true);
        return;
      }
      const r = data as Database["public"]["Tables"]["exercicios"]["Row"];
      setNome(r.nome);
      setGrupo(r.grupo_muscular as Ins["grupo_muscular"]);
      setEquip(r.equipamento);
      setImagemUrl(r.imagem_url);
      setDesc(r.descricao_execucao);
      setDicas(r.dicas_seguranca ?? "");
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
    if (!nome.trim() || !equipamento.trim() || !imagem_url.trim() || !descricao_execucao.trim()) {
      setErr("Preencha nome, equipamento, URL da imagem e descrição da execução.");
      return;
    }

    const row: Omit<Ins, "id"> = {
      nome: nome.trim(),
      grupo_muscular: grupo_muscular!,
      equipamento: equipamento.trim(),
      imagem_url: imagem_url.trim(),
      descricao_execucao: descricao_execucao.trim(),
      dicas_seguranca: dicas_seguranca.trim(),
    };

    setSending(true);
    const sb = getSupabase();
    const { error } = isEdit
      ? await sb.from("exercicios").update(row).eq("id", editId)
      : await sb.from("exercicios").insert(row);
    setSending(false);

    if (error) {
      setErr(error.message);
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Exercício atualizado." : "Exercício cadastrado.");
    navigate("/exercicios");
  }

  const urlTrim = imagem_url.trim();
  const urlLooksHttp = /^https?:\/\//i.test(urlTrim);
  const showImageInCircle = urlLooksHttp && !imgLoadError;

  if (checking || permGuard.checking || !ready || (isEdit && !editReady)) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A] text-[#00F9E4]" style={{ fontFamily: "system-ui", fontSize: 12 }}>
        {checking || permGuard.checking || !ready ? "Verificando acesso..." : "Carregando exercício..."}
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
              onClick={() => navigate("/exercicios")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer"
            >
              Exercícios
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }}>{isEdit ? "Editar Exercício" : "Novo Exercício"}</span>
          </div>
          <div className="md:hidden flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest min-w-0">
            <button
              type="button"
              onClick={() => navigate("/exercicios")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer shrink-0"
            >
              Exercícios
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }} className="truncate">
              {isEdit ? "Editar Exercício" : "Novo Exercício"}
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
              onClick={() => navigate("/exercicios")}
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
            {isEdit ? "EDITAR EXERCÍCIO / BIBLIOTECA" : "CADASTRAR NOVO EXERCÍCIO / BIBLIOTECA"}
          </h1>

          <div className="flex justify-end">
            <SavePrimaryButton type="submit" form="form-exercicio" preset="form" loading={sending}>
              Salvar exercício
            </SavePrimaryButton>
          </div>
        </div>

        <main className="px-4 md:px-10 flex-1 overflow-y-auto pb-24 md:pb-8 min-w-0">
          <div className="w-[95%] mx-auto min-w-0 px-0 md:px-2 py-6 box-border">
            <form id="form-exercicio" onSubmit={onSubmit} className="w-full space-y-5 box-border">
              {err && <p className="text-sm text-red-400">{err}</p>}

              <SectionCard
                number="1"
                title="Identificação e mídia"
                icon={<Dumbbell size={16} style={{ color: "#00F9E4" }} />}
                iconColor="#00F9E4"
                iconBg="rgba(0,249,228,0.12)"
              >
                <div className="space-y-5">
                  <div className="flex flex-col items-center gap-3 pb-2">
                    <FieldLabel required>Imagem do exercício</FieldLabel>
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
                          <Dumbbell size={32} style={{ color: "#606060" }} />
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
                    <FieldLabel required>Nome do exercício</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex.: Supino reto com barra"
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div>
                      <FieldLabel required>Grupo muscular</FieldLabel>
                      <div className="relative">
                        <select
                          className={`${IC} appearance-none cursor-pointer pr-10`}
                          style={{ color: "#F5F5F5" }}
                          value={String(grupo_muscular ?? "")}
                          onChange={(e) => setGrupo(e.target.value as Ins["grupo_muscular"])}
                          onFocus={focusCian}
                          onBlur={blurGray}
                        >
                          {GRUPOS_MUSCULARES_ADMIN.map((g) => (
                            <option key={g} value={g}>
                              {LABEL_GRUPO[g] ?? g}
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
                      <FieldLabel required>Equipamento</FieldLabel>
                      <input
                        type="text"
                        className={IC}
                        value={equipamento}
                        onChange={(e) => setEquip(e.target.value)}
                        placeholder="Barra, halter, peso corporal…"
                        onFocus={focusCian}
                        onBlur={blurGray}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                number="2"
                title="Execução e segurança"
                icon={<ClipboardList size={16} style={{ color: "#00F9E4" }} />}
                iconColor="#00F9E4"
                iconBg="rgba(0,249,228,0.12)"
              >
                <div className="space-y-5">
                  <div>
                    <FieldLabel required>Descrição da execução</FieldLabel>
                    <p className="text-[11px] mb-2" style={{ color: "#6B6B6B" }}>
                      Postura, amplitude de movimento e sequência dos passos.
                    </p>
                    <textarea
                      className={TA}
                      value={descricao_execucao}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Como realizar o movimento com segurança e eficiência…"
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel>Dicas de segurança</FieldLabel>
                    <textarea
                      className={`${TA} min-h-[88px]`}
                      value={dicas_seguranca}
                      onChange={(e) => setDicas(e.target.value)}
                      placeholder="Opcional: aquecimento, pegada, limitações…"
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
