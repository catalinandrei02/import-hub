<script setup lang="ts">
import AIcon from "./AIcon.vue";
import { onMounted, reactive, ref } from "vue";
import type { Contact } from "../data/types";
import { addDoc, canWrite, queue } from "../data/store";
import { t } from "../i18n";
import { toast, ui } from "../ui";

const props = defineProps<{ contact: Contact | null }>();
const dlg = ref<HTMLDialogElement | null>(null);
const c = props.contact;
const f = reactive({ name: c?.name || "", role: c?.role || "", phone: c?.phone || "", email: c?.email || "", notes: c?.notes || "" });
const armed = ref(false);
const fields = [["name", "text"], ["role", "text"], ["phone", "tel"], ["email", "email"]] as const;
async function save() {
  if (!canWrite.value) return;
  const d = { ...f };
  try { if (c?._id) await queue("contacts/" + c._id, b => b.set("contacts/" + c._id, d)); else await addDoc("contacts", d); toast(t.value.costs.saved); ui.dialog = null; }
  catch { toast(t.value.c.error); }
}
async function del() {
  if (!armed.value) { armed.value = true; return; }
  try { await queue("contacts/" + c!._id, b => b.remove("contacts/" + c!._id)); ui.dialog = null; } catch { toast(t.value.c.error); }
}
onMounted(() => dlg.value?.showModal());
</script>
<template>
  <dialog ref="dlg" @close="ui.dialog = null" @cancel.prevent="ui.dialog = null">
    <form id="ct-form" class="dlg" novalidate autocomplete="off" @submit.prevent="save">
      <div class="spread"><h2>{{ c ? t.cars.edit : t.contacts.add }}</h2>
        <button class="closex" type="button" :aria-label="t.c.close" @click="ui.dialog = null"><AIcon name="cancel" /></button></div>
      <div class="form">
        <div v-for="[k, type] in fields" :key="k" class="row full"><div class="lab"><label :for="'ct-' + k">{{ (t.contacts as any)[k] }}</label></div>
          <div class="inp txt"><input :id="'ct-' + k" v-model="f[k]" :type="type"></div></div>
        <div class="row full wide"><div class="lab"><label for="ct-notes">{{ t.contacts.notes }}</label></div><div class="inp area"><textarea id="ct-notes" v-model="f.notes"></textarea></div></div>
      </div>
      <div class="spread">
        <div class="rowx"><button class="btn primary" type="submit" :disabled="!canWrite">{{ t.f.save }}</button><button class="btn" type="button" @click="ui.dialog = null">{{ t.f.cancel }}</button></div>
        <button v-if="c" class="btn danger" type="button" data-act="del-contact" :disabled="!canWrite" @click="del">{{ armed ? t.f.delConfirm : t.f.del }}</button>
      </div>
    </form>
  </dialog>
</template>
