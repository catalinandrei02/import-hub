<script setup lang="ts">
// Hero as an asymmetric split: a solid text block and a full-bleed tile with the car drawing.
import CarArt from "./CarArt.vue";
defineProps<{ title: string; lead: string }>();
</script>

<template>
  <section class="hero" aria-labelledby="hero-h">
    <div class="hero-in">
      <p v-if="$slots.proof" class="proof"><slot name="proof" /></p>
      <h1 id="hero-h">{{ title }}</h1>
      <p class="lead">{{ lead }}</p>
      <slot />
    </div>
    <div class="hero-art" aria-hidden="true"><CarArt label="" /></div>
  </section>
</template>
