<script setup lang="ts">
// Neutral SUV side profile for inventory cards (original drawing, no brand styling).
defineProps<{ label: string }>();
</script>
<template>
  <svg class="carart" viewBox="0 0 320 120" role="img" :aria-label="label">
    <path class="body" d="M22 86c0-9 4-15 13-17l38-8c12-14 30-26 52-28 30-2 62-1 88 4 20 4 37 14 50 27l20 4c11 2 17 9 17 18v8c0 4-3 6-6 6h-22a28 28 0 0 0-55 0H118a28 28 0 0 0-55 0H30c-5 0-8-3-8-7v-7z" />
    <path class="win" d="M86 61c11-12 25-20 41-21 26-2 54-1 77 3 15 3 28 9 39 18H86z" />
    <path class="line" d="M163 40v21M40 78h244" />
    <circle class="tyre" cx="90" cy="96" r="22" /><circle class="rim" cx="90" cy="96" r="12" />
    <circle class="tyre" cx="246" cy="96" r="22" /><circle class="rim" cx="246" cy="96" r="12" />
  </svg>
</template>
