<script setup lang="ts">
// Strip on the Cars page: last daily price check (shared), what changed, "check now", progress while running.
import { computed } from "vue";
import { canWrite, state } from "../data/store";
import { checkable, run, runPriceCheck } from "../lib/priceCheck";
import { hasExtension } from "../lib/extension";
import { cad, fmtDate } from "../lib/format";
import { fill, t } from "../i18n";
import { toast, ui } from "../ui";

const P = computed(() => state.prices);
const n = computed(() => checkable(state.cars).length);
async function now() { const r = await runPriceCheck(); if (r) toast(fill(t.value.prices.doneToast, { c: r.changes?.length || 0, g: r.gone?.length || 0 })); }
function openCar(id: string) { ui.selCar = id; ui.detail = true; }
</script>

<template>
  <section class="glass pricebar" data-sec="prices" aria-live="polite">
    <div class="pb-top">
      <div class="pb-t">
        <h2 class="label">{{ t.prices.h }}</h2>
        <p v-if="run.running" class="note"><b>{{ fill(t.prices.running, { d: run.done, n: run.total }) }}</b></p>
        <p v-else-if="P?.lastRun" class="note">{{ fill(t.prices.last, { d: fmtDate(P.lastRun), n: P.by || "—" }) }} ·
          {{ fill(t.prices.summary, { k: P.checked || 0, c: P.changes?.length || 0, g: P.gone?.length || 0 }) }}<template v-if="P.errors"> · {{ fill(t.prices.errors, { n: P.errors }) }}</template></p>
        <p v-else class="note">{{ t.prices.never }}</p>
        <p v-if="!hasExtension" class="note">{{ t.prices.needExt }}</p>
      </div>
      <button v-if="hasExtension" class="btn" type="button" data-act="check-prices" :disabled="run.running || !canWrite || !n" @click="now">{{ n ? t.prices.now : t.prices.none }}</button>
    </div>
    <div v-if="run.running" class="pb-bar" role="progressbar" :aria-valuenow="run.done" :aria-valuemax="run.total"><span :style="{ width: (run.total ? (run.done / run.total) * 100 : 0) + '%' }"></span></div>
    <ul v-if="!run.running && (P?.changes?.length || P?.gone?.length)" class="hist pb-list">
      <li v-for="ch in P!.changes || []" :key="'c' + ch.id"><button class="link" type="button" @click="openCar(ch.id)">{{ ch.title }}</button>
        <b :class="ch.from && ch.to < ch.from ? 'down' : 'up'">{{ ch.from ? cad(ch.from) + " → " : "" }}{{ cad(ch.to) }}</b></li>
      <li v-for="g in P!.gone || []" :key="'g' + g.id"><button class="link" type="button" @click="openCar(g.id)">{{ g.title }}</button><b class="bad">{{ t.prices.gone }}</b></li>
    </ul>
  </section>
</template>
