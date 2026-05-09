import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, User2 } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { useRequireSuperAdmin } from "../hooks/useRequireSuperAdmin";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { isoYmdSomente } from "../../lib/datetimeBr";
import { COLABORADOR_MODULOS } from "../../lib/colaboradorPermLabels";
import type { StaffPermKey } from "../../lib/staffPermKeys";
import { DateInputBr } from "../components/DateInputBr";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { SavePrimaryButton } from "../components/SavePrimaryButton";

type Row = Database["public"]["Tables"]["colaboradores"]["Row"];

const IC =
  "w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-full px-5 py-3 text-white text-sm placeholder:text-[#606060] focus:outline-none transition-all";

const MAX_PHOTO = 5 * 1024 * 1024;

function focusCian(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#00F9E4";
}
function blurGray(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "#2A2A2A";
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "#A8A8A8" }}>
      {children}
      {required && <span style={{ color: "#00F9E4" }}> *</span>}
    </label>
  );
}

function emptyPerm(): Record<StaffPermKey, boolean> {
  return {
    dashboard: false,
    alunos: false,
    checkins: false,
    agendamentos: false,
    professores: false,
    receitas: false,
    exercicios: false,
    aulas: false,
    configuracoes: false,
  };
}

export function AdminColaboradorFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { ready, checking } = useRequireSuperAdmin();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [nasc, setNasc] = useState("");
  const [addr, setAddr] = useState("");
  const [permos, setPermos] = useState(emptyPerm());
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  function onPickPhoto(f: File | null) {
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      toast.error("Use JPG ou PNG.");
      return;
    }
    if (f.size > MAX_PHOTO) {
      toast.error("Imagem até 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const u = typeof reader.result === "string" ? reader.result : null;
      setDataUrl(u);
      setPreview(u);
    };
    reader.readAsDataURL(f);
  }

  useEffect(() => {
    async function ld() {
      if (!isEdit || !id || !ready || checking) return;
      const { data, error } = await getSupabase().from("colaboradores").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(error?.message ?? "Colaborador não encontrado.");
        navigate("/colaboradores");
        return;
      }
      const r = data as Row;
      setNome(r.nome);
      setEmail(r.email);
      setTel(r.telefone ?? "");
      setCpf(r.cpf ?? "");
      setRg(r.rg ?? "");
      setNasc(isoYmdSomente(r.data_nascimento ?? ""));
      setAddr(r.endereco ?? "");
      if (r.foto?.startsWith("data:")) {
        setPreview(r.foto);
        setDataUrl(r.foto);
      }
      const base = emptyPerm();
      const p = r.permissoes && typeof r.permissoes === "object" && !Array.isArray(r.permissoes) ? (r.permissoes as Record<string, unknown>) : {};
      for (const k of Object.keys(base) as StaffPermKey[]) {
        base[k] = p[k] === true;
      }
      setPermos(base);
    }
    void ld();
  }, [isEdit, id, ready, checking, navigate]);

  function toggle(key: StaffPermKey) {
    setPermos((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome completo.");
      return;
    }
    if (!email.trim()) {
      toast.error("Informe o e-mail.");
      return;
    }
    const permPayload: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(permos)) {
      permPayload[k] = !!v;
    }

    if (!isSupabaseConfigured || !ready) return;
    const supabase = getSupabase();
    setSaving(true);

    if (isEdit && id) {
      const up = await supabase
        .from("colaboradores")
        .update({
          nome: nome.trim(),
          telefone: tel.trim() || null,
          cpf: cpf.trim() || null,
          rg: rg.trim() || null,
          data_nascimento: nasc || null,
          endereco: addr.trim() || null,
          foto: dataUrl ?? null,
          permissoes: permPayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      setSaving(false);
      if (up.error) {
        toast.error(up.error.message);
        return;
      }
      toast.success("Colaborador atualizado.");
      navigate(`/colaboradores/${id}`);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Sessão inválida. Faça login novamente.");
        setSaving(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke<{
        id?: string;
        emailSent?: boolean;
        email?: string;
        temporaryPassword?: string;
      }>("create-collaborador", {
        body: {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          app_origin: `${window.location.protocol}//${window.location.host}`,
          telefone: tel.trim() || null,
          cpf: cpf.trim() || null,
          rg: rg.trim() || null,
          data_nascimento: nasc || null,
          endereco: addr.trim() || null,
          foto: dataUrl ?? null,
          permissoes: permPayload,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      setSaving(false);
      if (error) {
        const msg = typeof error.message === "string" ? error.message : "Falha ao criar (função Edge).";
        toast.error(`${msg} Verifique se a função create-collaborador foi publicada no Supabase.`);
        return;
      }
      const nid = typeof data?.id === "string" ? data.id : "";
      if (!nid) {
        toast.error("Resposta inesperada da função de criação.");
        return;
      }
      if (data?.emailSent) {
        toast.success("Cadastro criado. E-mail com login e senha temporária enviado.");
      } else if (data?.temporaryPassword) {
        toast.warning(
          `Cadastro criado. Sem RESEND configurado — informe ao colaborador: login ${data.email ?? email.trim().toLowerCase()} · senha ${data.temporaryPassword}`,
          { duration: 25_000 },
        );
      } else {
        toast.success("Cadastro criado!");
      }
      navigate(`/colaboradores/${nid}`);
    } catch {
      setSaving(false);
      toast.error("Erro ao chamar servidor.");
    }
  }

  if (checking || !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A] text-[#00F9E4] font-mono text-xs">
        Verificando acesso...
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#0A0A0A", color: "#F5F5F5" }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Breadcrumb */}
        <header
          className="shrink-0 flex items-center px-4 md:px-6 py-4"
          style={{ background: "#111111", borderBottom: "1px solid #1E1E1E" }}
        >
          <nav className="text-xs uppercase tracking-[0.2em]" style={{ color: "#6B6B6B" }}>
            <button type="button" onClick={() => navigate("/colaboradores")} className="hover:text-[#00F9E4] bg-transparent border-none cursor-pointer">
              Colaboradores
            </button>
            <span className="mx-2">/</span>
            <span style={{ color: "#00F9E4" }}>{isEdit ? "Editar Colaborador" : "Cadastro de Novo Colaborador"}</span>
          </nav>
        </header>

        {/* Action bar */}
        <div
          className="shrink-0 grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:px-6 py-3"
          style={{ background: "#090909", borderBottom: "1px solid #1E1E1E" }}
        >
          <div className="flex justify-start min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xs md:text-sm font-mono uppercase tracking-wider transition-colors bg-transparent border-none cursor-pointer"
              style={{ color: "#606060" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#606060"; }}
            >
              <ArrowLeft size={16} className="shrink-0 text-primary" />
              <span className="text-xs md:text-sm font-mono uppercase tracking-wider">VOLTAR</span>
            </button>
          </div>
          <h1 className="text-center font-black uppercase tracking-tight text-[10px] sm:text-xs md:text-lg leading-tight min-w-0 line-clamp-2 px-1" style={{ color: "#F2F2F2" }}>
            {isEdit ? "EDITAR COLABORADOR" : "CADASTRAR NOVO COLABORADOR"}
          </h1>
          <div className="flex justify-end">
            <SavePrimaryButton preset="form" loading={saving} onClick={() => void submit()}>
              Salvar cadastro
            </SavePrimaryButton>
          </div>
        </div>

        <main className="px-4 md:px-10 flex-1 overflow-y-auto pb-[72px] md:pb-8 min-w-0">
        <form onSubmit={submit} className="w-[95%] mx-auto min-w-0 px-0 md:px-2 py-6 box-border">

          <CadastroFormAccordion defaultValue={["cad-colab-pessoais"]}>
          <CadastroFormAccordionSection
            value="cad-colab-pessoais"
            ordinal="1"
            title="Dados Pessoais"
            icon={<User2 size={16} style={{ color: "#00F9E4" }} />}
            iconColor="#00F9E4"
            iconBg="rgba(0,249,228,0.12)"
          >
            <div className="space-y-4">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center gap-3 pb-4" style={{ borderBottom: "1px solid #1E1E1E" }}>
                <FieldLabel>Foto de Perfil</FieldLabel>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(ev) => {
                    onPickPhoto(ev.target.files?.[0] ?? null);
                    ev.target.value = "";
                  }}
                />
                <div
                  onClick={() => photoRef.current?.click()}
                  className="relative group cursor-pointer"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    border: preview ? "2px solid #00F9E4" : "1px solid #2A2A2A",
                    background: preview ? "transparent" : "#1C1C1C",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!preview) (e.currentTarget as HTMLDivElement).style.borderColor = "#00F9E4";
                  }}
                  onMouseLeave={(e) => {
                    if (!preview) (e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A2A";
                  }}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-300">
                        <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Trocar foto
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <User2 size={32} style={{ color: "#606060" }} />
                      <span className="text-xs text-center px-2" style={{ color: "#606060" }}>
                        Clique para adicionar
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-center" style={{ color: "#606060" }}>
                  Formatos: JPG, PNG (máx. 5MB)
                </p>
              </div>

              {/* Nome */}
              <div>
                <FieldLabel required>Nome Completo</FieldLabel>
                <input className={IC} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" required onFocus={focusCian} onBlur={blurGray} />
              </div>

              {/* E-mail */}
              <div>
                <FieldLabel required>E-mail (login)</FieldLabel>
                <input
                  className={IC}
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                  readOnly={isEdit}
                  onFocus={focusCian}
                  onBlur={blurGray}
                />
              </div>

              {/* Telefone + CPF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <FieldLabel required>Telefone / WhatsApp</FieldLabel>
                  <input className={IC} value={tel} onChange={(e) => setTel(e.target.value)} placeholder="(00) 00000-0000" required onFocus={focusCian} onBlur={blurGray} />
                </div>
                <div>
                  <FieldLabel required>CPF</FieldLabel>
                  <input className={IC} value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" required onFocus={focusCian} onBlur={blurGray} />
                </div>
              </div>

              {/* RG + Data de Nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <FieldLabel required>RG</FieldLabel>
                  <input className={IC} value={rg} onChange={(e) => setRg(e.target.value)} placeholder="Documento RG" required onFocus={focusCian} onBlur={blurGray} />
                </div>
                <div>
                  <FieldLabel required>Data de Nascimento</FieldLabel>
                  <DateInputBr
                    inputClassName={IC}
                    valueIso={nasc ?? ""}
                    onChangeIso={(v) => setNasc(v)}
                    required
                    onFocus={focusCian}
                    onBlur={blurGray}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <FieldLabel required>Endereço Completo</FieldLabel>
                <input className={IC} value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Rua, número, bairro, cidade, CEP…" required onFocus={focusCian} onBlur={blurGray} />
              </div>

              {!isEdit ? (
                <p className="text-[12px] leading-relaxed rounded-xl px-4 py-3" style={{ color: "#8A8A8A", border: "1px solid #2A2A2A", background: "#121212" }}>
                  Após salvar, o colaborador receberá neste e-mail uma <span style={{ color: "#00F9E4" }}>senha temporária</span>. No primeiro login, será solicitado criar uma senha nova.
                </p>
              ) : null}
            </div>
          </CadastroFormAccordionSection>

          <CadastroFormAccordionSection
            value="cad-colab-permissoes"
            ordinal="2"
            title="Permissões de Acesso"
            icon={<User2 size={16} style={{ color: "#00F9E4" }} />}
            iconColor="#00F9E4"
            iconBg="rgba(0,249,228,0.12)"
          >
            <p className="text-sm mb-6" style={{ color: "#6B6B6B" }}>
              Defina quais páginas este colaborador poderá acessar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COLABORADOR_MODULOS.map((m) => {
                const on = !!permos[m.key];
                return (
                  <label
                    key={m.key}
                    className="flex items-start gap-3 cursor-pointer rounded-xl px-4 py-3 transition-all"
                    style={{
                      border: `1px solid ${on ? "#00F9E4" : "#222222"}`,
                      background: on ? "rgba(0,249,228,0.08)" : "#111111",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(m.key)}
                      className="sr-only"
                    />
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded mt-0.5"
                      style={{
                        border: `2px solid ${on ? "#00F9E4" : "#404040"}`,
                        background: on ? "#00F9E4" : "transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {on && <Check size={12} strokeWidth={3} style={{ color: "#0A0A0A" }} />}
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: on ? "#E5FFFC" : "#F2F2F2" }}>{m.label}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "#6B6B6B" }}>{m.hint}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div
              className="mt-6 rounded-[16px] p-5 text-[13px] leading-relaxed"
              style={{
                background: "rgba(245,158,11,0.10)",
                border: "1px solid #F59E0B",
                color: "#EAB308",
              }}
            >
              <p className="font-semibold mb-2">⚠️ O colaborador NÃO terá acesso a:</p>
              <ul className="list-disc pl-5 space-y-1" style={{ color: "#CBD5E1" }}>
                <li>Criação de outros colaboradores</li>
                <li>Exclusão permanente de registros restritos pelo administrador</li>
                <li>Dados financeiros completos (histórico de pagamentos nas telas restritas ao master)</li>
              </ul>
            </div>
          </CadastroFormAccordionSection>
          </CadastroFormAccordion>
        </form>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
