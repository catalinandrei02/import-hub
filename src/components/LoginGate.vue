<script setup lang="ts">
// Login screen: the whole site is shown only to signed-in family members (uid in members/{uid}).
// Everyone else sees this page: sign in, "checking", "no access" with the code to send the owner, or "not connected".
// The real protection is firestore.rules; this screen keeps the site itself private-looking too.
import { computed } from "vue";
import { lang, t } from "../i18n";
import { signOut, state } from "../data/store";
import { signInWithHelp } from "../lib/signin";
import { copyText } from "../ui";
import FlagsLogo from "./FlagsLogo.vue";

const mode = computed(() => (state.auth === "none" ? "none" : state.auth === "denied" ? "denied" : state.auth === "signedOut" ? "signedOut" : "checking"));
const base = import.meta.env.BASE_URL;
async function other() { await signOut(); await signInWithHelp(); }
</script>

<template>
  <main id="main" class="gate" :data-mode="mode">
    <section class="gate-in" aria-labelledby="gate-h">
      <div class="gate-top">
        <span class="brand"><FlagsLogo /><span class="brand-t">Import Hub</span></span>
        <label class="lang"><span class="sr-only">{{ t.langL }}</span>
          <select id="gate-lang" v-model="lang"><option value="ro">RO</option><option value="en">EN</option><option value="fr">FR</option></select></label>
      </div>
      <div class="gate-body">
        <p class="proof">{{ t.gate.private }}</p>
        <h1 id="gate-h">Import Hub</h1>
        <p class="lead">{{ t.gate.lead }}</p>
        <div class="gate-act" role="status" aria-live="polite">
          <p v-if="mode === 'checking'" class="lead">{{ t.gate.checking }}</p>
          <p v-else-if="mode === 'none'" class="lead">{{ t.gate.none }}</p>
          <button v-else-if="mode === 'signedOut'" class="cta gate-btn" type="button" data-act="sign-in" @click="signInWithHelp">{{ t.auth.signIn }}</button>
          <template v-else>
            <p v-if="state.requestSent" class="lead gate-sent">{{ t.gate.sent }}</p>
            <p class="lead">{{ t.auth.noAccess }}</p>
            <p><code class="gate-code">{{ state.user?.uid }}</code></p>
            <div class="gate-row">
              <button class="cta gate-btn" type="button" @click="copyText(state.user?.uid || '', t.c.copied)">{{ t.auth.copyCode }}</button>
              <button class="btn gate-ghost" type="button" @click="other">{{ t.gate.other }}</button>
              <button class="btn gate-ghost" type="button" @click="signOut">{{ t.auth.signOut }}</button>
            </div>
          </template>
        </div>
      </div>
    </section>
    <div class="gate-art" aria-hidden="true">
      <img :src="base + 'hero.jpg'" :srcset="`${base}hero-1200.jpg 1200w, ${base}hero.jpg 2400w`" sizes="(min-width: 62rem) 55vw, 100vw" alt="">
    </div>
  </main>
</template>
