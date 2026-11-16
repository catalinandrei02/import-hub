<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { canWrite, queue, state } from "../data/store";
import { RATE_KEYS, type Costs } from "../lib/constants";
import { landed } from "../lib/costs";
import { parseNum } from "../lib/cars";
import { eur, fmt, fmtDT } from "../lib/format";
import { fill, t } from "../i18n";
import { toast, ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CostPanels from "../components/CostPanels.vue";

type K = keyof Costs;
const PCT: Partial<Record<K, 1>> = { insPct: 1, dutyPct: 1, vatPct: 1 };
const draft = reactive<Partial<Record<K, string>>>({});
const busy = ref(false);
const val = (k: K) => draft[k] ?? String(state.costs[k]);
const bad = (k: K) => { const v = val(k), n = parseNum(v); return v.trim() === "" || n == null || n < 0 || (!!PCT[k] && n > 100); };
const anyBad = computed(() => RATE_KEYS.some(bad));
const dirty = computed(() => RATE_KEYS.some(k => draft[k] != null && draft[k] !== String(state.costs[k])));
const used = computed(() => Object.fromEntries(RATE_KEYS.map(k => [k, bad(k) ? state.costs[k] : parseNum(val(k))!])) as Costs);
const price = computed(() => parseNum(ui.priceInput) || 0);
const total = computed(() => landed(price.value, ui.gstOn, used.value).total);
const insHint = computed(() => fill(t.value.costs.insH, { p: fmt(used.value.insPct, 2), v: fmt(price.value), e: eur(price.value * used.value.cadEur * used.value.insPct / 100) }));
const xe = (from: string) => `https://www.xe.com/currencyconverter/convert/?Amount=1&From=${from}&To=EUR`;
// When someone else saves new rates, keep only the fields this viewer is still editing.
watch(() => state.costsAt, () => { for (const k of RATE_KEYS) if (draft[k] === String(state.costs[k])) delete draft[k]; });

const groups = computed(() => [
  { h: t.value.costs.gCar, rows: [{ k: "cadEur" as K, u: "€", link: "CAD" }] },
  { h: t.value.costs.gShip, rows: [{ k: "shipUsd" as K, u: "USD" }, { k: "insPct" as K, u: "%", hint: insHint.value }, { k: "fuelUsd" as K, u: "USD" }, { k: "usdEur" as K, u: "€", link: "USD" }] },
  { h: t.value.costs.gCustoms, rows: [{ k: "dutyPct" as K, u: "%", hint: t.value.costs.dutyH }, { k: "vatPct" as K, u: "%", hint: t.value.costs.vatH }, { k: "marlogEur" as K, u: "€", hint: t.value.costs.marlogH }] },
  { h: t.value.costs.gRo, rows: [{ k: "roadEur" as K, u: "€", hint: t.value.costs.roadH }, { k: "rarEur" as K, u: "€" }] },
]);

async function save() {
  if (!canWrite.value || anyBad.value) return;
  busy.value = true;
  const d: Record<string, any> = { ...used.value, updatedAt: new Date().toISOString() };
  try { await queue("config/costs", b => b.set("config/costs", d)); for (const k of RATE_KEYS) delete draft[k]; toast(t.value.costs.saved); }
  catch { toast(t.value.c.error); } finally { busy.value = false; }
}
function revert() { for (const k of RATE_KEYS) delete draft[k]; }
</script>

<template>
  <HeroSection :title="t.costs.h" :lead="t.costs.lead">
    <template #proof><span><b>{{ fill(t.chip.rate, { v: fmt(used.cadEur, 3) }) }}</b> · {{ t.c.lastChanged }}: {{ state.costsAt ? fmtDT(state.costsAt) : "—" }}</span></template>
    <form class="pillform" novalidate autocomplete="off" @submit.prevent>
      <label class="sr-only" for="c-price">{{ t.hero.priceL }}</label>
      <input id="c-price" v-model="ui.priceInput" inputmode="decimal" :placeholder="t.hero.priceL"><span class="u">CAD</span>
      <output for="c-price" aria-live="polite">{{ eur(total) }}</output>
    </form>
  </HeroSection>

  <div class="content">
    <div class="main">
      <StatusBanner />
      <form id="rates-form" class="glass pad" novalidate autocomplete="off" style="display:grid;gap:28px" @submit.prevent="save">
        <div class="form">
          <section v-for="(g, gi) in groups" :key="g.h" class="group">
            <h2 class="label">{{ g.h }}</h2>
            <div v-for="r in g.rows" :key="r.k" class="row">
              <div class="lab"><label :for="'r-' + r.k">{{ (t.costs.lab as any)[r.k] }}</label>
                <small v-if="r.link" :id="'r-' + r.k + '-h'"><a :href="xe(r.link)" target="_blank" rel="noopener">{{ t.costs.rateH }}</a></small>
                <small v-else-if="r.hint" :id="'r-' + r.k + '-h'">{{ r.hint }}</small></div>
              <div class="inp" :data-bad="bad(r.k) ? '' : undefined">
                <input :id="'r-' + r.k" :data-rate="r.k" :value="val(r.k)" inputmode="decimal" spellcheck="false" :aria-invalid="bad(r.k)" :aria-describedby="r.link || r.hint ? 'r-' + r.k + '-h' : undefined"
                  @input="draft[r.k] = ($event.target as HTMLInputElement).value"><span class="u">{{ r.u }}</span></div>
              <p v-if="bad(r.k)" :id="'r-' + r.k + '-e'" class="err">{{ PCT[r.k] ? t.c.errPct : t.c.errNum }}</p>
            </div>
            <label v-if="gi === 0" class="row sw" for="c-gst"><span class="lab"><span class="t">{{ t.costs.gstL }}</span><small>{{ t.costs.gstH }}</small></span>
              <input id="c-gst" v-model="ui.gstOn" class="switch" type="checkbox" role="switch"></label>
            <p v-if="gi === 0" class="note">{{ t.costs.localNote }}</p>
          </section>
        </div>
        <div class="spread">
          <div class="rowx"><button class="btn primary" type="submit" :disabled="!canWrite || anyBad || busy">{{ t.costs.saveRates }}</button>
            <button v-if="dirty" class="link" type="button" @click="revert">{{ t.c.revert }}</button></div>
          <p class="note"><b v-if="dirty">{{ t.c.unsaved }} · </b>{{ t.c.lastChanged }}: {{ state.costsAt ? fmtDT(state.costsAt) : "—" }}</p>
        </div>
      </form>
    </div>
    <aside id="side" class="side"><CostPanels :price="price" :gst="ui.gstOn" :costs="used" :cap="t.cars.landedCap" /></aside>
  </div>
</template>
