// Day / night / automatic theme. A per-viewer convenience kept in browser storage; index.html applies it before
// the page draws (no flash). "auto" follows the device (prefers-color-scheme), the CSS handles the rest.
import { ref, watch } from "vue";

export type Theme = "auto" | "light" | "dark";
const KEY = "hub-theme";
const read = (): Theme => { try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : "auto"; } catch { return "auto"; } };

export const theme = ref<Theme>(read());
export function applyTheme(t: Theme) {
  const el = document.documentElement;
  if (t === "auto") el.removeAttribute("data-theme"); else el.setAttribute("data-theme", t);
  el.style.colorScheme = t === "auto" ? "" : t; // native controls (selects, scrollbars) follow too
}
watch(theme, t => { applyTheme(t); try { if (t === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, t); } catch { /* storage blocked: still works this visit */ } }, { immediate: true });
export const nextTheme = (t: Theme): Theme => (t === "auto" ? "light" : t === "light" ? "dark" : "auto");
