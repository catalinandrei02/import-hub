<script setup lang="ts">
// Page hero: the photo as a tile in the same column as the page content (public/hero.jpg, or `photo`), the title
// bottom-left over a dark fade, so the car
// stays clear. Anything in the default slot (add a car, price, search…) goes in a bar right under the photo,
// introduced by `barTitle` / `barNote`. Our car drawing replaces the photo if it can't load.
import { ref, watch } from "vue";
import CarArt from "./CarArt.vue";
const props = defineProps<{ title: string; lead?: string; photo?: string; barTitle?: string; barNote?: string; small?: boolean }>();
const broken = ref(false);
const base = import.meta.env.BASE_URL;
watch(() => props.photo, () => (broken.value = false));
</script>

<template>
  <div class="h2-wrap">
  <section class="hero2" :class="{ nophoto: broken, small }" aria-labelledby="hero-h">
    <div class="h2-media" aria-hidden="true">
      <img v-if="photo && !broken" :src="photo" alt="" referrerpolicy="no-referrer" @error="broken = true">
      <img v-else-if="!broken" :src="base + 'hero.jpg'" :srcset="`${base}hero-1200.jpg 1200w, ${base}hero.jpg 1920w`" sizes="100vw" alt="" @error="broken = true">
      <CarArt v-else label="" />
    </div>
    <div class="h2-text">
      <p v-if="$slots.proof" class="proof"><slot name="proof" /></p>
      <h1 id="hero-h">{{ title }}</h1>
      <p v-if="lead" class="lead">{{ lead }}</p>
    </div>
  </section>
  <div v-if="$slots.default" class="h2-bar">
    <div class="h2-bar-in">
      <div v-if="barTitle" class="h2-bar-t"><h2>{{ barTitle }}</h2><p v-if="barNote">{{ barNote }}</p></div>
      <div class="h2-bar-c"><slot /></div>
    </div>
  </div>
  </div>
</template>
