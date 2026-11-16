<script setup lang="ts">
// Hero as an asymmetric split: a solid text block and a full-bleed photo tile (public/hero.jpg, or a `photo` if given;
// our own car drawing if the image can't load).
import { ref, watch } from "vue";
import CarArt from "./CarArt.vue";
const props = defineProps<{ title: string; lead: string; photo?: string }>();
const broken = ref(false);
const base = import.meta.env.BASE_URL;
watch(() => props.photo, () => (broken.value = false));
</script>

<template>
  <section class="hero" aria-labelledby="hero-h">
    <div class="hero-in">
      <p v-if="$slots.proof" class="proof"><slot name="proof" /></p>
      <h1 id="hero-h">{{ title }}</h1>
      <p class="lead">{{ lead }}</p>
      <slot />
    </div>
    <div class="hero-art" :class="{ hasphoto: !broken }" aria-hidden="true">
      <img v-if="photo && !broken" :src="photo" alt="" referrerpolicy="no-referrer" @error="broken = true">
      <img v-else-if="!broken" class="stock" :src="base + 'hero.jpg'" :srcset="`${base}hero-1200.jpg 1200w, ${base}hero.jpg 2400w`" sizes="(min-width: 62rem) 60vw, 100vw" alt="" @error="broken = true">
      <CarArt v-else label="" />
    </div>
  </section>
</template>
