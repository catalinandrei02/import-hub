<script setup lang="ts">
defineProps<{ title: string; lead: string }>();
</script>

<template>
  <section class="hero" aria-labelledby="hero-h">
    <div class="wrap hero-in">
      <p v-if="$slots.proof" class="proof"><slot name="proof" /></p>
      <h1 id="hero-h">{{ title }}</h1>
      <p class="lead">{{ lead }}</p>
      <slot />
    </div>
  </section>
</template>
