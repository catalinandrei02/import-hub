<script setup lang="ts">
defineProps<{ title: string; lead: string }>();
</script>

<template>
  <section class="hero" aria-labelledby="hero-h">
    <div v-if="$slots.proof" class="proof pillglass"><slot name="proof" /></div>
    <h1 id="hero-h">{{ title }}</h1>
    <p class="lead">{{ lead }}</p>
    <slot />
  </section>
</template>
