<script setup lang="ts">
// Equipment ("dotări") as read from the listing (CarGurus options or the dealer site's lists).
import { computed, ref } from "vue";
import type { Car } from "../data/types";
import { ACC_RE, CAM_RE } from "../lib/importer";
import { fill, t } from "../i18n";

const props = defineProps<{ car: Car }>();
const all = ref(false);
const list = computed(() => props.car.equipment || []);
const shown = computed(() => (all.value ? list.value : list.value.slice(0, 18)));
const key = (x: string) => ACC_RE.test(x) || CAM_RE.test(x);
</script>

<template>
  <section class="glass pad equip" data-sec="equipment">
    <h3 class="label">{{ t.equip.h }}<template v-if="list.length"> · {{ list.length }}</template></h3>
    <p v-if="!list.length" class="note">{{ t.equip.none }}</p>
    <ul v-else class="eqlist"><li v-for="x in shown" :key="x" :class="{ key: key(x) }">{{ x }}</li></ul>
    <button v-if="list.length > 18" class="link" type="button" data-act="equip-all" @click="all = !all">{{ all ? t.equip.less : fill(t.equip.more, { n: list.length }) }}</button>
  </section>
</template>
