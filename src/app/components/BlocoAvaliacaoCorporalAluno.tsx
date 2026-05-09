import type { CSSProperties, ReactNode } from "react";
import { formatDateBr } from "../../lib/displayHelpers";
import type { Database } from "../../lib/database.types";
import {
  CIRC_KEYS,
  formatCm,
  parseCircJson,
} from "../../lib/avaliacaoCorporalLabels";
import {
  KEYS_ANTROPOMETRIA_CM,
  KEYS_BILATERAIS,
  KEYS_COMP_CORP_DECIMAL,
  parseMedidasPayloadFromJson,
} from "../../lib/avaliacaoCorporalMedidas";
import {
  ClipboardList,
  Activity,
  Heart,
  Ruler,
  Columns2,
  Waves,
} from "lucide-react";
import { CadastroFormAccordion, CadastroFormAccordionSection } from "./CadastroFormAccordion";

export type AgendaRowFull = Database["public"]["Tables"]["avaliacoes_agenda"]["Row"] & {
  professores: { nome: string } | null;
};
export type AvaliacaoAlunoRow = Database["public"]["Tables"]["avaliacoes"]["Row"];

function FieldLineMini({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[minmax(160px,220px)_1fr] gap-2 py-2.5 border-b border-[#222222] last:border-b-0 text-sm"
      style={{ borderColor: "#222222" }}
    >
      <span className="text-[11px] uppercase tracking-widest shrink-0" style={{ color: "#6B6B6B" }}>
        {label}
      </span>
      <div style={{ color: "#F2F2F2" }}>{children}</div>
    </div>
  );
}

function numeroOuTraco(n: number | null | undefined, suffix = ""): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${suffix}`;
}

function fmtBool(v: boolean | null | undefined): string {
  if (v === true) return "Sim";
  if (v === false) return "Não";
  return "—";
}

const accVal = (avId: string, n: string) => `${avId}-${n}`;

export function BlocoAvaliacaoCorporalAluno({
  av,
  agendas,
  variant = "standalone",
}: {
  av: AvaliacaoAlunoRow;
  agendas: AgendaRowFull[];
  /** `embedded`: sem caixa nem resumo inicial (lista expansível pai já mostra dados). */
  variant?: "standalone" | "embedded";
}) {
  const circ = parseCircJson(av.circunferencias);
  const agg = av.agenda_id ? agendas.find((g) => g.id === av.agenda_id) : undefined;
  const prof = agg?.professores?.nome?.trim() ?? "—";
  const v2 = parseMedidasPayloadFromJson(av.medidas);
  const hasLegacyCirc = CIRC_KEYS.some(([k]) => {
    const raw = circ[k];
    return raw != null && raw !== "";
  });

  function rowNumMap(
    keys: typeof KEYS_COMP_CORP_DECIMAL | typeof KEYS_ANTROPOMETRIA_CM | typeof KEYS_BILATERAIS,
    bag: Partial<Record<string, number | null>> | undefined,
    opts?: { hideEmptyPlaceholder?: boolean },
  ) {
    const lines = keys.map(([k, lab, unit]) => {
      const n = bag?.[k as keyof typeof bag];
      const num = typeof n === "number" ? n : n != null ? Number(n) : null;
      if (num == null || Number.isNaN(num)) return null;
      return (
        <FieldLineMini key={k} label={`${lab} (${unit})`}>
          {numeroOuTraco(num)}
        </FieldLineMini>
      );
    });
    const filtered = lines.filter((x): x is NonNullable<(typeof lines)[number]> => x != null);
    if (filtered.length === 0) {
      return opts?.hideEmptyPlaceholder ? null : (
        <p className="text-xs py-2 italic" style={{ color: "#606060" }}>
          Nenhuma medida nesta seção.
        </p>
      );
    }
    return <div className="space-y-0">{filtered}</div>;
  }

  const shellCls =
    variant === "standalone"
      ? "rounded-xl p-4 mb-4 space-y-2 last:mb-0"
      : "space-y-2 pt-1";
  const shellStyle: CSSProperties | undefined =
    variant === "standalone" ? { background: "#111111", border: "1px solid #252525" } : undefined;

  return (
    <div className={shellCls} style={shellStyle}>
      {variant === "standalone" ? (
        <>
          <p className="text-xs uppercase tracking-wider font-black" style={{ color: "#00F9E4" }}>
            {formatDateBr(av.data_avaliacao)}
          </p>
          <FieldLineMini label="Professor (agenda vinculada)">{prof}</FieldLineMini>
        </>
      ) : null}

      {v2 ? (
        <CadastroFormAccordion
          type="multiple"
          defaultValue={[accVal(av.id, "1")]}
          className="border-t border-[#222] mt-4 pt-2"
        >
          <CadastroFormAccordionSection
            value={accVal(av.id, "1")}
            ordinal="1"
            title="Informações gerais"
            icon={<ClipboardList size={16} style={{ color: "#00F9E4" }} />}
            iconColor="#00F9E4"
            iconBg="rgba(0,249,228,0.12)"
          >
              <FieldLineMini label="Reavaliação">{v2.reavaliacao_em ? formatDateBr(v2.reavaliacao_em) : "—"}</FieldLineMini>
              <div className="grid grid-cols-2 gap-3 text-sm py-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
                    Peso
                  </span>
                  <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.peso, " kg")}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
                    Estatura
                  </span>
                  <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.altura != null ? Math.round(av.altura) : null, " cm")}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
                    IMC
                  </span>
                  <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.imc)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
                    Gordura
                  </span>
                  <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.percentual_gordura, " %")}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
                    Massa magra
                  </span>
                  <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.massa_magra, " kg")}</span>
                </div>
              </div>
          </CadastroFormAccordionSection>

          <CadastroFormAccordionSection
            value={accVal(av.id, "2")}
            ordinal="2"
            title="Composição corporal"
            icon={<Activity size={16} style={{ color: "#F472B6" }} />}
            iconColor="#F472B6"
            iconBg="rgba(244,114,182,0.12)"
          >
              {rowNumMap(KEYS_COMP_CORP_DECIMAL, v2.composicao_corporal, { hideEmptyPlaceholder: true })}
          </CadastroFormAccordionSection>

          <CadastroFormAccordionSection
            value={accVal(av.id, "3")}
            ordinal="3"
            title="Anamnese"
            icon={<Heart size={16} style={{ color: "#EF4444" }} />}
            iconColor="#EF4444"
            iconBg="rgba(239,68,68,0.12)"
          >
              <FieldLineMini label="Objetivos">
                {v2.objetivos.length ? v2.objetivos.join(", ") : "—"}
              </FieldLineMini>
              <FieldLineMini label="Histórico de atividade física">
                {v2.historico_atividade_fisica.trim() ? v2.historico_atividade_fisica : "—"}
              </FieldLineMini>
              <FieldLineMini label="Cirurgias">{fmtBool(v2.cirurgias)}</FieldLineMini>
              <FieldLineMini label="Medicamentos">{fmtBool(v2.medicamentos)}</FieldLineMini>
              <FieldLineMini label="Fraturas">{fmtBool(v2.fraturas)}</FieldLineMini>
              <FieldLineMini label="Artrose">{fmtBool(v2.artrose)}</FieldLineMini>
              <FieldLineMini label="Dores na coluna">{fmtBool(v2.dores_coluna)}</FieldLineMini>
          </CadastroFormAccordionSection>

          <CadastroFormAccordionSection
            value={accVal(av.id, "4")}
            ordinal="4"
            title="Antropometria"
            icon={<Ruler size={16} style={{ color: "#4ADE80" }} />}
            iconColor="#4ADE80"
            iconBg="rgba(74,222,128,0.12)"
          >
            {rowNumMap(KEYS_ANTROPOMETRIA_CM, v2.antropometria)}
          </CadastroFormAccordionSection>

          <CadastroFormAccordionSection
            value={accVal(av.id, "5")}
            ordinal="5"
            title="Medidas bilaterais"
            icon={<Columns2 size={16} style={{ color: "#FACC15" }} />}
            iconColor="#FACC15"
            iconBg="rgba(250,204,21,0.12)"
          >
            {rowNumMap(KEYS_BILATERAIS, v2.bilaterais)}
          </CadastroFormAccordionSection>

          <CadastroFormAccordionSection
            value={accVal(av.id, "6")}
            ordinal="6"
            title="Flexibilidade"
            icon={<Waves size={16} style={{ color: "#22D3EE" }} />}
            iconColor="#22D3EE"
            iconBg="rgba(34,211,238,0.12)"
          >
            <FieldLineMini label="Método">{v2.flexibilidade_metodo.trim() || "—"}</FieldLineMini>
            <FieldLineMini label="Resultado">{numeroOuTraco(v2.flexibilidade_resultado)}</FieldLineMini>
          </CadastroFormAccordionSection>
        </CadastroFormAccordion>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-sm">
          <div>
            <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
              Peso
            </span>
            <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.peso, " kg")}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
              Altura
            </span>
            <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.altura, " cm")}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
              IMC
            </span>
            <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.imc)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
              Gordura
            </span>
            <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.percentual_gordura, " %")}</span>
          </div>
          <div className="col-span-2 sm:col-span-4">
            <span className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: "#6B6B6B" }}>
              Massa magra
            </span>
            <span style={{ color: "#F2F2F2" }}>{numeroOuTraco(av.massa_magra, " kg")}</span>
          </div>
        </div>
      )}

      {!v2 && hasLegacyCirc ? (
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <p className="col-span-full text-[11px] uppercase font-bold mt-2" style={{ color: "#888" }}>
            Circunferências (histórico)
          </p>
          {CIRC_KEYS.map(([key, lab]) => {
            const raw = circ[key];
            const v =
              typeof raw === "number" && Number.isFinite(raw)
                ? raw
                : raw != null
                  ? Number.parseFloat(String(raw))
                  : null;
            const has = raw != null && raw !== "";
            return (
              <div key={key} className="flex justify-between gap-2 py-1 border-b border-[#222]">
                <span style={{ color: "#888" }}>{lab}</span>
                <span className="font-mono shrink-0" style={{ color: "#F2F2F2" }}>
                  {has && Number.isFinite(v as number) ? formatCm(v as number) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {(av.observacoes ?? "").trim() ? (
        <FieldLineMini label="Observações do professor">{av.observacoes}</FieldLineMini>
      ) : null}
    </div>
  );
}
