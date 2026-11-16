// Talks to the optional "Import Hub" Chrome extension (extension/), which can open a listing link in the user's own
// Chrome (VPN and sign-ins included) and read its photos. Without the extension everything else works as before.
import { ref } from "vue";
import type { ListingData, SearchData } from "./listingReader";

export const hasExtension = ref(typeof document !== "undefined" && document.documentElement.dataset.importHub === "1");
/** The extension's version ("" if unknown, e.g. 1.0–1.2 which didn't report it). */
export const extVersion = ref(typeof document !== "undefined" ? document.documentElement.dataset.importHubV || "" : "");
const waiting = new Map<string, (d: { data?: any; error?: string | null }) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("message", e => {
    const m = e.data;
    if (e.source !== window || !m || m.source !== "import-hub-ext") return;
    if (m.type === "ready") { hasExtension.value = true; extVersion.value = String(m.v || "") || "1.2.0"; }
    if (m.type === "result") { waiting.get(m.id)?.(m); waiting.delete(m.id); }
  });
}

/** Asks the extension to read a listing. Resolves to null when there is no extension, it fails or takes too long. */
export function readWithExtension(url: string, timeoutMs = 90000): Promise<ListingData | null> { return ask("read", url, timeoutMs); }
/** Asks the extension to read a search results page (needs extension 1.3.0). */
export function searchWithExtension(url: string, timeoutMs = 90000): Promise<SearchData | null> { return ask("search", url, timeoutMs); }

function ask<T>(type: "read" | "search", url: string, timeoutMs: number): Promise<T | null> {
  if (!hasExtension.value || !/^https?:\/\//i.test(url)) return Promise.resolve(null);
  const id = Math.random().toString(36).slice(2);
  return new Promise(resolve => {
    const t = setTimeout(() => { waiting.delete(id); resolve(null); }, timeoutMs);
    waiting.set(id, m => { clearTimeout(t); resolve(m.error ? null : m.data || null); });
    window.postMessage({ source: "import-hub", type, id, url }, location.origin);
  });
}
