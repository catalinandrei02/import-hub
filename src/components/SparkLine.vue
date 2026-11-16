<script setup lang="ts">
import { computed } from "vue";
import type { Car } from "../data/types";
import { history } from "../lib/cars";
import { fmt } from "../lib/format";
import { t } from "../i18n";

const props = defineProps<{ car: Car }>();
const pts = computed(() => {
  let h = history(props.car).map(x => x.price);
  if (props.car.price && h.length && h[h.length - 1] !== props.car.price) h = [...h, props.car.price];
  if (h.length < 2) return null;
  const W = 104, H = 38, P = 4, mn = Math.min(...h), mx = Math.max(...h), sp = mx - mn;
  const xy = h.map((v, i) => [P + (i * (W - 2 * P)) / (h.length - 1), sp ? P + ((mx - v) / sp) * (H - 2 * P) : H / 2]);
  const line = xy.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const last = xy[xy.length - 1];
  return { line, area: `M${xy[0][0].toFixed(1)},38 L${line.replace(/ /g, " L")} L${last[0].toFixed(1)},38 Z`, last, label: h.map(v => fmt(v)).join(" → ") + " CAD" };
});
</script>
<template>
  <svg v-if="pts" class="spark" viewBox="0 0 104 38" role="img" :aria-label="t.cars.sparkLabel + ': ' + pts.label">
    <line class="grid" x1="0" y1="37.5" x2="104" y2="37.5" />
    <path class="area" :d="pts.area" />
    <polyline class="line" :points="pts.line" />
    <circle class="end" :cx="pts.last[0]" :cy="pts.last[1]" r="3.5" />
  </svg>
</template>
