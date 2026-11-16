import { queue, state } from "../data/store";
import { today } from "./cars";
import { t } from "../i18n";
import { toast } from "../ui";

/** Tick or untick a step/document on a car; stores the date it was ticked. Reads the latest doc at write time. */
export function tick(carId: string, field: "steps" | "docs", key: string, on: boolean) {
  return queue("cars/" + carId, b => {
    const cur = state.cars.find(c => c._id === carId);
    const m: Record<string, string | boolean> = { ...((cur?.[field] as Record<string, string | boolean>) || {}) };
    if (on) m[key] = today(); else delete m[key];
    return b.update("cars/" + carId, { [field]: m, updatedAt: new Date().toISOString() });
  }).catch(() => toast(t.value.c.error));
}
