import type { Car } from "../data/types";
import { decodeVin } from "./vin";
import { STATUSES, ST_CLASS } from "./constants";

export const carName = (c: Car) => [c.year, c.title || "Audi Q5"].filter(Boolean).join(" ");
export function carTrim(c: Car): string {
  const d = decodeVin(c.vin);
  return c.trim || (d.err || d.trim === "?" ? "" : d.trim);
}
export const carLabel = (c: Car) => carName(c) + (carTrim(c) ? " " + carTrim(c) : "") + (c.seller ? " · " + c.seller : "");
export const history = (c: Car) => (Array.isArray(c.priceHistory) ? c.priceHistory : []).filter(h => h && typeof h.price === "number");
export function priceDelta(c: Car): number {
  const h = history(c);
  return h.length && c.price ? c.price - h[0].price : 0;
}
export function sortCars(a: Car, b: Car) {
  return STATUSES.indexOf(a.status as any) - STATUSES.indexOf(b.status as any) || String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
}
export const statusClass = (s?: string) => ({ info: "info", warn: "warn", ok: "ok", bad: "bad" } as Record<string, string>)[ST_CLASS[s || ""]] || "";
export const countDone = (m: Record<string, unknown> | undefined, keys: string[]) => keys.filter(k => m && m[k]).length;
export const initials = (s?: string) => (String(s || "?").replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("") || "?").toUpperCase();
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const safeUrl = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : undefined);
export function parseNum(v: unknown): number | null {
  const n = parseFloat(String(v ?? "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
