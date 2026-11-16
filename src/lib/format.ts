import { lang, LOCALE } from "../i18n";

const loc = () => LOCALE[lang.value];
export const fmt = (n: number, d = 0) => new Intl.NumberFormat(loc(), { maximumFractionDigits: d }).format(n);
export const eur = (n: number) => new Intl.NumberFormat(loc(), { style: "currency", currency: "EUR", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(n);
export const cad = (n: number) => new Intl.NumberFormat(loc(), { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(n);
export function fmtDate(s: unknown): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(typeof s === "string" ? s : "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString(loc(), { day: "numeric", month: "short", year: "numeric" }) : "";
}
export function fmtDT(iso?: string): string {
  const d = new Date(iso || "");
  return isNaN(+d) ? "" : d.toLocaleString(loc(), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export const shortDate = (d: Date) => d.toLocaleDateString(loc(), { day: "numeric", month: "short" });
