import { describe, expect, it } from "vitest";
import { calcularCicloMenstrual, classificarDiaCalendario } from "./cicloMenstrualCalendario";

describe("cicloMenstrualCalendario", () => {
  it("exemplo oficial 01/05/2026, ciclo 28, menstruação 5 dias", () => {
    const c = calcularCicloMenstrual("2026-05-01", 28, 5);
    expect(c).not.toBeNull();
    expect(c!.menstruacaoInicio).toBe("2026-05-01");
    expect(c!.menstruacaoFim).toBe("2026-05-05");
    expect(c!.proximaMenstruacaoInicio).toBe("2026-05-29");
    expect(c!.proximaMenstruacaoFim).toBe("2026-06-02");
    expect(c!.ovulacao).toBe("2026-05-15");
    expect(c!.fertilInicio).toBe("2026-05-10");
    expect(c!.fertilFim).toBe("2026-05-16");

    expect(classificarDiaCalendario("2026-05-15", c)).toBe("dia_ovulacao");
    expect(classificarDiaCalendario("2026-05-03", c)).toBe("menstruacao");
    expect(classificarDiaCalendario("2026-05-11", c)).toBe("ovulacao_janela");
    expect(classificarDiaCalendario("2026-05-01", c)).toBe("menstruacao");
    expect(classificarDiaCalendario("2026-05-30", c)).toBe("periodo_previsto");
  });

  it("retorna null com dados incompletos", () => {
    expect(calcularCicloMenstrual("", 28, 5)).toBeNull();
    expect(calcularCicloMenstrual("2026-05-01", null, 5)).toBeNull();
    expect(calcularCicloMenstrual("2026-05-01", 28, null)).toBeNull();
    expect(calcularCicloMenstrual("2026-05-01", 10, 5)).toBeNull();
  });
});
