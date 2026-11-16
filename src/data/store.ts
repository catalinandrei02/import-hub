// Shared app state: one subscription per query, opened once after sign-in; one write at a time per document.
import { computed, reactive } from "vue";
import type { Backend, Connection, ErrCode, Unsub } from "./backend";
import type { AccessRequest, Car, Contact, Member, PriceRun, Scan, SearchSettings, ViewDoc } from "./types";
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
  prices: null as PriceRun | null, pricesLoaded: false,
  views: {} as Record<string, ViewDoc>, viewsOn: false,
  me: null as Omit<Member, "_id"> | null,          // my own members/{uid} doc
  members: [] as Member[], requests: [] as AccessRequest[], // admins only
  request: "" as "" | "sending" | "sent" | "failed", // my access request, while I have no access
});
export const isAdmin = computed(() => state.auth === "ok" && state.me?.role === "admin");

export const canWrite = computed(() => state.auth === "ok" && (state.data === "ok" || state.data === "stale"));

let conn: Connection | null = null;
let unsubs: Unsub[] = [];
let adminUnsubs: Unsub[] = [];
let waitUnsub: Unsub | null = null;
let staleTimer: ReturnType<typeof setTimeout> | undefined;

function resetData() {
  unsubs.forEach(u => u()); unsubs = [];
  adminUnsubs.forEach(u => u()); adminUnsubs = [];
  waitUnsub?.(); waitUnsub = null;
  Object.assign(state, { cars: [], carsLoaded: false, contacts: [], contactsLoaded: false, costs: { ...DEF_COSTS }, costsAt: "", search: { ...DEF_SEARCH }, scan: null, prices: null, pricesLoaded: false, views: {}, viewsOn: false, me: null, members: [], requests: [], request: "" });
}

function onErr(code: ErrCode) {
  clearTimeout(staleTimer);
  if (code === "permission-denied") { resetData(); state.auth = "denied"; state.data = "off"; awaitAccess(); }
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
    b.watchDoc("config/prices", (d, cache) => { state.prices = d as PriceRun | null; if (!cache) state.pricesLoaded = true; }, () => { state.pricesLoaded = true; }),
    // My own member doc (role); admins then also watch members and access requests.
    b.watchDoc("members/" + state.user!.uid, d => { state.me = d as Member | null; watchAdmin(b); }, () => {}),
    // View counts are extra: if the rules don't allow them yet, the rest of the site keeps working.
    b.watchCollection("views", docs => { state.views = Object.fromEntries(docs.map(d => [d.id, d.data as ViewDoc])); state.viewsOn = true; }, () => { state.views = {}; state.viewsOn = false; }),
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

/** Counts one view of a car by the signed-in member (opening its details). Failures are ignored. */
export function recordView(carId: string) {
  const u = state.user;
  if (!conn || state.auth !== "ok" || !u || !carId) return;
  const first = firstName(u.name);
  conn.backend.bump("views/" + carId, { total: 1, [`byUser.${u.uid}.n`]: 1 }, { [`byUser.${u.uid}.name`]: first, [`byUser.${u.uid}.last`]: new Date().toISOString() }).catch(() => {});
}

// ---- access ---------------------------------------------------------------
const firstName = (n?: string) => (n || "").trim().split(/\s+/)[0].slice(0, 30);

/** Not a member: ask the admins once (requests/{uid}), then wait for my members doc and open the site by itself. */
function awaitAccess() {
  const u = state.user, b = conn?.backend;
  if (!u || !b) return;
  state.request = "sending";
  b.set("requests/" + u.uid, { name: firstName(u.name), at: new Date().toISOString() }).then(() => (state.request = "sent"), () => (state.request = "failed"));
  waitUnsub = b.watchDoc("members/" + u.uid, d => {
    if (!d || state.auth !== "denied") return;
    waitUnsub?.(); waitUnsub = null;
    state.auth = "ok"; state.me = d as Member; subscribe(b);
  }, () => {});
}

function watchAdmin(b: Backend) {
  if (state.me?.role !== "admin") { adminUnsubs.forEach(u => u()); adminUnsubs = []; state.members = []; state.requests = []; return; }
  if (adminUnsubs.length) return;
  adminUnsubs.push(
    b.watchCollection("members", docs => { state.members = docs.map(d => ({ _id: d.id, ...d.data }) as Member); }, () => {}),
    b.watchCollection("requests", docs => { state.requests = docs.map(d => ({ _id: d.id, ...d.data }) as AccessRequest); }, () => {}),
  );
}

/** Admin actions. The rules allow them only for admins and never let an admin remove or demote themself. */
export const admin = {
  async approve(r: AccessRequest) {
    await queue("members/" + r._id, b => b.set("members/" + r._id, { name: r.name || "", role: "member", addedAt: new Date().toISOString() }));
    await queue("requests/" + r._id, b => b.remove("requests/" + r._id));
  },
  reject: (r: AccessRequest) => queue("requests/" + r._id, b => b.remove("requests/" + r._id)),
  add: (uid: string, name: string) => queue("members/" + uid, b => b.set("members/" + uid, { name: firstName(name), role: "member", addedAt: new Date().toISOString() })),
  setRole: (m: Member, role: "admin" | "member") => queue("members/" + m._id, b => b.set("members/" + m._id, { name: m.name || "", role, addedAt: m.addedAt || new Date().toISOString() })),
  remove: (m: Member) => queue("members/" + m._id, b => b.remove("members/" + m._id)),
};
