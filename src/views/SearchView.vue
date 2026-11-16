<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { canWrite, queue, state } from "../data/store";
import { SOURCES } from "../lib/constants";
import { parseNum } from "../lib/cars";
import { fmtDT, shortDate } from "../lib/format";
import { fill, t } from "../i18n";
import { toast } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";

const SRC: Record<string, string> = { cargurus: "CarGurus.ca", autohebdo: "AutoHebdo", kijiji: "Kijiji Autos", autotrader: "AutoTrader.ca", facebook: "Facebook Marketplace" };
const TRIMS = ["Technik", "Progressiv", "Komfort"];
const s = reactive<Record<string, any>>({});
const busy = ref(false);
const load = () => Object.assign(s, JSON.parse(JSON.stringify(state.search)), {
  yearMin: state.search.yearMin ?? "", yearMax: state.search.yearMax ?? "", maxPrice: state.search.maxPrice ?? "", maxKm: state.search.maxKm ?? "", radiusKm: state.search.radiusKm ?? "",
  sources: Array.isArray(state.search.sources) ? [...state.search.sources] : [...SOURCES], trims: [...(state.search.trims || [])],
});
load();
watch(() => state.search, load);

const freqLabel = computed(() => ({ 1: t.value.search.f1, 3: t.value.search.f3, 7: t.value.search.f7 } as Record<number, string>)[+state.search.frequencyDays] || t.value.search.f7);
const last = computed(() => { const d = new Date(state.scan?.lastRun || ""); return isNaN(+d) ? null : d; });
const next = computed(() => (last.value ? new Date(last.value.getTime() + (+state.search.frequencyDays || 7) * 864e5) : null));

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
  <HeroSection :title="t.search.h" :lead="t.search.lead">
    <template #proof><span class="dot" aria-hidden="true" :style="{ background: state.search.enabled ? 'var(--ok)' : 'var(--warn)' }"></span>
      <span v-if="state.search.enabled">{{ fill(t.chip.searchOn, { f: freqLabel }) }}<template v-if="state.scan?.found != null"> · <b>{{ state.scan.found }}</b> {{ t.search.found }}</template></span>
      <span v-else>{{ t.chip.searchOff }}</span></template>
  </HeroSection>
  <div class="content">
    <div class="main">
      <StatusBanner />
      <form id="search-form" class="glass pad" novalidate autocomplete="off" style="display:grid;gap:28px" @submit.prevent="save">
        <div class="spread">
          <label class="row sw" for="s-enabled" style="flex:1;min-width:14rem"><span class="lab"><span class="t">{{ t.search.enabled }}</span><small>{{ t.search.freqH }}</small></span>
            <input id="s-enabled" v-model="s.enabled" class="switch" type="checkbox" role="switch"></label>
          <div class="seg" role="radiogroup" :aria-label="t.search.freq">
            <label v-for="o in [[1, t.search.f1], [3, t.search.f3], [7, t.search.f7]]" :key="o[0]"><input v-model.number="s.frequencyDays" type="radio" name="frequencyDays" :value="o[0]">{{ o[1] }}</label>
          </div>
        </div>
        <div class="form">
          <section class="group"><h2 class="label">{{ t.search.gWhat }}</h2>
            <div class="row full"><div class="lab"><label for="s-model">{{ t.search.model }}</label></div><div class="inp txt"><input id="s-model" v-model="s.model"></div></div>
            <div v-for="k in (['yearMin', 'yearMax', 'maxPrice', 'maxKm'] as const)" :key="k" class="row"><div class="lab"><label :for="'s-' + k">{{ (t.search as any)[k] }}</label></div>
              <div class="inp"><input :id="'s-' + k" v-model="s[k]" inputmode="numeric"><span v-if="k === 'maxPrice'" class="u">CAD</span><span v-if="k === 'maxKm'" class="u">KM</span></div></div>
          </section>
          <section class="group"><h2 class="label">{{ t.search.gWhere }}</h2>
            <div v-for="k in (['region', 'center'] as const)" :key="k" class="row full"><div class="lab"><label :for="'s-' + k">{{ t.search[k] }}</label></div><div class="inp txt"><input :id="'s-' + k" v-model="s[k]"></div></div>
            <div class="row"><div class="lab"><label for="s-radiusKm">{{ t.search.radius }}</label></div><div class="inp"><input id="s-radiusKm" v-model="s.radiusKm" inputmode="numeric"><span class="u">KM</span></div></div>
          </section>
          <section class="group"><h2 class="label">{{ t.search.trims }}</h2>
            <label v-for="x in TRIMS" :key="x" class="row sw" :for="'s-trim-' + x"><span class="lab"><span class="t">{{ x }}</span></span><input :id="'s-trim-' + x" v-model="s.trims" class="switch" type="checkbox" role="switch" :value="x"></label>
          </section>
          <section class="group"><h2 class="label">{{ t.search.must }}</h2>
            <label v-for="k in (['mustAcc', 'must360', 'phevBonus'] as const)" :key="k" class="row sw" :for="'s-' + k"><span class="lab"><span class="t">{{ k === 'mustAcc' ? t.search.acc : k === 'must360' ? t.search.cam : t.search.phev }}</span></span>
              <input :id="'s-' + k" v-model="s[k]" class="switch" type="checkbox" role="switch"></label>
          </section>
          <section class="group"><h2 class="label">{{ t.search.sellers }}</h2>
            <label v-for="k in (['dealers', 'privates'] as const)" :key="k" class="row sw" :for="'s-' + k"><span class="lab"><span class="t">{{ k === 'dealers' ? t.search.dealer : t.search.private }}</span></span>
              <input :id="'s-' + k" v-model="s[k]" class="switch" type="checkbox" role="switch"></label>
          </section>
          <section class="group"><h2 class="label">{{ t.search.sources }}</h2><p class="note">{{ t.search.sourcesH }}</p>
            <label v-for="x in SOURCES" :key="x" class="row sw" :for="'s-source-' + x"><span class="lab"><span class="t">{{ x === 'certified' ? t.search.srcCertified : SRC[x] }}</span></span>
              <input :id="'s-source-' + x" v-model="s.sources" class="switch" type="checkbox" role="switch" :value="x"></label>
          </section>
          <section class="group wide"><h2 class="label">{{ t.search.gMore }}</h2>
            <div class="row full"><div class="lab"><label for="s-exclude">{{ t.search.exclude }}</label></div><div class="inp area"><textarea id="s-exclude" v-model="s.exclude"></textarea></div></div>
            <div class="row full"><div class="lab"><label for="s-extra">{{ t.search.extra }}</label></div><div class="inp area"><textarea id="s-extra" v-model="s.extra"></textarea></div></div>
          </section>
        </div>
        <div class="spread"><button class="btn primary" type="submit" :disabled="!canWrite || busy">{{ t.search.save }}</button>
          <p class="note">{{ t.c.lastChanged }}: {{ state.search.updatedAt ? fmtDT(state.search.updatedAt) : "—" }}</p></div>
      </form>
    </div>
    <aside id="side" class="side">
      <div v-if="!state.search.enabled" class="banner glass warn"><span class="msg"><span>{{ t.search.off }}</span></span></div>
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
      <section class="break glass deep">
        <h3 class="bh">{{ t.search.summaryH }}</h3>
        <p class="notes" style="margin-top:12px">{{ state.scan?.summary || t.search.noSummary }}</p>
        <p v-if="last" class="note" style="padding:0;margin-top:12px">{{ fmtDT(state.scan!.lastRun) }}</p>
      </section>
      <section class="glass pad" style="display:grid;gap:8px"><h3 class="label">{{ t.search.runNowH }}</h3><p class="note">{{ t.search.runNow }}</p></section>
    </aside>
  </div>
</template>
