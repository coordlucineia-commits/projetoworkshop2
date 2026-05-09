/** Horários públicos guiados — alinhado ao SQL `visitas_guiadas_horario_chk`. */
export const VISIT_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export type VisitTimeSlot = (typeof VISIT_TIME_SLOTS)[number];

/** Mesmo valor padrão de `v_max_slot` em `criar_visita_guiada` (migration). */
export const MAX_BOOKINGS_PER_TIME_SLOT = 8;

export function stripPhoneDigits(input: string): string {
  return input.replace(/\D/g, "");
}

export function maskPhoneBr(value: string): string {
  const d = stripPhoneDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

/** Formata `YYYY-MM-DD` sem deslocar fuso (Postgres date). */
export function formatDateYmdToBr(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function visitsPublicBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin)
    return window.location.origin;
  return import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

export function buildVisitConfirmLink(visitId: string): string {
  const base = visitsPublicBaseUrl();
  return `${base}/confirmar-visita?id=${encodeURIComponent(visitId)}`;
}

export function buildWhatsAppReminderPayload(args: {
  nome: string;
  dataVisitBr: string;
  horario: string;
  confirmUrl: string;
}): string {
  const { nome, dataVisitBr, horario, confirmUrl } = args;
  const firstName = nome.trim().split(/\s+/)[0] ?? nome;
  return (
    `Olá, ${firstName}! 👋\n\n` +
    `Lembramos que sua visita guiada à LuTe Academy está agendada para amanhã, ${dataVisitBr} às ${horario}.\n\n` +
    `Estamos te esperando! 💪\n\n` +
    `Confirme sua presença pelo link:\n${confirmUrl}\n\n` +
    `[CONFIRMAR VISITA]\n${confirmUrl}`
  );
}

/** Abre WhatsApp Web/App com país 55 quando possível (apenas dígitos armazenados). */
export function openWhatsAppWithText(phoneDigits: string, text: string): void {
  const d = phoneDigits.replace(/\D/g, "");
  const withCountry =
    d.length >= 10 && !d.startsWith("55") ? `55${d}` : d;
  const url = `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
