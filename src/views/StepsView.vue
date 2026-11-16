<script setup lang="ts">
import { computed } from "vue";
import { canWrite, state } from "../data/store";
import NoCar from "../components/NoCar.vue";
import { carLabel } from "../lib/cars";
import { fmtDate } from "../lib/format";
import { tick } from "../lib/tick";
import { STEPS } from "../i18n/content";
import { fill, lang, t } from "../i18n";
import { ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CarPicker from "../components/CarPicker.vue";
import ProgressRing from "../components/ProgressRing.vue";

const car = computed(() => state.cars.find(c => c._id === ui.selCar) || null);
const steps = computed(() => STEPS[lang.value]);
const done = computed(() => steps.value.filter((_, i) => car.value?.steps?.["s" + i]).length);
const phases = computed(() => {
  const out: { name: string; items: number[] }[] = [];
  steps.value.forEach((s, i) => { const p = out[out.length - 1]; if (!p || p.name !== s[0]) out.push({ name: s[0], items: [i] }); else p.items.push(i); });
  return out;
});
const when = (i: number) => { const v = car.value?.steps?.["s" + i]; return typeof v === "string" ? fill(t.value.proc.ticked, { d: fmtDate(v) }) : v ? t.value.proc.doneNoDate : ""; };
const next = computed(() => { const i = steps.value.findIndex((_, k) => !car.value?.steps?.["s" + k]); return i < 0 ? t.value.proc.allDone : t.value.proc.next + ": " + steps.value[i][1]; });
</script>

<template>
  <HeroSection :title="t.proc.h" :lead="t.proc.lead">
    <template #proof><span class="dot" aria-hidden="true"></span>
      <span v-if="car"><b>{{ done }}</b> {{ fill(t.proc.of, { n: steps.length }) }} · {{ carLabel(car) }}</span><span v-else>{{ t.proc.pickHint }}</span></template>
  </HeroSection>
  <div class="content">
    <div class="main">
      <StatusBanner />
      <NoCar v-if="!car" :hint="t.proc.pickHint" />
      <section class="glass pad" style="display:grid;gap:24px">
        <div v-for="p in phases" :key="p.name" class="group">
          <h2 class="label">{{ p.name }}</h2>
          <ol class="tl">
            <li v-for="i in p.items" :key="i" :class="{ done: !!car?.steps?.['s' + i] }">
              <template v-if="car">
                <input :id="'st-' + i" class="node" type="checkbox" :data-step="'s' + i" :checked="!!car.steps?.['s' + i]" :disabled="!canWrite"
                  @change="tick(car._id, 'steps', 's' + i, ($event.target as HTMLInputElement).checked)">
                <label :for="'st-' + i"><span class="st">{{ steps[i][1] }}</span><span class="sd">{{ steps[i][2] }}</span>
                  <span class="chips"><span class="chip">{{ t.proc.who }}: {{ steps[i][3] }}</span><span class="chip">{{ t.proc.docs }}: {{ steps[i][4] }}</span></span>
                  <span v-if="when(i)" class="when">{{ when(i) }}</span></label>
              </template>
              <template v-else>
                <span class="node" aria-hidden="true">{{ i + 1 }}</span>
                <div class="bd"><span class="st">{{ steps[i][1] }}</span><span class="sd">{{ steps[i][2] }}</span>
                  <span class="chips"><span class="chip">{{ t.proc.who }}: {{ steps[i][3] }}</span><span class="chip">{{ t.proc.docs }}: {{ steps[i][4] }}</span></span></div>
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
