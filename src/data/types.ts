// Firestore document shapes. Same as CLAUDE.md §4; the scheduled auto-search task depends on them. Only add fields.
import type { Status } from "../lib/constants";

export interface PricePoint { date: string; price: number }

export interface Car {
  _id: string;
  title?: string; year?: number | null; trim?: string; vin?: string; km?: number | null;
  price?: number | null; priceHistory?: PricePoint[];
  seller?: string; sellerType?: "dealer" | "private"; location?: string; url?: string;
  status?: Status; acc?: "yes" | "no" | ""; cam?: "yes" | "no" | "";
  flags?: string[]; notes?: string;
  /** s<i> → "YYYY-MM-DD" when ticked; legacy `true` accepted. */
  steps?: Record<string, string | boolean>;
  addedBy?: "manual" | "claude"; addedAt?: string; updatedAt?: string;
  // v2 additions
  gst?: boolean; contact?: string; stock?: string; offer?: number | null;
  /** v2, no longer shown (the Germany comparison was removed); old docs may still have it. */
  dePrice?: number | null;
  docs?: Record<string, string | boolean>;
  /** v3: photo links taken from the listing (first = main photo). Hotlinked, visible only to members. */
  photos?: string[];
  [k: string]: unknown;
}

export interface Contact { _id: string; name?: string; role?: string; phone?: string; email?: string; notes?: string }

export interface SearchSettings {
  enabled: boolean; frequencyDays: number; model: string; trims: string[];
  yearMin: number | null; yearMax: number | null; maxPrice: number | null; maxKm: number | null;
  region: string; center: string; radiusKm: number | null;
  mustAcc: boolean; must360: boolean; phevBonus: boolean; dealers: boolean; privates: boolean;
  sources: string[]; exclude: string; extra: string; updatedAt?: string;
}

/** views/{carId}: how often each member opened the car (v3). Names are first names only; never emails. */
export interface ViewDoc { total?: number; byUser?: Record<string, { n?: number; name?: string; last?: string }> }

export interface Scan { lastRun?: string; found?: number; summary?: string }
