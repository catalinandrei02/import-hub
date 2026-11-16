<script setup lang="ts">
import AIcon from "../components/AIcon.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { parseImport } from "../lib/importer";
import { canWrite, queue, state } from "../data/store";
import { carLanded } from "../lib/costs";
import { decodeVin } from "../lib/vin";
import { priceDelta, sortCars } from "../lib/cars";
import { cad, eur } from "../lib/format";
import { fill, t } from "../i18n";
import { toast, ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";
import CarCard from "../components/CarCard.vue";
import CompareTable from "../components/CompareTable.vue";
import VinInfo from "../components/VinInfo.vue";

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const filter = ref<"active" | "dropped" | "all">((get("hub-filter") as any) || "active");
watch(filter, v => { try { localStorage.setItem("hub-filter", v); } catch { /* ignore */ } });
const vin = ref("");
const cmpOpen = ref(false);

const active = computed(() => state.cars.filter(c => c.status !== "dropped"));
const list = computed(() => state.cars.filter(c => filter.value === "all" || (filter.value === "dropped" ? c.status === "dropped" : c.status !== "dropped")).slice().sort(sortCars));
const cheapest = computed(() => { const v = active.value.map(c => carLanded(c, state.costs)?.total).filter((x): x is number => !!x); return v.length ? Math.min(...v) : null; });
const bestDrop = computed(() => { const d = active.value.map(priceDelta).filter(x => x < 0); return d.length ? -Math.min(...d) : null; });
const cmpCars = computed(() => ui.cmp.map(id => state.cars.find(c => c._id === id)).filter(Boolean) as typeof state.cars);
const loading = computed(() => !state.carsLoaded && (state.data === "loading" || state.data === "stale"));

function addFromVin() {
  const d = decodeVin(vin.value);
  ui.dialog = { kind: "car", car: { vin: vin.value.toUpperCase().replace(/\s/g, ""), ...(d.err ? {} : { trim: d.trim === "?" ? "" : d.trim, year: d.year === "?" ? null : d.year }) } as any };
}
watch(() => ui.cmp.length, n => { if (n < 2) cmpOpen.value = false; });
// Hero photo: the selected car's main photo, else the newest active car that has one.
const heroPhoto = computed(() => {
  const sel = state.cars.find(c => c._id === ui.selCar && c.photos?.length);
  const any = active.value.filter(c => c.photos?.length).sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0];
  return (sel || any)?.photos?.[0] || "";
});
// Arriving from the "Add to Import Hub" bookmark: #/cars?add=<listing data>
const route = useRoute(), router = useRouter();
const sameUrl = (a?: string, b?: string) => !!a && !!b && a.split(/[?#]/)[0].replace(/\/$/, "").toLowerCase() === b.split(/[?#]/)[0].replace(/\/$/, "").toLowerCase();
let pending = "";
function takeImport() {
  const raw = route.query.add;
  if (typeof raw === "string" && raw) { pending = raw; router.replace({ query: {} }); }
  if (!pending) return;
  // Wait for the saved cars, so an already-saved listing is recognised instead of added twice.
  if (state.auth === "loading" || (state.auth === "ok" && !state.carsLoaded)) return;
  const car = parseImport(pending); pending = "";
  if (!car) return;
  const old = state.cars.find(c => (car.vin && c.vin === car.vin) || sameUrl(c.url, car.url));
  if (!old) { ui.dialog = { kind: "car", car: { status: "watching", sellerType: "dealer", ...car }, imported: true }; return; }
  // Already saved: add the listing's photos on their own. A new price still goes through the form (price history).
  const have = old.photos || [];
  const photos = [...have, ...(car.photos || []).filter(u => !have.includes(u))].slice(0, 12);
  const added = photos.length - have.length;
  ui.selCar = old._id;
  if (car.price && old.price !== car.price) { ui.dialog = { kind: "car", car: { ...old, photos, price: car.price }, imported: true }; return; }
  if (!added || !canWrite.value) { toast(t.value.imp.same); return; }
  queue("cars/" + old._id, b => b.update("cars/" + old._id, { photos, updatedAt: new Date().toISOString() }))
    .then(() => toast(fill(t.value.imp.added, { n: added })), () => toast(t.value.c.error));
}
watch(() => [state.auth, state.carsLoaded], takeImport);
onMounted(takeImport);
watch(() => route.query.add, takeImport);
</script>

<template>
  <HeroSection :title="t.cars.h" :lead="t.cars.lead" :photo="heroPhoto">
    <template #proof>
      <span><b>{{ fill(t.chip.cars, { n: active.length }).split(" ")[0] }}</b> {{ fill(t.chip.cars, { n: active.length }).split(" ").slice(1).join(" ") }}<template v-if="cheapest"> · {{ t.cars.cheapest }} {{ eur(cheapest) }}</template></span>
    </template>
    <form class="pillform" novalidate autocomplete="off" @submit.prevent="addFromVin">
      <label class="sr-only" for="hero-vin">{{ t.hero.vinL }}</label>
      <input id="hero-vin" v-model="vin" maxlength="17" spellcheck="false" :placeholder="t.hero.vinPh">
      <button class="cta" type="submit" :disabled="!canWrite">{{ t.cars.add }} <AIcon name="forward" /></button>
    </form>
    <div v-if="vin.trim()" class="vinout"><VinInfo :vin="vin" center /></div>
  </HeroSection>

  <div class="content solo">
    <div class="main">
      <StatusBanner />
      <div class="secrow">
         <h2 class="seclabel">{{ t.cars.h }}</h2>
        <div class="rowx">
          <div class="seg" role="group" :aria-label="t.f.status">
            <button v-for="f in ([['active', t.cars.all], ['dropped', t.cars.dropped], ['all', t.cars.allAll]] as const)" :key="f[0]" type="button" :data-filter="f[0]" :aria-pressed="filter === f[0]" @click="filter = f[0]">{{ f[1] }}</button>
          </div>
        </div>
      </div>

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
    </div>
  </div>
</template>
