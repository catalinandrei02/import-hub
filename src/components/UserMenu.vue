<script setup lang="ts">
import AIcon from "./AIcon.vue";
// Avatar button that opens a small account menu; signing out needs a second, explicit click.
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import { t } from "../i18n";
import { isAdmin, signOut, state } from "../data/store";
import { copyText } from "../ui";

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const btn = ref<HTMLButtonElement | null>(null);
const first = ref<HTMLButtonElement | null>(null);

function close(focus = false) { open.value = false; if (focus) btn.value?.focus(); }
function onDoc(e: MouseEvent) { if (root.value && !root.value.contains(e.target as Node)) close(); }
function onKey(e: KeyboardEvent) { if (e.key === "Escape") close(true); }
watch(open, o => {
  if (o) { document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey); nextTick(() => first.value?.focus()); }
  else { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); }
});
onBeforeUnmount(() => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); });
async function doSignOut() { close(); await signOut(); }
</script>

<template>
  <div v-if="state.user" ref="root" class="umenu">
    <button ref="btn" class="ubtn" type="button" aria-haspopup="menu" :aria-expanded="open" :aria-label="t.auth.account + ': ' + state.user.name" @click="open = !open">
      <span v-if="isAdmin && state.requests.length" class="udot" :aria-label="t.admin.reqH + ': ' + state.requests.length">{{ state.requests.length }}</span>
      <img v-if="state.user.photo" class="avatar" :src="state.user.photo" alt="" referrerpolicy="no-referrer" width="36" height="36">
      <AIcon v-else name="user" />
    </button>
    <div v-if="open" class="upop glass" role="menu">
      <p class="uname"><span>{{ state.user.name || t.auth.account }}</span><span class="urole" data-role="me">{{ isAdmin ? t.admin.admin : t.admin.member }}</span></p>
      <RouterLink v-if="isAdmin" class="uitem" to="/admin" role="menuitem" data-act="admin" @click="close()">{{ t.admin.menu }}<span v-if="state.requests.length" class="ucount">{{ state.requests.length }}</span></RouterLink>
      <button ref="first" class="uitem" type="button" role="menuitem" @click="copyText(state.user.uid, t.c.copied); close(true)">{{ t.auth.copyCode }}</button>
      <button class="uitem danger" type="button" role="menuitem" data-act="sign-out" @click="doSignOut">{{ t.auth.signOut }}</button>
    </div>
  </div>
</template>
