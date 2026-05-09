import { useState, useEffect, useCallback } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useStaffSession } from "../context/StaffSessionContext";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import type { Database as SupabaseSchema, Json } from "../../lib/database.types";
import { AdminSidebar } from "../components/AdminSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import {
  Sun,
  UserPlus,
  Zap,
  Building2,
  ShieldCheck,
  CreditCard,
  Settings2,
  X,
  Plus,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Hash,
  Lock,
  DollarSign,
  Clock,
  CalendarDays,
  ExternalLink,
  Trash2,
  Loader2,
  User,
  Star,
} from "lucide-react";
import { SavePrimaryButton } from "../components/SavePrimaryButton";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "geral" | "perfil" | "planos" | "sistema";

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  cor: string;
  beneficios: string[];
  destaque: boolean;
}

const CORES_PLANO = ["#A8A8A8", "#00F9E4", "#FFB800", "#8B5CF6", "#9A9A9A"];

type PlanoRow = SupabaseSchema["public"]["Tables"]["planos"]["Row"];

function parseBeneficiosJson(b: Json | null | undefined): string[] {
  if (b == null) return [];
  if (Array.isArray(b)) return b.filter((x): x is string => typeof x === "string");
  if (typeof b === "object" && b !== null && "items" in b) {
    const it = (b as { items: unknown }).items;
    if (Array.isArray(it)) return it.filter((x): x is string => typeof x === "string");
  }
  return [];
}

function rowToPlanoPlano(r: PlanoRow, i: number): Plano {
  return {
    id: r.id,
    nome: r.nome,
    descricao: r.descricao,
    preco: r.preco,
    cor: CORES_PLANO[i % CORES_PLANO.length]!,
    beneficios: parseBeneficiosJson(r.beneficios),
    destaque: i === 1,
  };
}

// ─── Shared Input ──────────────────────────────────────────────────────────────
function PillInput({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
  type = "text",
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: ElementType;
  type?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium" style={{ color: "#F2F2F2" }}>
          {label}
        </label>
      )}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-full"
        style={{ background: "#1A1A1A", border: "1px solid #303030" }}
      >
        {Icon && <Icon size={16} style={{ color: type === "time" ? "#00F9E4" : "#606060", flexShrink: 0 }} />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "#F2F2F2" }}
        />
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" style={{ color: "#F2F2F2" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-full"
        style={{ background: "#1A1A1A", border: "1px solid #303030" }}
      >
        <Lock size={16} style={{ color: "#606060", flexShrink: 0 }} />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "#F2F2F2" }}
        />
        <button onClick={() => setShow(!show)} style={{ color: "#606060" }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Salvar / Cancelar ─────────────────────────────────────────────────────────
function ActionBar({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid #1E1E1E" }}>
      <button
        onClick={onCancel}
        className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
        style={{ border: "1px solid #303030", color: "#F2F2F2" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#1C1C1C";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        Cancelar
      </button>
      <SavePrimaryButton preset="form" type="button" className="!text-sm px-6 py-2.5 font-bold normal-case uppercase" onClick={onSave}>
        Salvar alterações
      </SavePrimaryButton>
    </div>
  );
}

// ─── Tab: Geral ────────────────────────────────────────────────────────────────
function TabGeral() {
  const [form, setForm] = useState({
    nome: "LuTe Academy",
    cnpj: "12.345.678/0001-90",
    telefone: "(11) 3456-7890",
    email: "contato@luteacademy.com.br",
    endereco: "Rua das Academias, 123 - Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-6"
      style={{ background: "#141414", border: "1px solid #1E1E1E" }}
    >
      <div>
        <h2 className="font-black tracking-tight uppercase" style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", fontSize: 20 }}>
          INFORMAÇÕES DA ACADEMIA
        </h2>
        <p className="text-sm mt-1" style={{ color: "#A8A8A8" }}>
          Configure os dados básicos da sua academia
        </p>
      </div>
      <div style={{ borderTop: "1px solid #1E1E1E" }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PillInput label="Nome da Academia" value={form.nome} onChange={set("nome")} icon={Building2} />
        <PillInput label="CNPJ" value={form.cnpj} onChange={set("cnpj")} icon={Hash} />
        <PillInput label="Telefone" value={form.telefone} onChange={set("telefone")} icon={Phone} />
        <PillInput label="Email" value={form.email} onChange={set("email")} icon={Mail} type="email" />
      </div>

      <PillInput label="Endereço" value={form.endereco} onChange={set("endereco")} icon={MapPin} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PillInput label="Cidade" value={form.cidade} onChange={set("cidade")} />
        <PillInput label="Estado" value={form.estado} onChange={set("estado")} />
        <PillInput label="CEP" value={form.cep} onChange={set("cep")} />
      </div>

      <ActionBar onCancel={() => {}} onSave={() => {}} />
    </div>
  );
}

// ─── Tab: Perfil Admin ─────────────────────────────────────────────────────────
function TabPerfilAdmin() {
  const [form, setForm] = useState({
    nome: "Admin LuTe",
    email: "admin@luteacademy.com.br",
    telefone: "(11) 98765-4321",
    senhaAtual: "",
    novaSenha: "",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-6"
      style={{ background: "#141414", border: "1px solid #1E1E1E" }}
    >
      <div>
        <h2 className="font-black tracking-tight uppercase" style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", fontSize: 20 }}>
          PERFIL DO ADMINISTRADOR
        </h2>
        <p className="text-sm mt-1" style={{ color: "#A8A8A8" }}>
          Gerencie suas informações pessoais e credenciais
        </p>
      </div>
      <div style={{ borderTop: "1px solid #1E1E1E" }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PillInput label="Nome Completo" value={form.nome} onChange={set("nome")} icon={User} />
        <PillInput label="Email" value={form.email} onChange={set("email")} icon={Mail} type="email" />
      </div>
      <div className="w-full min-w-0">
        <PillInput label="Telefone" value={form.telefone} onChange={set("telefone")} icon={Phone} />
      </div>

      <div style={{ borderTop: "1px solid #1E1E1E" }} />

      <div>
        <h3 className="font-black tracking-tight uppercase mb-4" style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", fontSize: 16 }}>
          ALTERAR SENHA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PasswordInput
            label="Senha Atual"
            value={form.senhaAtual}
            onChange={set("senhaAtual")}
            placeholder="Digite sua senha atual"
          />
          <PasswordInput
            label="Nova Senha"
            value={form.novaSenha}
            onChange={set("novaSenha")}
            placeholder="Digite a nova senha"
          />
        </div>
      </div>

      <ActionBar onCancel={() => {}} onSave={() => {}} />
    </div>
  );
}

// ─── Tab: Planos ────────────────────────────────────────────────────────────────
function TabPlanos() {
  const { role } = useStaffSession();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  /** Plano sendo excluído no momento (id), ou null. */
  const [excluindoPlanoId, setExcluindoPlanoId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [novoPlano, setNovoPlano] = useState({
    nome: "",
    preco: "",
    descricao: "",
    destaque: false,
  });

  const carregar = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setErro("Configure o Supabase no .env");
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    const s = getSupabase();
    const { data, error } = await s.from("planos").select("*").order("created_at", { ascending: true });
    if (error) {
      setErro(error.message);
      setPlanos([]);
    } else {
      setPlanos((data ?? []).map((r, i) => rowToPlanoPlano(r, i)));
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const salvarPlanos = async () => {
    if (!isSupabaseConfigured) return;
    setSalvando(true);
    setErro(null);
    const s = getSupabase();
    const rows = planos.map((p) => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco: p.preco,
      beneficios: p.beneficios as unknown as Json,
      ativo: true,
    }));
    const { error } = await s.from("planos").upsert(rows, { onConflict: "id" });
    if (error) setErro(error.message);
    setSalvando(false);
  };

  const updatePreco = (id: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPlanos((prev) => prev.map((p) => (p.id === id ? { ...p, preco: num } : p)));
    }
  };

  const addBeneficio = (id: string) => {
    const benefit = prompt("Nome do benefício:");
    if (benefit?.trim()) {
      setPlanos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, beneficios: [...p.beneficios, benefit.trim()] } : p
        )
      );
    }
  };

  const removeBeneficio = (planId: string, idx: number) => {
    setPlanos((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, beneficios: p.beneficios.filter((_, i) => i !== idx) } : p
      )
    );
  };

  const criarPlano = async () => {
    if (!novoPlano.nome.trim() || !isSupabaseConfigured) return;
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `pl-${Date.now()}`;
    const row = {
      id,
      nome: novoPlano.nome.toUpperCase().trim(),
      descricao: novoPlano.descricao.trim() || "Novo plano",
      preco: parseFloat(novoPlano.preco) || 0,
      beneficios: [] as unknown as Json,
      ativo: true,
    };
    const s = getSupabase();
    const { error } = await s.from("planos").insert(row);
    if (error) {
      setErro(error.message);
      return;
    }
    await carregar();
    setNovoPlano({ nome: "", preco: "", descricao: "", destaque: false });
    setShowModal(false);
  };

  const excluirPlano = async (planoId: string, nomePlano: string) => {
    if (!isSupabaseConfigured) return;
    const confirma = window.confirm(
      `Excluir o plano "${nomePlano}"?\n\nAlunos que usarem este plano ficarão sem plano de catálogo.`,
    );
    if (!confirma) return;

    setErro(null);
    setExcluindoPlanoId(planoId);
    const s = getSupabase();
    const { error: upErr } = await s.from("alunos").update({ plano_id: null }).eq("plano_id", planoId);
    if (upErr) {
      setErro(upErr.message);
      toast.error(upErr.message);
      setExcluindoPlanoId(null);
      return;
    }
    const { error: delErr } = await s.from("planos").delete().eq("id", planoId);
    if (delErr) {
      setErro(delErr.message);
      toast.error(delErr.message);
      setExcluindoPlanoId(null);
      return;
    }
    toast.success(`Plano "${nomePlano}" excluído.`);
    await carregar();
    setExcluindoPlanoId(null);
  };

  return (
    <>
      <div
        className="rounded-2xl p-6 flex flex-col gap-5"
        style={{ background: "#141414", border: "1px solid #1E1E1E" }}
      >
        <div>
          <h2 className="font-black tracking-tight uppercase" style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", fontSize: 20 }}>
            PLANOS E PREÇOS
          </h2>
          <p className="text-sm mt-1" style={{ color: "#A8A8A8" }}>
            Configure os planos disponíveis para os alunos. As alterações refletem em todo o sistema.
          </p>
        </div>
        <div style={{ borderTop: "1px solid #1E1E1E" }} />

        {erro && (
          <div
            className="p-3 rounded-xl text-sm"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#F87171",
            }}
          >
            {erro}
          </div>
        )}

        {carregando && (
          <p className="text-sm" style={{ color: "#606060" }}>
            Carregando planos…
          </p>
        )}

        {/* Planos list */}
        <div className="flex flex-col gap-4">
          {!carregando && planos.length === 0 && !erro && (
            <p className="text-sm" style={{ color: "#606060" }}>
              Nenhum plano cadastrado. Crie o primeiro abaixo ou cadastre via SQL/seed no Supabase.
            </p>
          )}
          {planos.map((plano) => (
            <div
              key={plano.id}
              className="rounded-2xl p-5"
              style={{ background: "#0D0D0D", border: `1px solid ${plano.cor}33` }}
            >
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-black tracking-widest text-sm" style={{ color: plano.cor, fontFamily: "Barlow Condensed, sans-serif" }}>
                    {plano.nome}
                  </span>
                  {plano.destaque && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "#00F9E41A", color: "#00F9E4" }}>
                      <Star size={10} />
                      Destaque
                    </span>
                  )}
                  <span className="text-xs flex-1 min-w-0 break-words" style={{ color: "#606060" }}>
                    {plano.descricao}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                  <DollarSign size={14} style={{ color: "#606060" }} />
                  <input
                    type="number"
                    value={plano.preco}
                    onChange={(e) => updatePreco(plano.id, e.target.value)}
                    disabled={!!excluindoPlanoId || salvando}
                    className="w-24 px-3 py-1.5 rounded-full text-sm text-right outline-none disabled:opacity-50"
                    style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#F2F2F2" }}
                  />
                  {role === "super_admin" && (
                    <button
                      type="button"
                      title="Remover este plano"
                      aria-label={`Remover plano ${plano.nome}`}
                      onClick={() => void excluirPlano(plano.id, plano.nome)}
                      disabled={carregando || salvando || excluindoPlanoId !== null}
                      className="p-2 rounded-full transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        color: "#F87171",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        background: "rgba(239, 68, 68, 0.06)",
                      }}
                      onMouseEnter={(e) => {
                        if (carregando || salvando || excluindoPlanoId !== null) return;
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.14)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(239, 68, 68, 0.06)";
                      }}
                    >
                      {excluindoPlanoId === plano.id ? (
                        <Loader2 size={14} className="animate-spin" aria-hidden />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <ul className="flex flex-col gap-1.5 mb-3">
                {plano.beneficios.map((b, i) => (
                  <li key={i} className="flex items-center justify-between text-sm group" style={{ color: "#C8C8C8" }}>
                    <span>• {b}</span>
                    <button
                      onClick={() => removeBeneficio(plano.id, i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "#606060" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => addBeneficio(plano.id)}
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "#606060" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
              >
                <Plus size={12} />
                Adicionar benefício
              </button>
            </div>
          ))}
        </div>

        {/* Criar novo plano */}
        <button
          onClick={() => setShowModal(true)}
          className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
          style={{ background: "#00F9E4", color: "#0A0A0A" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#33FFEE";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,249,228,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#00F9E4";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <Plus size={14} />
          Criar Novo Plano
        </button>

        <ActionBar
          onCancel={() => void carregar()}
          onSave={() => {
            void salvarPlanos();
          }}
        />
        {salvando && (
          <p className="text-xs text-center" style={{ color: "#606060" }}>
            Salvando…
          </p>
        )}
      </div>

      {/* Modal Criar Plano */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-5"
              style={{ background: "#1A1A1A", border: "1px solid #303030" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black uppercase tracking-tight" style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", fontSize: 18 }}>
                  CRIAR NOVO PLANO
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-full transition-colors"
                  style={{ color: "#606060" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F2F2F2")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" style={{ color: "#F2F2F2" }}>Nome do Plano</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-full" style={{ background: "#0D0D0D", border: "1px solid #303030" }}>
                    <input
                      type="text"
                      value={novoPlano.nome}
                      onChange={(e) => setNovoPlano((p) => ({ ...p, nome: e.target.value }))}
                      placeholder="Ex: PREMIUM"
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: "#F2F2F2" }}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" style={{ color: "#F2F2F2" }}>Preço Mensal</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-full" style={{ background: "#0D0D0D", border: "1px solid #303030" }}>
                    <DollarSign size={14} style={{ color: "#606060" }} />
                    <input
                      type="number"
                      value={novoPlano.preco}
                      onChange={(e) => setNovoPlano((p) => ({ ...p, preco: e.target.value }))}
                      placeholder="0"
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: "#F2F2F2" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: "#F2F2F2" }}>Descrição</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-full" style={{ background: "#0D0D0D", border: "1px solid #303030" }}>
                  <input
                    type="text"
                    value={novoPlano.descricao}
                    onChange={(e) => setNovoPlano((p) => ({ ...p, descricao: e.target.value }))}
                    placeholder="Breve descrição do plano"
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#F2F2F2" }}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setNovoPlano((p) => ({ ...p, destaque: !p.destaque }))}
                  className="w-4 h-4 rounded flex items-center justify-center transition-colors"
                  style={{
                    background: novoPlano.destaque ? "#00F9E4" : "#0D0D0D",
                    border: `1px solid ${novoPlano.destaque ? "#00F9E4" : "#303030"}`,
                  }}
                >
                  {novoPlano.destaque && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium" style={{ color: "#F2F2F2" }}>Marcar como plano em destaque</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                  style={{ border: "1px solid #303030", color: "#F2F2F2" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1C1C1C")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                >
                  Cancelar
                </button>
                <button
                  onClick={criarPlano}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                  style={{ background: "#00F9E4", color: "#0A0A0A" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#33FFEE";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#00F9E4";
                  }}
                >
                  <Plus size={14} />
                  Criar Plano
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Tab: Sistema ──────────────────────────────────────────────────────────────
function TabSistema() {
  const [form, setForm] = useState({
    abertura: "06:00",
    fechamento: "22:00",
    diasSemCheckin: "10",
    diasVencimento: "5",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-6"
      style={{ background: "#141414", border: "1px solid #1E1E1E" }}
    >
      <div>
        <h2 className="font-black tracking-tight uppercase" style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", fontSize: 20 }}>
          CONFIGURAÇÕES DO SISTEMA
        </h2>
        <p className="text-sm mt-1" style={{ color: "#A8A8A8" }}>
          Configure parâmetros operacionais do sistema
        </p>
      </div>
      <div style={{ borderTop: "1px solid #1E1E1E" }} />

      {/* Horário de Funcionamento */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F2F2F2" }}>
          Horário de Funcionamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PillInput label="Abertura" value={form.abertura} onChange={set("abertura")} icon={Clock} type="time" />
          <PillInput label="Fechamento" value={form.fechamento} onChange={set("fechamento")} icon={Clock} type="time" />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1E1E1E" }} />

      {/* Alertas Automáticos */}
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: "#F2F2F2" }}>
          Alertas Automáticos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <PillInput
              label="Dias sem check-in para risco"
              value={form.diasSemCheckin}
              onChange={set("diasSemCheckin")}
              icon={CalendarDays}
              type="number"
            />
            <p className="text-xs px-2" style={{ color: "#606060" }}>
              Dias sem frequência para considerar aluno em risco
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <PillInput
              label="Dias antes do vencimento para alertar"
              value={form.diasVencimento}
              onChange={set("diasVencimento")}
              icon={CalendarDays}
              type="number"
            />
            <p className="text-xs px-2" style={{ color: "#606060" }}>
              Antecedência para notificar vencimento
            </p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1E1E1E" }} />

      {/* Informações do Sistema */}
      <div>
        <h3 className="text-base font-semibold mb-4" style={{ color: "#F2F2F2" }}>
          Informações do Sistema
        </h3>
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}
        >
          {[
            { label: "Versão:", value: "1.0.0", color: "#F2F2F2" },
            { label: "Última atualização:", value: "23 de fevereiro, 2026", color: "#F2F2F2" },
            { label: "Banco de dados:", value: "Conectado", color: "#00F9E4" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span style={{ color: "#A8A8A8" }}>{label}</span>
              <span style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1E1E1E" }} />

      {/* Design System */}
      <div>
        <h3 className="text-base font-semibold mb-2" style={{ color: "#F2F2F2" }}>
          Design System
        </h3>
        <div
          className="rounded-xl p-4"
          style={{ background: "#0D0D0D", border: "1px solid #1E1E1E" }}
        >
          <p className="text-sm mb-3" style={{ color: "#A8A8A8" }}>
            Acesse a documentação completa do Design System com tokens, componentes e guias de estilo.
          </p>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{ background: "#00F9E41A", color: "#00F9E4", border: "1px solid #00F9E433" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#00F9E433";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#00F9E41A";
            }}
          >
            <ExternalLink size={14} />
            Abrir Design System
          </button>
        </div>
      </div>

      <ActionBar onCancel={() => {}} onSave={() => {}} />
    </div>
  );
}

// ─── Tab definitions ────────────────────────────────────────────────────────────
const tabs: { id: Tab; label: string; icon: ElementType }[] = [
  { id: "geral", label: "Geral", icon: Building2 },
  { id: "perfil", label: "Perfil Admin", icon: ShieldCheck },
  { id: "planos", label: "Planos", icon: CreditCard },
  { id: "sistema", label: "Sistema", icon: Settings2 },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function ConfiguracoesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("geral");

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{ background: "#0A0A0A", maxWidth: "100%", width: "100%" }}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden min-w-0">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between px-4 md:px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1E1E1E" }}
        >
          <div>
            <h1
              className="font-black uppercase tracking-tight text-lg md:text-xl"
              style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "-0.5px" }}
            >
              CONFIGURAÇÕES
            </h1>
            <p className="hidden md:block text-xs uppercase tracking-widest font-mono" style={{ color: "#606060" }}>
              Configurações do Sistema
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="hidden md:block p-2 rounded-full transition-colors"
              style={{ border: "1px solid #1E1E1E", color: "#9A9A9A" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F2F2F2")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#9A9A9A")}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => navigate("/cadastro")}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
              style={{ border: "1px solid #1E1E1E", color: "#9A9A9A" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#1C1C1C";
                (e.currentTarget as HTMLButtonElement).style.color = "#F5F5F5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#9A9A9A";
              }}
            >
              <UserPlus size={14} />
              Novo Aluno
            </button>
            <button
              onClick={() => navigate("/cadastro")}
              className="md:hidden p-2 rounded-full transition-colors"
              style={{ border: "1px solid #1E1E1E", color: "#9A9A9A" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#F2F2F2";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#9A9A9A";
              }}
            >
              <UserPlus size={16} />
            </button>
            <button
              onClick={() => navigate("/recepcao")}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap"
              style={{ background: "#00F9E4", color: "#0A0A0A" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#33FFEE";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,249,228,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#00F9E4";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <Zap size={14} />
              <span className="hidden sm:inline">Ativar Recepção</span>
              <span className="sm:hidden">Recepção</span>
            </button>
          </div>
        </motion.header>

        {/* Scrollable Content */}
        <main className="px-4 md:px-10 flex-1 overflow-y-auto min-w-0 py-6 pb-20 md:pb-6 box-border">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full min-w-0 flex flex-col gap-6 box-border"
          >
            {/* Page title */}
            <div>
              <h2
                className="font-black uppercase tracking-tight"
                style={{ color: "#F2F2F2", fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, letterSpacing: "-0.75px" }}
              >
                CONFIGURAÇÕES
              </h2>
              <p className="text-base" style={{ color: "#A8A8A8" }}>
                Gerencie as configurações da academia
              </p>
            </div>

            {/* Tabs — aba ativa com o mesmo pill primário que "Salvar Alterações" */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b" style={{ borderColor: "#1E1E1E" }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex min-w-0 shrink items-center justify-center gap-2 rounded-full text-sm px-4 md:px-6 py-2.5 transition-all ${
                      isActive ? "font-bold" : "font-medium"
                    }`}
                    style={
                      isActive
                        ? { background: "#00F9E4", color: "#0A0A0A", border: "1px solid transparent" }
                        : {
                            border: "1px solid #303030",
                            color: "#A8A8A8",
                            background: "transparent",
                          }
                    }
                    onMouseEnter={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      if (isActive) {
                        b.style.background = "#33FFEE";
                        b.style.boxShadow = "0 0 20px rgba(0,249,228,0.3)";
                      } else {
                        b.style.background = "#1C1C1C";
                        b.style.color = "#F2F2F2";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget as HTMLButtonElement;
                      if (isActive) {
                        b.style.background = "#00F9E4";
                        b.style.boxShadow = "none";
                      } else {
                        b.style.background = "transparent";
                        b.style.color = "#A8A8A8";
                      }
                    }}
                  >
                    <tab.icon size={14} className="shrink-0" />
                    <span className="whitespace-nowrap truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "geral" && <TabGeral />}
                {activeTab === "perfil" && <TabPerfilAdmin />}
                {activeTab === "planos" && <TabPlanos />}
                {activeTab === "sistema" && <TabSistema />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
