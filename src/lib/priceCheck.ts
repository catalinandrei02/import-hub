// Daily price check through the Chrome extension (CarGurus etc. have no buyer API, see CLAUDE.md §8).
// Whoever has the site open in Chrome with the extension runs it when the last run is over 20 h old (or on demand).
// Price changes are appended to priceHistory (never rewritten); a listing with no price any more is flagged `gone`.
// Status and steps are never touched; dropped and already bought/shipped/arrived cars are skipped.
import { reactive } from "vue";
import { canWrite, queue, state } from "../data/store";
import type { Car, PriceRun } from "../data/types";
import { readWithExtension, hasExtension } from "./extension";
import { parseImport, MAX_PHOTOS } from "./importer";
import { carName, safeUrl } from "./cars";

export const DUE_MS = 20 * 3600 * 1000;
const ACTIVE = new Set(["watching", "contacted", "offer", "inspection"]);
export const run = reactive({ running: false, done: 0, total: 0 });

export const checkable = (cars: Car[]) => cars.filter(c => ACTIVE.has(c.status || "watching") && !!safeUrl(c.url));
export function isDue(p: PriceRun | null, now = Date.now()) { return !p?.lastRun || now - Date.parse(p.lastRun) > DUE_MS; }

export async function runPriceCheck(): Promise<PriceRun | null> {
  if (run.running || !hasExtension.value || !canWrite.value) return null;
  const cars = checkable(state.cars);
  const by = (state.user?.name || "").trim().split(/\s+/)[0].slice(0, 30);
  const now = new Date().toISOString(), today = now.slice(0, 10);
  const res: PriceRun = { lastRun: now, by, checked: 0, errors: 0, changes: [], gone: [] };
  Object.assign(run, { running: true, done: 0, total: cars.length });
  try {
    // Claim the run first, so others opening the site now don't start a second one.
    await queue("config/prices", b => b.set("config/prices", { ...(state.prices || {}), lastRun: now, by }));
    for (const c of cars) {
      const d = await readWithExtension(safeUrl(c.url)!);
      run.done++;
      if (!d) { res.errors!++; continue; }
      res.checked!++;
      const p = parseImport(JSON.stringify(d));
      const upd: Record<string, unknown> = {};
      if (!p?.price) {
        if (!c.gone) { upd.gone = today; res.gone!.push({ id: c._id, title: carName(c) }); }
      } else {
        if (c.gone) upd.gone = "";
        if (p.price !== c.price) {
          const h = Array.isArray(c.priceHistory) ? [...c.priceHistory] : [];
          if (!h.length && c.price) h.push({ date: (c.addedAt || now).slice(0, 10), price: c.price }); // keep the old price on record
          h.push({ date: today, price: p.price });
          Object.assign(upd, { price: p.price, priceHistory: h });
          res.changes!.push({ id: c._id, title: carName(c), from: c.price ?? null, to: p.price });
        }
        if (!c.photos?.length && p.photos?.length) upd.photos = p.photos.slice(0, MAX_PHOTOS);
      }
      if (Object.keys(upd).length) await queue("cars/" + c._id, b => b.update("cars/" + c._id, { ...upd, updatedAt: new Date().toISOString() }));
    }
    await queue("config/prices", b => b.set("config/prices", res));
    return res;
  } finally { run.running = false; }
}
