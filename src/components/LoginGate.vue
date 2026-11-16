<script setup lang="ts">
// Login screen: the whole site is shown only to signed-in family members (uid in members/{uid}).
// Everyone else sees this page: sign in, "checking", "no access" with the code to send the owner, or "not connected".
// The real protection is firestore.rules; this screen keeps the site itself private-looking too.
import { computed } from "vue";
import { lang, t } from "../i18n";
import { ref } from "vue";
import { resetPassword, signInEmail, signOut, signUpEmail, state } from "../data/store";
import { emailError, signInWithHelp } from "../lib/signin";
import { copyText } from "../ui";
import FlagsLogo from "./FlagsLogo.vue";

const mode = computed(() => (state.auth === "none" ? "none" : state.auth === "denied" ? "denied" : state.auth === "signedOut" ? "signedOut" : "checking"));
const base = import.meta.env.BASE_URL;
// Email accounts: same approval flow as Google (a request goes to the admins). The email is never stored in the db.
const tab = ref<"in" | "up">("in");
const name = ref(""), email = ref(""), pass = ref(""), msg = ref(""), msgOk = ref(false), busy = ref(false);
async function submit() {
  msg.value = ""; msgOk.value = false;
  if (tab.value === "up" && !name.value.trim()) { msg.value = t.value.gate.needName; return; }
  busy.value = true;
  try { if (tab.value === "in") await signInEmail(email.value, pass.value); else await signUpEmail(email.value, pass.value, name.value); pass.value = ""; }
  catch (e) { msg.value = emailError(e); } finally { busy.value = false; }
}
async function forgot() {
  msg.value = ""; busy.value = true;
  try { await resetPassword(email.value); msg.value = t.value.gate.resetSent; msgOk.value = true; }
  catch (e: any) { if (e?.code === "auth/user-not-found") { msg.value = t.value.gate.resetSent; msgOk.value = true; } else msg.value = emailError(e); } finally { busy.value = false; }
}
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
          <template v-else-if="mode === 'signedOut'">
            <button class="cta gate-btn" type="button" data-act="sign-in" @click="signInWithHelp">{{ t.auth.signIn }}</button>
            <p class="gate-or"><span>{{ t.gate.or }}</span></p>
            <div class="gate-tabs" role="tablist">
              <button v-for="m in (['in', 'up'] as const)" :key="m" type="button" role="tab" :aria-selected="tab === m" :data-tab="m" @click="tab = m; msg = ''">{{ m === "in" ? t.gate.tabIn : t.gate.tabUp }}</button>
            </div>
            <form class="gate-form" novalidate @submit.prevent="submit">
              <label v-if="tab === 'up'"><span>{{ t.gate.name }}</span><input id="g-name" v-model="name" autocomplete="given-name" maxlength="30"></label>
              <label><span>{{ t.gate.email }}</span><input id="g-email" v-model="email" type="email" autocomplete="email" inputmode="email" spellcheck="false"></label>
              <label><span>{{ t.gate.pass }}</span><input id="g-pass" v-model="pass" type="password" :autocomplete="tab === 'up' ? 'new-password' : 'current-password'"><small v-if="tab === 'up'">{{ t.gate.passH }}</small></label>
              <p v-if="msg" class="gate-msg" :class="{ ok: msgOk }" role="alert">{{ msg }}</p>
              <div class="gate-row">
                <button class="cta gate-btn" type="submit" data-act="email-submit" :disabled="busy">{{ tab === "in" ? t.gate.submitIn : t.gate.submitUp }}</button>
                <button v-if="tab === 'in'" class="btn gate-ghost" type="button" data-act="forgot" :disabled="busy" @click="forgot">{{ t.gate.forgot }}</button>
              </div>
              <p v-if="tab === 'up'" class="gate-note">{{ t.gate.upNote }}</p>
            </form>
          </template>
          <template v-else>
            <!-- The request goes to the admins on its own; the code is only a fallback if it couldn't be sent. -->
            <p v-if="state.request === 'failed'" class="lead">{{ t.auth.noAccess }}</p>
            <p v-else class="lead gate-sent" data-req="sent">{{ state.request === "sent" ? t.gate.sent : t.gate.sending }}</p>
            <p v-if="state.request === 'failed'"><code class="gate-code">{{ state.user?.uid }}</code></p>
            <div class="gate-row">
              <button v-if="state.request === 'failed'" class="cta gate-btn" type="button" @click="copyText(state.user?.uid || '', t.c.copied)">{{ t.auth.copyCode }}</button>
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
