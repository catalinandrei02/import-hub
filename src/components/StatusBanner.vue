<script setup lang="ts">
// Connection / sign-in / loading / stale states for everything that reads shared data.
import { computed } from "vue";
import { t } from "../i18n";
import { signIn, state } from "../data/store";
import { copyText, toast } from "../ui";

const view = computed(() => {
  const L = t.value;
  if (state.auth === "none") return { warn: true, msg: L.auth.notConfigured };
  if (state.auth === "signedOut") return { warn: false, msg: L.auth.signedOut, signIn: true };
  if (state.auth === "denied") return { warn: true, msg: L.auth.noAccess, code: state.user?.uid };
  if (state.data === "loading") return { warn: false, msg: L.loading };
  if (state.data === "stale") return { warn: true, msg: L.stale };
  if (state.data === "off" && state.auth === "ok") return { warn: true, msg: L.dbOff };
  return null;
});
async function doSignIn() { try { await signIn(); } catch { toast(t.value.auth.error); } }
</script>

<template>
  <div v-if="view" class="banner glass" :class="{ warn: view.warn }" role="status">
    <span class="msg"><span>{{ view.msg }} <code v-if="view.code">{{ view.code }}</code></span></span>
    <button v-if="view.signIn" class="btn primary" type="button" @click="doSignIn">{{ t.auth.signIn }}</button>
    <button v-if="view.code" class="btn" type="button" @click="copyText(view.code!, t.c.copied)">{{ t.auth.copyCode }}</button>
  </div>
</template>
