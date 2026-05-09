"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  calcularCicloMenstrual,
  classificarDiaCalendario,
  toYmd,
} from "../../lib/cicloMenstrualCalendario";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/** Paleta próxima da referência, contrastada sobre fundo escuro */
const CORES = {
  previsto: { bg: "rgba(244,114,182,0.42)", texto: "#FCE7F3" },
  menstruacao: { bg: "rgba(219,39,119,0.92)", texto: "#FFF" },
  fertil: { bg: "rgba(167,139,250,0.45)", texto: "#EDE9FE" },
  ovulacao: { bg: "rgba(109,40,217,0.95)", texto: "#FFF", ring: "rgba(255,255,255,0.92)" },
} as const;

type Props = {
  dumYmd: string;
  diasCiclo: number;
  diasMenstruais: number;
};

function LegendDot({ bg, ring }: { bg: string; ring?: boolean }) {
  return (
    <span
      className="inline-block size-3 rounded-full shrink-0"
      style={{
        background: bg,
        boxShadow: ring ? `0 0 0 2px rgba(255,255,255,0.35)` : undefined,
      }}
    />
  );
}

export function CicloMenstrualCalendarioPreview({ dumYmd, diasCiclo, diasMenstruais }: Props) {
  const [mesReferencia, setMesReferencia] = useState(() => {
    try {
      const d = dumYmd?.trim()?.slice(0, 10);
      const parts = d?.split("-");
      if (parts?.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        const da = Number(parts[2]);
        const dt = new Date(y, m - 1, da);
        if (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === da) return dt;
      }
    } catch {
      /* noop */
    }
    return new Date();
  });

  useEffect(() => {
    try {
      const d = dumYmd?.trim()?.slice(0, 10);
      const parts = d?.split("-");
      if (parts?.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]);
        const da = Number(parts[2]);
        const dt = new Date(y, m - 1, da);
        if (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === da) {
          setMesReferencia(new Date(y, m - 1, 1));
        }
      }
    } catch {
      /* noop */
    }
  }, [dumYmd]);

  const calculado = useMemo(
    () => calcularCicloMenstrual(dumYmd, diasCiclo, diasMenstruais),
    [dumYmd, diasCiclo, diasMenstruais],
  );

  const diasGrid = useMemo(() => {
    try {
      const inicioMes = startOfMonth(mesReferencia);
      const fimMes = endOfMonth(mesReferencia);
      const ini = startOfWeek(inicioMes, { weekStartsOn: 0 });
      const fim = endOfWeek(fimMes, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: ini, end: fim });
    } catch {
      return [];
    }
  }, [mesReferencia]);

  if (!calculado) return null;

  return (
    <div
      className="rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] px-4 py-5 mt-6 w-full max-w-full overflow-hidden"
      aria-label="Calendário estimado do ciclo menstrual"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          className="p-2 rounded-xl border border-[#2A2A2A] text-primary hover:bg-[#161616] transition-colors"
          aria-label="Mês anterior"
          onClick={() => setMesReferencia((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
        >
          <ChevronLeft size={20} className="shrink-0 text-primary" />
        </button>
        <h2 className="text-base font-black uppercase tracking-wide text-[#F2F2F2] truncate text-center px-2">
          {(() => {
            try {
              return format(mesReferencia, "MMMM yyyy", { locale: ptBR });
            } catch {
              return "";
            }
          })()}
        </h2>
        <button
          type="button"
          className="p-2 rounded-xl border border-[#2A2A2A] text-primary hover:bg-[#161616] transition-colors"
          aria-label="Próximo mês"
          onClick={() => setMesReferencia((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
        >
          <ChevronRight size={20} className="shrink-0 text-primary" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] sm:text-xs mb-2" style={{ color: "#DB2777" }}>
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="font-semibold py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-sm">
        {diasGrid.map((dia) => {
          const ymd = toYmd(dia);
          const tipo = classificarDiaCalendario(ymd, calculado);
          const mesmoMes = (() => {
            try {
              return isSameMonth(dia, mesReferencia);
            } catch {
              return true;
            }
          })();

          const labelBase = mesmoMes ? "#F5F5F5" : "#4B5563";

          let estiloCirculo: CSSProperties | undefined;
          let labelCor = labelBase;

          switch (tipo) {
            case "dia_ovulacao":
              estiloCirculo = {
                background: CORES.ovulacao.bg,
                color: CORES.ovulacao.texto,
                boxShadow: `0 0 0 2px ${CORES.ovulacao.ring}`,
              };
              labelCor = CORES.ovulacao.texto;
              break;
            case "menstruacao":
              estiloCirculo = {
                background: CORES.menstruacao.bg,
                color: CORES.menstruacao.texto,
              };
              labelCor = CORES.menstruacao.texto;
              break;
            case "periodo_previsto":
              estiloCirculo = {
                background: CORES.previsto.bg,
                color: CORES.previsto.texto,
              };
              labelCor = CORES.previsto.texto;
              break;
            case "ovulacao_janela":
              estiloCirculo = {
                background: CORES.fertil.bg,
                color: CORES.fertil.texto,
              };
              labelCor = CORES.fertil.texto;
              break;
            default:
              estiloCirculo = undefined;
              labelCor = labelBase;
          }

          const n = dia.getDate();

          return (
            <div key={ymd + String(dia.getTime())} className="flex items-center justify-center min-h-[2.25rem]">
              <span
                className="inline-flex size-9 sm:size-10 items-center justify-center rounded-full text-[13px] sm:text-sm font-medium"
                style={{
                  ...(estiloCirculo ?? {}),
                  color: estiloCirculo ? undefined : labelCor,
                }}
              >
                {n}
              </span>
            </div>
          );
        })}
      </div>

      <ul className="mt-6 space-y-2.5 text-xs" style={{ color: "#B8B8B8" }}>
        <li className="flex items-center gap-2">
          <LegendDot bg={CORES.previsto.bg} />
          <span>Período previsto</span>
        </li>
        <li className="flex items-center gap-2">
          <LegendDot bg={CORES.menstruacao.bg} />
          <span>Menstruação</span>
        </li>
        <li className="flex items-center gap-2">
          <LegendDot bg={CORES.fertil.bg} />
          <span>Ovulação (janela fértil)</span>
        </li>
        <li className="flex items-center gap-2">
          <LegendDot bg={CORES.ovulacao.bg} ring />
          <span>Dia da ovulação</span>
        </li>
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed" style={{ color: "#6B7280" }}>
        Estimativa apenas; estresse, hormônios e irregularidades podem alterar a ovulação. Em dúvidas, consulte um
        ginecologista.
      </p>
    </div>
  );
}
