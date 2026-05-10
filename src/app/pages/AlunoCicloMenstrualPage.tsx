import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { Droplets, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { isSexoFemininoAluno } from "../../lib/alunoSexo";
import type { Database } from "../../lib/database.types";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "../components/CadastroFormAccordion";
import { CicloMenstrualCalendarioPreview } from "../components/CicloMenstrualCalendarioPreview";
import { DateInputBr } from "../components/DateInputBr";
import { SavePrimaryButton } from "../components/SavePrimaryButton";
import { formatIsoParaDataBrasil, isoYmdSomente } from "../../lib/datetimeBr";

type Ctx = { alunoId: string; checkinRegistrado: boolean; alunoSexo: string | null };

type CicloRegistroRow = Database["public"]["Tables"]["aluno_ciclo_menstrual_registro"]["Row"];

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors border border-[#222222] bg-[#111111]" +
  " text-[#F2F2F2] placeholder:text-[#505050] focus:border-[#00F9E4]";

function parseOptionalIntValidated(raw: string, min: number, max: number): number | null | "invalid" {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n)) return "invalid";
  if (n < min || n > max) return "invalid";
  return n;
}

function previewFromRegistro(r: CicloRegistroRow | null | undefined) {
  if (!r?.data_ultima_menstruacao) return null;
  const dumYmd = isoYmdSomente(String(r.data_ultima_menstruacao));
  if (!dumYmd) return null;
  const dc = r.dias_ciclo;
  const dm = r.dias_menstruais;
  if (!Number.isFinite(dc) || !Number.isFinite(dm)) return null;
  if (dc < 15 || dc > 45 || dm < 1 || dm > 31) return null;
  return { dumYmd, diasCiclo: dc, diasMenstruais: dm };
}

function formatoRegistroEm(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return iso.slice(0, 16);
  }
}

type DigitacaoProps = {
  diasMenstruaisStr: string;
  setDiasMenstruaisStr: (v: string) => void;
  diasCicloStr: string;
  setDiasCicloStr: (v: string) => void;
  dataUltimaIso: string;
  setDataUltimaIso: (v: string) => void;
};

function CicloDigitacaoCampos(props: DigitacaoProps) {
  const { diasMenstruaisStr, setDiasMenstruaisStr, diasCicloStr, setDiasCicloStr, dataUltimaIso, setDataUltimaIso } =
    props;
  return (
    <div className="space-y-5 pt-2">
      <div>
        <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
          Dias menstruais
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          className={inputCls}
          placeholder="Quantos dias normalmente dura a sua menstruação?"
          value={diasMenstruaisStr}
          onChange={(e) => setDiasMenstruaisStr(e.target.value.replace(/\D/g, "").slice(0, 2))}
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
          Dias de ciclo
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={2}
          className={inputCls}
          placeholder="Quantos dias é o intervalo entre suas menstruações?"
          value={diasCicloStr}
          onChange={(e) => setDiasCicloStr(e.target.value.replace(/\D/g, "").slice(0, 2))}
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-widest block mb-2" style={{ color: "#6B6B6B" }}>
          Data da última menstruação
        </label>
        <DateInputBr
          valueIso={dataUltimaIso}
          onChangeIso={setDataUltimaIso}
          inputClassName={inputCls}
          placeholder="Quando começou sua última menstruação?"
          hideCalendarButton={false}
        />
      </div>
    </div>
  );
}

/** Tabela somente leitura (linha única ou várias no histórico). */
function TabelaCicloReadOnly({
  titulo,
  linhas,
  mostrarColRegistradoEm,
}: {
  titulo: string;
  linhas: CicloRegistroRow[];
  mostrarColRegistradoEm: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1E1E1E]">
        <h2 className="font-black uppercase tracking-tight text-sm text-[#F2F2F2]">{titulo}</h2>
      </div>
      {linhas.length === 0 ? (
        <p className="px-5 py-6 text-xs" style={{ color: "#6B6B6B" }}>
          Nenhum registro.
        </p>
      ) : (
        <>
          <div className="sm:hidden divide-y divide-[#1E1E1E]">
            {linhas.map((row) => (
              <div key={row.id} className="px-5 py-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wider shrink-0" style={{ color: "#6B6B6B" }}>
                    Dias menstruais
                  </span>
                  <span className="text-right tabular-nums" style={{ color: "#E8E8E8" }}>
                    {row.dias_menstruais}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wider shrink-0" style={{ color: "#6B6B6B" }}>
                    Dias de ciclo
                  </span>
                  <span className="text-right tabular-nums" style={{ color: "#E8E8E8" }}>
                    {row.dias_ciclo}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wider shrink-0 max-w-[45%]" style={{ color: "#6B6B6B" }}>
                    Última menstruação (DUM)
                  </span>
                  <span className="text-right min-w-0 break-words" style={{ color: "#E8E8E8" }}>
                    {formatIsoParaDataBrasil(isoYmdSomente(String(row.data_ultima_menstruacao)))}
                  </span>
                </div>
                {mostrarColRegistradoEm ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-[11px] uppercase tracking-wider shrink-0 max-w-[45%]" style={{ color: "#6B6B6B" }}>
                      Registrado em
                    </span>
                    <span className="text-right text-xs min-w-0 break-words" style={{ color: "#E8E8E8" }}>
                      {formatoRegistroEm(row.registrado_em)}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider" style={{ color: "#6B6B6B" }}>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Dias menstruais</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Dias de ciclo</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Última menstruação (DUM)</th>
                  {mostrarColRegistradoEm ? (
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Registrado em</th>
                  ) : null}
                </tr>
              </thead>
              <tbody style={{ color: "#E8E8E8" }}>
                {linhas.map((row) => (
                  <tr key={row.id} className="border-t border-[#1E1E1E]">
                    <td className="px-4 py-3 whitespace-nowrap align-top">{row.dias_menstruais}</td>
                    <td className="px-4 py-3 whitespace-nowrap align-top">{row.dias_ciclo}</td>
                    <td className="px-4 py-3 whitespace-nowrap align-top">
                      {formatIsoParaDataBrasil(isoYmdSomente(String(row.data_ultima_menstruacao)))}
                    </td>
                    {mostrarColRegistradoEm ? (
                      <td className="px-4 py-3 whitespace-nowrap align-top">{formatoRegistroEm(row.registrado_em)}</td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function AlunoCicloMenstrualPage() {
  const { alunoId, alunoSexo } = useOutletContext<Ctx>();
  const navigate = useNavigate();

  const sexoStr = useMemo(() => (alunoSexo ?? "").trim(), [alunoSexo]);
  const femininoConfirmado = sexoStr !== "" && isSexoFemininoAluno(alunoSexo);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registros, setRegistros] = useState<CicloRegistroRow[]>([]);
  const [novoCicloAberto, setNovoCicloAberto] = useState(false);

  const [diasMenstruaisStr, setDiasMenstruaisStr] = useState("");
  const [diasCicloStr, setDiasCicloStr] = useState("");
  const [dataUltimaIso, setDataUltimaIso] = useState("");

  const temCadastro = registros.length > 0;
  const cicloAtual = temCadastro ? registros[0] : null;
  const historico = temCadastro ? registros.slice(1) : [];

  const calendarPreviewForm = useMemo(() => {
    const dumYmd = isoYmdSomente(dataUltimaIso);
    if (!dumYmd) return null;
    const dm = parseOptionalIntValidated(diasMenstruaisStr, 1, 31);
    const dc = parseOptionalIntValidated(diasCicloStr, 15, 45);
    if (dm === null || dm === "invalid" || dc === null || dc === "invalid") return null;
    return { dumYmd, diasCiclo: dc, diasMenstruais: dm };
  }, [dataUltimaIso, diasMenstruaisStr, diasCicloStr]);

  const calendarPreviewDb = useMemo(() => previewFromRegistro(cicloAtual), [cicloAtual]);

  const calendarMostrado = useMemo(() => {
    if (!temCadastro) return calendarPreviewForm;
    if (novoCicloAberto && calendarPreviewForm) return calendarPreviewForm;
    return calendarPreviewDb ?? calendarPreviewForm;
  }, [temCadastro, novoCicloAberto, calendarPreviewForm, calendarPreviewDb]);

  useEffect(() => {
    if (sexoStr === "") return;
    if (!isSexoFemininoAluno(alunoSexo)) navigate("/aluno/dashboard", { replace: true });
  }, [sexoStr, alunoSexo, navigate]);

  const limparFormulario = useCallback(() => {
    setDiasMenstruaisStr("");
    setDiasCicloStr("");
    setDataUltimaIso("");
  }, []);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured || !alunoId || !femininoConfirmado) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = getSupabase();
      const limite = new Date();
      limite.setUTCFullYear(limite.getUTCFullYear(), limite.getUTCMonth() - 12, limite.getUTCDate());
      const limiteIso = limite.toISOString();

      const { data, error } = await sb
        .from("aluno_ciclo_menstrual_registro")
        .select("*")
        .eq("aluno_id", alunoId)
        .gte("registrado_em", limiteIso)
        .order("registrado_em", { ascending: false });

      if (error) {
        toast.error(error.message);
        return;
      }

      const rows = (data ?? []) as CicloRegistroRow[];
      setRegistros(rows);
    } finally {
      setLoading(false);
    }
  }, [alunoId, femininoConfirmado]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function abrirNovoCiclo() {
    limparFormulario();
    setNovoCicloAberto(true);
  }

  function cancelarNovoCiclo() {
    limparFormulario();
    setNovoCicloAberto(false);
  }

  async function salvar() {
    if (!isSupabaseConfigured || !alunoId || !femininoConfirmado) return;

    const dm = parseOptionalIntValidated(diasMenstruaisStr, 1, 31);
    const dc = parseOptionalIntValidated(diasCicloStr, 15, 45);
    if (dm === "invalid") {
      toast.error("Dias menstruais: informe um número entre 1 e 31.");
      return;
    }
    if (dc === "invalid") {
      toast.error("Dias de ciclo: informe um número entre 15 e 45.");
      return;
    }
    if (dm === null || dc === null) {
      toast.error("Preencha os dias menstruais e os dias do ciclo.");
      return;
    }

    const dataIso = isoYmdSomente(dataUltimaIso);
    if (!dataIso) {
      toast.error("Informe a data da última menstruação.");
      return;
    }

    setSaving(true);
    const sb = getSupabase();
    const payload: Database["public"]["Tables"]["aluno_ciclo_menstrual_registro"]["Insert"] = {
      aluno_id: alunoId,
      dias_menstruais: dm,
      dias_ciclo: dc,
      data_ultima_menstruacao: dataIso,
    };
    const { error } = await sb.from("aluno_ciclo_menstrual_registro").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(temCadastro ? "Novo ciclo registrado." : "Dados salvos.");
    limparFormulario();
    setNovoCicloAberto(false);
    await reload();
  }

  if (sexoStr === "") {
    return (
      <div className="mx-auto max-w-2xl w-full flex flex-col gap-4 pb-8">
        <p className="text-sm py-8" style={{ color: "#888" }}>
          Carregando…
        </p>
      </div>
    );
  }

  if (!femininoConfirmado) return null;

  const digitacaoProps: DigitacaoProps = {
    diasMenstruaisStr,
    setDiasMenstruaisStr,
    diasCicloStr,
    setDiasCicloStr,
    dataUltimaIso,
    setDataUltimaIso,
  };

  return (
    <div className="mx-auto max-w-2xl w-full flex flex-col gap-4 pb-8">
      <div>
        <h1 className="font-black text-xl md:text-2xl tracking-tight mb-1" style={{ color: "#F2F2F2" }}>
          Ciclo menstrual
        </h1>
        <p className="text-xs md:text-sm" style={{ color: "#6B6B6B" }}>
          Opcional — ajuda no acompanhamento. Apenas você vê estas informações.
        </p>
      </div>

      {/* Primeiro cadastro: apenas acordeão com formulário */}
      {!temCadastro ? (
        <CadastroFormAccordion type="multiple" defaultValue={["ciclo"]}>
          <CadastroFormAccordionSection
            value="ciclo"
            title="Ciclo menstrual"
            icon={<Droplets size={16} style={{ color: "#00F9E4" }} />}
            subtitle="Primeiro cadastro — preencha e salve para ver o calendário e iniciar seu histórico."
          >
            {loading ? (
              <p className="text-sm py-4" style={{ color: "#888" }}>
                Carregando…
              </p>
            ) : (
              <div className="space-y-4">
                <CicloDigitacaoCampos {...digitacaoProps} />
                <SavePrimaryButton preset="form" loading={saving} onClick={() => void salvar()}>
                  Salvar
                </SavePrimaryButton>
              </div>
            )}
          </CadastroFormAccordionSection>
        </CadastroFormAccordion>
      ) : null}

      {/* Ciclo atual + novo ciclo */}
      {temCadastro ? (
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-sm py-4" style={{ color: "#888" }}>
              Carregando…
            </p>
          ) : cicloAtual ? (
            <TabelaCicloReadOnly titulo="Ciclo atual" linhas={[cicloAtual]} mostrarColRegistradoEm={false} />
          ) : null}

          {!loading && !novoCicloAberto ? (
            <button
              type="button"
              className="self-start inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] px-5 py-3 text-sm font-bold transition-colors hover:bg-[#161616]"
              style={{ color: "#00F9E4" }}
              onClick={abrirNovoCiclo}
            >
              <Plus size={18} strokeWidth={2.25} aria-hidden />
              Novo Ciclo
            </button>
          ) : null}

          {novoCicloAberto ? (
            <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-5 space-y-4">
              <h2 className="font-black uppercase tracking-tight text-sm text-[#F2F2F2]">Registrar novo ciclo</h2>
              <p className="text-[11px] leading-relaxed" style={{ color: "#6B6B6B" }}>
                O ciclo atual passará para o histórico após salvar esta nova entrada.
              </p>
              <CicloDigitacaoCampos {...digitacaoProps} />
              <div className="flex flex-wrap gap-3 pt-2">
                <SavePrimaryButton preset="form" loading={saving} onClick={() => void salvar()}>
                  Salvar
                </SavePrimaryButton>
                <button
                  type="button"
                  disabled={saving}
                  className="px-4 py-3 rounded-xl text-sm border border-[#2A2A2A] text-[#B8B8B8] hover:bg-[#161616] transition-colors disabled:opacity-50"
                  onClick={cancelarNovoCiclo}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && calendarMostrado ? (
        <CicloMenstrualCalendarioPreview
          dumYmd={calendarMostrado.dumYmd}
          diasCiclo={calendarMostrado.diasCiclo}
          diasMenstruais={calendarMostrado.diasMenstruais}
        />
      ) : null}

      {!loading && !calendarMostrado ? (
        <p className="mt-2 text-[11px] leading-relaxed max-w-xl" style={{ color: "#6B6B6B" }}>
          Preencha a data da última menstruação, os dias do ciclo e os dias menstruais para visualizar o calendário com
          menstruação, período previsto, janela de ovulação e dia da ovulação (estimativa).
        </p>
      ) : null}

      {temCadastro && !loading && historico.length > 0 ? (
        <div className="mt-2">
          <TabelaCicloReadOnly titulo="Histórico" linhas={historico} mostrarColRegistradoEm />
        </div>
      ) : null}

      {temCadastro && !loading && historico.length === 0 ? (
        <p className="text-[11px] leading-relaxed" style={{ color: "#6B6B6B" }}>
          O histórico lista ciclos anteriores (até 12 meses). Ao registrar um novo ciclo, o anterior aparecerá aqui.
        </p>
      ) : null}
    </div>
  );
}
