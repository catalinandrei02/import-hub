<script setup lang="ts">
import { computed } from "vue";
import { canWrite, state } from "../data/store";
import { initials } from "../lib/cars";
import { fill, t } from "../i18n";
import { copyText, ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";

const list = computed(() => state.contacts.slice().sort((a, b) => (a.role || "").localeCompare(b.role || "")));
const hue = (s?: string) => [...String(s || "")].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 360;
const loading = computed(() => !state.contactsLoaded && (state.data === "loading" || state.data === "stale"));
</script>

<template>
  <HeroSection :title="t.contacts.h" :lead="t.contacts.lead">
    <template #proof>
      <span>{{ fill(t.chip.contacts, { n: list.length }) }}</span>
    </template>
    <button class="cta" type="button" data-act="add-contact" :disabled="!canWrite" @click="ui.dialog = { kind: 'contact', contact: null }">+ {{ t.contacts.add }}</button>
  </HeroSection>
  <div class="content solo">
    <div class="main">
      <StatusBanner />
      <div v-if="loading" class="glass empty"><p class="big">{{ t.loading }}</p></div>
      <div v-else-if="!list.length" class="glass empty"><p class="big">{{ t.contacts.h }}</p><p>{{ t.contacts.empty }}</p></div>
      <div v-else class="cols">
        <section v-for="c in list" :key="c._id" class="glass card">
          <div class="cfoot" style="border:0;padding:0">
            <span class="ini" :style="{ background: `hsl(${hue(c.name)} 8% 32%)` }" aria-hidden="true">{{ initials(c.name) }}</span>
            <span class="who"><b>{{ c.name }}</b><small>{{ c.role }}</small></span>
            <button class="link" type="button" data-act="edit-contact" :data-id="c._id" @click="ui.dialog = { kind: 'contact', contact: c }">{{ t.cars.edit }}</button>
          </div>
          <div v-if="c.phone" class="line"><span class="mono">{{ c.phone }}</span><button class="btn" type="button" @click="copyText(c.phone!, t.contacts.copied)">{{ t.contacts.copy }}</button></div>
          <div v-if="c.email" class="line"><span class="mono">{{ c.email }}</span><button class="btn" type="button" @click="copyText(c.email!, t.contacts.copied)">{{ t.contacts.copy }}</button></div>
          <p v-if="c.notes" class="notes" style="color:var(--ink-2)">{{ c.notes }}</p>
        </section>
      </div>
    </div>
  </div>
</template>
