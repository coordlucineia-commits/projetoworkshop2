import { FormEvent, useEffect, useRef, useState } from "react";
import { useMatch, useNavigate } from "react-router";
import { ArrowLeft, Briefcase, Check, ChevronDown, User2 } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { useRequireAdmin } from "../hooks/useRequireAdmin";
import { useStaffPermissionGuard } from "../hooks/useStaffPermissionGuard";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { invokeWelcomeUserCredentials } from "../../lib/welcomeUserCredentials";
import { DateInputBr } from "../components/DateInputBr";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import { ESPECIALIDADES_PROFESSOR_OPTS } from "../../lib/professorEspecialidades";

const IC =
  "w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-full px-5 py-3 text-white text-sm placeholder:text-[#606060] focus:outline-none transition-all";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const DIAS_TRABALHO = [
  { key: 1, label: "Seg" },
  { key: 2, label: "Ter" },
  { key: 3, label: "Qua" },
  { key: 4, label: "Qui" },
  { key: 5, label: "Sex" },
  { key: 6, label: "Sáb" },
] as const;

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

function SelectField({
  children,
  value,
  onChange,
  placeholder = "Selecione",
}: {
  children: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        className={`${IC} appearance-none cursor-pointer pr-10`}
        style={{ color: value ? "#F5F5F5" : "#606060" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={focusCian}
        onBlur={blurGray}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0 text-primary"
      />
    </div>
  );
}

export function AdminNovaProfessorPage() {
  const navigate = useNavigate();
  const { ready, checking } = useRequireAdmin();
  const permGuard = useStaffPermissionGuard("professores");
  const editMatch = useMatch("/professores/editar/:id");
  const editId = editMatch?.params?.id ?? "";
  const isEdit = Boolean(editId);
  const [editReady, setEditReady] = useState(!editId);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [dn, setDn] = useState("");
  const [endereco, setEndereco] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [area, setArea] = useState<"professor" | "personal" | "ambos">("ambos");
  const [espSel, setEspSel] = useState<Record<string, boolean>>({});
  const [aulasTexto, setAulasTexto] = useState("");
  const [diasDisp, setDiasDisp] = useState<Record<number, boolean>>({});
  const [horaEntrada, setHoraEntrada] = useState("");
  const [horaSaida, setHoraSaida] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const toggleEsp = (k: string) => {
    setEspSel((p) => ({ ...p, [k]: !p[k] }));
  };

  const toggleDia = (k: number) => {
    setDiasDisp((p) => ({ ...p, [k]: !p[k] }));
  };

  const handleCpf = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    const masked = n
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(masked);
  };

  const handlePhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    const masked = n.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
    setTel(masked);
  };

  const handleFotoPick = () => fileRef.current?.click();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\/(jpeg|png)$/i.test(file.type)) {
      toast.error("Use apenas JPG ou PNG.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Arquivo acima de 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setFotoPreview(url);
      setFotoDataUrl(url);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!editId || !isSupabaseConfigured) {
      setEditReady(true);
      return;
    }
    let cancelled = false;
    setEditReady(false);
    void (async () => {
      const { data, error } = await getSupabase().from("professores").select("*").eq("id", editId).maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error(error?.message ?? "Professor não encontrado.");
        navigate("/professores");
        setEditReady(true);
        return;
      }
      setNome(data.nome);
      setEmail(data.email ?? "");
      setTel(data.telefone ?? "");
      setCpf(data.cpf ?? "");
      setRg(data.rg ?? "");
      setDn(data.data_nascimento ? String(data.data_nascimento).slice(0, 10) : "");
      setEndereco(data.endereco ?? "");
      setFotoPreview(data.foto);
      setFotoDataUrl(data.foto);
      const ar = data.area_atuacao;
      if (ar === "professor" || ar === "personal" || ar === "ambos") setArea(ar);

      const espArr = Array.isArray(data.especialidades)
        ? data.especialidades.filter((x): x is string => typeof x === "string")
        : [];
      const sel: Record<string, boolean> = {};
      for (const e of espArr) sel[e] = true;
      setEspSel(sel);

      const h = data.horario_trabalho;
      if (h && typeof h === "object" && !Array.isArray(h)) {
        const o = h as Record<string, unknown>;
        const dias = o.dias_semana;
        if (Array.isArray(dias)) {
          const d: Record<number, boolean> = {};
          for (const x of dias) {
            if (typeof x === "number") d[x] = true;
          }
          setDiasDisp(d);
        }
        setHoraEntrada(typeof o.entrada === "string" ? o.entrada : "");
        setHoraSaida(typeof o.saida === "string" ? o.saida : "");
        const am = o.aulas_ministradas;
        if (typeof am === "string" && am) {
          const espJoined = espArr.join(", ");
          if (espJoined && am.startsWith(espJoined)) {
            const rest = am.slice(espJoined.length).trim().replace(/^[·,\s]+/, "");
            setAulasTexto(rest);
          } else if (am.includes(" · ")) {
            setAulasTexto(am.split(" · ").slice(1).join(" · "));
          } else {
            setAulasTexto(am);
          }
        } else {
          setAulasTexto("");
        }
      } else {
        setAulasTexto("");
      }
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
    const em = email.trim().toLowerCase();
    if (!nome.trim() || !em) {
      setErr("Nome e e-mail são obrigatórios.");
      return;
    }
    if (!tel.trim() || !cpf.trim() || !rg.trim() || !dn.trim() || !endereco.trim()) {
      setErr("Preencha telefone, CPF, RG, data de nascimento e endereço.");
      return;
    }
    const especialidadesLista = ESPECIALIDADES_PROFESSOR_OPTS.filter((x) => espSel[x]).map((x) => x);
    if (especialidadesLista.length === 0) {
      setErr("Selecione pelo menos uma especialidade.");
      return;
    }

    const dias_ordem = DIAS_TRABALHO.filter(({ key }) => diasDisp[key]).map(({ key }) => key);

    const espAulas = ESPECIALIDADES_PROFESSOR_OPTS.filter((x) => espSel[x]);
    const extraAulas = aulasTexto.trim();
    const aulasMerged =
      espAulas.length && extraAulas
        ? `${espAulas.join(", ")} · ${extraAulas}`
        : espAulas.length
          ? espAulas.join(", ")
          : extraAulas || null;

    const horario_trabalho = {
      dias_semana: dias_ordem,
      entrada: horaEntrada.trim() || null,
      saida: horaSaida.trim() || null,
      aulas_ministradas: aulasMerged,
    };

    setSending(true);
    const payload = {
      nome: nome.trim(),
      email: em,
      telefone: tel.trim(),
      cpf: cpf.trim(),
      rg: rg.trim(),
      data_nascimento: dn.trim(),
      endereco: endereco.trim(),
      foto: fotoDataUrl ?? null,
      area_atuacao: area,
      especialidades: especialidadesLista,
      horario_trabalho,
    };

    const sb = getSupabase();
    const { error, data: saved } = isEdit
      ? await sb.from("professores").update(payload).eq("id", editId).select("id").maybeSingle()
      : await sb.from("professores").insert(payload).select("id").single();

    setSending(false);
    if (error) {
      setErr(error.message);
      toast.error(error.message);
      return;
    }

    if (!isEdit && saved?.id) {
      const cred = await invokeWelcomeUserCredentials(sb, {
        kind: "professor",
        entity_id: saved.id,
      });
      if (cred.error) {
        toast.error(`Professor cadastrado, mas o acesso (Auth/e-mail) falhou: ${cred.error}`, {
          duration: 12_000,
        });
      } else if (cred.emailSent) {
        toast.success("Professor cadastrado. E-mail com login e senha temporária enviado.");
      } else if (cred.temporaryPassword) {
        toast.warning(
          `Professor cadastrado. Sem RESEND configurado — envie manualmente: login ${cred.email ?? em} · senha temporária ${cred.temporaryPassword}`,
          { duration: 25_000 },
        );
      } else {
        toast.success("Professor cadastrado.");
      }
    } else {
      toast.success(isEdit ? "Cadastro atualizado." : "Professor cadastrado.");
    }

    navigate("/professores");
  }

  if (checking || permGuard.checking || !ready || (isEdit && !editReady)) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A] text-[#00F9E4]" style={{ fontFamily: "system-ui", fontSize: 12 }}>
        {checking || permGuard.checking || !ready ? "Verificando acesso..." : "Carregando cadastro..."}
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#0A0A0A", color: "#F5F5F5", maxWidth: "100%", width: "100%" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top: breadcrumb */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-4 shrink-0"
          style={{ background: "#111111", borderBottom: "1px solid #1E1E1E" }}
        >
          <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
            <button
              type="button"
              onClick={() => navigate("/professores")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer"
            >
              Professores
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }}>{isEdit ? "Editar Professor" : "Cadastro de Novo Professor"}</span>
          </div>
          <div className="md:hidden flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest min-w-0">
            <button
              type="button"
              onClick={() => navigate("/professores")}
              style={{ color: "#606060" }}
              className="hover:text-white transition-colors bg-transparent border-none cursor-pointer shrink-0"
            >
              Professores
            </button>
            <span style={{ color: "#3A3A3A" }}>/</span>
            <span style={{ color: "#00F9E4" }} className="truncate">
              {isEdit ? "Editar Professor" : "Cadastro de Novo Professor"}
            </span>
          </div>
        </header>

        {/* Action bar: voltar · título central · salvar */}
        <div
          className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 md:px-6 py-3 shrink-0"
          style={{ background: "#090909", borderBottom: "1px solid #1E1E1E" }}
        >
          <div className="flex justify-start min-w-0">
            <button
              type="button"
              onClick={() => navigate("/professores")}
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

          <h1 className="text-center font-black uppercase tracking-tight text-[10px] sm:text-xs md:text-lg leading-tight min-w-0 line-clamp-2 px-1" style={{ color: "#F2F2F2" }}>
            {isEdit ? "EDITAR PROFESSOR / PERSONAL" : "CADASTRAR NOVO PROFESSOR / PERSONAL"}
          </h1>

          <div className="flex justify-end">
            <SavePrimaryButton
              type="submit"
              form="form-novo-professor"
              preset="form"
              loading={sending}
            >
              Salvar cadastro
            </SavePrimaryButton>
          </div>
        </div>

        <main className="px-4 md:px-10 flex-1 overflow-y-auto pb-24 md:pb-8 min-w-0">
            <form id="form-novo-professor" onSubmit={onSubmit} className="w-[95%] mx-auto min-w-0 px-0 md:px-2 py-6 box-border">
            {err && <p className="text-sm text-red-400 mb-4">{err}</p>}

            <CadastroFormAccordion defaultValue={["cad-prof-pessoais", "cad-prof-especialidades"]}>
            <CadastroFormAccordionSection
              value="cad-prof-pessoais"
              ordinal="1"
              title="Dados Pessoais"
              icon={<User2 size={16} style={{ color: "#00F9E4" }} />}
              iconColor="#00F9E4"
              iconBg="rgba(0,249,228,0.12)"
            >
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3 pb-4" style={{ borderBottom: "1px solid #1E1E1E" }}>
                  <FieldLabel>Foto de Perfil</FieldLabel>
                  <div
                    onClick={handleFotoPick}
                    className="relative group cursor-pointer"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      border: fotoPreview ? "2px solid #00F9E4" : "1px solid #2A2A2A",
                      background: fotoPreview ? "transparent" : "#1C1C1C",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!fotoPreview) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#00F9E4";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!fotoPreview) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "#2A2A2A";
                      }
                    }}
                  >
                    {fotoPreview ? (
                      <>
                        <img src={fotoPreview} alt="Foto de perfil" className="w-full h-full object-cover" />
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
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFotoChange} />
                  <p className="text-xs text-center" style={{ color: "#606060" }}>
                    Formatos: JPG, PNG (máx. 5MB)
                  </p>
                </div>

                <div>
                  <FieldLabel required>Nome Completo</FieldLabel>
                  <input
                    type="text"
                    className={IC}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    onFocus={focusCian}
                    onBlur={blurGray}
                  />
                </div>

                <div>
                  <FieldLabel required>E-mail</FieldLabel>
                  <input
                    type="email"
                    className={IC}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    onFocus={focusCian}
                    onBlur={blurGray}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <FieldLabel required>Telefone / WhatsApp</FieldLabel>
                    <input
                      type="tel"
                      className={IC}
                      value={tel}
                      onChange={(e) => handlePhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                  <div>
                    <FieldLabel required>CPF</FieldLabel>
                    <input
                      type="text"
                      className={IC}
                      value={cpf}
                      onChange={(e) => handleCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div>
                    <FieldLabel required>RG</FieldLabel>
                    <input type="text" className={IC} value={rg} onChange={(e) => setRg(e.target.value)} placeholder="Documento RG" onFocus={focusCian} onBlur={blurGray} />
                  </div>
                  <div>
                    <FieldLabel required>Data de Nascimento</FieldLabel>
                    <DateInputBr
                      inputClassName={IC}
                      valueIso={dn}
                      onChangeIso={setDn}
                      disabled={sending}
                      required
                      onFocus={focusCian}
                      onBlur={blurGray}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Endereço Completo</FieldLabel>
                  <input
                    type="text"
                    className={IC}
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro, cidade, CEP..."
                    onFocus={focusCian}
                    onBlur={blurGray}
                  />
                </div>

                {!isEdit ? (
                  <p className="text-[12px] leading-relaxed rounded-xl px-4 py-3" style={{ color: "#8A8A8A", border: "1px solid #2A2A2A", background: "#121212" }}>
                    No primeiro cadastro, o professor receberá neste e-mail uma <span style={{ color: "#00F9E4" }}>senha temporária</span>. No primeiro login, será solicitado criar uma senha nova.
                  </p>
                ) : null}
              </div>
            </CadastroFormAccordionSection>

            <CadastroFormAccordionSection
              value="cad-prof-especialidades"
              ordinal="2"
              title="Especialidades"
              subtitle="Área de atuação, competências, aulas e horários"
              icon={<Briefcase size={16} style={{ color: "#22D3EE" }} />}
              iconColor="#22D3EE"
              iconBg="rgba(34,211,238,0.12)"
            >
              <div className="space-y-5">

                <div>
                  <FieldLabel required>Área de Atuação</FieldLabel>
                  <SelectField value={area} onChange={(v) => setArea(v as typeof area)} placeholder="Selecione">
                    <option value="professor">Professor</option>
                    <option value="personal">Personal</option>
                    <option value="ambos">Ambos</option>
                  </SelectField>
                </div>

                <div>
                  <FieldLabel required>Especialidades</FieldLabel>
                  <p className="text-[11px] mb-3" style={{ color: "#6B6B6B" }}>
                    Selecione todas as áreas em que o professor atua
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ESPECIALIDADES_PROFESSOR_OPTS.map((opt) => {
                      const on = !!espSel[opt];
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 text-sm transition-all min-h-[44px]"
                          style={{
                            border: `1px solid ${on ? "#00F9E4" : "#222222"}`,
                            background: on ? "rgba(0,249,228,0.08)" : "#111111",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleEsp(opt)}
                            className="sr-only"
                          />
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                            style={{
                              border: `2px solid ${on ? "#00F9E4" : "#404040"}`,
                              background: on ? "#00F9E4" : "transparent",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {on && <Check size={12} strokeWidth={3} style={{ color: "#0A0A0A" }} />}
                          </span>
                          <span className="leading-tight" style={{ color: on ? "#E5FFFC" : "#9CA3AF" }}>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <FieldLabel>Aulas que ministra na academia</FieldLabel>
                  <p className="text-[11px] mb-2" style={{ color: "#6B6B6B" }}>
                    As especialidades marcadas aparecem neste campo; complemente com outras turmas, se houver.
                  </p>
                  <div
                    className="w-full min-h-[52px] flex flex-wrap items-center gap-2 px-5 py-3 border border-[#2A2A2A] bg-[#1C1C1C] transition-colors focus-within:border-[#00F9E4] rounded-full"
                  >
                    {ESPECIALIDADES_PROFESSOR_OPTS.filter((opt) => espSel[opt]).map((opt) => (
                      <span
                        key={opt}
                        className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium shrink-0 border"
                        style={{
                          borderColor: "#00F9E4",
                          background: "rgba(0,249,228,0.10)",
                          color: "#E5FFFC",
                        }}
                      >
                        {opt}
                      </span>
                    ))}
                    <input
                      type="text"
                      className="flex-1 min-w-[160px] bg-transparent border-none outline-none text-sm text-white placeholder:text-[#606060] py-1"
                      value={aulasTexto}
                      onChange={(e) => setAulasTexto(e.target.value)}
                      placeholder={
                        ESPECIALIDADES_PROFESSOR_OPTS.some((o) => espSel[o])
                          ? "Outras aulas ou turmas…"
                          : "Ex: Pilates, Box, Dança — ou marque especialidades acima"
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2" style={{ borderTop: "1px solid #1E1E1E" }}>
                  <FieldLabel>Horário de trabalho</FieldLabel>
                  <p className="text-[11px] -mt-2 mb-2" style={{ color: "#6B6B6B" }}>
                    Dias disponíveis e jornada habitual
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DIAS_TRABALHO.map(({ key, label }) => {
                      const on = !!diasDisp[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleDia(key)}
                          className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all"
                          style={{
                            borderColor: on ? "#00F9E4" : "#2A2A2A",
                            background: on ? "rgba(0,249,228,0.10)" : "transparent",
                            color: on ? "#00F9E4" : "#6B6B6B",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Entrada</FieldLabel>
                      <input
                        type="time"
                        className={IC}
                        style={{ colorScheme: "dark" }}
                        value={horaEntrada}
                        onChange={(e) => setHoraEntrada(e.target.value)}
                        onFocus={focusCian}
                        onBlur={blurGray}
                      />
                    </div>
                    <div>
                      <FieldLabel>Saída</FieldLabel>
                      <input
                        type="time"
                        className={IC}
                        style={{ colorScheme: "dark" }}
                        value={horaSaida}
                        onChange={(e) => setHoraSaida(e.target.value)}
                        onFocus={focusCian}
                        onBlur={blurGray}
                      />
                    </div>
                  </div>
                </div>
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
