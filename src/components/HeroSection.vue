<script setup lang="ts">
// Hero as an asymmetric split: a solid text block and a full-bleed tile with a photo of one of the family's cars
// (members only, from its listing) or, without one, our own car drawing.
import { ref, watch } from "vue";
import CarArt from "./CarArt.vue";
const props = defineProps<{ title: string; lead: string; photo?: string }>();
const broken = ref(false);
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
    <div class="hero-art" :class="{ hasphoto: photo && !broken }" aria-hidden="true">
      <img v-if="photo && !broken" :src="photo" alt="" referrerpolicy="no-referrer" @error="broken = true">
      <CarArt v-else label="" />
    </div>
  </section>
</template>
