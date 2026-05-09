import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { AlunoAvatar } from "../components/AlunoAvatar";
import { useRequireSuperAdmin } from "../hooks/useRequireSuperAdmin";
import {
  ChevronLeft,
  Edit2,
  Mail,
  Phone,
  Check,
  Sun,
  UserPlus,
  Briefcase,
  Calendar,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";
import { getSupabase } from "../../lib/supabaseClient";
import type { Database } from "../../lib/database.types";
import { COLABORADOR_MODULOS } from "../../lib/colaboradorPermLabels";
import { formatDateBr, formatDateTimeBr } from "../../lib/displayHelpers";
import type { StaffPermKey } from "../../lib/staffPermKeys";

type Row = Database["public"]["Tables"]["colaboradores"]["Row"];

function waUrl(tel: string | null): string | null {
  if (!tel?.trim()) return null;
  let d = tel.replace(/\D/g, "");
  if (!d) return null;
  if (d.length >= 10 && d.length <= 11 && !d.startsWith("55")) d = `55${d}`;
  return `https://wa.me/${d}`;
}

function permOn(r: Row, k: StaffPermKey): boolean {
  const p = r.permissoes;
  if (!p || typeof p !== "object" || Array.isArray(p)) return false;
  return (p as Record<string, unknown>)[k] === true;
}

function WhatsAppGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function AdminColaboradorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ready, checking } = useRequireSuperAdmin();
  const [row, setRow] = useState<Row | null>(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    async function ld() {
      if (!ready || checking) return;
      if (!id) {
        setRow(null);
        setLoad(false);
        return;
      }
      const { data, error } = await getSupabase().from("colaboradores").select("*").eq("id", id).maybeSingle();
      if (error || !data) setRow(null);
      else setRow(data as Row);
      setLoad(false);
    }
    void ld();
  }, [id, ready, checking]);

  const whatsappHref = row ? waUrl(row.telefone) : null;

  const pageBody =
    load ? (
      <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: "#606060" }}>
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
        />
        <p className="font-mono text-xs uppercase tracking-widest">Carregando perfil…</p>
      </div>
    ) : !row ? (
      <div
        className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}
      >
        <p style={{ color: "#A8A8A8" }}>Colaborador não encontrado.</p>
        <button
          type="button"
          onClick={() => navigate("/colaboradores")}
          className="mt-6 flex items-center gap-2 text-sm transition-colors"
          style={{ color: "#00F9E4", background: "none", border: "none", cursor: "pointer" }}
        >
          <ChevronLeft size={18} className="shrink-0 text-primary" />
          Voltar para lista
        </button>
      </div>
    ) : (
      <div className="w-full min-w-0">
        <button
          type="button"
          onClick={() => navigate("/colaboradores")}
          className="flex items-center gap-2 mb-6 text-sm transition-colors"
          style={{ color: "#A8A8A8", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#00F9E4";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#A8A8A8";
          }}
        >
          <ChevronLeft size={18} className="shrink-0 text-primary" />
          Voltar para lista
        </button>

        <div
          className="p-5 md:p-6 rounded-2xl mb-6"
          style={{
            background: "#0D0D0D",
            border: "1px solid #303030",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div className="flex items-start gap-4 min-w-0">
              <AlunoAvatar nome={row.nome} src={row.foto ?? undefined} size={64} />

              <div className="min-w-0">
                <h2 className="font-black text-xl md:text-2xl mb-2 truncate" style={{ color: "#F2F2F2" }}>
                  {row.nome}
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: row.ativo ? "rgba(34, 197, 94, 0.15)" : "rgba(107, 107, 107, 0.2)",
                      color: row.ativo ? "#22C55E" : "#6B6B6B",
                    }}
                  >
                    {row.ativo ? "ATIVO" : "INATIVO"}
                  </span>

                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: "#00F9E4",
                      color: "#0A0A0A",
                    }}
                  >
                    COLABORADOR
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all"
                  style={{
                    background: "#25D366",
                    color: "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.03)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                  }}
                >
                  <WhatsAppGlyph size={18} />
                  WhatsApp
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => navigate(`/colaboradores/${row.id}/editar`)}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shrink-0"
                style={{
                  background: "transparent",
                  color: "#606060",
                  border: "1px solid #303030",
                }}
                title="Editar cadastro"
                aria-label="Editar cadastro"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#2A2A2A";
                  (e.currentTarget as HTMLButtonElement).style.color = "#F2F2F2";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "#606060";
                }}
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={14} style={{ color: "#6B6B6B" }} />
                <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
                  Email
                </span>
              </div>
              <p className="text-sm break-all" style={{ color: "#F2F2F2" }}>
                {row.email ?? "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
              <div className="flex items-center gap-2 mb-2">
                <Phone size={14} style={{ color: "#6B6B6B" }} />
                <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
                  Telefone
                </span>
              </div>
              <p className="text-sm" style={{ color: "#F2F2F2" }}>
                {row.telefone?.trim() ? row.telefone : "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={14} style={{ color: "#6B6B6B" }} />
                <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
                  Função
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#F2F2F2" }}>
                Colaborador (staff)
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} style={{ color: "#6B6B6B" }} />
                <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
                  Data de cadastro
                </span>
              </div>
              <p className="text-sm" style={{ color: "#F2F2F2" }}>
                {formatDateBr(row.created_at)}
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} style={{ color: "#6B6B6B" }} />
                <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
                  Último acesso
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#AAAAAA" }}>
                {row.ultimo_acesso_em ? formatDateTimeBr(row.ultimo_acesso_em) : "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} style={{ color: "#6B6B6B" }} />
                <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
                  Status
                </span>
              </div>
              <p className="text-sm" style={{ color: "#F2F2F2" }}>
                {row.ativo ? "Ativo" : "Inativo"}
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-5 md:p-6 rounded-2xl"
          style={{
            background: "#0D0D0D",
            border: "1px solid #303030",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: "#6B6B6B" }} />
              <h3 className="font-black text-lg uppercase tracking-tight" style={{ color: "#F2F2F2" }}>
                Permissões de acesso
              </h3>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/colaboradores/${row.id}/editar`)}
              className="shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all self-start sm:self-auto"
              style={{ background: "#00F9E4", color: "#0A0A0A" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(0,249,228,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              Editar permissões
            </button>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#111111",
              border: "1px solid #222222",
            }}
          >
            {COLABORADOR_MODULOS.map((m, idx, arr) => {
              const on = permOn(row, m.key);
              return (
                <div
                  key={m.key}
                  className="px-4 py-4 text-sm md:grid md:grid-cols-[auto_1fr] md:items-start md:gap-4"
                  style={{
                    borderBottom: idx < arr.length - 1 ? "1px solid #222222" : undefined,
                  }}
                >
                  <div className="flex items-start gap-2 mb-2 md:mb-0 shrink-0">
                    {on ? (
                      <Check size={18} className="text-[#00F9E4] shrink-0 mt-0.5" />
                    ) : (
                      <X size={18} className="text-[#6B6B6B] shrink-0 mt-0.5" />
                    )}
                    <span
                      className="font-semibold whitespace-nowrap"
                      style={{ color: on ? "#00F9E4" : "#6B6B6B" }}
                    >
                      {on ? "Acesso liberado" : "Sem acesso"}
                    </span>
                  </div>
                  <div className="min-w-0 pl-8 md:pl-0 border-t md:border-t-0 border-[#222] md:border-none pt-2 md:pt-0 mt-2 md:mt-0 md:border-none">
                    <span style={{ color: "#F2F2F2" }} className="font-medium">
                      {m.label}
                    </span>
                    <p className="text-[12px] mt-1" style={{ color: "#6B6B6B" }}>
                      {m.hint}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );

  if (checking || !ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0A0A0A]" style={{ fontFamily: "monospace", fontSize: 12 }}>
        <span style={{ color: "#00F9E4" }}>Verificando acesso…</span>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%", color: "#F5F5F5" }}
    >
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
            <h1 className="font-black tracking-tight text-lg md:text-xl mb-1" style={{ color: "#F2F2F2" }}>
              COLABORADORES
            </h1>
            <p className="hidden md:block font-mono text-sm uppercase tracking-widest" style={{ color: "#606060" }}>
              Staff e permissões · LuTe Academy
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
              className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
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
            >
              <UserPlus size={14} />
              Novo colaborador
            </button>

            <button
              type="button"
              onClick={() => navigate("/colaboradores/novo")}
              className="md:hidden p-2 rounded-full transition-colors"
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
              aria-label="Novo colaborador"
            >
              <UserPlus size={16} />
            </button>

          </div>
        </motion.header>

        <main className="px-4 md:px-10 flex-1 overflow-y-auto py-6 pb-20 md:pb-6 min-w-0">
          <div className="w-[95%] mx-auto min-w-0">{pageBody}</div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
