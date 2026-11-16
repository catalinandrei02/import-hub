<script setup lang="ts">
import { t } from "./i18n";
import { ui } from "./ui";
import SkyCanvas from "./components/SkyCanvas.vue";
import AppHeader from "./components/AppHeader.vue";
import CarDetail from "./components/CarDetail.vue";
import CarDialog from "./components/CarDialog.vue";
import ContactDialog from "./components/ContactDialog.vue";
</script>

<template>
  <SkyCanvas />
  <a class="skip" href="#main">{{ t.c.skip }}</a>
  <div class="app">
    <AppHeader />
    <main id="main" class="wrap" tabindex="-1"><RouterView /></main>
    <footer class="foot wrap">
      <span>Import Hub · CA → NL → RO</span>
      <span>{{ t.foot.line }}</span>
    </footer>
  </div>
  <CarDetail v-if="ui.detail" />
  <CarDialog v-if="ui.dialog?.kind === 'car'" :car="ui.dialog.car" />
  <ContactDialog v-if="ui.dialog?.kind === 'contact'" :contact="ui.dialog.contact" />
  <div v-if="ui.toast" class="toast" role="status">{{ ui.toast }}</div>
</template>
