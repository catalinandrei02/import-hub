/** Audi Q5 (platform FY) VIN decoder, orientative only (CLAUDE.md §5). Do not change the rules. */
export type VinInfo =
  | { err: "bad" }
  | { err?: undefined; vin: string; isQ5: boolean; trim: string; year: number | "?"; phev: boolean };

const YEARS: Record<string, number> = { L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025, T: 2026 };
const TRIMS: Record<string, string> = { E: "Progressiv", F: "Technik", A: "Komfort", B: "Komfort" };

export function decodeVin(input: unknown): VinInfo {
  const v = String(input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (v.length !== 17) return { err: "bad" };
  return { vin: v, isQ5: v.slice(6, 8) === "FY", trim: TRIMS[v[3]] || "?", year: YEARS[v[9]] || "?", phev: v[4] === "2" };
}
