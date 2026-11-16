<script setup lang="ts">
import { computed, reactive } from "vue";
import { state } from "../data/store";
import { fillTemplate, templateValues } from "../lib/templates";
import { TPL } from "../i18n/content";
import { fill, lang, t } from "../i18n";
import { copyText, ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import CarPicker from "../components/CarPicker.vue";

const car = computed(() => state.cars.find(c => c._id === ui.selCar) || null);
const tl = reactive<Record<string, "fr" | "en">>({});
const rendered = computed(() => TPL.map(x => {
  const same = x.fr === x.en, l = same ? "en" : tl[x.id] || (lang.value === "fr" ? "fr" : "en");
  return { x, same, l, ...fillTemplate(x[l], templateValues(car.value, l)) };
}));
const missing = computed(() => {
  const c = car.value, F = t.value.f; if (!c) return [];
  return ([["year", F.year], ["vin", F.vin], ["stock", F.stock], ["price", F.price], ["contact", F.contact]] as const).filter(([k]) => !c[k]).map(([, l]) => l);
});
</script>

<template>
  <HeroSection :title="t.tpl.h" :lead="t.tpl.lead">
    <template #proof><span class="dot" aria-hidden="true"></span><span>{{ fill(t.chip.tpl, { n: TPL.length }) }}</span></template>
  </HeroSection>
  <div class="content">
    <div class="main">
      <div class="cols">
        <section v-for="r in rendered" :key="r.x.id" class="glass card tpl">
          <div class="spread"><h3>{{ r.x.l[lang] }}</h3>
            <span v-if="r.same" class="chip">EN</span>
            <div v-else class="seg sm" role="group" aria-label="FR / EN">
              <button type="button" :data-tpl="r.x.id" data-tl="fr" :aria-pressed="r.l === 'fr'" @click="tl[r.x.id] = 'fr'">FR</button>
              <button type="button" :data-tpl="r.x.id" data-tl="en" :aria-pressed="r.l === 'en'" @click="tl[r.x.id] = 'en'">EN</button>
            </div></div>
          <pre :id="'tpl-' + r.x.id"><template v-for="(p, i) in r.parts" :key="i"><b v-if="p.kind === 'filled'">{{ p.text }}</b><mark v-else-if="p.kind === 'missing'">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template></pre>
          <div><button class="btn" type="button" :data-copytpl="r.x.id" @click="copyText(r.plain, t.tpl.copied)">{{ t.tpl.copy }}</button></div>
        </section>
      </div>
    </div>
    <aside id="side" class="side">
      <CarPicker />
      <section class="glass pad" style="display:grid;gap:10px">
        <p v-if="!car" class="note">{{ t.tpl.noCar }}</p>
        <template v-else-if="missing.length">
          <h3 class="label">{{ t.tpl.missing }}</h3>
          <div class="chips"><span v-for="m in missing" :key="m" class="chip warn">{{ m }}</span></div>
          <p class="note">{{ t.tpl.missingHint }}</p>
          <div><button class="btn" type="button" @click="ui.dialog = { kind: 'car', car }">{{ t.cars.edit }}</button></div>
        </template>
        <template v-else><h3 class="label">{{ t.tpl.filled }}</h3><p class="note">{{ t.tpl.allFilled }}</p></template>
      </section>
    </aside>
  </div>
</template>
