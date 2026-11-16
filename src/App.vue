<script setup lang="ts">
import { t } from "./i18n";
import { LINKS } from "./i18n/content";
import { ui } from "./ui";
import AppHeader from "./components/AppHeader.vue";
import CarDetail from "./components/CarDetail.vue";
import CarDialog from "./components/CarDialog.vue";
import ContactDialog from "./components/ContactDialog.vue";
</script>

<template>
  <a class="skip" href="#main">{{ t.c.skip }}</a>
  <div class="app">
    <AppHeader />
    <main id="main" tabindex="-1"><RouterView /></main>
    <footer class="foot">
      <div class="wrap foot-in">
        <div class="foot-col"><p class="foot-brand">Import Hub</p><span>Canada → Nederland → România</span><span>{{ t.foot.line }}</span><span>Icons: <a href="https://github.com/oneaudi/audi-icon" target="_blank" rel="noopener">Audi Icons</a>, <a href="./LICENSE-audi-icon.txt" target="_blank" rel="noopener">Apache-2.0</a></span></div>
        <nav class="foot-links" :aria-label="t.foot.sources">
          <h2 class="label">{{ t.foot.sources }}</h2>
          <ul class="links"><li v-for="l in LINKS" :key="l[1]"><a :href="l[1]" target="_blank" rel="noopener">{{ l[0] }}</a></li></ul>
        </nav>
      </div>
    </footer>
  </div>
  <CarDetail v-if="ui.detail" />
  <CarDialog v-if="ui.dialog?.kind === 'car'" :car="ui.dialog.car" :imported="ui.dialog.imported" :auto-fill="ui.dialog.autoFill" />
  <ContactDialog v-if="ui.dialog?.kind === 'contact'" :contact="ui.dialog.contact" />
  <div v-if="ui.toast" class="toast" role="status">{{ ui.toast }}</div>
</template>
