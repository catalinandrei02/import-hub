<script setup lang="ts">
// Daily check (shared): one compact line under the cars — last run, counts, "Check now", progress while running;
// the changes, new cars and any warnings are folded in a <details>.
import { computed } from "vue";
import { canWrite, state } from "../data/store";
import { checkable, run, runPriceCheck, searchNeedsUpdate, searchOn, searchUrl } from "../lib/priceCheck";
import { hasExtension } from "../lib/extension";
import { cad, fmtDate } from "../lib/format";
import { fill, t } from "../i18n";
import { toast, ui } from "../ui";

const P = computed(() => state.prices);
const n = computed(() => checkable(state.cars).length);
const warns = computed(() => [
  !run.running && P.value?.blocked ? t.value.prices.blocked : "",
  searchOn(state.search) && !searchUrl(state.search) ? t.value.prices.noModel : "",
  searchOn(state.search) && searchNeedsUpdate() ? t.value.prices.updateExt : "",
  !hasExtension.value ? t.value.prices.needExt : "",
].filter(Boolean));
const items = computed(() => (P.value?.found?.length || 0) + (P.value?.changes?.length || 0) + (P.value?.gone?.length || 0));
async function now() { const r = await runPriceCheck(); if (r) toast(fill(t.value.prices.doneToast, { n: r.found?.length || 0, c: r.changes?.length || 0, g: r.gone?.length || 0 })); }
function openCar(id: string) { ui.selCar = id; ui.detail = true; }
</script>

<template>
  <section class="glass pricebar" data-sec="prices" aria-live="polite">
    <div class="pb-line">
      <h2 class="label">{{ t.prices.h }}</h2>
      <span class="pb-sum">
        <template v-if="run.running && run.phase === 'search'"><b>{{ run.total > 1 || run.done ? fill(t.prices.adding, { d: run.done, n: run.total }) : t.prices.searching }}</b></template>
        <template v-else-if="run.running"><b>{{ fill(t.prices.running, { d: run.done, n: run.total }) }}</b></template>
        <template v-else-if="P?.lastRun">{{ fill(t.prices.last, { d: fmtDate(P.lastRun), n: P.by || "—" }) }} · {{ fill(t.prices.summary, { k: P.checked || 0, c: P.changes?.length || 0, g: P.gone?.length || 0 }) }}<template v-if="P.found?.length"> · {{ t.prices.newCar }}: {{ P.found.length }}</template></template>
        <template v-else>{{ t.prices.never }}</template>
        <span v-if="warns.length" class="pb-warn-dot" :title="warns.join(' ')"> · !</span>
      </span>
      <button v-if="hasExtension" class="btn" type="button" data-act="check-prices" :disabled="run.running || !canWrite || (!n && !searchOn(state.search))" @click="now">{{ n || searchOn(state.search) ? t.prices.now : t.prices.none }}</button>
    </div>
    <div v-if="run.running" class="pb-bar" role="progressbar" :aria-valuenow="run.done" :aria-valuemax="run.total"><span :style="{ width: (run.total ? (run.done / run.total) * 100 : 0) + '%' }"></span></div>
    <details v-if="!run.running && (items || warns.length)">
      <summary>{{ t.prices.details }}<template v-if="items"> ({{ items }})</template></summary>
      <p v-for="w in warns" :key="w" class="note pb-warn">{{ w }}</p>
      <p v-if="P?.searchRun && !P.blocked" class="note">{{ fill(t.prices.search, { d: fmtDate(P.searchRun), t: P.searchTotal ?? "—", n: P.found?.length || 0 }) }}</p>
      <ul v-if="items" class="hist pb-list">
        <li v-for="f in P!.found || []" :key="'f' + f.id"><button class="link" type="button" @click="openCar(f.id)">{{ f.title }}</button><b class="new">{{ t.prices.newCar }}{{ f.price ? " · " + cad(f.price) : "" }}</b></li>
        <li v-for="ch in P!.changes || []" :key="'c' + ch.id"><button class="link" type="button" @click="openCar(ch.id)">{{ ch.title }}</button>
          <b :class="ch.from && ch.to < ch.from ? 'down' : 'up'">{{ ch.from ? cad(ch.from) + " → " : "" }}{{ cad(ch.to) }}</b></li>
        <li v-for="g in P!.gone || []" :key="'g' + g.id"><button class="link" type="button" @click="openCar(g.id)">{{ g.title }}</button><b class="bad">{{ t.prices.gone }}</b></li>
      </ul>
    </details>
  </section>
</template>
