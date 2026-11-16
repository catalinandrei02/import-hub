// In-memory store for tests and `npm run dev:mock`. Sample data only, clearly fake; never shipped to GitHub Pages.
import type { Connection, DocSnap } from "./backend";

const SAMPLE: Record<string, Record<string, any>> = {
  "cars/s1": { title: "Audi Q5", year: 2023, vin: "WA1EAAFY2P2004677", km: 41000, price: 27890, priceHistory: [{ date: "2026-09-20", price: 29890 }, { date: "2026-10-12", price: 28890 }, { date: "2026-11-02", price: 27890 }], seller: "Sample dealer A", sellerType: "dealer", contact: "Sam Example", stock: "X100", location: "Blainville", url: "https://example.com/s1", status: "offer", acc: "yes", cam: "yes", flags: ["accident", "noexport"], notes: "Sample car for testing.", steps: { s0: true, s1: "2026-11-10" }, addedBy: "manual", addedAt: "2026-09-20T10:00:00Z", updatedAt: "2026-11-02T10:00:00Z", offer: 26500 },
  "cars/s2": { title: "Audi Q5", year: 2021, vin: "WA1FAAFY2M2004811", km: 88000, price: 29750, priceHistory: [{ date: "2026-10-01", price: 33000 }, { date: "2026-11-01", price: 29750 }], seller: "Sample private seller", sellerType: "private", location: "Laval", status: "watching", acc: "yes", cam: "", flags: [], steps: {}, addedBy: "claude", addedAt: "2026-10-01T10:00:00Z", updatedAt: "2026-11-01T10:00:00Z" },
  "cars/s3": { title: "Audi Q5", year: 2021, vin: "WA1FAAFY0M2006217", km: 76000, price: 27999, priceHistory: [{ date: "2026-11-05", price: 27999 }], seller: "Sample dealer B", sellerType: "dealer", location: "Gatineau", status: "watching", acc: "", cam: "", flags: [], steps: {}, addedBy: "manual", addedAt: "2026-11-05T10:00:00Z", updatedAt: "2026-11-05T10:00:00Z" },
  "cars/s4": { title: "Audi Q5", year: 2022, vin: "WA1FAAFY5N2010001", km: 52000, price: 31490, priceHistory: [{ date: "2026-11-08", price: 31990 }, { date: "2026-11-14", price: 31490 }], seller: "Sample dealer C", sellerType: "dealer", location: "Montréal", status: "contacted", acc: "yes", cam: "yes", flags: [], steps: {}, addedBy: "claude", addedAt: "2026-11-08T10:00:00Z", updatedAt: "2026-11-14T10:00:00Z" },
  "cars/s5": { title: "Audi Q5", year: 2021, vin: "WA1EAAFY0M2063089", km: 70000, price: 23500, priceHistory: [{ date: "2026-09-01", price: 23500 }], seller: "Sample dealer D", sellerType: "dealer", location: "Blainville", status: "dropped", acc: "no", cam: "no", flags: ["rust"], steps: {}, addedBy: "manual" },
  "contacts/k1": { name: "Sample Shipper", role: "Shipping line, Montréal", phone: "000-000-0000", email: "", notes: "Bookings, quotes" },
  "contacts/k2": { name: "Sample Warehouse", role: "Drop-off warehouse", phone: "", email: "", notes: "" },
  "members/mock-user": { name: "Test", role: "admin", addedAt: "2026-11-01T10:00:00Z" },
  "members/SampleMemberAna0000000001": { name: "Ana", role: "member", addedAt: "2026-11-02T10:00:00Z" },
  "requests/SampleRequestLaszlo00000002": { name: "Laszlo", at: "2026-11-16T09:00:00Z" },
  "config/scan": { lastRun: "2026-11-15T07:00:00Z", found: 2, summary: "Exemplu: 1 mașină nouă și o scădere de preț de 500 CAD." },
};

export function connectMock(): Connection {
  const store = new Map(Object.entries(structuredClone(SAMPLE)));
  const subs = new Set<() => void>();
  let n = 0;
  const emit = () => setTimeout(() => subs.forEach(f => f()), 5);
  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
  // "?deny" in the address: start as someone who isn't a member yet (until members/mock-user appears).
  const urlDeny = new URLSearchParams(location.search).has("deny");
  if (urlDeny) store.delete("members/mock-user");
  const denied = (p: string) => urlDeny && !store.has("members/mock-user") && !p.startsWith("members/");
  (window as any).__mock = { store, writes: [] as string[][], emit: () => emit() };
  const log = (op: string, p: string) => (window as any).__mock.writes.push([op, p]);
  return {
    backend: {
      watchCollection(p, cb, err) {
        const depth = p.split("/").length + 1;
        const f = () => denied(p) ? err("permission-denied") : cb([...store.keys()].filter(k => k.startsWith(p + "/") && k.split("/").length === depth)
          .map(k => ({ id: k.split("/").pop()!, data: clone(store.get(k)!) }) as DocSnap), false);
        subs.add(f); setTimeout(f, 30); return () => subs.delete(f);
      },
      watchDoc(p, cb, err) { const f = () => denied(p) ? err("permission-denied") : cb(store.has(p) ? clone(store.get(p)!) : null, false); subs.add(f); setTimeout(f, 30); return () => subs.delete(f); },
      async set(p, d) { log("set", p); store.set(p, clone(d)); emit(); },
      async update(p, d) { log("update", p); if (!store.has(p)) throw new Error("not found"); store.set(p, { ...store.get(p), ...clone(d) }); emit(); },
      async remove(p) { log("delete", p); store.delete(p); emit(); },
      async bump(p, inc, set) {
        log("bump", p);
        const o: Record<string, any> = store.get(p) ? clone(store.get(p)!) : {};
        const at = (k: string) => { const ks = k.split("."); let c = o; ks.slice(0, -1).forEach(x => (c = c[x] ??= {})); return [c, ks[ks.length - 1]] as const; };
        for (const [k, v] of Object.entries(set)) { const [c, last] = at(k); c[last] = v; }
        for (const [k, n] of Object.entries(inc)) { const [c, last] = at(k); c[last] = (Number(c[last]) || 0) + n; }
        store.set(p, o); emit();
      },
      async add(c, d) { const id = "new" + ++n; log("add", c + "/" + id); store.set(c + "/" + id, clone(d)); emit(); return id; },
    },
    auth: {
      onChange(cb) { setTimeout(() => cb({ uid: "mock-user", name: "Test", photo: null }), 0); return () => {}; },
      async signIn() {}, async signOut() {},
    },
  };
}
