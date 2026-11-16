<script lang="ts">
const tried = new Set<string>(); // cars whose photos were already fetched this visit
</script>
<script setup lang="ts">
import AIcon from "./AIcon.vue";
// Car detail drawer: right-hand sheet on desktop, full screen on phones.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { canWrite, queue, recordView, state } from "../data/store";
import { carGst } from "../lib/costs";
import { STATUSES } from "../lib/constants";
import { carName, carTrim, countDone, history, safeUrl } from "../lib/cars";
import { cad, fmt, fmtDate } from "../lib/format";
import { DOCS, STEPS } from "../i18n/content";
import { countLabel, fill, lang, t } from "../i18n";
import { copyText, toast, ui } from "../ui";
import CostPanels from "./CostPanels.vue";
import ProgressRing from "./ProgressRing.vue";
import VinInfo from "./VinInfo.vue";
import PhotoShow from "./PhotoShow.vue";
import CarfaxSection from "./CarfaxSection.vue";
import EquipmentSection from "./EquipmentSection.vue";
import { hasExtension, readWithExtension } from "../lib/extension";
import { mergeExtras, parseImport } from "../lib/importer";

const car = computed(() => state.cars.find(c => c._id === ui.selCar) || null);
const closeBtn = ref<HTMLButtonElement | null>(null);
const nSteps = computed(() => STEPS[lang.value].length);
const done = computed(() => STEPS[lang.value].filter((_, i) => car.value?.steps?.["s" + i]).length);
const docKeys = computed(() => DOCS[lang.value].flatMap((g, gi) => g[1].map((_, i) => `d${gi}_${i}`)));
const docsDone = computed(() => countDone(car.value?.docs, docKeys.value));
const next = computed(() => {
  const i = STEPS[lang.value].findIndex((_, k) => !car.value?.steps?.["s" + k]);
  return i < 0 ? t.value.proc.allDone : t.value.proc.next + ": " + STEPS[lang.value][i][1];
});
const yn = (v?: string) => (v === "yes" ? t.value.cars.yes : v === "no" ? t.value.cars.no : t.value.cars.unknown);
const rows = computed(() => {
  const c = car.value!, F = t.value.f, L = t.value.cars;
  return [
    [F.year, c.year || "—"], [F.trim, carTrim(c) || "—"], [F.km, c.km ? fmt(c.km) : "—"], [F.price, c.price ? cad(c.price) : "—"],
    [F.offer, c.offer ? cad(c.offer) : "—"], [F.gst, carGst(c) ? L.yes : L.no],
    [F.sellerType, c.sellerType === "private" ? F.private : F.dealer], [F.contact, c.contact || "—"], [F.stock, c.stock || "—"],
    [F.acc, yn(c.acc)], [F.cam, yn(c.cam)],
    [t.value.c.added, (fmtDate(c.addedAt) || "—") + (c.addedBy === "claude" ? " · " + L.byClaude : "")], [t.value.c.updated, fmtDate(c.updatedAt) || "—"],
  ] as [string, string | number][];
});
function setStatus(e: Event) {
  const v = (e.target as HTMLSelectElement).value, id = car.value!._id;
  queue("cars/" + id, b => b.update("cars/" + id, { status: v, updatedAt: new Date().toISOString() })).catch(() => toast(t.value.c.error));
}
function close() { const id = ui.selCar; ui.detail = false; nextTick(() => (document.querySelector(`[data-act="details"][data-id="${CSS.escape(id)}"]`) as HTMLElement | null)?.focus()); }
const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !ui.dialog) close(); };
onMounted(() => { document.body.classList.add("lock"); document.addEventListener("keydown", onKey); nextTick(() => closeBtn.value?.focus()); });
onBeforeUnmount(() => { document.body.classList.remove("lock"); document.removeEventListener("keydown", onKey); });
watch(car, c => { if (!c) ui.detail = false; });
// One view each time a car's details are opened (or another car is opened in the drawer). Everyone sees the counts.
watch(() => ui.selCar, id => recordView(id), { immediate: true });
const views = computed(() => {
  const v = car.value ? state.views[car.value._id] : undefined;
  const people = Object.entries(v?.byUser || {}).map(([uid, x]) => ({ uid, n: x.n || 0, name: uid === state.user?.uid ? t.value.views.you : x.name || "—", last: x.last || "" }))
    .filter(p => p.n > 0).sort((a, b) => b.n - a.n);
  return { total: v?.total || 0, people };
});

// Photos: slideshow beside the drawer on wide screens, inside it on phones.
const wideMq = typeof matchMedia === "function" ? matchMedia("(min-width: 62rem)") : null;
const wide = ref(!!wideMq?.matches);
const onWide = (e: MediaQueryListEvent) => (wide.value = e.matches);
onMounted(() => wideMq?.addEventListener("change", onWide));
onBeforeUnmount(() => wideMq?.removeEventListener("change", onWide));
// With the Chrome extension, a car with a listing link and no photos gets them on its own the first time it's opened.
const listing = computed(() => safeUrl(car.value?.url) || "");
const canFetch = computed(() => hasExtension.value && canWrite.value && !!listing.value);
const fetchingId = ref("");
async function fetchPhotos() {
  const c = car.value, url = listing.value;
  if (!c || !canFetch.value || fetchingId.value) return;
  tried.add(c._id); fetchingId.value = c._id;
  try {
    const d = await readWithExtension(url);
    const p = d ? parseImport(JSON.stringify(d)) : null;
    const photos = p?.photos || [];
    if (!photos.length) { toast(t.value.show.failed); return; }
    await queue("cars/" + c._id, b => b.update("cars/" + c._id, { ...mergeExtras(c, p!), photos, updatedAt: new Date().toISOString() }));
    toast(fill(t.value.show.got, { n: photos.length }));
  } catch { toast(t.value.c.error); } finally { fetchingId.value = ""; }
}
watch(() => [car.value?._id, canFetch.value], () => { const c = car.value; if (c && canFetch.value && !c.photos?.length && !tried.has(c._id)) fetchPhotos(); }, { immediate: true });
</script>

<template>
  <Teleport to="body">
    <div class="scrim" @click="close"></div>
    <PhotoShow v-if="car && wide" :photos="car.photos || []" :name="carName(car)" :wide="true" :fetching="fetchingId === car._id" :has-ext="hasExtension" :has-url="!!listing" :can-fetch="canFetch" @refresh="fetchPhotos" />
    <aside v-if="car" id="side" class="drawer sheet" role="dialog" aria-modal="true" :aria-label="carName(car)">
      <section class="glass pad dhead">
        <div class="top">
          <div><span class="eyebrow">{{ (t.st as any)[car.status || ''] }}</span><h2>{{ carName(car) }}<template v-if="carTrim(car)"> · {{ carTrim(car) }}</template></h2>
            <p class="note">{{ [car.seller, car.location].filter(Boolean).join(" · ") }}</p></div>
          <button ref="closeBtn" class="closex" type="button" data-act="close-detail" :aria-label="t.c.close" @click="close">
            <AIcon name="cancel" />
          </button>
        </div>
        <div class="row full"><div class="lab"><label for="q-status">{{ t.cars.status }}</label></div>
          <div class="inp"><select id="q-status" :value="car.status" :disabled="!canWrite" @change="setStatus">
            <option v-for="s in STATUSES" :key="s" :value="s">{{ (t.st as any)[s] }}</option></select><span class="u" aria-hidden="true">▾</span></div></div>
        <div class="rowx">
          <a v-if="safeUrl(car.url)" class="btn" :href="safeUrl(car.url)" target="_blank" rel="noopener">{{ t.cars.open }} ↗</a>
          <button v-if="car.vin" class="btn" type="button" @click="copyText(car.vin!, t.c.copied)">{{ t.c.copyVin }}</button>
          <button class="btn" type="button" data-act="edit-car" :data-id="car._id" @click="ui.dialog = { kind: 'car', car }"><AIcon name="edit" :size="20" />{{ t.cars.edit }}</button>
        </div>
      </section>
      <PhotoShow v-if="!wide" :photos="car.photos || []" :name="carName(car)" :wide="false" :fetching="fetchingId === car._id" :has-ext="hasExtension" :has-url="!!listing" :can-fetch="canFetch" @refresh="fetchPhotos" />
      <CostPanels v-if="car.price" :price="car.price" :gst="carGst(car)" :costs="state.costs" :cap="t.cars.landedCap" :extra="carGst(car) ? t.cars.withGst : t.cars.noGst" />
      <CarfaxSection :car="car" />
      <EquipmentSection :car="car" />
      <section class="glass pad" style="display:grid;gap:12px">
        <h3 class="label">{{ t.cars.progress }}</h3>
        <div class="ringrow"><ProgressRing :n="done" :total="nSteps" />
          <div><p class="big">{{ done }} {{ fill(t.proc.of, { n: nSteps }) }}</p><p class="note">{{ next }}</p><p class="note">{{ t.cars.docsL }}: {{ docsDone }} / {{ docKeys.length }}</p></div></div>
        <div class="rowx">
          <RouterLink class="link" to="/steps" @click="ui.detail = false">{{ t.tabs.process }} <AIcon name="forward" :size="20" /></RouterLink>
          <RouterLink class="link" to="/documents" @click="ui.detail = false">{{ t.tabs.docs }} <AIcon name="forward" :size="20" /></RouterLink>
        </div>
      </section>
      <section v-if="state.viewsOn" class="glass pad views" style="display:grid;gap:12px" data-sec="views">
        <h3 class="label">{{ t.views.h }}</h3>
        <p class="big">{{ countLabel(views.total, t.views) }}</p>
        <ul v-if="views.people.length" class="hist"><li v-for="p in views.people" :key="p.uid"><span>{{ p.name }}<small v-if="p.last" class="note"> · {{ t.views.last }} {{ fmtDate(p.last) }}</small></span><b>{{ p.n }}</b></li></ul>
        <p class="note">{{ views.people.length ? t.views.how : t.views.none }}</p>
      </section>
      <section class="glass pad" style="display:grid;gap:12px">
        <h3 class="label">{{ t.f.gCar }}</h3>
        <dl class="dl"><dt>{{ t.f.vin }}</dt><dd><span class="mono">{{ car.vin || "—" }}</span></dd><template v-for="r in rows" :key="r[0]"><dt>{{ r[0] }}</dt><dd>{{ r[1] }}</dd></template></dl>
        <VinInfo :vin="car.vin" />
        <div v-if="car.flags?.length" class="chips"><span v-for="f in car.flags" :key="f" class="chip bad">{{ (t.f.flagList as any)[f] || f }}</span></div>
        <template v-if="history(car).length"><h3 class="label">{{ t.cars.history }}</h3>
          <ul class="hist"><li v-for="(h, i) in history(car).slice().reverse()" :key="i"><span>{{ fmtDate(h.date) || h.date }}</span><b>{{ cad(h.price) }}</b></li></ul></template>
        <template v-if="car.notes"><h3 class="label">{{ t.f.notes }}</h3><p class="notes">{{ car.notes }}</p></template>
      </section>
    </aside>
  </Teleport>
</template>
