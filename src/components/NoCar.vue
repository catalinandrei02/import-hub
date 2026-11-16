<script setup lang="ts">
// Shown on per-car pages (Steps, Documents) when no car is chosen: explains why nothing can be ticked yet.
import { canWrite, state } from "../data/store";
import { t } from "../i18n";
import { ui } from "../ui";
defineProps<{ hint: string }>();
</script>
<template>
  <div class="glass empty">
    <p v-if="!state.cars.length" class="big">{{ t.noCars }}</p>
    <p v-else class="big">{{ hint }}</p>
    <button v-if="!state.cars.length && canWrite" class="btn primary" type="button" @click="ui.dialog = { kind: 'car', car: null }">+ {{ t.cars.add }}</button>
    <label v-else-if="state.cars.length" class="btn" for="pick">{{ t.c.pickCar }} ↓</label>
  </div>
</template>
