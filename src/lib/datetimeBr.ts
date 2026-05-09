/** Segunda-feira = 1 … domingo = 7 (PostgreSQL dia_semana do projeto). */
export function dowBrMonSun(d: Date = new Date()): number {
  const js = d.getDay(); // 0 Sun … 6 Sat
  return js === 0 ? 7 : js;
}

export function startOfUtcMonthUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/** yyyy-mm-dd → DD/MM/AAAA */
export function formatIsoParaDataBrasil(isoDate: string | null | undefined): string {
  const iso = (isoDate ?? "").trim().slice(0, 10);
  const parts = iso.split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts.map((x) => x.trim());
  if (!y?.length || !m?.length || !d?.length) return "";
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
}

/** Aceita apenas dígitos durante a digitação e monta DD/MM/AAAA até 10 caracteres. */
export function maskDigitarDataBrasil(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 8);
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  if (!mm) return dd;
  if (!yyyy.length) return `${dd}/${mm}`;
  return `${dd}/${mm}/${yyyy}`;
}

/** DD/MM/AAAA válido → yyyy-mm-dd; senão null. */
export function parseDataBrasilParaIso(br: string | null | undefined): string | null {
  const t = (br ?? "").trim();
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t);
  if (!m) return null;
  const dd = Number.parseInt(m[1]!, 10);
  const mm = Number.parseInt(m[2]!, 10);
  const yyyy = Number.parseInt(m[3]!, 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > 2200) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (
    d.getFullYear() !== yyyy ||
    d.getMonth() !== mm - 1 ||
    d.getDate() !== dd
  ) {
    return null;
  }
  return `${String(yyyy).padStart(4, "0")}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
    2,
    "0",
  )}`;
}

/** Normaliza Postgres/campo texto para só `yyyy-mm-dd` (10 caracteres), ou ''. */
export function isoYmdSomente(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m?.[1]) return m[1];
  const fromBr = parseDataBrasilParaIso(t);
  return fromBr ?? "";
}

/** yyyy-mm-dd da data civil em America/Sao_Paulo para um instante ISO (ex.: avaliacoes_agenda.inicio_at). */
export function ymdSaoPauloFromInstant(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return String(iso ?? "").trim().slice(0, 10);
  }
}

