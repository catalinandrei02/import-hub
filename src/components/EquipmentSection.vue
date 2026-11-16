<script setup lang="ts">
// Equipment ("dotări") as read from the listing (CarGurus options or the dealer site's lists), plus CarGurus' history flags.
import { computed, ref } from "vue";
import type { Car } from "../data/types";
import { ACC_RE, CAM_RE } from "../lib/importer";
import { fill, t } from "../i18n";

const props = defineProps<{ car: Car }>();
const all = ref(false);
const list = computed(() => props.car.equipment || []);
const shown = computed(() => (all.value ? list.value : list.value.slice(0, 18)));
const key = (x: string) => ACC_RE.test(x) || CAM_RE.test(x);
const hist = computed(() => {
  const h = props.car.history; if (!h) return null;
  const bad = (["damaged", "accidents", "scrapped"] as const).filter(k => h[k]);
  const info = (["imported", "exported"] as const).filter(k => h[k]);
  return { bad, info, src: h.source || "" };
});
</script>

<template>
  <section class="glass pad equip" data-sec="equipment">
    <h3 class="label">{{ t.equip.h }}<template v-if="list.length"> · {{ list.length }}</template></h3>
    <p v-if="!list.length" class="note">{{ t.equip.none }}</p>
    <ul v-else class="eqlist"><li v-for="x in shown" :key="x" :class="{ key: key(x) }">{{ x }}</li></ul>
    <button v-if="list.length > 18" class="link" type="button" data-act="equip-all" @click="all = !all">{{ all ? t.equip.less : fill(t.equip.more, { n: list.length }) }}</button>
    <template v-if="hist">
      <h3 class="label">{{ fill(t.equip.hist, { s: hist.src }) }}</h3>
      <div class="chips">
        <span v-for="k in hist.bad" :key="k" class="chip bad">{{ t.equip[k] }}</span>
        <span v-for="k in hist.info" :key="k" class="chip warn">{{ t.equip[k] }}</span>
        <span v-if="!hist.bad.length && !hist.info.length" class="chip ok">{{ t.equip.clean }}</span>
      </div>
    </template>
  </section>
</template>
