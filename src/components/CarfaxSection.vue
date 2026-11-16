<script setup lang="ts">
// Carfax reports for one car: add a link or upload a PDF (stored in Firestore pieces, see data/files.ts),
// open them, delete them (second press). Everyone in the family sees the same list.
import { computed, ref } from "vue";
import type { Car, CarfaxItem } from "../data/types";
import { canWrite, queue, state } from "../data/store";
import { MAX_PDF, deletePdf, readPdf, uploadPdf } from "../data/files";
import { fmtDate } from "../lib/format";
import { fill, t } from "../i18n";
import { toast } from "../ui";
import AIcon from "./AIcon.vue";

const props = defineProps<{ car: Car }>();
const items = computed(() => (props.car.carfax || []).slice().sort((a, b) => String(b.addedAt || "").localeCompare(String(a.addedAt || ""))));
const link = ref(""), progress = ref(-1), armed = ref(""), opening = ref("");
const fileIn = ref<HTMLInputElement | null>(null);
const me = () => (state.user?.name || "").trim().split(/\s+/)[0].slice(0, 30);
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const mb = (n?: number) => (n ? (n / 1048576).toFixed(n < 1048576 ? 2 : 1) + " MB" : "");
const host = (u?: string) => { try { return new URL(u || "").hostname.replace(/^www\./, ""); } catch { return u || ""; } };

function save(list: CarfaxItem[]) {
  const id = props.car._id;
  return queue("cars/" + id, b => b.update("cars/" + id, { carfax: list, updatedAt: new Date().toISOString() }));
}
async function addLink() {
  const u = link.value.trim();
  if (!/^https?:\/\/\S+\.\S+/i.test(u)) { toast(t.value.carfax.badLink); return; }
  try { await save([...(props.car.carfax || []), { id: newId(), kind: "link", url: u.slice(0, 600), addedAt: new Date().toISOString(), addedBy: me() }]); link.value = ""; toast(t.value.carfax.added); }
  catch { toast(t.value.c.error); }
}
async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  (e.target as HTMLInputElement).value = "";
  if (!f) return;
  if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) { toast(t.value.carfax.notPdf); return; }
  if (f.size > MAX_PDF) { toast(t.value.carfax.tooBig); return; }
  progress.value = 0;
  try {
    const fileId = await uploadPdf(f, props.car._id, p => (progress.value = p));
    await save([...(props.car.carfax || []), { id: newId(), kind: "pdf", fileId, name: f.name.slice(0, 120), size: f.size, addedAt: new Date().toISOString(), addedBy: me() }]);
    toast(t.value.carfax.added);
  } catch { toast(t.value.c.error); } finally { progress.value = -1; }
}
async function openPdf(it: CarfaxItem) {
  // Open the tab now (still inside the click), fill it once the file is read.
  const w = window.open("", "_blank");
  opening.value = it.id;
  try {
    const url = URL.createObjectURL(await readPdf(it.fileId!));
    if (w) w.location.href = url;
    else { const a = document.createElement("a"); a.href = url; a.download = it.name || "carfax.pdf"; a.click(); }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch { w?.close(); toast(t.value.c.error); } finally { opening.value = ""; }
}
async function remove(it: CarfaxItem) {
  if (armed.value !== it.id) { armed.value = it.id; return; }
  armed.value = "";
  try {
    await save((props.car.carfax || []).filter(x => x.id !== it.id));
    if (it.kind === "pdf" && it.fileId) await deletePdf(it.fileId);
  } catch { toast(t.value.c.error); }
}
</script>

<template>
  <section class="glass pad carfax" data-sec="carfax">
    <h3 class="label">{{ t.carfax.h }}</h3>
    <p v-if="!items.length" class="note">{{ t.carfax.none }}</p>
    <ul v-else class="cfx">
      <li v-for="it in items" :key="it.id" :data-kind="it.kind">
        <span class="cfx-t">
          <a v-if="it.kind === 'link'" :href="it.url" target="_blank" rel="noopener noreferrer">{{ host(it.url) }} ↗</a>
          <button v-else class="link" type="button" data-act="open-pdf" :disabled="opening === it.id" @click="openPdf(it)">{{ opening === it.id ? t.carfax.opening : it.name || "Carfax.pdf" }}</button>
          <small class="note">{{ it.kind === "pdf" ? "PDF · " + mb(it.size) + " · " : "" }}{{ fill(t.carfax.by, { n: it.addedBy || "—", d: fmtDate(it.addedAt) }) }}</small>
        </span>
        <button class="btn" :class="{ primary: armed === it.id }" type="button" data-act="del-carfax" :disabled="!canWrite" @click="remove(it)">{{ armed === it.id ? t.carfax.sure : t.carfax.del }}</button>
      </li>
    </ul>
    <form class="linkrow" novalidate autocomplete="off" @submit.prevent="addLink">
      <label class="sr-only" for="cfx-link">{{ t.carfax.linkL }}</label>
      <div class="inp txt"><input id="cfx-link" v-model="link" type="url" inputmode="url" spellcheck="false" placeholder="https://www.carfax.ca/…"></div>
      <button class="btn" type="submit" data-act="add-carfax-link" :disabled="!canWrite || !link.trim()">{{ t.carfax.addLink }}</button>
    </form>
    <div class="rowx">
      <input ref="fileIn" id="cfx-file" class="sr-only" type="file" accept="application/pdf,.pdf" @change="onFile">
      <button class="btn primary" type="button" data-act="upload-carfax" :disabled="!canWrite || progress >= 0" @click="fileIn?.click()"><AIcon name="documents" :size="20" />{{ progress >= 0 ? fill(t.carfax.uploading, { p: progress }) : t.carfax.upload }}</button>
      <small class="note">{{ t.carfax.max }}</small>
    </div>
  </section>
</template>
