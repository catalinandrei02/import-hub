<script setup lang="ts">
import { useRoute } from "vue-router";
import { SECTIONS } from "../router";
import { lang, t } from "../i18n";
import { canWrite, signOut, state } from "../data/store";
import { signInWithHelp } from "../lib/signin";
import { ui } from "../ui";

const route = useRoute();
function addCar() { ui.dialog = { kind: "car", car: null }; }
const doSignIn = signInWithHelp;
</script>

<template>
  <header class="head wrap">
    <RouterLink class="brand" to="/cars" aria-label="Import Hub">
      <svg class="logo" viewBox="0 0 96 40" fill="none" aria-hidden="true">
        <path d="M2 30C26 27 50 19 74 5" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" />
        <path d="M18 36c20-1 42-6 62-17l-9 15c8-2 13-4 22-9" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p><b>Import Hub</b> {{ t.brand.line1 }}<br>{{ t.brand.line2 }}</p>
    </RouterLink>
    <div class="hright">
      <label class="lang">
        <span class="sr-only">{{ t.langL }}</span>
        <select id="lang" v-model="lang">
          <option value="ro">RO</option><option value="en">EN</option><option value="fr">FR</option>
        </select>
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </label>
      <button v-if="state.auth === 'signedOut'" class="cta" type="button" @click="doSignIn">{{ t.auth.signIn }}</button>
      <template v-else>
        <button class="cta hide-sm" type="button" data-act="add-car" :disabled="!canWrite" @click="addCar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg>
          <span>{{ t.cars.add }}</span>
        </button>
        <button v-if="state.user && state.auth !== 'none'" class="btn" type="button" :title="state.user.name" @click="signOut()">
          <img v-if="state.user.photo" class="avatar" :src="state.user.photo" alt="" referrerpolicy="no-referrer" width="36" height="36">
          <span class="sr-only">{{ t.auth.signOut }}</span><span v-if="!state.user.photo">{{ t.auth.signOut }}</span>
        </button>
      </template>
    </div>
  </header>
  <nav class="navrow" :aria-label="t.nav.main">
      <div class="tabs pillglass">
        <RouterLink v-for="s in SECTIONS" :key="s.key" :to="s.path" :data-tab="s.key" :class="{ on: route.path === s.path }"
          :aria-current="route.path === s.path ? 'page' : undefined">{{ (t.tabs as any)[s.key] }}</RouterLink>
      </div>
  </nav>
</template>
