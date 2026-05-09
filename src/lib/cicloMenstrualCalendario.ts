import { addDays, format } from "date-fns";

/** Ciclo menstrual calculado a partir da DUM (lógica ginecológica comum; só estimativa). */
export type CicloMenstrualCalculado = {
  /** yyyy-mm-dd */
  menstruacaoInicio: string;
  /** yyyy-mm-dd */
  menstruacaoFim: string;
  /** Início da próxima menstruação prevista (primeiro dia) */
  proximaMenstruacaoInicio: string;
  /** Fim dos dias previstos de menstruação (inclusivo) */
  proximaMenstruacaoFim: string;
  /** Dia da ovulação (yyyy-mm-dd) */
  ovulacao: string;
  fertilInicio: string;
  fertilFim: string;
};

/** Compara yyyy-mm-dd (ordem lexical = cronológica). */
export function cmpYmd(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function parseYmdLocal(ymd: string): Date | null {
  const t = (ymd ?? "").trim().slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function toYmd(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Calcula datas do ciclo conforme entrada clínica comum:
 * próxima = DUM + ciclo; ovulação = DUM + (ciclo - 14); fértil = ov-5 até ov+1.
 * Retorna null se dados incompletos ou inválidos.
 */
export function calcularCicloMenstrual(
  dumYmd: string | null | undefined,
  diasCiclo: number | null | undefined,
  diasMenstruais: number | null | undefined,
): CicloMenstrualCalculado | null {
  try {
    const dum = parseYmdLocal(String(dumYmd ?? ""));
    const ciclo = diasCiclo;
    const dm = diasMenstruais;
    if (!dum || ciclo == null || dm == null) return null;
    if (!Number.isInteger(ciclo) || ciclo < 15 || ciclo > 45) return null;
    if (!Number.isInteger(dm) || dm < 1 || dm > 31) return null;

    const menstruacaoInicio = toYmd(dum);
    const menstruacaoFim = toYmd(addDays(dum, dm - 1));

    const proxStart = addDays(dum, ciclo);
    const proximaMenstruacaoInicio = toYmd(proxStart);
    const proximaMenstruacaoFim = toYmd(addDays(proxStart, dm - 1));

    const ovDate = addDays(dum, ciclo - 14);
    const ovulacao = toYmd(ovDate);

    const fertilInicio = toYmd(addDays(ovDate, -5));
    const fertilFim = toYmd(addDays(ovDate, 1));

    return {
      menstruacaoInicio,
      menstruacaoFim,
      proximaMenstruacaoInicio,
      proximaMenstruacaoFim,
      ovulacao,
      fertilInicio,
      fertilFim,
    };
  } catch {
    return null;
  }
}

export type DiaCalendarioCicloTipo = "nenhum" | "periodo_previsto" | "menstruacao" | "ovulacao_janela" | "dia_ovulacao";

/**
 * Prioridade para colorir um dia no calendário (evita conflitos em ciclos atípicos).
 * 1) Dia da ovulação  2) Menstruação atual  3) Período previsto  4) Janela fértil
 */
export function classificarDiaCalendario(ymd: string, calc: CicloMenstrualCalculado | null): DiaCalendarioCicloTipo {
  if (!calc) return "nenhum";
  try {
    if (ymd === calc.ovulacao) return "dia_ovulacao";
    if (cmpYmd(ymd, calc.menstruacaoInicio) >= 0 && cmpYmd(ymd, calc.menstruacaoFim) <= 0) return "menstruacao";
    if (
      cmpYmd(ymd, calc.proximaMenstruacaoInicio) >= 0 &&
      cmpYmd(ymd, calc.proximaMenstruacaoFim) <= 0
    )
      return "periodo_previsto";
    if (cmpYmd(ymd, calc.fertilInicio) >= 0 && cmpYmd(ymd, calc.fertilFim) <= 0) return "ovulacao_janela";
    return "nenhum";
  } catch {
    return "nenhum";
  }
}
