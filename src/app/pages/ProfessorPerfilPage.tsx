import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { formatDateBr } from "../../lib/displayHelpers";
import { AlunoAvatar } from "../components/AlunoAvatar";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import type { Database } from "../../lib/database.types";

type Ctx = { professorId: string };
type Prof = Database["public"]["Tables"]["professores"]["Row"];

// ── helpers idênticos aos de ProfessorPublicPage ──────────────────────────────

type HorarioJson = {
  dias_semana?: number[];
  entrada?: string | null;
  saida?: string | null;
  aulas_ministradas?: string | null;
};

const DIA_EXTENSO: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
  7: "Domingo",
};

function parseHorario(json: Prof["horario_trabalho"]): HorarioJson | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  return json as HorarioJson;
}

function normalizeTime(t: string | null | undefined): string {
  if (!t) return "";
  const s = String(t).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return s.slice(0, 5);
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function parseMinutes(t: string): number {
  const [h, min] = t.split(":").map((x) => Number.parseInt(x, 10));
  if (Number.isNaN(h)) return 0;
  return h * 60 + (Number.isNaN(min) ? 0 : min);
}

function formatCargaHoraria(entrada: string, saida: string): string {
  let diff = parseMinutes(saida) - parseMinutes(entrada);
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

function areaBadgeLabel(area: string): string {
  const a = area?.toLowerCase() ?? "";
  if (a === "professor") return "PROFESSOR";
  if (a === "personal") return "PERSONAL";
  if (a === "ambos") return "AMBOS";
  return area?.toUpperCase() ?? "—";
}

function parseEspecialidades(json: Prof["especialidades"]): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((x): x is string => typeof x === "string");
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ProfessorPerfilPage() {
  const { professorId } = useOutletContext<Ctx>();

  const [prof, setProf] = useState<Prof | null>(null);
  const [loading, setLoading] = useState(true);

  // ── telefone ──
  const [editingTel, setEditingTel] = useState(false);
  const [telValue, setTelValue] = useState("");
  const [telSaving, setTelSaving] = useState(false);
  const [telMsg, setTelMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── especialidades ──
  const [editingEsp, setEditingEsp] = useState(false);
  const [espList, setEspList] = useState<string[]>([]);
  const [espInput, setEspInput] = useState("");
  const [espSaving, setEspSaving] = useState(false);
  const [espMsg, setEspMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── senha ──
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [senhaSaving, setSenhaSaving] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !professorId) return;
    void getSupabase()
      .from("professores")
      .select("*")
      .eq("id", professorId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProf(data);
          setTelValue(data.telefone ?? "");
          setEspList(parseEspecialidades(data.especialidades));
        }
        setLoading(false);
      });
  }, [professorId]);

  const horario = useMemo(() => parseHorario(prof?.horario_trabalho ?? null), [prof]);

  const linhasHorario = useMemo(() => {
    if (!horario?.dias_semana?.length || !horario.entrada || !horario.saida) return [];
    const ent = normalizeTime(horario.entrada);
    const sai = normalizeTime(horario.saida);
    if (!ent || !sai) return [];
    const carga = formatCargaHoraria(ent, sai);
    return [...horario.dias_semana]
      .filter((d) => d >= 1 && d <= 7)
      .sort((a, b) => a - b)
      .map((d) => ({ dia: DIA_EXTENSO[d] ?? `Dia ${d}`, entrada: ent, saida: sai, carga }));
  }, [horario]);

  const especialidades = useMemo(() => (prof ? parseEspecialidades(prof.especialidades) : []), [prof]);

  const aulasMinistradasTexto = useMemo(() => {
    if (!horario?.aulas_ministradas?.trim()) return "—";
    return horario.aulas_ministradas.trim();
  }, [horario]);

  async function salvarTelefone() {
    if (!isSupabaseConfigured || !professorId) return;
    setTelSaving(true);
    setTelMsg(null);
    const { error } = await getSupabase()
      .from("professores")
      .update({ telefone: telValue.trim() || null })
      .eq("id", professorId);
    setTelSaving(false);
    if (error) {
      setTelMsg({ ok: false, text: "Erro ao salvar telefone." });
    } else {
      setProf((prev) => (prev ? { ...prev, telefone: telValue.trim() || null } : prev));
      setEditingTel(false);
      setTelMsg({ ok: true, text: "Telefone atualizado!" });
      setTimeout(() => setTelMsg(null), 3000);
    }
  }

  function addEsp() {
    const val = espInput.trim();
    if (!val || espList.includes(val)) { setEspInput(""); return; }
    setEspList((prev) => [...prev, val]);
    setEspInput("");
  }

  function removeEsp(idx: number) {
    setEspList((prev) => prev.filter((_, i) => i !== idx));
  }

  async function salvarEspecialidades() {
    if (!isSupabaseConfigured || !professorId) return;
    setEspSaving(true);
    setEspMsg(null);
    const { error } = await getSupabase()
      .from("professores")
      .update({ especialidades: espList })
      .eq("id", professorId);
    setEspSaving(false);
    if (error) {
      setEspMsg({ ok: false, text: "Erro ao salvar especialidades." });
    } else {
      setProf((prev) => (prev ? { ...prev, especialidades: espList } : prev));
      setEditingEsp(false);
      setEspMsg({ ok: true, text: "Especialidades atualizadas!" });
      setTimeout(() => setEspMsg(null), 3000);
    }
  }

  async function alterarSenha() {
    setSenhaMsg(null);
    if (!senha || senha.length < 6) {
      setSenhaMsg({ ok: false, text: "A senha deve ter ao menos 6 caracteres." });
      return;
    }
    if (senha !== confirmarSenha) {
      setSenhaMsg({ ok: false, text: "As senhas não coincidem." });
      return;
    }
    setSenhaSaving(true);
    const { error } = await getSupabase().auth.updateUser({ password: senha });
    setSenhaSaving(false);
    if (error) {
      setSenhaMsg({ ok: false, text: error.message });
    } else {
      setSenha(""); setConfirmarSenha("");
      setSenhaMsg({ ok: true, text: "Senha alterada com sucesso!" });
      setTimeout(() => setSenhaMsg(null), 4000);
    }
  }

  // ── loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: "#606060" }}>
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: "#00F9E4", borderTopColor: "transparent" }}
        />
        <p className="font-mono text-xs uppercase tracking-widest">Carregando perfil…</p>
      </div>
    );
  }

  if (!prof) {
    return (
      <div className="flex items-center justify-center py-16 px-6 text-center rounded-2xl mx-4 md:mx-8 mt-8"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}>
        <p style={{ color: "#A8A8A8" }}>Perfil não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="px-0 md:px-8 py-6 pb-24 md:pb-8 w-full min-w-0">

      {/* ── Card principal (mesmo layout de ProfessorPublicPage) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 md:p-6 rounded-2xl mb-6"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}
      >
        {/* Cabeçalho: foto + nome + badges */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div className="flex items-start gap-4 min-w-0">
            <AlunoAvatar nome={prof.nome} src={prof.foto} size={64} />
            <div className="min-w-0">
              <h2 className="font-black text-xl md:text-2xl mb-2 truncate" style={{ color: "#F2F2F2" }}>
                {prof.nome}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{
                    background: prof.ativo ? "rgba(34,197,94,0.15)" : "rgba(107,107,107,0.2)",
                    color: prof.ativo ? "#22C55E" : "#6B6B6B",
                  }}
                >
                  {prof.ativo ? "ATIVO" : "INATIVO"}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                  style={{ background: "#00F9E4", color: "#0A0A0A" }}
                >
                  {areaBadgeLabel(prof.area_atuacao)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid 3×2 — Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Email — somente leitura */}
          <InfoCard icon={Mail} label="Email">
            <p className="text-sm break-all" style={{ color: "#F2F2F2" }}>{prof.email ?? "—"}</p>
          </InfoCard>

          {/* Telefone — editável */}
          <InfoCard icon={Phone} label="Telefone">
            <div className="flex items-center gap-2 min-w-0">
              {editingTel ? (
                <input
                  type="tel"
                  value={telValue}
                  onChange={(e) => setTelValue(e.target.value)}
                  placeholder="(xx) 9xxxx-xxxx"
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none min-w-0"
                  style={{ color: "#E0E0E0", caretColor: "#00F9E4" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void salvarTelefone();
                    if (e.key === "Escape") { setEditingTel(false); setTelValue(prof.telefone ?? ""); }
                  }}
                />
              ) : (
                <p className="text-sm flex-1 min-w-0" style={{ color: prof.telefone?.trim() ? "#F2F2F2" : "#555" }}>
                  {prof.telefone?.trim() || "—"}
                </p>
              )}
              {editingTel ? (
                <>
                  <SavePrimaryButton
                    preset="inline"
                    loading={telSaving}
                    loadingLabel="…"
                    type="button"
                    onClick={() => void salvarTelefone()}
                  >
                    OK
                  </SavePrimaryButton>
                  <button
                    type="button"
                    onClick={() => { setEditingTel(false); setTelValue(prof.telefone ?? ""); }}
                    className="shrink-0 transition-colors"
                    style={{ color: "#555" }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditingTel(true)}
                  className="shrink-0 transition-colors"
                  style={{ color: "#444" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#444")}
                  title="Editar telefone"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {telMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 mt-1.5 text-[11px]"
                  style={{ color: telMsg.ok ? "#22C55E" : "#F87171" }}
                >
                  {telMsg.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {telMsg.text}
                </motion.p>
              )}
            </AnimatePresence>
          </InfoCard>

          {/* Área de atuação — somente leitura */}
          <InfoCard icon={Briefcase} label="Área de atuação">
            <p className="text-sm font-semibold" style={{ color: "#F2F2F2" }}>
              {areaBadgeLabel(prof.area_atuacao)}
            </p>
          </InfoCard>

          {/* Data de cadastro — somente leitura */}
          <InfoCard icon={Calendar} label="Data de cadastro">
            <p className="text-sm" style={{ color: "#F2F2F2" }}>{formatDateBr(prof.created_at)}</p>
          </InfoCard>

          {/* Aulas ministradas — somente leitura */}
          <InfoCard icon={BookOpen} label="Aulas ministradas">
            <p className="text-sm leading-relaxed" style={{ color: "#AAAAAA" }}>{aulasMinistradasTexto}</p>
          </InfoCard>

          {/* Especialidades — editável */}
          <InfoCard icon={Award} label="Especialidades">
            {editingEsp ? (
              <>
                {/* chips com remoção */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
                  {espList.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-full"
                      style={{ border: "1px solid #2A2A2A", color: "#E5E7EB" }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeEsp(i)}
                        style={{ color: "#666", lineHeight: 1 }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F87171")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#666")}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                {/* input + adicionar */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={espInput}
                    onChange={(e) => setEspInput(e.target.value)}
                    placeholder="Nova especialidade…"
                    className="flex-1 text-xs bg-transparent outline-none min-w-0"
                    style={{ color: "#E0E0E0", caretColor: "#00F9E4" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addEsp(); }
                      if (e.key === "Escape") { setEditingEsp(false); setEspList(parseEspecialidades(prof.especialidades)); }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addEsp}
                    className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: "#222", color: "#00F9E4", border: "1px solid #333" }}
                  >
                    + Add
                  </button>
                </div>
                {/* ações */}
                <div className="flex items-center gap-2">
                  <SavePrimaryButton
                    preset="inline"
                    loading={espSaving}
                    loadingLabel="…"
                    type="button"
                    onClick={() => void salvarEspecialidades()}
                  >
                    Salvar
                  </SavePrimaryButton>
                  <button
                    type="button"
                    onClick={() => { setEditingEsp(false); setEspList(parseEspecialidades(prof.especialidades)); }}
                    style={{ color: "#555" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2 items-start">
                {espList.length > 0 ? (
                  espList.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="inline-block px-3 py-1.5 text-xs rounded-full"
                      style={{ border: "1px solid #2A2A2A", color: "#E5E7EB" }}
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-sm" style={{ color: "#AAAAAA" }}>—</p>
                )}
                <button
                  type="button"
                  onClick={() => { setEditingEsp(true); setEspInput(""); }}
                  className="shrink-0 transition-colors mt-0.5"
                  style={{ color: "#444" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#444")}
                  title="Editar especialidades"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
            <AnimatePresence>
              {espMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 mt-1.5 text-[11px]"
                  style={{ color: espMsg.ok ? "#22C55E" : "#F87171" }}
                >
                  {espMsg.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {espMsg.text}
                </motion.p>
              )}
            </AnimatePresence>
          </InfoCard>
        </div>
      </motion.div>

      {/* ── Horários de trabalho (idêntico ao ProfessorPublicPage) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.07 }}
        className="p-5 md:p-6 rounded-2xl mb-6"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} style={{ color: "#6B6B6B" }} />
          <h3 className="font-black text-lg uppercase tracking-tight" style={{ color: "#F2F2F2" }}>
            Horários de trabalho
          </h3>
        </div>

        {linhasHorario.length === 0 ? (
          <p className="text-sm py-4" style={{ color: "#6B6B6B" }}>
            Horário não informado ou incompleto.
          </p>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111111", border: "1px solid #222222" }}>
            <div
              className="hidden md:grid md:grid-cols-[1fr_minmax(0,100px)_minmax(0,100px)_minmax(0,80px)] gap-2 px-4 py-3 text-[11px] uppercase tracking-widest font-mono"
              style={{ color: "#6B6B6B", borderBottom: "1px solid #222222" }}
            >
              <span>Dia</span>
              <span className="text-center">Entrada</span>
              <span className="text-center">Saída</span>
              <span className="text-center">Carga</span>
            </div>
            {linhasHorario.map((row, idx, arr) => (
              <div
                key={row.dia}
                className="grid gap-1 px-4 py-3 text-xs md:text-sm md:grid-cols-[1fr_minmax(0,100px)_minmax(0,100px)_minmax(0,80px)] md:items-center md:gap-2"
                style={{ borderBottom: idx < arr.length - 1 ? "1px solid #222222" : "none", color: "#FFFFFF" }}
              >
                <span className="font-medium">{row.dia}</span>
                <span className="md:text-center text-[#AAAAAA]">
                  <span className="md:hidden" style={{ color: "#6B6B6B" }}>Entrada: </span>{row.entrada}
                </span>
                <span className="md:text-center text-[#AAAAAA]">
                  <span className="md:hidden" style={{ color: "#6B6B6B" }}>Saída: </span>{row.saida}
                </span>
                <span className="md:text-center font-mono" style={{ color: "#00F9E4" }}>{row.carga}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Alterar senha ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13 }}
        className="p-5 md:p-6 rounded-2xl"
        style={{ background: "#0D0D0D", border: "1px solid #303030" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} style={{ color: "#6B6B6B" }} />
          <h3 className="font-black text-lg uppercase tracking-tight" style={{ color: "#F2F2F2" }}>
            Alterar senha
          </h3>
        </div>

        <p className="text-xs mb-5" style={{ color: "#555" }}>
          Mínimo de 6 caracteres. O acesso atual permanece válido até o próximo login.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Nova senha */}
          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
              Nova senha
            </label>
            <div className="relative">
              <input
                type={showSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "#111111", border: "1px solid #222222", color: "#F2F2F2" }}
                onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#00F9E4")}
                onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#222222")}
              />
              <button
                type="button"
                onClick={() => setShowSenha((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#555" }}
              >
                {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
              Confirmar nova senha
            </label>
            <div className="relative">
              <input
                type={showConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none transition-colors"
                style={{ background: "#111111", border: "1px solid #222222", color: "#F2F2F2" }}
                onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#00F9E4")}
                onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "#222222")}
                onKeyDown={(e) => { if (e.key === "Enter") void alterarSenha(); }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmar((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#555" }}
              >
                {showConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void alterarSenha()}
          disabled={senhaSaving || !senha || !confirmarSenha}
          className="px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
          style={{ background: "#1A1A1A", border: "1px solid #303030", color: "#F2F2F2" }}
          onMouseEnter={(e) => {
            if (!senhaSaving && senha && confirmarSenha) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#00F9E4";
              (e.currentTarget as HTMLButtonElement).style.color = "#00F9E4";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#303030";
            (e.currentTarget as HTMLButtonElement).style.color = "#F2F2F2";
          }}
        >
          {senhaSaving ? "Salvando…" : "Alterar senha"}
        </button>

        <AnimatePresence>
          {senhaMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 mt-3 text-xs"
              style={{ color: senhaMsg.ok ? "#22C55E" : "#F87171" }}
            >
              {senhaMsg.ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {senhaMsg.text}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── sub-componente InfoCard ───────────────────────────────────────────────────

function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "#111111", border: "1px solid #222222" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: "#6B6B6B" }} />
        <span className="text-[11px] uppercase tracking-widest" style={{ color: "#6B6B6B" }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
