<script setup lang="ts">
import { computed, ref } from "vue";
import { canWrite, state } from "../data/store";
import NoCar from "../components/NoCar.vue";
import { carLabel } from "../lib/cars";
import { fmtDate } from "../lib/format";
import { tick } from "../lib/tick";
import { sellerOf, stepsFor, type Seller } from "../i18n/content";
import { fill, lang, t } from "../i18n";
import { ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CarPicker from "../components/CarPicker.vue";
import ProgressRing from "../components/ProgressRing.vue";
import SellerSwitch from "../components/SellerSwitch.vue";

const car = computed(() => state.cars.find(c => c._id === ui.selCar) || null);
// The car's seller type picks the list (dealer or private); with no car, a switch previews either.
const preview = ref<Seller>("dealer");
const seller = computed<Seller>(() => (car.value ? sellerOf(car.value) : preview.value));
const steps = computed(() => stepsFor(lang.value, seller.value));
const done = computed(() => steps.value.filter(s => car.value?.steps?.[s.key]).length);
const phases = computed(() => {
  const out: { name: string; items: typeof steps.value }[] = [];
  steps.value.forEach(s => { const p = out[out.length - 1]; if (!p || p.name !== s.phase) out.push({ name: s.phase, items: [s] }); else p.items.push(s); });
  return out;
});
const when = (key: string) => { const v = car.value?.steps?.[key]; return typeof v === "string" ? fill(t.value.proc.ticked, { d: fmtDate(v) }) : v ? t.value.proc.doneNoDate : ""; };
const next = computed(() => { const s = steps.value.find(x => !car.value?.steps?.[x.key]); return s ? t.value.proc.next + ": " + s.title : t.value.proc.allDone; });
</script>

<template>
  <HeroSection small :title="t.proc.h" :lead="t.proc.lead">
    <template #proof><span v-if="car"><b>{{ done }}</b> {{ fill(t.proc.of, { n: steps.length }) }} · {{ carLabel(car) }}</span><span v-else>{{ t.proc.pickHint }}</span></template>
  </HeroSection>
  <div class="content">
    <div class="main">
      <StatusBanner />
      <NoCar v-if="!car" :hint="t.proc.pickHint" />
      <section class="glass pad" style="display:grid;gap:24px">
        <SellerSwitch v-model="preview" :car="car" />
        <div v-for="p in phases" :key="p.name" class="group">
          <h2 class="label">{{ p.name }}</h2>
          <ol class="tl">
            <li v-for="st in p.items" :key="st.key" :class="{ done: !!car?.steps?.[st.key] }">
              <template v-if="car">
                <input :id="'st-' + st.i" class="node" type="checkbox" :data-step="st.key" :checked="!!car.steps?.[st.key]" :disabled="!canWrite"
                  @change="tick(car._id, 'steps', st.key, ($event.target as HTMLInputElement).checked)">
                <label :for="'st-' + st.i"><span class="st">{{ st.title }}</span><span class="sd">{{ st.desc }}</span>
                  <span class="chips"><span class="chip">{{ t.proc.who }}: {{ st.who }}</span><span class="chip">{{ t.proc.docs }}: {{ st.docs }}</span></span>
                  <span v-if="when(st.key)" class="when">{{ when(st.key) }}</span></label>
              </template>
              <template v-else>
                <span class="node" aria-hidden="true">{{ steps.indexOf(st) + 1 }}</span>
                <div class="bd"><span class="st">{{ st.title }}</span><span class="sd">{{ st.desc }}</span>
                  <span class="chips"><span class="chip">{{ t.proc.who }}: {{ st.who }}</span><span class="chip">{{ t.proc.docs }}: {{ st.docs }}</span></span></div>
              </template>
            </li>
          </ol>
        </div>
      </section>
    </div>
    <aside id="side" class="side">
      <CarPicker />
      <section class="glass pad" style="display:grid;gap:12px">
        <template v-if="car"><h3 class="label">{{ t.cars.progress }}</h3>
          <div class="ringrow"><ProgressRing :n="done" :total="steps.length" /><div><p class="big">{{ done }} {{ fill(t.proc.of, { n: steps.length }) }}</p><p class="note">{{ next }}</p></div></div></template>
        <p v-else class="note">{{ t.proc.pickHint }}</p>
      </section>
    </aside>
  </div>
</template>
