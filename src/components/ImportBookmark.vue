<script setup lang="ts">
// Install box for the "Add to Import Hub" bookmark: drag the button to Chrome's bookmarks bar once,
// then press it on any listing page.
import { onMounted, ref } from "vue";
import { bookmarkletHref } from "../lib/importer";
import { t } from "../i18n";
import { toast } from "../ui";

const link = ref<HTMLAnchorElement | null>(null);
// The href is set directly on the element: it is a javascript: bookmark, built from this site's own address.
onMounted(() => { if (link.value) link.value.setAttribute("href", bookmarkletHref(location.origin + location.pathname)); });
</script>
<template>
  <div class="impbox">
    <div><p class="impt">{{ t.imp.h }}</p><p class="note">{{ t.imp.lead }}</p></div>
    <a ref="link" class="btn primary bm" draggable="true" @click.prevent="toast(t.imp.dragOnly)">＋ Import Hub</a>
  </div>
</template>
