// Per-viewer UI state (selected car, compare list, drawer, dialogs, toast). Browser storage is a convenience only.
import { reactive, watch } from "vue";
import type { Car, Contact } from "./data/types";

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
let cmp: string[] = [];
try { cmp = JSON.parse(get("hub-cmp") || "[]"); } catch { cmp = []; }

export const ui = reactive({
  selCar: get("hub-car") || "",
  cmp: Array.isArray(cmp) ? cmp : [],
  detail: false,
  dialog: null as null | { kind: "car"; car: Partial<Car> | null } | { kind: "contact"; contact: Contact | null },
  toast: "",
  priceInput: "25000",
  gstOn: true,
});
watch(() => ui.selCar, v => put("hub-car", v));
watch(() => ui.cmp.slice(), v => put("hub-cmp", JSON.stringify(v)));

let timer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) { ui.toast = msg; clearTimeout(timer); timer = setTimeout(() => (ui.toast = ""), 2200); }

export async function copyText(text: string, done: string) {
  try { await navigator.clipboard.writeText(text); toast(done); } catch { /* clipboard refused: text stays selectable on screen */ }
}
