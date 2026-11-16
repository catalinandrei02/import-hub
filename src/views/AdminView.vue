<script setup lang="ts">
// Admin page (avatar menu → Admin): access requests, members and roles, add by code, who uses the site.
// The rules enforce all of this; the page only hides itself for non-admins.
import { computed, ref } from "vue";
import { admin, canWrite, isAdmin, state } from "../data/store";
import type { AccessRequest, Member } from "../data/types";
import { carName } from "../lib/cars";
import { fmtDate } from "../lib/format";
import { countLabel, t } from "../i18n";
import { copyText, toast, ui } from "../ui";
import HeroSection from "../components/HeroSection.vue";
import StatusBanner from "../components/StatusBanner.vue";

const me = computed(() => state.user?.uid || "");
// Per person: how many car openings and when they were last seen, from views/{carId}.byUser.
const usage = computed(() => {
  const u: Record<string, { n: number; last: string }> = {};
  for (const v of Object.values(state.views)) for (const [uid, x] of Object.entries(v.byUser || {})) {
    const o = (u[uid] ||= { n: 0, last: "" }); o.n += x.n || 0; if ((x.last || "") > o.last) o.last = x.last || "";
  }
  return u;
});
const members = computed(() => state.members.slice().sort((a, b) => (a._id === me.value ? -1 : b._id === me.value ? 1 : (a.role === "admin" ? 0 : 1) - (b.role === "admin" ? 0 : 1) || String(a.name).localeCompare(String(b.name)))));
const requests = computed(() => state.requests.slice().sort((a, b) => String(b.at || "").localeCompare(String(a.at || ""))));
const top = computed(() => Object.entries(state.views).map(([id, v]) => ({ car: state.cars.find(c => c._id === id), n: v.total || 0 })).filter(x => x.car && x.n).sort((a, b) => b.n - a.n).slice(0, 5));
const armed = ref("");
const busy = ref(false);
async function run(fn: () => Promise<unknown>, ok?: string) {
  if (busy.value) return; busy.value = true;
  try { await fn(); if (ok) toast(ok); } catch { toast(t.value.c.error); } finally { busy.value = false; armed.value = ""; }
}
const approve = (r: AccessRequest) => run(() => admin.approve(r), t.value.admin.added);
const reject = (r: AccessRequest) => run(() => admin.reject(r));
const role = (m: Member) => run(() => admin.setRole(m, m.role === "admin" ? "member" : "admin"));
function remove(m: Member) { if (armed.value !== m._id) { armed.value = m._id; return; } run(() => admin.remove(m)); }
const code = ref(""), name = ref("");
function add() {
  const c = code.value.trim();
  if (!/^[A-Za-z0-9]{20,40}$/.test(c)) { toast(t.value.admin.badCode); return; }
  run(() => admin.add(c, name.value), t.value.admin.added).then(() => { code.value = ""; name.value = ""; });
}
function openCar(id: string) { ui.selCar = id; ui.detail = true; }
</script>

<template>
  <HeroSection :title="t.admin.h" :lead="t.admin.lead" />
  <div class="content solo">
    <div class="main admin">
      <StatusBanner />
      <div v-if="!isAdmin" class="glass empty"><p class="big">{{ t.admin.only }}</p></div>
      <template v-else>
        <section class="glass pad" data-sec="requests">
          <h2 class="label">{{ t.admin.reqH }}<span v-if="requests.length" class="ucount">{{ requests.length }}</span></h2>
          <p v-if="!requests.length" class="note">{{ t.admin.reqNone }}</p>
          <ul v-else class="arows">
            <li v-for="r in requests" :key="r._id" class="arow">
              <span class="who"><b>{{ r.name || "—" }}</b><small>{{ t.admin.code }} <span class="mono">{{ r._id }}</span> · {{ fmtDate(r.at) }}</small></span>
              <span class="aact">
                <button class="btn primary" type="button" data-act="approve" :disabled="!canWrite || busy" @click="approve(r)">{{ t.admin.approve }}</button>
                <button class="btn" type="button" data-act="reject" :disabled="!canWrite || busy" @click="reject(r)">{{ t.admin.reject }}</button>
              </span>
            </li>
          </ul>
        </section>

        <section class="glass pad" data-sec="members">
          <h2 class="label">{{ t.admin.memH }} · {{ members.length }}</h2>
          <ul class="arows">
            <li v-for="m in members" :key="m._id" class="arow" :data-id="m._id">
              <span class="who">
                <b>{{ m.name || "—" }}<template v-if="m._id === me"> ({{ t.admin.you }})</template> <span class="chip" :class="{ info: m.role === 'admin' }">{{ m.role === "admin" ? t.admin.admin : t.admin.member }}</span></b>
                <small>{{ t.admin.views }}: {{ usage[m._id]?.n || 0 }} · {{ t.admin.last }}: {{ usage[m._id]?.last ? fmtDate(usage[m._id].last) : t.admin.never }} ·
                  <button class="link" type="button" :title="t.auth.copyCode" @click="copyText(m._id, t.c.copied)"><span class="mono">{{ m._id.slice(0, 8) }}…</span></button></small>
              </span>
              <span v-if="m._id !== me" class="aact">
                <button class="btn" type="button" data-act="role" :disabled="!canWrite || busy" @click="role(m)">{{ m.role === "admin" ? t.admin.makeMember : t.admin.makeAdmin }}</button>
                <button class="btn" :class="{ primary: armed === m._id }" type="button" data-act="remove" :disabled="!canWrite || busy" @click="remove(m)">{{ armed === m._id ? t.admin.sure : t.admin.remove }}</button>
              </span>
            </li>
          </ul>
        </section>

        <section class="glass pad" data-sec="add">
          <h2 class="label">{{ t.admin.addH }}</h2>
          <p class="note">{{ t.admin.addLead }}</p>
          <form class="addrow" novalidate autocomplete="off" @submit.prevent="add">
            <label class="row full"><span class="lab">{{ t.admin.addCode }}</span><span class="inp txt"><input id="a-code" v-model="code" class="mono" spellcheck="false" maxlength="40"></span></label>
            <label class="row full"><span class="lab">{{ t.admin.addName }}</span><span class="inp txt"><input id="a-name" v-model="name" maxlength="30"></span></label>
            <button class="btn primary" type="submit" data-act="add-member" :disabled="!canWrite || busy || !code.trim()">{{ t.admin.add }}</button>
          </form>
        </section>

        <section class="glass pad" data-sec="top">
          <h2 class="label">{{ t.admin.topH }}</h2>
          <p v-if="!top.length" class="note">{{ t.admin.none }}</p>
          <ul v-else class="hist"><li v-for="x in top" :key="x.car!._id"><button class="link" type="button" @click="openCar(x.car!._id)">{{ carName(x.car!) }}</button><b>{{ countLabel(x.n, t.views) }}</b></li></ul>
        </section>
      </template>
    </div>
  </div>
</template>
