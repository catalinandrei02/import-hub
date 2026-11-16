<script setup lang="ts">
import { computed } from "vue";
import type { Car } from "../data/types";
import { state } from "../data/store";
import { carGst, carLanded } from "../lib/costs";
import { carName, carTrim } from "../lib/cars";
import { cad, eur, fmt } from "../lib/format";
import { t } from "../i18n";

const props = defineProps<{ cars: Car[] }>();
const lcs = computed(() => props.cars.map(c => carLanded(c, state.costs)));
const min = (v: (number | null | undefined)[]) => { const x = v.filter((n): n is number => n != null && n > 0); return x.length > 1 ? Math.min(...x) : null; };
const best = computed(() => ({ price: min(props.cars.map(c => c.price)), km: min(props.cars.map(c => c.km)), landed: min(lcs.value.map(r => r?.total)) }));
const yn = (v?: string) => (v === "yes" ? t.value.cars.yes : v === "no" ? t.value.cars.no : t.value.cars.unknown);
</script>
<template>
  <section class="cmp glass deep">
    <h2 class="label">{{ t.cars.compareH }}</h2>
    <div class="scroll">
      <table>
        <thead><tr><td></td><th v-for="c in cars" :key="c._id" scope="col">{{ carName(c) }} {{ carTrim(c) }}<div class="note">{{ c.seller }}</div></th></tr></thead>
        <tbody>
          <tr><th scope="row">{{ t.cars.price }}</th><td v-for="c in cars" :key="c._id" :class="{ best: c.price && c.price === best.price }">{{ c.price ? cad(c.price) : "—" }}</td></tr>
          <tr><th scope="row">{{ t.cars.km }}</th><td v-for="c in cars" :key="c._id" :class="{ best: c.km && c.km === best.km }">{{ c.km ? fmt(c.km) : "—" }}</td></tr>
          <tr><th scope="row">{{ t.f.year }}</th><td v-for="c in cars" :key="c._id">{{ c.year || "—" }}</td></tr>
          <tr><th scope="row">{{ t.f.trim }}</th><td v-for="c in cars" :key="c._id">{{ carTrim(c) || "—" }}</td></tr>
          <tr><th scope="row">{{ t.f.acc }}</th><td v-for="c in cars" :key="c._id">{{ yn(c.acc) }}</td></tr>
          <tr><th scope="row">{{ t.f.cam }}</th><td v-for="c in cars" :key="c._id">{{ yn(c.cam) }}</td></tr>
          <tr><th scope="row">{{ t.f.flags }}</th><td v-for="c in cars" :key="c._id"><div v-if="c.flags?.length" class="chips"><span v-for="f in c.flags" :key="f" class="chip">{{ (t.f.flagList as any)[f] || f }}</span></div><template v-else>{{ t.cars.none }}</template></td></tr>
          <tr><th scope="row">{{ t.cars.gstRow }}</th><td v-for="c in cars" :key="c._id">{{ carGst(c) ? t.cars.yes : t.cars.no }}</td></tr>
          <tr><th scope="row">{{ t.cars.landed }}</th><td v-for="(c, i) in cars" :key="c._id" :class="{ best: lcs[i] && lcs[i]!.total === best.landed }">{{ lcs[i] ? eur(lcs[i]!.total) : "—" }}</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
