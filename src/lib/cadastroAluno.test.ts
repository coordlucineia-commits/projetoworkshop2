import { describe, expect, it } from "vitest";
import {
  buildMedidasJson,
  buildObservacoes,
  mapFormaPagamento,
  parseMoneyBr,
  stripDigits,
  validateNovoAluno,
} from "./cadastroAluno";

describe("stripDigits", () => {
  it("remove não-dígitos", () => {
    expect(stripDigits("123.456.789-00")).toBe("12345678900");
  });
});

describe("parseMoneyBr", () => {
  it("interpreta formato brasileiro", () => {
    expect(parseMoneyBr("149,90")).toBeCloseTo(149.9);
    expect(parseMoneyBr("1.234,56")).toBeCloseTo(1234.56);
  });
  it("retorna null para vazio", () => {
    expect(parseMoneyBr("  ")).toBeNull();
  });
});

describe("mapFormaPagamento", () => {
  it("mapeia chaves do enum", () => {
    expect(mapFormaPagamento("PIX")).toBe("PIX");
    expect(mapFormaPagamento("CARTAO_CREDITO")).toBe("CARTAO_CREDITO");
  });
  it("retorna null para desconhecido", () => {
    expect(mapFormaPagamento("pix")).toBeNull();
  });
});

describe("buildObservacoes", () => {
  it("monta texto legível", () => {
    const t = buildObservacoes({
      profissao: "Dev",
      contatoEmergencia: "Maria",
      telEmergencia: "11999999999",
      objetivo: "Hipertrofia",
      jaTreinou: "SIM",
      tempoPratica: "1 ano",
      vezesSemana: "4x",
      horarioPref: "Manhã",
    });
    expect(t).toContain("Profissão: Dev");
    expect(t).toContain("Emergência: Maria");
    expect(t).toContain("Objetivo principal: Hipertrofia");
  });
});

describe("buildMedidasJson", () => {
  it("estrutura JSON para coluna medidas", () => {
    const j = buildMedidasJson({
      medidasTexto: "Cintura 80cm",
      peso: "80",
      altura: "180",
      imc: "24.7",
      gordura: "15",
      assinaturaPng: "data:image/png;base64,xxx",
    });
    expect(j).toMatchObject({
      corporais: expect.objectContaining({ texto: "Cintura 80cm" }),
      assinatura_termo: "data:image/png;base64,xxx",
    });
  });
});

describe("validateNovoAluno", () => {
  const base = {
    nome: "João",
    dataNasc: "1990-01-01",
    cpf: "123.456.789-09",
    rg: "12.345.678-9",
    sexo: "M",
    estadoCivil: "solteiro",
    profissao: "X",
    telefone: "(11) 98765-4321",
    email: "a@b.com",
    endereco: "Rua 1",
    contatoEmergencia: "Maria",
    telEmergencia: "11999999999",
    tipoPlano: "uuid-plano",
    valorPlano: "199,00",
    dataInicio: "2026-01-01",
    dataVenc: "2026-02-01",
    formaPagto: "PIX",
  };

  it("aceita payload válido", () => {
    expect(validateNovoAluno(base)).toEqual([]);
  });

  it("lista campos faltando", () => {
    const e = validateNovoAluno({ ...base, nome: "" });
    expect(e.some((m) => m.includes("Nome"))).toBe(true);
  });

  it("valida CPF", () => {
    const e = validateNovoAluno({ ...base, cpf: "123" });
    expect(e.some((m) => m.includes("CPF"))).toBe(true);
  });
});
