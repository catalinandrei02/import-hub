<script setup lang="ts">
import { computed } from "vue";
import { canWrite, state } from "../data/store";
import NoCar from "../components/NoCar.vue";
import { carLabel, countDone } from "../lib/cars";
import { fmtDate } from "../lib/format";
import { tick } from "../lib/tick";
import { DOCS } from "../i18n/content";
import { fill, lang, t } from "../i18n";
import { ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CarPicker from "../components/CarPicker.vue";
import ProgressRing from "../components/ProgressRing.vue";

const car = computed(() => state.cars.find(c => c._id === ui.selCar) || null);
const keys = computed(() => DOCS[lang.value].flatMap((g, gi) => g[1].map((_, i) => `d${gi}_${i}`)));
const done = computed(() => countDone(car.value?.docs, keys.value));
</script>

<template>
  <HeroSection :title="t.docs.h" :lead="t.docs.lead">
    <template #proof><span v-if="car"><b>{{ done }}</b> {{ fill(t.docs.of, { n: keys.length }) }} · {{ carLabel(car) }}</span><span v-else>{{ t.docs.pickHint }}</span></template>
  </HeroSection>
  <div class="content">
    <div class="main">
      <StatusBanner />
      <NoCar v-if="!car" :hint="t.docs.pickHint" />
      <div class="cols">
        <section v-for="(g, gi) in DOCS[lang]" :key="g[0]" class="glass card">
          <h3>{{ g[0] }}</h3>
          <ul class="checks">
            <template v-for="(x, i) in g[1]" :key="i">
              <li v-if="car"><input :id="`dc-d${gi}_${i}`" class="box" type="checkbox" :data-doc="`d${gi}_${i}`" :checked="!!car.docs?.[`d${gi}_${i}`]" :disabled="!canWrite"
                  @change="tick(car._id, 'docs', `d${gi}_${i}`, ($event.target as HTMLInputElement).checked)">
                <label :for="`dc-d${gi}_${i}`">{{ x }}<small v-if="typeof car.docs?.[`d${gi}_${i}`] === 'string'">{{ fill(t.proc.ticked, { d: fmtDate(car.docs![`d${gi}_${i}`]) }) }}</small></label></li>
              <li v-else class="plain"><span>{{ x }}</span></li>
            </template>
          </ul>
        </section>
      </div>
    </div>
    <aside id="side" class="side">
      <CarPicker />
      <section class="glass pad" style="display:grid;gap:12px">
        <template v-if="car"><h3 class="label">{{ t.docs.have }}</h3><div class="ringrow"><ProgressRing :n="done" :total="keys.length" /><p class="big">{{ done }} {{ fill(t.docs.of, { n: keys.length }) }}</p></div></template>
        <p v-else class="note">{{ t.docs.pickHint }}</p>
      </section>
    </aside>
  </div>
</template>
