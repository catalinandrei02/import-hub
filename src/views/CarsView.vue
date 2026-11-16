<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { canWrite, state } from "../data/store";
import { carLanded, landed } from "../lib/costs";
import { decodeVin } from "../lib/vin";
import { priceDelta, sortCars } from "../lib/cars";
import { cad, eur, fmt } from "../lib/format";
import { fill, lang, t } from "../i18n";
import { STEPS } from "../i18n/content";
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

const active = computed(() => state.cars.filter(c => c.status !== "dropped"));
const list = computed(() => state.cars.filter(c => filter.value === "all" || (filter.value === "dropped" ? c.status === "dropped" : c.status !== "dropped")).slice().sort(sortCars));
const cheapest = computed(() => { const v = active.value.map(c => carLanded(c, state.costs)?.total).filter((x): x is number => !!x); return v.length ? Math.min(...v) : null; });
const bestDrop = computed(() => { const d = active.value.map(priceDelta).filter(x => x < 0); return d.length ? -Math.min(...d) : null; });
const cmpCars = computed(() => ui.cmp.map(id => state.cars.find(c => c._id === id)).filter(Boolean) as typeof state.cars);
const loading = computed(() => !state.carsLoaded && (state.data === "loading" || state.data === "stale"));

function addFromVin() {
  const d = decodeVin(vin.value);
  ui.dialog = { kind: "car", car: { vin: vin.value.toUpperCase().replace(/\s/g, ""), ...(d.err ? {} : { trim: d.trim === "?" ? "" : d.trim, year: d.year === "?" ? null : d.year }) } as any };
}
watch(() => ui.cmp.length, n => { if (n < 2) cmpOpen.value = false; });
// Journey: the process phases with how many steps each has and how many are done for the selected car.
const phases = computed(() => {
  const sel = state.cars.find(c => c._id === ui.selCar);
  const out: { name: string; first: string; n: number; done: number }[] = [];
  STEPS[lang.value].forEach((s, i) => {
    let p = out[out.length - 1];
    if (!p || p.name !== s[0]) { p = { name: s[0], first: s[1], n: 0, done: 0 }; out.push(p); }
    p.n++; if (sel?.steps?.["s" + i]) p.done++;
  });
  return out;
});
const example = computed(() => landed(25000, true, state.costs).total);
</script>

<template>
  <HeroSection :title="t.story.h" :lead="t.story.lead" tall>
    <template #proof><span>{{ t.story.eyebrow }}</span></template>
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

      <section v-reveal class="story" :aria-label="t.cars.h">
        <div class="stats">
          <div class="stat"><b>{{ active.length }}</b><span>{{ t.story.sWatched }}</span></div>
          <div class="stat"><b>{{ cheapest ? eur(cheapest) : "—" }}</b><span>{{ t.story.sCheapest }}</span></div>
          <div class="stat"><b>≈ 75</b><span>{{ t.story.sDays }}</span></div>
          <div class="stat"><b>{{ STEPS[lang].length }}</b><span>{{ t.story.sSteps }}</span></div>
        </div>
      </section>

      <section v-reveal class="story" aria-labelledby="cars-h">
        <div class="secrow">
          <div class="story-h"><span class="eyebrow">{{ t.story.carsEyebrow }}</span><h2 id="cars-h" class="seclabel">{{ t.cars.h }}</h2><p>{{ t.cars.lead }}</p></div>
          <div class="seg" role="group" :aria-label="t.f.status">
            <button v-for="f in ([['active', t.cars.all], ['dropped', t.cars.dropped], ['all', t.cars.allAll]] as const)" :key="f[0]" type="button" :data-filter="f[0]" :aria-pressed="filter === f[0]" @click="filter = f[0]">{{ f[1] }}</button>
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
        <div v-else class="cars"><CarCard v-for="c in list" :key="c._id" :car="c" /></div>
        <p v-if="bestDrop" class="note">{{ t.cars.bestDrop }}: ▼ {{ cad(bestDrop) }}</p>
      </section>

      <section v-reveal class="story" aria-labelledby="journey-h">
        <div class="story-h"><span class="eyebrow">{{ t.story.journeyEyebrow }}</span><h2 id="journey-h">{{ fill(t.story.journeyH, { n: phases.length }) }}</h2><p>{{ t.story.journeyLead }}</p></div>
        <ol class="journey">
          <li v-for="p in phases" :key="p.name">
            <h3>{{ p.name }}</h3>
            <p>{{ p.first }}</p>
            <p class="note">{{ fill(t.story.stepsN, { n: p.n }) }}<template v-if="p.done"> · {{ p.done }}/{{ p.n }}</template></p>
            <span class="bar" aria-hidden="true"><i :style="{ width: (p.done / p.n) * 100 + '%' }"></i></span>
          </li>
        </ol>
        <div><RouterLink class="btn" to="/steps">{{ t.story.seeSteps }} →</RouterLink></div>
      </section>

      <section v-reveal class="story" aria-labelledby="cost-h">
        <div class="costband">
          <div style="display:grid;gap:14px">
            <span class="eyebrow">{{ t.story.costEyebrow }}</span>
            <h2 id="cost-h">{{ t.story.costH }}</h2>
            <p>{{ t.story.costLead }}</p>
            <div><RouterLink class="btn primary" to="/costs">{{ t.story.openCalc }} →</RouterLink></div>
          </div>
          <div class="eq"><span>{{ fill(t.story.costEx, { p: fmt(25000) }) }}</span><b>{{ eur(example) }}</b><span>{{ t.cars.landedCap }}</span></div>
        </div>
      </section>

      <section v-reveal class="story" aria-labelledby="cta-h">
        <div class="ctaband">
          <h2 id="cta-h">{{ t.story.ctaH }}</h2>
          <p>{{ t.story.ctaLead }}</p>
          <RouterLink class="cta" to="/search">{{ t.story.ctaGo }} →</RouterLink>
        </div>
      </section>
    </div>
  </div>
</template>
