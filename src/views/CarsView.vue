<script setup lang="ts">
import AIcon from "../components/AIcon.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MAX_PHOTOS, findSaved, mergeExtras, parseImport } from "../lib/importer";
import { canWrite, queue, state } from "../data/store";
import { priceDelta, sortCars } from "../lib/cars";
import { cad } from "../lib/format";
import { fill, t } from "../i18n";
import { toast, ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CarCard from "../components/CarCard.vue";
import CompareTable from "../components/CompareTable.vue";
import PriceCheckBar from "../components/PriceCheckBar.vue";

// Opens on "All" every time (owner's choice).
const filter = ref<"active" | "dropped" | "all">("all");
const vin = ref("");
const cmpOpen = ref(false);

const active = computed(() => state.cars.filter(c => c.status !== "dropped"));
const list = computed(() => state.cars.filter(c => filter.value === "all" || (filter.value === "dropped" ? c.status === "dropped" : c.status !== "dropped")).slice().sort(sortCars));
const bestDrop = computed(() => { const d = active.value.map(priceDelta).filter(x => x < 0); return d.length ? -Math.min(...d) : null; });
const cmpCars = computed(() => ui.cmp.map(id => state.cars.find(c => c._id === id)).filter(Boolean) as typeof state.cars);
const loading = computed(() => !state.carsLoaded && (state.data === "loading" || state.data === "stale"));

// The bar adds cars by listing link only (owner's request): the form opens and fills itself in (Chrome extension).
// A car without a link is still added with "Add car" in the header.
function addFromVin() {
  const v = vin.value.trim();
  if (!/^https?:\/\/\S+\.\S+/i.test(v)) { toast(t.value.hero.linkOnly); return; }
  ui.dialog = { kind: "car", car: { url: v }, autoFill: true }; vin.value = "";
}
watch(() => ui.cmp.length, n => { if (n < 2) cmpOpen.value = false; });
// Arriving from the "Add to Import Hub" bookmark: #/cars?add=<listing data>
const route = useRoute(), router = useRouter();
let pending = "";
function takeImport() {
  const raw = route.query.add;
  if (typeof raw === "string" && raw) { pending = raw; router.replace({ query: {} }); }
  if (!pending) return;
  // Wait for the saved cars, so an already-saved listing is recognised instead of added twice.
  if (state.auth === "loading" || (state.auth === "ok" && !state.carsLoaded)) return;
  const car = parseImport(pending); pending = "";
  if (!car) return;
  const old = findSaved(state.cars, car);
  if (!old) { ui.dialog = { kind: "car", car: { status: "watching", sellerType: "dealer", ...car }, imported: true }; return; }
  // Already saved: add the listing's photos on their own. A new price still goes through the form (price history).
  const have = old.photos || [];
  const photos = [...have, ...(car.photos || []).filter(u => !have.includes(u))].slice(0, MAX_PHOTOS);
  const added = photos.length - have.length;
  ui.selCar = old._id;
  const more = mergeExtras(old, car); // equipment, Carfax links, history the car didn't have yet
  if (car.price && old.price !== car.price) { ui.dialog = { kind: "car", car: { ...old, ...more, photos, price: car.price }, imported: true }; return; }
  if ((!added && !Object.keys(more).length) || !canWrite.value) { toast(t.value.imp.same); return; }
  queue("cars/" + old._id, b => b.update("cars/" + old._id, { ...more, photos, updatedAt: new Date().toISOString() }))
    .then(() => toast(fill(t.value.imp.added, { n: added })), () => toast(t.value.c.error));
}
watch(() => [state.auth, state.carsLoaded], takeImport);
onMounted(takeImport);
watch(() => route.query.add, takeImport);
</script>

<template>
  <!-- Title and the add box only (owner's request: no count line, no description). -->
  <HeroSection :title="t.cars.h">
    <!-- Add box and the list filter side by side (one heading for the page: the hero title). -->
    <div class="addrowbar">
      <form class="pillform" novalidate autocomplete="off" @submit.prevent="addFromVin">
        <label class="sr-only" for="hero-vin">{{ t.hero.vinL }}</label>
        <input id="hero-vin" v-model="vin" type="url" inputmode="url" maxlength="600" spellcheck="false" :placeholder="t.hero.vinPh" :title="t.hero.vinPh">
        <button class="cta" type="submit" :disabled="!canWrite"><span class="btxt">{{ t.cars.add }}</span> <AIcon name="forward" /></button>
      </form>
      <div class="seg" role="group" :aria-label="t.f.status">
        <button v-for="f in ([['active', t.cars.all], ['dropped', t.cars.dropped], ['all', t.cars.allAll]] as const)" :key="f[0]" type="button" :data-filter="f[0]" :aria-pressed="filter === f[0]" @click="filter = f[0]">{{ f[1] }}</button>
      </div>
    </div>
  </HeroSection>

  <div class="content solo">
    <div class="main">
      <StatusBanner />

      <div v-if="ui.cmp.length" class="banner glass" role="status">
        <span class="msg"><span>{{ fill(t.cars.compareN, { n: cmpCars.length }) }}<template v-if="cmpCars.length < 2"> · {{ t.cars.compareHint }}</template></span></span>
        <button v-if="cmpCars.length > 1" class="btn primary" type="button" data-act="cmp-show" @click="cmpOpen = !cmpOpen">{{ cmpOpen ? t.cars.compareHide : t.cars.compareShow }}</button>
        <button class="btn" type="button" @click="ui.cmp = []">{{ t.cars.compareClear }}</button>
      </div>
      <CompareTable v-if="cmpOpen && cmpCars.length > 1" :cars="cmpCars" />

      <div v-if="loading" class="glass empty"><p class="big">{{ t.cars.loadingCars }}</p></div>
      <div v-else-if="!list.length" class="glass empty">
        <p class="big">{{ t.cars.h }}</p><p>{{ t.cars.empty }}</p>
        <button v-if="canWrite" class="btn primary" type="button" @click="ui.dialog = { kind: 'car', car: null }">+ {{ t.cars.add }}</button>
      </div>
      <template v-else>
        <div class="cars"><CarCard v-for="c in list" :key="c._id" :car="c" /></div>
      </template>
      <p v-if="bestDrop" class="note" style="text-align:center">{{ t.cars.bestDrop }}: ▼ {{ cad(bestDrop) }}</p>
      <PriceCheckBar v-if="state.auth === 'ok'" />
    </div>
  </div>
</template>
