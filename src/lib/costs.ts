import { DEF_COSTS, RATE_KEYS, type Costs } from "./constants";
import type { Car } from "../data/types";

export interface Landed {
  car: number; gst: number; ship: number; ins: number; cif: number; duty: number; vat: number;
  marlog: number; road: number; rar: number; total: number; perK: number;
}

/**
 * Landed cost in Romania (CLAUDE.md §5). Do not change the formula.
 * car = price × cadEur; gst = 5% of car when paid; ship = (shipUsd + fuelUsd) × usdEur; ins = car × insPct
 * CIF = car + gst + ship + ins; duty = CIF × dutyPct; VAT = (CIF + duty) × vatPct
 * TOTAL = CIF + duty + VAT + marlog + road + rar
 */
export function landed(price: number, gst: boolean, c: Costs): Landed {
  const car = price * c.cadEur, g = gst ? car * 0.05 : 0, ship = (c.shipUsd + c.fuelUsd) * c.usdEur, ins = car * c.insPct / 100;
  const cif = car + g + ship + ins, duty = cif * c.dutyPct / 100, vat = (cif + duty) * c.vatPct / 100;
  return {
    car, gst: g, ship, ins, cif, duty, vat, marlog: c.marlogEur, road: c.roadEur, rar: c.rarEur,
    total: cif + duty + vat + c.marlogEur + c.roadEur + c.rarEur,
    perK: 1000 * c.cadEur * (1 + (gst ? 0.05 : 0) + c.insPct / 100) * (1 + c.dutyPct / 100) * (1 + c.vatPct / 100),
  };
}

/** Coerce a stored config/costs doc into numbers, falling back to defaults per key. */
export function numCosts(d: Record<string, unknown> | null | undefined): Costs {
  const o = {} as Costs;
  for (const k of RATE_KEYS) {
    const raw = d?.[k];
    const v = Number(raw);
    o[k] = raw !== "" && raw != null && Number.isFinite(v) ? v : DEF_COSTS[k];
  }
  return o;
}

/** Per-car GST: explicit flag wins; otherwise dealers charge it and private sellers don't. */
export function carGst(c: Pick<Car, "gst" | "sellerType">): boolean {
  return typeof c.gst === "boolean" ? c.gst : c.sellerType !== "private";
}

export function carLanded(c: Car | null | undefined, costs: Costs): Landed | null {
  return c && c.price ? landed(c.price, carGst(c), costs) : null;
}
