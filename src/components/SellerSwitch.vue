<script setup lang="ts">
// Which list applies: from the selected car's seller type, or a Dealer / Private preview switch when no car is picked.
import type { Car } from "../data/types";
import { sellerOf, type Seller } from "../i18n/content";
import { t } from "../i18n";
import { ui } from "../ui";
defineProps<{ car: Car | null }>();
const model = defineModel<Seller>({ required: true });
</script>

<template>
  <div class="sellersw">
    <template v-if="car">
      <span class="note">{{ t.f.sellerType }}: <b>{{ sellerOf(car) === "private" ? t.f.private : t.f.dealer }}</b> · {{ t.procx.forSeller }}</span>
      <button class="link" type="button" data-act="edit-seller" @click="ui.dialog = { kind: 'car', car }">{{ t.cars.edit }}</button>
    </template>
    <template v-else>
      <span class="note">{{ t.procx.previewFor }}</span>
      <div class="seg" role="group" :aria-label="t.f.sellerType">
        <button v-for="s in (['dealer', 'private'] as const)" :key="s" type="button" :data-seller="s" :aria-pressed="model === s" @click="model = s">{{ s === "private" ? t.f.private : t.f.dealer }}</button>
      </div>
    </template>
  </div>
</template>
