<script setup lang="ts">
// Cost hero + "where the money goes" breakdown with the 4-colour stack bar.
import { computed } from "vue";
import { landed } from "../lib/costs";
import type { Costs } from "../lib/constants";
import { eur, fmt } from "../lib/format";
import { fill, t } from "../i18n";

const props = defineProps<{ price: number; gst: boolean; costs: Costs; cap: string; extra?: string }>();
const r = computed(() => landed(props.price, props.gst, props.costs));
const taxes = computed(() => r.value.gst + r.value.duty + r.value.vat);
const groups = computed(() => {
  const x = r.value;
  return { car: x.car, ship: x.ship + x.ins + x.marlog, tax: taxes.value, ro: x.road + x.rar };
});
const share = (v: number) => (r.value.total > 0 ? v / r.value.total : 0);
const pct = (v: number) => (r.value.total > 0 ? Math.round(share(v) * 100) + "%" : "");
const sub = computed(() => (props.price > 0 && props.costs.cadEur > 0 ? fill(t.value.k.atRate, { v: fmt(r.value.total / props.costs.cadEur) }) : t.value.k.enterPrice));
const shipUsd = computed(() => props.costs.shipUsd + props.costs.fuelUsd);
</script>
<template>
  <section class="costhero glass tint">
    <h2 class="cap">{{ cap }}</h2>
    <p class="total">{{ fmt(r.total) }}<span class="cur" aria-hidden="true">€</span></p>
    <p class="sub">{{ sub }}<template v-if="extra"> · {{ extra }}</template></p>
    <dl class="facts">
      <div><dt>{{ t.k.overCar }}</dt><dd>+{{ eur(r.total - r.car) }}</dd></div>
      <div><dt>{{ t.k.taxes }}</dt><dd>{{ eur(taxes) }}</dd></div>
      <div><dt>{{ t.k.perK }}</dt><dd>−{{ eur(r.perK) }}</dd></div>
    </dl>
  </section>
  <section class="break glass deep">
    <h3 class="bh">{{ t.k.where }}</h3>
    <div class="stackbar" aria-hidden="true">
      <i :style="{ flexGrow: share(groups.car) }"></i><i :style="{ flexGrow: share(groups.ship) }"></i>
      <i :style="{ flexGrow: share(groups.tax) }"></i><i :style="{ flexGrow: share(groups.ro) }"></i>
    </div>
    <div class="groups">
      <section class="g"><h4 class="gh"><i class="gdot"></i><span>{{ t.k.gCar }}<em>{{ pct(groups.car) }}</em></span><b>{{ eur(r.car) }}</b><small>{{ t.k.gCarS }}</small></h4></section>
      <section class="g">
        <h4 class="gh"><i class="gdot"></i><span>{{ t.k.gShip }}<em>{{ pct(groups.ship) }}</em></span><b>{{ eur(groups.ship) }}</b><small>{{ t.k.gShipS }}</small></h4>
        <ul class="ln">
          <li><span>{{ t.costs.ship }}<template v-if="shipUsd > 0"> · {{ fmt(shipUsd) }} USD</template></span><b>{{ eur(r.ship) }}</b></li>
          <li><span>{{ t.costs.ins }} {{ fmt(costs.insPct, 2) }}%</span><b>{{ eur(r.ins) }}</b></li>
          <li><span>{{ t.costs.marlog }}</span><b>{{ eur(r.marlog) }}</b></li>
        </ul>
      </section>
      <section class="g">
        <h4 class="gh"><i class="gdot"></i><span>{{ t.k.gTax }}<em>{{ pct(groups.tax) }}</em></span><b>{{ eur(taxes) }}</b><small>{{ t.k.gTaxS }}</small></h4>
        <ul class="ln">
          <li v-if="gst"><span>{{ t.costs.gstL }}</span><b>{{ eur(r.gst) }}</b></li>
          <li><span>{{ t.costs.duty }} {{ fmt(costs.dutyPct, 2) }}%</span><b>{{ eur(r.duty) }}</b></li>
          <li><span>{{ t.costs.vat }} {{ fmt(costs.vatPct, 2) }}%</span><b>{{ eur(r.vat) }}</b></li>
        </ul>
        <p class="note">{{ t.k.cif.split("{v}")[0] }}<b>{{ eur(r.cif) }}</b>{{ t.k.cif.split("{v}")[1] }}</p>
      </section>
      <section class="g">
        <h4 class="gh"><i class="gdot"></i><span>{{ t.k.gRo }}<em>{{ pct(groups.ro) }}</em></span><b>{{ eur(groups.ro) }}</b><small>{{ t.k.gRoS }}</small></h4>
        <ul class="ln"><li><span>{{ t.costs.road }}</span><b>{{ eur(r.road) }}</b></li><li><span>{{ t.costs.rar }}</span><b>{{ eur(r.rar) }}</b></li></ul>
      </section>
    </div>
  </section>
</template>
