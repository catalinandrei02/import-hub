<script setup lang="ts">
import { computed, ref } from "vue";
import { canWrite, state } from "../data/store";
import NoCar from "../components/NoCar.vue";
import { carLabel, countDone } from "../lib/cars";
import { fmtDate } from "../lib/format";
import { tick } from "../lib/tick";
import { docsFor, sellerOf, type Seller } from "../i18n/content";
import SellerSwitch from "../components/SellerSwitch.vue";
import { fill, lang, t } from "../i18n";
import { ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CarPicker from "../components/CarPicker.vue";
import ProgressRing from "../components/ProgressRing.vue";

const car = computed(() => state.cars.find(c => c._id === ui.selCar) || null);
const preview = ref<Seller>("dealer");
const groups = computed(() => docsFor(lang.value, car.value ? sellerOf(car.value) : preview.value));
const keys = computed(() => groups.value.flatMap(g => g.items.map(x => x.key)));
const have = (k: string) => !!car.value?.docs?.[k];
const gDone = (g: { items: { key: string }[] }) => g.items.filter(x => have(x.key)).length;
const missing = computed(() => groups.value.flatMap(g => g.items.filter(x => !have(x.key)).map(x => ({ ...x, g: g.title }))).slice(0, 3));
const done = computed(() => countDone(car.value?.docs, keys.value));
</script>

<template>
  <HeroSection small :title="t.docs.h" :lead="t.docs.lead">
    <template #proof><span v-if="car"><b>{{ done }}</b> {{ fill(t.docs.of, { n: keys.length }) }} · {{ carLabel(car) }}</span><span v-else>{{ t.docs.pickHint }}</span></template>
  </HeroSection>
  <div class="content">
    <div class="main">
      <StatusBanner />
      <NoCar v-if="!car" :hint="t.docs.pickHint" />
      <section class="glass pad docs-top">
        <SellerSwitch v-model="preview" :car="car" />
        <div v-if="car" class="docs-sum">
          <ProgressRing :n="done" :total="keys.length" />
          <div><p class="big">{{ done }} {{ fill(t.docs.of, { n: keys.length }) }}</p>
            <p v-if="missing.length" class="note">{{ t.docsx.missing }}: {{ missing.map(m => m.text).join(" · ") }}</p>
            <p v-else class="note">{{ t.docsx.allHere }}</p></div>
        </div>
      </section>
      <div class="docgrid">
        <section v-for="g in groups" :key="g.gi" class="glass docgroup" :data-group="g.gi">
          <header>
            <h3>{{ g.title }}</h3>
            <span v-if="car" class="dg-count">{{ gDone(g) }} / {{ g.items.length }}</span>
          </header>
          <div v-if="car" class="dg-bar"><span :style="{ width: (gDone(g) / g.items.length) * 100 + '%' }"></span></div>
          <ul class="docrows">
            <li v-for="x in g.items" :key="x.key" :class="{ on: have(x.key) }">
              <template v-if="car">
                <input :id="'dc-' + x.key" type="checkbox" :data-doc="x.key" :checked="have(x.key)" :disabled="!canWrite"
                  @change="tick(car._id, 'docs', x.key, ($event.target as HTMLInputElement).checked)">
                <label :for="'dc-' + x.key"><span>{{ x.text }}</span>
                  <small v-if="typeof car.docs?.[x.key] === 'string'">{{ fill(t.proc.ticked, { d: fmtDate(car.docs![x.key]) }) }}</small></label>
              </template>
              <span v-else class="plain">{{ x.text }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
    <aside id="side" class="side">
      <CarPicker />
    </aside>
  </div>
</template>
