<script setup lang="ts">
import FlagsLogo from "./FlagsLogo.vue";
import AIcon from "./AIcon.vue";
import { useRoute } from "vue-router";
import { SECTIONS } from "../router";
import { lang, t } from "../i18n";
import { canWrite, state } from "../data/store";
import { signInWithHelp } from "../lib/signin";
import { ui } from "../ui";
import UserMenu from "./UserMenu.vue";

const route = useRoute();
function addCar() { ui.dialog = { kind: "car", car: null }; }
const doSignIn = signInWithHelp;
</script>

<template>
  <header class="topbar">
    <div class="wrap head">
      <RouterLink class="brand" to="/cars">
        <FlagsLogo />
        <span class="brand-t">Import Hub</span>
      </RouterLink>
      <nav class="navrow" :aria-label="t.nav.main">
        <div class="tabs">
          <RouterLink v-for="s in SECTIONS" :key="s.key" :to="s.path" :data-tab="s.key" :class="{ on: route.path === s.path }"
            :aria-current="route.path === s.path ? 'page' : undefined">{{ (t.tabs as any)[s.key] }}</RouterLink>
        </div>
      </nav>
      <div class="hright">
        <label class="lang">
          <span class="sr-only">{{ t.langL }}</span>
          <select id="lang" v-model="lang"><option value="ro">RO</option><option value="en">EN</option><option value="fr">FR</option></select>
          <AIcon name="arrow-down" :size="20" />
        </label>
        <button v-if="state.auth === 'signedOut'" class="cta" type="button" @click="doSignIn">{{ t.auth.signIn }}</button>
        <template v-else>
          <button class="cta hide-sm" type="button" data-act="add-car" :disabled="!canWrite" @click="addCar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" /></svg>
            <span>{{ t.cars.add }}</span>
          </button>
          <UserMenu v-if="state.auth !== 'none'" />
        </template>
      </div>
    </div>
  </header>
</template>
