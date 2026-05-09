import type { Database } from "./database.types";

type StatusFin = Database["public"]["Enums"]["status_financeiro"];
type StatusPag = Database["public"]["Enums"]["status_pagamento"];
type FormaPag = Database["public"]["Enums"]["forma_pagamento"];

/** Labels in Portuguese for UI (matches existing getStatusColor keys). */
export function statusFinanceiroToLabel(
  s: StatusFin,
): "Em dia" | "Vencendo" | "Em atraso" {
  switch (s) {
    case "EM_DIA":
      return "Em dia";
    case "VENCENDO":
      return "Vencendo";
    case "EM_ATRASO":
      return "Em atraso";
    default:
      return "Em dia";
  }
}

export function statusPagamentoToLabel(
  s: StatusPag,
): "Pago" | "Atrasado" | "Pendente" | "Cancelado" {
  switch (s) {
    case "PAGO":
      return "Pago";
    case "ATRASADO":
      return "Atrasado";
    case "PENDENTE":
      return "Pendente";
    case "CANCELADO":
      return "Cancelado";
    default:
      return "Pendente";
  }
}

export function formaPagamentoToLabel(
  f: FormaPag | null,
): string {
  if (!f) return "—";
  const map: Record<FormaPag, string> = {
    PIX: "PIX",
    BOLETO: "Boleto",
    CARTAO_CREDITO: "Cartão crédito",
    CARTAO_DEBITO: "Cartão débito",
    DINHEIRO: "Dinheiro",
    TRANSFERENCIA: "Transferência",
  };
  return map[f] ?? f;
}

export function formatDateBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTimeBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Data + horário em pt-BR, fuso São Paulo e sem segundos (evita divergências do TZ do navegador). */
export function formatDateTimeBrSaoPaulo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

export function timeOnlyBr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initialsFromName(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[p.length - 1]![0]!).toUpperCase();
}

/** Relative time in Portuguese, e.g. "há 2 horas". */
export function timeAgoPt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 30) return formatDateBr(iso);
  if (d > 0) return d === 1 ? "1 dia atrás" : `${d} dias atrás`;
  if (h > 0) return h === 1 ? "1 hora atrás" : `${h} horas atrás`;
  if (m > 0) return m === 1 ? "1 minuto atrás" : `${m} minutos atrás`;
  return "Agora";
}

export function startOfLocalDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfLocalDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
