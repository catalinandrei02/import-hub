<script setup lang="ts">
import { computed } from "vue";
import { state } from "../data/store";
import { carLabel, sortCars } from "../lib/cars";
import { ui } from "../ui";
import { t } from "../i18n";
const opts = computed(() => state.cars.filter(c => c.status !== "dropped" || c._id === ui.selCar).slice().sort(sortCars));
</script>
<template>
  <section class="glass pad picker">
    <label class="label" for="pick">{{ t.c.pickCar }}</label>
    <div class="inp"><select id="pick" v-model="ui.selCar"><option value="">{{ t.proc.none }}</option>
      <option v-for="c in opts" :key="c._id" :value="c._id">{{ carLabel(c) }}</option></select><span class="u" aria-hidden="true">▾</span></div>
  </section>
</template>
