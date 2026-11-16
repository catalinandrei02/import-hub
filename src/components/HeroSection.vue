<script setup lang="ts">
import RouteArt from "./RouteArt.vue";
defineProps<{ title: string; lead: string; tall?: boolean }>();
</script>

<template>
  <section class="hero" :class="{ tall }" aria-labelledby="hero-h">
    <RouteArt />
    <div class="wrap hero-in">
      <p v-if="$slots.proof" class="proof"><slot name="proof" /></p>
      <h1 id="hero-h">{{ title }}</h1>
      <p class="lead">{{ lead }}</p>
      <slot />
    </div>
  </section>
</template>
