// Talks to the optional "Import Hub" Chrome extension (extension/), which can open a listing link in the user's own
// Chrome (VPN and sign-ins included) and read its photos. Without the extension everything else works as before.
import { ref } from "vue";
import type { ListingData } from "./listingReader";

export const hasExtension = ref(typeof document !== "undefined" && document.documentElement.dataset.importHub === "1");
const waiting = new Map<string, (d: { data?: ListingData; error?: string | null }) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("message", e => {
    const m = e.data;
    if (e.source !== window || !m || m.source !== "import-hub-ext") return;
    if (m.type === "ready") hasExtension.value = true;
    if (m.type === "result") { waiting.get(m.id)?.(m); waiting.delete(m.id); }
  });
}

/** Asks the extension to read a listing. Resolves to null when there is no extension, it fails or takes too long. */
export function readWithExtension(url: string, timeoutMs = 90000): Promise<ListingData | null> {
  if (!hasExtension.value || !/^https?:\/\//i.test(url)) return Promise.resolve(null);
  const id = Math.random().toString(36).slice(2);
  return new Promise(resolve => {
    const t = setTimeout(() => { waiting.delete(id); resolve(null); }, timeoutMs);
    waiting.set(id, m => { clearTimeout(t); resolve(m.error ? null : m.data || null); });
    window.postMessage({ source: "import-hub", type: "read", id, url }, location.origin);
  });
}
