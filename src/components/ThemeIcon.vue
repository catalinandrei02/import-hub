<script setup lang="ts">
// Our own small sun / moon / half-circle icons (Audi Icons has no theme icons). Drawn with currentColor.
defineProps<{ mode: "auto" | "light" | "dark"; size?: number }>();
</script>

<template>
  <svg :width="size || 22" :height="size || 22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
    <template v-if="mode === 'light'"><circle cx="12" cy="12" r="4.5" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke-linecap="square" /></template>
    <path v-else-if="mode === 'dark'" d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" stroke-linejoin="miter" />
    <template v-else><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" /></template>
  </svg>
</template>
