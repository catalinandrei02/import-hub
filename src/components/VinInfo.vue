<script setup lang="ts">
import { computed } from "vue";
import { decodeVin } from "../lib/vin";
import { t } from "../i18n";
const props = defineProps<{ vin?: string; center?: boolean }>();
const d = computed(() => decodeVin(props.vin));
</script>
<template>
  <div v-if="vin" class="vin-out" :style="center ? 'justify-items:center;text-align:center' : ''">
    <div class="chips" :style="center ? 'justify-content:center' : ''">
      <span v-if="d.err" class="chip warn">{{ t.vin.bad }}</span>
      <template v-else>
        <span class="chip info">{{ t.vin.trim }}: {{ d.trim }}</span><span class="chip">{{ t.vin.year }}: {{ d.year }}</span>
        <span v-if="!d.isQ5" class="chip warn wrap">{{ t.vin.notq5 }}</span><span v-if="d.phev" class="chip warn wrap">{{ t.vin.phev }}</span>
      </template>
    </div>
    <p v-if="!d.err" class="note">{{ t.vin.hint }}</p>
  </div>
</template>
