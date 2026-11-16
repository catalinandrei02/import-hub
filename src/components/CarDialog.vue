<script setup lang="ts">
import AIcon from "./AIcon.vue";
import { computed, onMounted, reactive, ref } from "vue";
import type { Car } from "../data/types";
import { addDoc, canWrite, queue } from "../data/store";
import { FLAGS, STATUSES } from "../lib/constants";
import { carGst } from "../lib/costs";
import { decodeVin } from "../lib/vin";
import { parseNum } from "../lib/cars";
import { t } from "../i18n";
import { toast, ui } from "../ui";
import VinInfo from "./VinInfo.vue";
import ImportBookmark from "./ImportBookmark.vue";

const props = defineProps<{ car: Partial<Car> | null; imported?: boolean }>();
const dlg = ref<HTMLDialogElement | null>(null);
const old = props.car || {};
const isNew = !old._id;
const str = (v: unknown) => (v == null ? "" : String(v));
const f = reactive({
  title: str(old.title || "Audi Q5"), vin: str(old.vin), year: str(old.year), trim: str(old.trim), km: str(old.km), url: str(old.url),
  seller: str(old.seller), sellerType: old.sellerType || "dealer", contact: str(old.contact), stock: str(old.stock), location: str(old.location),
  status: old.status || "watching", price: str(old.price), offer: str(old.offer), dePrice: str(old.dePrice),
  gst: carGst({ gst: old.gst, sellerType: old.sellerType || "dealer" }), gstTouched: typeof old.gst === "boolean",
  acc: old.acc || "", cam: old.cam || "", flags: [...(old.flags || [])] as string[], notes: str(old.notes),
  photos: (old.photos || []).join("\n"),
});
const armed = ref(false);
const photoList = computed(() => f.photos.split(/\s+/).filter(u => /^https?:\/\//i.test(u)).slice(0, 12));
const busy = ref(false);
const F = computed(() => t.value.f);
function onVin() {
  const d = decodeVin(f.vin);
  if (!d.err) { if (!f.trim && d.trim !== "?") f.trim = d.trim; if (!f.year && d.year !== "?") f.year = String(d.year); }
}
function onSellerType() { if (!f.gstTouched) f.gst = f.sellerType === "dealer"; }
async function save() {
  if (!canWrite.value || busy.value) return;
  busy.value = true;
  const now = new Date().toISOString(), price = parseNum(f.price);
  const base: Record<string, any> = {};
  for (const [k, v] of Object.entries(old)) if (k !== "_id") base[k] = v;
  const data: Record<string, any> = Object.assign(base, {
    title: f.title || "Audi Q5", year: parseNum(f.year), trim: f.trim, price, km: parseNum(f.km), status: f.status, seller: f.seller,
    sellerType: f.sellerType, contact: f.contact, stock: f.stock, location: f.location, offer: parseNum(f.offer), dePrice: parseNum(f.dePrice),
    gst: f.gst, acc: f.acc, cam: f.cam, vin: f.vin.toUpperCase().replace(/\s/g, ""), url: f.url, flags: f.flags, notes: f.notes, updatedAt: now,
    photos: f.photos.split(/\s+/).filter(u => /^https?:\/\//i.test(u)).slice(0, 12),
  });
  // Price changes are appended to the history, never rewritten.
  const h = Array.isArray(old.priceHistory) ? [...old.priceHistory] : [];
  if (price != null && (!h.length || h[h.length - 1].price !== price)) h.push({ date: now.slice(0, 10), price });
  data.priceHistory = h;
  try {
    if (isNew) {
      Object.assign(data, { steps: {}, docs: {}, addedBy: "manual", addedAt: now });
      ui.selCar = await addDoc("cars", data);
    } else await queue("cars/" + old._id, b => b.set("cars/" + old._id, data));
    toast(t.value.costs.saved); ui.dialog = null;
  } catch { toast(t.value.c.error); } finally { busy.value = false; }
}
async function del() {
  if (!armed.value) { armed.value = true; return; }
  const id = old._id!;
  try {
    await queue("cars/" + id, b => b.remove("cars/" + id));
    if (ui.selCar === id) { ui.selCar = ""; ui.detail = false; }
    ui.cmp = ui.cmp.filter(x => x !== id); ui.dialog = null;
  } catch { toast(t.value.c.error); }
}
onMounted(() => { dlg.value?.showModal(); onVin(); });
</script>

<template>
  <dialog ref="dlg" @close="ui.dialog = null" @cancel.prevent="ui.dialog = null">
    <form id="car-form" class="dlg" novalidate autocomplete="off" @submit.prevent="save">
      <div class="spread"><h2>{{ isNew ? t.cars.add : t.cars.edit }}</h2>
        <button class="closex" type="button" :aria-label="t.c.close" @click="ui.dialog = null"><AIcon name="cancel" /></button></div>
      <div v-if="imported" class="banner"><span class="msg"><span>{{ t.imp.got }}</span></span></div>
      <ImportBookmark v-else-if="isNew" />
      <div class="form">
        <section class="group"><h3 class="label">{{ F.gCar }}</h3>
          <div class="row full"><div class="lab"><label for="d-title">{{ F.title }}</label></div><div class="inp txt"><input id="d-title" v-model="f.title"></div></div>
          <div class="row full"><div class="lab"><label for="d-vin">{{ F.vin }}</label></div><div class="inp txt"><input id="d-vin" v-model="f.vin" class="mono" maxlength="17" spellcheck="false" @input="onVin"></div><VinInfo :vin="f.vin" /></div>
          <div class="row"><div class="lab"><label for="d-year">{{ F.year }}</label></div><div class="inp"><input id="d-year" v-model="f.year" inputmode="numeric"></div></div>
          <div class="row full"><div class="lab"><label for="d-trim">{{ F.trim }}</label></div><div class="inp txt"><input id="d-trim" v-model="f.trim"></div></div>
          <div class="row"><div class="lab"><label for="d-km">{{ F.km }}</label></div><div class="inp"><input id="d-km" v-model="f.km" inputmode="numeric"><span class="u">KM</span></div></div>
          <div class="row full"><div class="lab"><label for="d-url">{{ F.url }}</label></div><div class="inp txt"><input id="d-url" v-model="f.url" type="url"></div></div>
        </section>
        <section class="group"><h3 class="label">{{ F.gSeller }}</h3>
          <div class="row full"><div class="lab"><label for="d-seller">{{ F.seller }}</label></div><div class="inp txt"><input id="d-seller" v-model="f.seller"></div></div>
          <div class="row full"><div class="lab"><label for="d-sellerType">{{ F.sellerType }}</label></div><div class="inp"><select id="d-sellerType" v-model="f.sellerType" @change="onSellerType"><option value="dealer">{{ F.dealer }}</option><option value="private">{{ F.private }}</option></select><span class="u" aria-hidden="true">▾</span></div></div>
          <div class="row full"><div class="lab"><label for="d-contact">{{ F.contact }}</label></div><div class="inp txt"><input id="d-contact" v-model="f.contact"></div></div>
          <div class="row full"><div class="lab"><label for="d-stock">{{ F.stock }}</label></div><div class="inp txt"><input id="d-stock" v-model="f.stock"></div></div>
          <div class="row full"><div class="lab"><label for="d-location">{{ F.location }}</label></div><div class="inp txt"><input id="d-location" v-model="f.location"></div></div>
          <div class="row full"><div class="lab"><label for="d-status">{{ F.status }}</label></div><div class="inp"><select id="d-status" v-model="f.status"><option v-for="s in STATUSES" :key="s" :value="s">{{ (t.st as any)[s] }}</option></select><span class="u" aria-hidden="true">▾</span></div></div>
        </section>
        <section class="group"><h3 class="label">{{ F.gPrice }}</h3>
          <div class="row"><div class="lab"><label for="d-price">{{ F.price.replace(/\s*\(.*\)/, "") }}</label></div><div class="inp"><input id="d-price" v-model="f.price" inputmode="decimal"><span class="u">CAD</span></div></div>
          <div class="row"><div class="lab"><label for="d-offer">{{ F.offer }}</label></div><div class="inp"><input id="d-offer" v-model="f.offer" inputmode="decimal"><span class="u">CAD</span></div></div>
          <div class="row"><div class="lab"><label for="d-dePrice">{{ F.dePrice }}</label><small>{{ F.deH }}</small></div><div class="inp"><input id="d-dePrice" v-model="f.dePrice" inputmode="decimal"><span class="u">€</span></div></div>
          <label class="row sw" for="d-gst"><span class="lab"><span class="t">{{ F.gst }}</span><small>{{ F.gstH }}</small></span>
            <input id="d-gst" v-model="f.gst" class="switch" type="checkbox" role="switch" @change="f.gstTouched = true"></label>
        </section>
        <section class="group"><h3 class="label">{{ F.gEquip }}</h3>
          <div v-for="k in (['acc', 'cam'] as const)" :key="k" class="row"><div class="lab"><span :id="'d-' + k + '-l'" class="t">{{ F[k] }}</span></div>
            <div class="seg sm" role="radiogroup" :aria-labelledby="'d-' + k + '-l'" style="justify-self:end">
              <label v-for="o in [['', t.cars.unknown], ['yes', t.cars.yes], ['no', t.cars.no]]" :key="o[0]"><input v-model="f[k]" type="radio" :name="k" :value="o[0]">{{ o[1] }}</label></div></div>
          <label v-for="fl in FLAGS" :key="fl" class="row sw" :for="'d-flag-' + fl"><span class="lab"><span class="t">{{ (F.flagList as any)[fl] }}</span></span>
            <input :id="'d-flag-' + fl" v-model="f.flags" class="switch" type="checkbox" role="switch" :value="fl"></label>
        </section>
        <section class="group wide"><h3 class="label">{{ t.imp.photos }}</h3>
          <p class="note">{{ t.imp.photosH }}</p>
          <div v-if="photoList.length" class="thumbs"><img v-for="u in photoList" :key="u" :src="u" alt="" loading="lazy" referrerpolicy="no-referrer" @error="($event.target as HTMLImageElement).classList.add('broken')"></div>
          <div class="inp area"><textarea id="d-photos" v-model="f.photos" spellcheck="false" :aria-label="t.imp.photos"></textarea></div>
        </section>
        <section class="group wide"><h3 class="label">{{ F.notes }}</h3><div class="inp area"><textarea id="d-notes" v-model="f.notes" :aria-label="F.notes"></textarea></div></section>
      </div>
      <div v-if="!canWrite" class="banner glass warn"><span class="msg"><span>{{ t.c.readOnly }}</span></span></div>
      <div class="spread">
        <div class="rowx"><button class="btn primary" type="submit" :disabled="!canWrite || busy">{{ F.save }}</button><button class="btn" type="button" @click="ui.dialog = null">{{ F.cancel }}</button></div>
        <button v-if="!isNew" class="btn danger" type="button" data-act="del-car" :disabled="!canWrite" @click="del">{{ armed ? F.delConfirm : F.del }}</button>
      </div>
    </form>
  </dialog>
</template>
