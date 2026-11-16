<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ n: number; total: number }>();
const C = 2 * Math.PI * 32;
const f = computed(() => (props.total ? props.n / props.total : 0));
</script>
<template>
  <svg class="ring" viewBox="0 0 76 76" aria-hidden="true">
    <circle class="trk" cx="38" cy="38" r="32" />
    <circle class="val" cx="38" cy="38" r="32" :stroke-dasharray="C.toFixed(2)" :stroke-dashoffset="(C * (1 - f)).toFixed(2)" />
    <text x="38" y="44" text-anchor="middle">{{ Math.round(f * 100) }}%</text>
  </svg>
</template>
