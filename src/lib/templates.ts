import type { Car } from "../data/types";
import { carTrim } from "./cars";

export type Part = { kind: "text" | "filled" | "missing"; text: string };

const tidy = (s: string) => s.replace(/[  ]/g, " ");

/** Values for [PLACEHOLDERS] in the FR/EN templates, taken from the selected car. */
export function templateValues(c: Car | null, tl: "fr" | "en"): Record<string, string> {
  if (!c) return {};
  const nf = (n: number) => tidy(new Intl.NumberFormat(tl === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 0 }).format(n));
  const model = [c.title || "Audi Q5", carTrim(c)].filter(Boolean).join(" ");
  const price = c.offer || c.price;
  const first = String(c.contact || "").trim().split(/\s+/)[0] || "";
  const year = c.year ? String(c.year) : "";
  return {
    MODEL: model, "MODÈLE": model, YEAR: year, "ANNÉE": year, VIN: c.vin || "", NIV: c.vin || "",
    STOCK: c.stock || "", PRICE: price ? nf(price) : "", PRIX: price ? nf(price) : "",
    "FIRST NAME": first, "PRÉNOM": first, VALUE: c.price ? nf(c.price) : "", SELLER: c.seller || "",
  };
}

export function fillTemplate(text: string, vals: Record<string, string>): { parts: Part[]; plain: string } {
  const parts: Part[] = [];
  for (const p of String(text).split(/(\[[^\]]+\])/)) {
    if (!p) continue;
    const m = /^\[([^\]]+)\]$/.exec(p);
    if (m) {
      const v = vals[m[1]];
      parts.push(v ? { kind: "filled", text: v } : { kind: "missing", text: p });
    } else parts.push({ kind: "text", text: p });
  }
  return { parts, plain: parts.map(p => p.text).join("") };
}
