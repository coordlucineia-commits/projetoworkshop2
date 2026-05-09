import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { isBefore, startOfDay } from "date-fns";
import {
  VISIT_TIME_SLOTS,
  MAX_BOOKINGS_PER_TIME_SLOT,
  stripPhoneDigits,
  maskPhoneBr,
  formatDateYmdToBr,
} from "../../lib/visitasGuiadas";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { DateInputBr } from "../components/DateInputBr";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import {
  LuTeGuestFooterCredits,
  LuTeGuestFormShell,
  LuTeGuestLogoCompact,
} from "../components/LuTeGuestFormShell";

export function AgendarVisitaPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataYmdIso, setDataYmdIso] = useState("");
  const [horario, setHorario] = useState<string>("");
  const [ocupacao, setOcupacao] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsNotice, setSlotsNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    nome: string;
    dataYmd: string;
    horario: string;
  } | null>(null);

  const refreshOcupacao = useCallback(
    async (ymd: string) => {
      if (!ymd || !isSupabaseConfigured) {
        setOcupacao({});
        return;
      }
      setLoadingSlots(true);
      try {
        setSlotsNotice(null);
        const supabase = getSupabase();
        const { data, error: rpcErr } = await supabase.rpc(
          "visitas_horarios_ocupacao",
          { p_data: ymd },
        );
        if (rpcErr) {
          const msg = rpcErr.message ?? "";
          setOcupacao({});
          const missing =
            /could not find the function/i.test(msg) ||
            /schema cache/i.test(msg);
          if (missing) {
            setSlotsNotice(
              "O Supabase ainda não expõe a função de vagas. No SQL Editor rode o arquivo supabase/fix_visitas_horarios_rpc.sql (ou a migration visitas_guiadas) e aguarde alguns segundos; também recarregue o schema em Project Settings → API se necessário. Enquanto isso todos os horários aparecem livres.",
            );
            return;
          }
          setSlotsNotice(msg);
          return;
        }
        const map: Record<string, number> = {};
        for (const row of data ?? []) {
          map[row.horario] = Number(row.ocupacao);
        }
        setOcupacao(map);
      } finally {
        setLoadingSlots(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!dataYmdIso) {
      setOcupacao({});
      return;
    }
    void refreshOcupacao(dataYmdIso);
  }, [dataYmdIso, refreshOcupacao]);

  const calendarDisabled = (date: Date) => {
    const todayStart = startOfDay(new Date());
    if (isBefore(startOfDay(date), todayStart)) return true;
    if (date.getDay() === 0) return true;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const n = nome.trim();
    if (n.length < 3) {
      setError("Informe seu nome completo.");
      return;
    }
    const tel = stripPhoneDigits(telefone);
    if (tel.length < 10) {
      setError("Informe um telefone válido (WhatsApp).");
      return;
    }
    if (!dataYmdIso) {
      setError("Escolha a data da visita.");
      return;
    }
    if (!horario) {
      setError("Escolha um horário.");
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        "Serviço de agendamento indisponível. Configure Supabase nas variáveis de ambiente.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { data: novoId, error: rpcErr } = await supabase.rpc(
        "criar_visita_guiada",
        {
          p_nome: n,
          p_telefone: tel,
          p_data: dataYmdIso,
          p_horario: horario,
        },
      );
      if (rpcErr) {
        setError(rpcErr.message ?? "Não foi possível concluir o agendamento.");
        setSubmitting(false);
        return;
      }
      if (!novoId) {
        setError("Agendamento não retornou confirmação.");
        setSubmitting(false);
        return;
      }
      setSuccess({ nome: n, dataYmd: dataYmdIso, horario });
    } finally {
      setSubmitting(false);
    }
  };

  const formHeader = (
    <div className="flex flex-col items-center mb-8">
      <LuTeGuestLogoCompact />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.3 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: "rgba(0,249,228,0.08)", border: "1px solid rgba(0,249,228,0.2)" }}
      >
        <CalendarCheck size={28} style={{ color: "#00F9E4" }} strokeWidth={1.5} />
      </motion.div>
      <h1 className="text-3xl md:text-4xl font-black uppercase text-center mb-2 tracking-tight text-white">
        Agende sua visita
      </h1>
      <p className="text-sm text-center leading-relaxed" style={{ color: "#9A9A9A" }}>
        Venha conhecer a LuTe Academy. Escolha o melhor dia e horário para sua{" "}
        <span style={{ color: "#00F9E4" }}>visita guiada</span>.
      </p>
    </div>
  );

  const fieldLabelClass =
    "block text-[10px] uppercase tracking-widest px-2 font-mono";
  const pillInputClass =
    "w-full pl-5 pr-5 py-3.5 rounded-full text-sm text-white transition-colors outline-none";
  const pillBorderStyle = { background: "#0A0A0A", border: "1px solid #2A2A2A", color: "#F5F5F5" } as const;

  if (!isSupabaseConfigured) {
    return (
      <LuTeGuestFormShell>
        <div className="text-center px-2">
          {formHeader}
          <p style={{ color: "#9A9A9A" }} className="text-sm leading-relaxed">
            Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env e aplique a migration de visitas
            guiadas no banco para habilitar o agendamento online.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 w-full text-sm flex items-center justify-center gap-2 transition-colors rounded-full py-3.5 uppercase font-bold tracking-wider"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#AAA" }}
          >
            <ArrowLeft size={15} className="shrink-0" style={{ color: "#00F9E4" }} />
            Voltar ao início
          </button>
          <LuTeGuestFooterCredits />
        </div>
      </LuTeGuestFormShell>
    );
  }

  if (success) {
    return (
      <LuTeGuestFormShell motionKey="success">
        <div className="flex flex-col items-center mb-6">
          <LuTeGuestLogoCompact />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{
              background: "rgba(0,249,228,0.1)",
              border: "1px solid rgba(0,249,228,0.35)",
            }}
          >
            <CalendarCheck size={28} style={{ color: "#00F9E4" }} strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-center mb-2 tracking-tight text-white">
            Visita agendada!
          </h1>
          <p className="text-sm text-center leading-relaxed" style={{ color: "#9A9A9A" }}>
            Você receberá uma mensagem no WhatsApp com os detalhes.
          </p>
        </div>

        <div
          className="text-left rounded-2xl p-5 mb-6 space-y-2 text-sm"
          style={{ background: "#0A0A0A", border: "1px solid #2A2A2A" }}
        >
          <p>
            <span className="text-[#6B6B6B]">Nome </span>
            <span className="text-white font-semibold">{success.nome}</span>
          </p>
          <p>
            <span className="text-[#6B6B6B]">Data </span>
            <span className="text-white font-semibold">{formatDateYmdToBr(success.dataYmd)}</span>
          </p>
          <p>
            <span className="text-[#6B6B6B]">Horário </span>
            <span className="text-white font-semibold">{success.horario}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2"
          style={{
            border: "1px solid #2A2A2A",
            color: "#F5F5F5",
            background: "transparent",
          }}
        >
          <ArrowLeft size={15} style={{ color: "#00F9E4" }} />
          Voltar ao início
        </button>
        <LuTeGuestFooterCredits />
      </LuTeGuestFormShell>
    );
  }

  return (
    <LuTeGuestFormShell>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-6 text-sm flex items-center gap-2 font-mono uppercase tracking-wider transition-colors w-full justify-center sm:justify-start"
        style={{ color: "#606060", background: "none", border: "none", cursor: "pointer" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00F9E4")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#606060")}
      >
        <ArrowLeft size={15} />
        Voltar
      </button>

      {formHeader}

      <form onSubmit={handleSubmit} className="space-y-5">
        {slotsNotice ? (
          <div
            className="rounded-xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              color: "#F59E0B",
              border: "1px solid rgba(245, 158, 11, 0.25)",
            }}
          >
            {slotsNotice}
          </div>
        ) : null}

        {error ? (
          <div
            className="rounded-xl px-4 py-3 text-sm text-center flex items-center gap-2 justify-center flex-wrap"
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#F87171",
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className={`${fieldLabelClass}`} style={{ color: "#9A9A9A" }}>
            Nome completo *
          </label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome completo"
            autoComplete="name"
            className={pillInputClass}
            style={pillBorderStyle}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#00F9E4")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#2A2A2A")}
          />
        </div>

        <div className="space-y-2">
          <label className={`${fieldLabelClass}`} style={{ color: "#9A9A9A" }}>
            Telefone (WhatsApp) *
          </label>
          <input
            required
            value={telefone}
            onChange={(e) => setTelefone(maskPhoneBr(e.target.value))}
            placeholder="(11) 99999-9999"
            inputMode="tel"
            className={pillInputClass}
            style={pillBorderStyle}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#00F9E4")}
            onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#2A2A2A")}
          />
          <p className="text-[11px] px-2" style={{ color: "#606060" }}>
            Confirmação e lembretes pelo WhatsApp
          </p>
        </div>

        <div className="space-y-2">
          <label className={`${fieldLabelClass}`} style={{ color: "#9A9A9A" }}>
            Data *
          </label>
          <DateInputBr
            valueIso={dataYmdIso}
            onChangeIso={(iso) => {
              setDataYmdIso(iso);
              setHorario("");
            }}
            disabled={submitting}
            disabledDates={calendarDisabled}
            required
            inputClassName={pillInputClass}
            wrapperClassName="w-full"
            inputStyle={{
              ...pillBorderStyle,
            }}
            popoverAlign="center"
            popoverContentClassName="w-auto border-[#2A2A2A] p-0 bg-[#0D0D0D]"
            modifiersClassNames={{
              selected: "!bg-[#00F9E4] !text-[#0A0A0A]",
            }}
          />
          <p className="text-[11px] px-2" style={{ color: "#606060" }}>
            Domingos indisponíveis. Dia/mês/ano ou calendário.
          </p>
        </div>

        <div className="space-y-2">
          <span className={`${fieldLabelClass}`} style={{ color: "#9A9A9A" }}>
            Horário *
          </span>
          {!dataYmdIso ? (
            <p className="text-sm px-2" style={{ color: "#6B6B6B" }}>Escolha uma data primeiro.</p>
          ) : loadingSlots ? (
            <p className="text-sm px-2" style={{ color: "#6B6B6B" }}>Carregando vagas…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {VISIT_TIME_SLOTS.map((slot) => {
                const oc = ocupacao[slot] ?? 0;
                const full = oc >= MAX_BOOKINGS_PER_TIME_SLOT;
                const active = horario === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={full}
                    onClick={() => setHorario(slot)}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide rounded-full transition-colors"
                    style={
                      full
                        ? {
                            background: "#1a1a1a",
                            color: "#444",
                            border: "1px solid #222",
                            cursor: "not-allowed",
                          }
                        : active
                          ? {
                              background: "#00F9E4",
                              color: "#0A0A0A",
                              border: "1px solid #00F9E4",
                            }
                          : {
                              background: "#0A0A0A",
                              color: "#fff",
                              border: "1px solid #2A2A2A",
                            }
                    }
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ scale: submitting ? 1 : 1.02 }}
          whileTap={{ scale: submitting ? 1 : 0.98 }}
          className="w-full py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#00F9E4", color: "#0A0A0A" }}
        >
          {submitting ? "Enviando…" : "Agendar minha visita"}
        </motion.button>
      </form>

      <LuTeGuestFooterCredits />
    </LuTeGuestFormShell>
  );
}
