<script setup lang="ts">
// Search page: one query + filters → matching saved cars (instant) and result links per listing site.
// The same filters are what the daily automatic search reads from config/search.
import { computed, nextTick, reactive, ref, watch } from "vue";
import { canWrite, queue, state } from "../data/store";
import { SOURCES } from "../lib/constants";
import { carName, carTrim, parseNum, safeUrl } from "../lib/cars";
import { carGst, carLanded } from "../lib/costs";
import { matchCars, siteLinks, type Query } from "../lib/search";
import { cad, eur, fmt, fmtDT, shortDate } from "../lib/format";
import { fill, t } from "../i18n";
import { toast, ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";

const SRC: Record<string, string> = { cargurus: "CarGurus.ca", autohebdo: "AutoHebdo", kijiji: "Kijiji", autotrader: "AutoTrader.ca", facebook: "Facebook Marketplace" };
const TRIMS = ["Technik", "Progressiv", "Komfort"];
const s = reactive<Record<string, any>>({});
const busy = ref(false);
const results = ref<HTMLElement | null>(null);
const load = () => Object.assign(s, JSON.parse(JSON.stringify(state.search)), {
  yearMin: state.search.yearMin ?? "", yearMax: state.search.yearMax ?? "", maxPrice: state.search.maxPrice ?? "", maxKm: state.search.maxKm ?? "", radiusKm: state.search.radiusKm ?? "",
  sources: Array.isArray(state.search.sources) ? [...state.search.sources] : [...SOURCES], trims: [...(state.search.trims || [])],
});
load();
watch(() => state.search.updatedAt, load);

const query = computed<Query>(() => ({
  text: String(s.model || ""), yearMin: parseNum(s.yearMin), yearMax: parseNum(s.yearMax), maxPrice: parseNum(s.maxPrice), maxKm: parseNum(s.maxKm),
  center: s.center || "", radiusKm: parseNum(s.radiusKm), trims: s.trims, mustAcc: !!s.mustAcc, must360: !!s.must360,
}));
const links = computed(() => siteLinks(query.value, s.sources || []));
const found = computed(() => matchCars(state.cars, query.value));
const summary = computed(() => {
  const q = query.value, parts: string[] = [];
  if (q.yearMin || q.yearMax) parts.push(`${q.yearMin || "…"}–${q.yearMax || "…"}`);
  if (q.maxPrice) parts.push("≤ " + cad(q.maxPrice));
  if (q.maxKm) parts.push("≤ " + fmt(q.maxKm) + " km");
  if (q.center) parts.push(q.center + (q.radiusKm ? ` ±${q.radiusKm} km` : ""));
  return parts.join(" · ");
});
const host = (u?: string) => { try { return new URL(u || "").hostname.replace(/^www\./, ""); } catch { return ""; } };
const freqLabel = computed(() => ({ 1: t.value.search.f1, 3: t.value.search.f3, 7: t.value.search.f7 } as Record<number, string>)[+state.search.frequencyDays] || t.value.search.f7);
const last = computed(() => { const d = new Date(state.scan?.lastRun || ""); return isNaN(+d) ? null : d; });
const next = computed(() => (last.value ? new Date(last.value.getTime() + (+state.search.frequencyDays || 7) * 864e5) : null));

function go() { nextTick(() => results.value?.scrollIntoView({ behavior: "smooth", block: "start" })); }
function open(id: string) { ui.selCar = id; ui.detail = true; }
async function save() {
  if (!canWrite.value) return;
  busy.value = true;
  const d = {
    enabled: !!s.enabled, frequencyDays: +s.frequencyDays || 7, model: s.model || "Audi Q5", trims: s.trims,
    yearMin: parseNum(s.yearMin), yearMax: parseNum(s.yearMax), maxPrice: parseNum(s.maxPrice), maxKm: parseNum(s.maxKm),
    region: s.region || "", center: s.center || "", radiusKm: parseNum(s.radiusKm),
    mustAcc: !!s.mustAcc, must360: !!s.must360, phevBonus: !!s.phevBonus, dealers: !!s.dealers, privates: !!s.privates,
    sources: s.sources, exclude: s.exclude || "", extra: s.extra || "", updatedAt: new Date().toISOString(),
  };
  try { await queue("config/search", b => b.set("config/search", d)); toast(t.value.search.saved); } catch { toast(t.value.c.error); } finally { busy.value = false; }
}
</script>

<template>
  <HeroSection :title="t.find.h" :lead="t.find.lead">
    <template #proof><span class="dot" aria-hidden="true" :style="{ background: state.search.enabled ? 'var(--ok)' : 'var(--warn)' }"></span>
      <span v-if="state.search.enabled">{{ fill(t.chip.searchOn, { f: freqLabel }) }}<template v-if="state.scan?.found != null"> · <b>{{ state.scan.found }}</b> {{ t.search.found }}</template></span>
      <span v-else>{{ t.chip.searchOff }}</span></template>
    <form class="pillform" role="search" novalidate autocomplete="off" @submit.prevent="go">
      <label class="sr-only" for="s-model">{{ t.search.model }}</label>
      <input id="s-model" v-model="s.model" type="search" :placeholder="t.find.ph">
      <button class="cta" type="submit">{{ t.find.go }} <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" /><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg></button>
    </form>
    <p v-if="summary" class="note">{{ summary }}</p>
  </HeroSection>

  <div class="content">
    <div class="main">
      <StatusBanner />
      <section class="glass pad" style="display:grid;gap:20px" :aria-label="t.find.filters">
        <h2 class="label">{{ t.find.filters }}</h2>
        <div class="form">
          <section class="group">
            <div v-for="k in (['yearMin', 'yearMax', 'maxPrice', 'maxKm'] as const)" :key="k" class="row"><div class="lab"><label :for="'s-' + k">{{ (t.search as any)[k] }}</label></div>
              <div class="inp"><input :id="'s-' + k" v-model="s[k]" inputmode="numeric"><span v-if="k === 'maxPrice'" class="u">CAD</span><span v-if="k === 'maxKm'" class="u">KM</span></div></div>
          </section>
          <section class="group">
            <div class="row full"><div class="lab"><label for="s-center">{{ t.search.center }}</label></div><div class="inp txt"><input id="s-center" v-model="s.center"></div></div>
            <div class="row"><div class="lab"><label for="s-radiusKm">{{ t.search.radius }}</label></div><div class="inp"><input id="s-radiusKm" v-model="s.radiusKm" inputmode="numeric"><span class="u">KM</span></div></div>
            <label v-for="k in (['mustAcc', 'must360'] as const)" :key="k" class="row sw" :for="'s-' + k"><span class="lab"><span class="t">{{ t.search.must }}: {{ k === 'mustAcc' ? t.search.acc : t.search.cam }}</span></span>
              <input :id="'s-' + k" v-model="s[k]" class="switch" type="checkbox" role="switch"></label>
          </section>
          <section class="group wide"><h3 class="label">{{ t.search.trims }}</h3>
            <div class="sws"><label v-for="x in TRIMS" :key="x" class="row sw" :for="'s-trim-' + x"><span class="lab"><span class="t">{{ x }}</span></span><input :id="'s-trim-' + x" v-model="s.trims" class="switch" type="checkbox" role="switch" :value="x"></label></div>
          </section>
        </div>
      </section>

      <section ref="results" class="glass pad sres" style="display:grid;gap:14px">
        <div class="spread"><h2 class="label" style="flex:1">{{ t.find.sitesH }}</h2><span class="note">{{ fill(t.find.results, { n: links.length }) }}</span></div>
        <p class="note">{{ t.find.sitesNote }}</p>
        <ol class="srlist">
          <li v-for="l in links" :key="l.id" class="sr">
            <span class="fav" aria-hidden="true">{{ l.name.charAt(0) }}</span>
            <div class="srbody">
              <span class="srhost">{{ host(l.url) }}</span>
              <a class="srtitle" :href="l.url" target="_blank" rel="noopener" :data-site="l.id">{{ query.text || "Audi Q5" }} · {{ l.name }}</a>
              <span class="srsnip"><span class="chip" :class="l.direct ? 'ok' : ''">{{ l.direct ? t.find.direct : t.find.viaGoogle }}</span> {{ summary }}</span>
            </div>
            <a class="btn" :href="l.url" target="_blank" rel="noopener">{{ t.find.open }} ↗</a>
          </li>
        </ol>
        <p class="note">{{ t.find.whyNot }}</p>
      </section>

      <section class="glass pad sres" style="display:grid;gap:14px">
        <div class="spread"><h2 class="label" style="flex:1">{{ t.find.foundH }}</h2><span class="note">{{ fill(t.find.results, { n: found.length }) }}</span></div>
        <p v-if="!found.length" class="note">{{ t.find.foundNone }}</p>
        <ol v-else class="srlist">
          <li v-for="c in found" :key="c._id" class="sr">
            <span class="fav" aria-hidden="true">{{ (c.seller || "?").charAt(0) }}</span>
            <div class="srbody">
              <span class="srhost">{{ host(c.url) || c.seller }}<template v-if="c.addedBy === 'claude'"> · {{ t.cars.byClaude }}</template></span>
              <button class="srtitle" type="button" @click="open(c._id)">{{ [carName(c) + (carTrim(c) ? " " + carTrim(c) : ""), c.price ? cad(c.price) : ""].filter(Boolean).join(" · ") }}</button>
              <span class="srsnip">{{ [c.km ? fmt(c.km) + " km" : "", c.seller, c.location].filter(Boolean).join(" · ") }}<template v-if="carLanded(c, state.costs)"> · {{ t.cars.landed }} {{ eur(carLanded(c, state.costs)!.total) }} ({{ carGst(c) ? t.cars.withGst : t.cars.noGst }})</template></span>
            </div>
            <a v-if="safeUrl(c.url)" class="btn" :href="safeUrl(c.url)" target="_blank" rel="noopener">{{ t.cars.open }} ↗</a>
          </li>
        </ol>
        <div><button class="btn" type="button" :disabled="!canWrite" @click="ui.dialog = { kind: 'car', car: null }">+ {{ t.find.addFound }}</button></div>
      </section>
    </div>

    <aside id="side" class="side">
      <section class="costhero glass tint">
        <h2 class="cap">{{ t.search.cap }}</h2>
        <p class="total">{{ state.scan?.found ?? "—" }}</p>
        <p class="sub">{{ t.search.carsFound }}</p>
        <dl class="facts">
          <div><dt>{{ t.search.last }}</dt><dd>{{ last ? shortDate(last) : t.search.never }}</dd></div>
          <div><dt>{{ t.search.next }}</dt><dd>{{ !state.search.enabled ? "—" : next && next > new Date() ? shortDate(next) : t.search.due }}</dd></div>
          <div><dt>{{ t.search.freqL }}</dt><dd>{{ freqLabel }}</dd></div>
        </dl>
      </section>
      <section v-if="state.scan?.summary" class="break glass deep">
        <h3 class="bh">{{ t.search.summaryH }}</h3>
        <p class="notes" style="margin-top:12px">{{ state.scan.summary }}</p>
        <p v-if="last" class="note" style="padding:0;margin-top:12px">{{ fmtDT(state.scan.lastRun) }}</p>
      </section>
      <form id="search-form" class="glass pad" novalidate autocomplete="off" style="display:grid;gap:16px" @submit.prevent="save">
        <h2 class="label">{{ t.find.dailyH }}</h2>
        <p class="note">{{ t.find.dailyLead }}</p>
        <label class="row sw" for="s-enabled"><span class="lab"><span class="t">{{ t.search.enabled }}</span></span><input id="s-enabled" v-model="s.enabled" class="switch" type="checkbox" role="switch"></label>
        <div class="seg" role="radiogroup" :aria-label="t.search.freq">
          <label v-for="o in [[1, t.search.f1], [3, t.search.f3], [7, t.search.f7]]" :key="o[0]"><input v-model.number="s.frequencyDays" type="radio" name="frequencyDays" :value="o[0]">{{ o[1] }}</label>
        </div>
        <div class="group"><h3 class="label">{{ t.search.sources }}</h3>
          <label v-for="x in SOURCES" :key="x" class="row sw" :for="'s-source-' + x"><span class="lab"><span class="t">{{ x === 'certified' ? t.search.srcCertified : SRC[x] }}</span></span>
            <input :id="'s-source-' + x" v-model="s.sources" class="switch" type="checkbox" role="switch" :value="x"></label></div>
        <div class="group"><h3 class="label">{{ t.search.sellers }}</h3>
          <label v-for="k in (['dealers', 'privates', 'phevBonus'] as const)" :key="k" class="row sw" :for="'s-' + k"><span class="lab"><span class="t">{{ k === 'dealers' ? t.search.dealer : k === 'privates' ? t.search.private : t.search.phev }}</span></span>
            <input :id="'s-' + k" v-model="s[k]" class="switch" type="checkbox" role="switch"></label></div>
        <div class="row full"><div class="lab"><label for="s-exclude">{{ t.search.exclude }}</label></div><div class="inp area"><textarea id="s-exclude" v-model="s.exclude"></textarea></div></div>
        <div class="row full"><div class="lab"><label for="s-extra">{{ t.search.extra }}</label></div><div class="inp area"><textarea id="s-extra" v-model="s.extra"></textarea></div></div>
        <button class="btn primary" type="submit" :disabled="!canWrite || busy">{{ t.find.saveDaily }}</button>
        <p class="note">{{ t.c.lastChanged }}: {{ state.search.updatedAt ? fmtDT(state.search.updatedAt) : "—" }}</p>
      </form>
    </aside>
  </div>
</template>
