<script setup lang="ts">
// A car as a testimonial-style card: status source line, the car and its price, then seller and cost in Romania.
import { computed } from "vue";
import type { Car } from "../data/types";
import { state } from "../data/store";
import { carGst, carLanded } from "../lib/costs";
import { carName, carTrim, history, initials, priceDelta, safeUrl, statusClass } from "../lib/cars";
import { cad, eur, fmt } from "../lib/format";
import { STEPS } from "../i18n/content";
import { fill, lang, t } from "../i18n";
import { toast, ui } from "../ui";
import SparkLine from "./SparkLine.vue";

const props = defineProps<{ car: Car }>();
const c = computed(() => props.car);
const lc = computed(() => carLanded(c.value, state.costs));
const dl = computed(() => priceDelta(c.value));
const first = computed(() => history(c.value)[0]?.price);
const done = computed(() => STEPS[lang.value].filter((_, i) => c.value.steps?.["s" + i]).length);
const hue = computed(() => [...String(c.value.seller || c.value._id)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360);
const yn = (v?: string) => (v === "yes" ? t.value.cars.yes : v === "no" ? t.value.cars.no : t.value.cars.unknown);
const ync = (v?: string) => (v === "yes" ? "ok" : v === "no" ? "bad" : "");
function toggleCmp(e: Event) {
  const on = (e.target as HTMLInputElement).checked, id = c.value._id;
  if (on && ui.cmp.length >= 3) { (e.target as HTMLInputElement).checked = false; toast(t.value.cars.compareMax); return; }
  ui.cmp = on ? [...ui.cmp, id] : ui.cmp.filter(x => x !== id);
}
function open() { ui.selCar = c.value._id; ui.detail = true; }
</script>

<template>
  <article class="car glass" :class="{ sel: ui.detail && ui.selCar === car._id, dropped: car.status === 'dropped' }">
    <div class="ct">
      <span class="src"><i class="sdot" :class="statusClass(car.status)"></i>
        <span><small>{{ (t.st as any)[car.status || ''] || car.status }}</small><span>{{ car.sellerType === 'private' ? t.f.private : t.f.dealer }}<template v-if="car.addedBy === 'claude'"> · {{ t.cars.byClaude }}</template></span></span>
      </span>
      <label class="cmpchk"><input type="checkbox" :data-cmp="car._id" :checked="ui.cmp.includes(car._id)" @change="toggleCmp"> {{ t.cars.compare }}</label>
    </div>
    <button class="cbody" type="button" data-act="details" :data-id="car._id" @click="open">
      <span class="ctt">{{ carName(car) }}<template v-if="carTrim(car)"> · {{ carTrim(car) }}</template></span>
      <span class="cp">
        <span>
          <span class="price">{{ car.price ? fmt(car.price) : "—" }}<span v-if="car.price" class="cur">CAD</span></span>
          <span v-if="dl" class="delta" :class="dl < 0 ? 'down' : 'up'">{{ dl < 0 ? "▼" : "▲" }} {{ cad(Math.abs(dl)) }} {{ fill(t.cars.dropFrom, { v: cad(first!) }) }}</span>
        </span>
        <SparkLine :car="car" />
      </span>
    </button>
    <div class="chips">
      <span class="chip" :class="ync(car.acc)">{{ t.cars.acc }}: {{ yn(car.acc) }}</span>
      <span class="chip" :class="ync(car.cam)">{{ t.cars.cam }}: {{ yn(car.cam) }}</span>
      <span v-if="car.km" class="chip">{{ fmt(car.km) }} km</span>
      <span class="chip">{{ t.cars.stepsL }} {{ done }}/{{ STEPS[lang].length }}</span>
      <span v-for="f in car.flags || []" :key="f" class="chip bad">{{ (t.f.flagList as any)[f] || f }}</span>
    </div>
    <div class="cfoot">
      <span class="ini" :style="{ background: `hsl(${hue} 32% 38%)` }" aria-hidden="true">{{ initials(car.seller) }}</span>
      <span class="who"><b>{{ car.seller || "—" }}</b><small>{{ car.location || "—" }}</small></span>
      <span class="rate"><b class="hl">{{ lc ? eur(lc.total) : "—" }}</b><small>{{ t.cars.landed }} · {{ carGst(car) ? t.cars.withGst : t.cars.noGst }}</small></span>
    </div>
    <div class="acts">
      <button class="btn" type="button" data-act="edit-car" :data-id="car._id" @click="ui.dialog = { kind: 'car', car }">{{ t.cars.edit }}</button>
      <a v-if="safeUrl(car.url)" class="link" :href="safeUrl(car.url)" target="_blank" rel="noopener">{{ t.cars.open }} ↗</a>
    </div>
  </article>
</template>
