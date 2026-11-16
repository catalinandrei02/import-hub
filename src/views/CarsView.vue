<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { canWrite, state } from "../data/store";
import { carLanded } from "../lib/costs";
import { decodeVin } from "../lib/vin";
import { initials, priceDelta, sortCars } from "../lib/cars";
import { cad, eur } from "../lib/format";
import { fill, t } from "../i18n";
import { ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CarCard from "../components/CarCard.vue";
import CompareTable from "../components/CompareTable.vue";
import VinInfo from "../components/VinInfo.vue";

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const filter = ref<"active" | "dropped" | "all">((get("hub-filter") as any) || "active");
watch(filter, v => { try { localStorage.setItem("hub-filter", v); } catch { /* ignore */ } });
const vin = ref("");
const cmpOpen = ref(false);
const rail = ref<HTMLElement | null>(null);
const page = ref(0);

const active = computed(() => state.cars.filter(c => c.status !== "dropped"));
const list = computed(() => state.cars.filter(c => filter.value === "all" || (filter.value === "dropped" ? c.status === "dropped" : c.status !== "dropped")).slice().sort(sortCars));
const cheapest = computed(() => { const v = active.value.map(c => carLanded(c, state.costs)?.total).filter((x): x is number => !!x); return v.length ? Math.min(...v) : null; });
const bestDrop = computed(() => { const d = active.value.map(priceDelta).filter(x => x < 0); return d.length ? -Math.min(...d) : null; });
const faces = computed(() => active.value.slice().sort(sortCars).slice(0, 4).map(c => ({ id: c._id, ini: initials(c.seller), hue: [...String(c.seller || c._id)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360 })));
const cmpCars = computed(() => ui.cmp.map(id => state.cars.find(c => c._id === id)).filter(Boolean) as typeof state.cars);
const loading = computed(() => !state.carsLoaded && (state.data === "loading" || state.data === "stale"));

function addFromVin() {
  const d = decodeVin(vin.value);
  ui.dialog = { kind: "car", car: { vin: vin.value.toUpperCase().replace(/\s/g, ""), ...(d.err ? {} : { trim: d.trim === "?" ? "" : d.trim, year: d.year === "?" ? null : d.year }) } as any };
}
function step(dir: number) { const r = rail.value; if (!r) return; const card = r.firstElementChild as HTMLElement | null; r.scrollBy({ left: dir * ((card?.offsetWidth || r.clientWidth) + 16), behavior: "smooth" }); }
function goto(i: number) { const r = rail.value; const el = r?.children[i] as HTMLElement | undefined; if (r && el) r.scrollTo({ left: el.offsetLeft - r.offsetLeft, behavior: "smooth" }); }
function onScroll() { const r = rail.value; if (!r || !r.children.length) return; const w = (r.children[0] as HTMLElement).offsetWidth + 16; page.value = Math.round(r.scrollLeft / w); }
const atEnd = computed(() => { page.value; const r = rail.value; return !r || r.scrollLeft + r.clientWidth >= r.scrollWidth - 4; });
watch(() => list.value.length, () => nextTick(onScroll));
watch(() => ui.cmp.length, n => { if (n < 2) cmpOpen.value = false; });
onMounted(onScroll);
</script>

<template>
  <HeroSection :title="t.cars.h" :lead="t.cars.lead">
    <template #proof>
      <span class="stack" aria-hidden="true"><i v-for="f in faces" :key="f.id" :style="{ background: `hsl(${f.hue} 32% 40%)` }">{{ f.ini }}</i></span>
      <span v-if="!faces.length" class="dot" aria-hidden="true"></span>
      <span><b>{{ fill(t.chip.cars, { n: active.length }).split(" ")[0] }}</b> {{ fill(t.chip.cars, { n: active.length }).split(" ").slice(1).join(" ") }}<template v-if="cheapest"> · {{ t.cars.cheapest }} {{ eur(cheapest) }}</template></span>
    </template>
    <form class="pillform" novalidate autocomplete="off" @submit.prevent="addFromVin">
      <label class="sr-only" for="hero-vin">{{ t.hero.vinL }}</label>
      <input id="hero-vin" v-model="vin" maxlength="17" spellcheck="false" :placeholder="t.hero.vinPh">
      <button class="cta" type="submit" :disabled="!canWrite">{{ t.cars.add }} <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
    </form>
    <div v-if="vin.trim()" class="vinout"><VinInfo :vin="vin" center /></div>
  </HeroSection>

  <div class="content solo">
    <div class="main">
      <StatusBanner />
      <div class="secrow">
        <h2 class="seclabel"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 6c-3.3 1-5 3.4-5 7v5h6v-6H8c0-2.1 1-3.5 3-4.2L10 6zm9 0c-3.3 1-5 3.4-5 7v5h6v-6h-3c0-2.1 1-3.5 3-4.2L19 6z" /></svg>{{ t.cars.h }}</h2>
        <div class="rowx">
          <div class="seg" role="group" :aria-label="t.f.status">
            <button v-for="f in ([['active', t.cars.all], ['dropped', t.cars.dropped], ['all', t.cars.allAll]] as const)" :key="f[0]" type="button" :data-filter="f[0]" :aria-pressed="filter === f[0]" @click="filter = f[0]">{{ f[1] }}</button>
          </div>
          <div class="arrows">
            <button class="round" type="button" :aria-label="t.nav.prev" :disabled="page <= 0" @click="step(-1)"><svg viewBox="0 0 16 16" fill="none"><path d="M10 3.5L5.5 8l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
            <button class="round" type="button" :aria-label="t.nav.next" :disabled="atEnd" @click="step(1)"><svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
          </div>
        </div>
      </div>

      <div v-if="ui.cmp.length" class="banner glass" role="status">
        <span class="msg"><span>{{ fill(t.cars.compareN, { n: cmpCars.length }) }}<template v-if="cmpCars.length < 2"> · {{ t.cars.compareHint }}</template></span></span>
        <button v-if="cmpCars.length > 1" class="btn primary" type="button" data-act="cmp-show" @click="cmpOpen = !cmpOpen">{{ cmpOpen ? t.cars.compareHide : t.cars.compareShow }}</button>
        <button class="btn" type="button" @click="ui.cmp = []">{{ t.cars.compareClear }}</button>
      </div>
      <CompareTable v-if="cmpOpen && cmpCars.length > 1" :cars="cmpCars" />

      <div v-if="loading" class="glass empty"><p class="big">{{ t.cars.loadingCars }}</p></div>
      <div v-else-if="!list.length" class="glass empty">
        <p class="big">{{ t.cars.h }}</p><p>{{ t.cars.empty }}</p>
        <button v-if="canWrite" class="btn primary" type="button" @click="ui.dialog = { kind: 'car', car: null }">+ {{ t.cars.add }}</button>
      </div>
      <template v-else>
        <div ref="rail" class="rail" tabindex="0" :aria-label="t.cars.h" @scroll.passive="onScroll"><CarCard v-for="c in list" :key="c._id" :car="c" /></div>
        <div class="dots" role="group" :aria-label="t.cars.h">
          <button v-for="(c, i) in list" :key="c._id" type="button" :class="{ on: i === page }" :aria-label="String(i + 1)" :aria-current="i === page ? 'true' : undefined" @click="goto(i)"></button>
        </div>
      </template>
      <p v-if="bestDrop" class="note" style="text-align:center">{{ t.cars.bestDrop }}: ▼ {{ cad(bestDrop) }}</p>
    </div>
  </div>
</template>
