// Shared app state: one subscription per query, opened once after sign-in; one write at a time per document.
import { computed, reactive } from "vue";
import type { Backend, Connection, ErrCode, Unsub } from "./backend";
import type { Car, Contact, Scan, SearchSettings } from "./types";
import { DEF_COSTS, DEF_SEARCH, type Costs } from "../lib/constants";
import { numCosts } from "../lib/costs";
import { firebaseConfig } from "../firebase.config";

export type AuthState = "none" | "loading" | "signedOut" | "denied" | "ok";
export type DataState = "idle" | "loading" | "ok" | "stale" | "off";

export const state = reactive({
  auth: "loading" as AuthState,
  user: null as { uid: string; name: string; photo: string | null } | null,
  data: "idle" as DataState,
  cars: [] as Car[], carsLoaded: false,
  contacts: [] as Contact[], contactsLoaded: false,
  costs: { ...DEF_COSTS } as Costs, costsAt: "",
  search: { ...DEF_SEARCH } as SearchSettings,
  scan: null as Scan | null,
});

export const canWrite = computed(() => state.auth === "ok" && (state.data === "ok" || state.data === "stale"));

let conn: Connection | null = null;
let unsubs: Unsub[] = [];
let staleTimer: ReturnType<typeof setTimeout> | undefined;

function resetData() {
  unsubs.forEach(u => u()); unsubs = [];
  Object.assign(state, { cars: [], carsLoaded: false, contacts: [], contactsLoaded: false, costs: { ...DEF_COSTS }, costsAt: "", search: { ...DEF_SEARCH }, scan: null });
}

function onErr(code: ErrCode) {
  clearTimeout(staleTimer);
  if (code === "permission-denied") { state.auth = "denied"; state.data = "off"; resetData(); }
  else state.data = "off";
}
function ready() { if (state.data === "loading" || state.data === "stale") { state.data = "ok"; clearTimeout(staleTimer); } }

function subscribe(b: Backend) {
  state.data = "loading";
  staleTimer = setTimeout(() => { if (state.data === "loading") state.data = "stale"; }, 10_000);
  unsubs.push(
    b.watchCollection("cars", (docs, cache) => {
      state.cars = docs.map(d => ({ _id: d.id, ...d.data }) as Car);
      if (!cache) { state.carsLoaded = true; ready(); } else if (docs.length) state.carsLoaded = true;
    }, onErr),
    b.watchCollection("contacts", (docs, cache) => {
      state.contacts = docs.map(d => ({ _id: d.id, ...d.data }) as Contact);
      if (!cache || docs.length) state.contactsLoaded = true;
    }, onErr),
    b.watchDoc("config/costs", d => { state.costs = numCosts(d); state.costsAt = (d?.updatedAt as string) || ""; }, onErr),
    b.watchDoc("config/search", d => { state.search = { ...DEF_SEARCH, ...(d || {}) } as SearchSettings; }, onErr),
    b.watchDoc("config/scan", d => { state.scan = d as Scan | null; }, onErr),
  );
}

export async function connect() {
  if (import.meta.env.MODE === "mock") conn = (await import("./mock")).connectMock();
  else {
    let cfg = firebaseConfig;
    try { if (import.meta.env.VITE_FIREBASE_CONFIG) cfg = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG); } catch { /* keep file config */ }
    if (!cfg) { state.auth = "none"; state.data = "off"; return; }
    conn = (await import("./firebase")).connectFirebase(cfg);
  }
  conn.auth.onChange(u => {
    resetData();
    state.user = u;
    if (!u) { state.auth = "signedOut"; state.data = "off"; return; }
    state.auth = "ok";
    subscribe(conn!.backend);
  });
}

export const signIn = () => conn?.auth.signIn();
export const signOut = () => conn?.auth.signOut();

// ---- writes -------------------------------------------------------------
const queues = new Map<string, Promise<unknown>>();
/** Runs `fn` after any pending write to the same document, so each document gets one write at a time. */
export function queue<T>(path: string, fn: (b: Backend) => Promise<T>): Promise<T> {
  if (!conn || !canWrite.value) return Promise.reject(new Error("read-only"));
  const b = conn.backend;
  const p = (queues.get(path) || Promise.resolve()).catch(() => undefined).then(() => fn(b));
  queues.set(path, p);
  return p;
}
export function addDoc(collection: string, data: Record<string, any>): Promise<string> {
  if (!conn || !canWrite.value) return Promise.reject(new Error("read-only"));
  return conn.backend.add(collection, data);
}
