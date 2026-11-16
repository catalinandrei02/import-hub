import type { Car } from "../data/types";
import { carName, carTrim } from "./cars";

export interface Query {
  text: string; yearMin?: number | null; yearMax?: number | null; maxPrice?: number | null; maxKm?: number | null;
  center?: string; radiusKm?: number | null; trims?: string[]; mustAcc?: boolean; must360?: boolean;
}
export interface SiteLink { id: string; name: string; url: string; direct: boolean }

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);

/** "Audi Q5 Technik" → make "audi", model "q5", rest "Technik". */
export function splitModel(text: string) {
  const w = words(text || "Audi Q5");
  return { make: slug(w[0] || "audi"), model: slug(w[1] || ""), rest: w.slice(2).join(" ") };
}

function google(site: string, q: Query) {
  const { rest } = splitModel(q.text);
  const name = words(q.text).slice(0, 2).join(" ") || "Audi Q5";
  const parts = [`site:${site}`, `"${name}"`, rest, q.yearMin || q.yearMax ? `${q.yearMin || 2000}..${q.yearMax || new Date().getFullYear() + 1}` : "", q.center || "Québec"];
  return "https://www.google.com/search?q=" + encodeURIComponent(parts.filter(Boolean).join(" "));
}

/** One link per listing site, with as many filters as each site accepts in its URL (checked Nov 2026). */
export function siteLinks(q: Query, sources: string[]): SiteLink[] {
  const { make, model } = splitModel(q.text);
  const city = slug(q.center || "");
  const out: SiteLink[] = [];
  const has = (s: string) => sources.includes(s);
  if (has("cargurus")) out.push({ id: "cargurus", name: "CarGurus.ca", url: google("cargurus.ca", q), direct: false });
  if (has("autotrader")) {
    const path = ["cars", make, model, "reg_qc", city ? "cit_" + city : "", "ot_used", q.maxPrice ? "pr_" + q.maxPrice : ""].filter(Boolean).join("/");
    const p = new URLSearchParams();
    if (q.yearMin) p.set("modelyearfrom", String(q.yearMin));
    if (q.yearMax) p.set("modelyearto", String(q.yearMax));
    if (q.maxKm) p.set("kmto", String(q.maxKm));
    if (q.radiusKm) p.set("radius", String(q.radiusKm));
    out.push({ id: "autotrader", name: "AutoTrader.ca", url: `https://www.autotrader.ca/${path}?${p}`, direct: true });
  }
  if (has("kijiji")) {
    const p = new URLSearchParams();
    if (q.maxPrice) p.set("price", "__" + q.maxPrice);
    if (q.yearMin || q.yearMax) p.set("caryear", `${q.yearMin || ""}__${q.yearMax || ""}`);
    if (q.maxKm) p.set("carmileageinkms", "__" + q.maxKm);
    out.push({ id: "kijiji", name: "Kijiji", url: `https://www.kijiji.ca/b-cars-trucks/quebec/${[make, model].filter(Boolean).join("-")}/k0c174l9001?${p}`, direct: true });
  }
  if (has("autohebdo")) out.push({ id: "autohebdo", name: "AutoHebdo", url: google("autohebdo.net", q), direct: false });
  if (has("certified")) out.push({ id: "certified", name: "Audi Certified :plus", url: google("audi.ca", { ...q, text: q.text + " certifié" }), direct: false });
  if (has("facebook")) out.push({ id: "facebook", name: "Facebook Marketplace", url: `https://www.facebook.com/marketplace/montreal/search?query=${encodeURIComponent(words(q.text).join(" ") || "audi q5")}${q.maxPrice ? "&maxPrice=" + q.maxPrice : ""}`, direct: true });
  return out;
}

/** Saved cars that match the query text and filters. Unknown equipment ("") never excludes a car. */
export function matchCars(cars: Car[], q: Query): Car[] {
  const tokens = words(q.text.toLowerCase());
  return cars.filter(c => {
    if (c.status === "dropped") return false;
    const hay = [carName(c), carTrim(c), c.seller, c.location, c.vin, c.notes].join(" ").toLowerCase();
    if (tokens.some(t => !hay.includes(t))) return false;
    if (q.yearMin && c.year && c.year < q.yearMin) return false;
    if (q.yearMax && c.year && c.year > q.yearMax) return false;
    if (q.maxPrice && c.price && c.price > q.maxPrice) return false;
    if (q.maxKm && c.km && c.km > q.maxKm) return false;
    const trim = carTrim(c);
    if (q.trims?.length && trim && !q.trims.includes(trim)) return false;
    if (q.mustAcc && c.acc === "no") return false;
    if (q.must360 && c.cam === "no") return false;
    return true;
  }).sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
}
