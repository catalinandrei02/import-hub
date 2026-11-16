<script setup lang="ts">
// Photo slideshow for one car: a large stage beside the details drawer on wide screens, a strip inside it on phones.
// Plays on its own every 5 s (not with reduced motion, and it stops while hovered, focused or after a manual change).
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { fill, t } from "../i18n";
import AIcon from "./AIcon.vue";
import CarArt from "./CarArt.vue";

const props = defineProps<{ photos: string[]; name: string; wide: boolean; fetching: boolean; hasExt: boolean; hasUrl: boolean; canFetch: boolean }>();
const emit = defineEmits<{ refresh: [] }>();
const broken = ref(new Set<string>());
const list = computed(() => props.photos.filter(u => !broken.value.has(u)));
const i = ref(0);
const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const playing = ref(!reduce);
const hold = ref(false);
const base = import.meta.env.BASE_URL;
watch(() => props.photos.join(" "), () => { i.value = 0; broken.value = new Set(); });
watch(list, l => { if (i.value >= l.length) i.value = 0; });
function go(d: number, manual = true) { const n = list.value.length; if (n) i.value = (i.value + d + n) % n; if (manual) playing.value = false; }
function pick(k: number) { i.value = k; playing.value = false; }
function bad(u: string) { const s = new Set(broken.value); s.add(u); broken.value = s; }
let timer: ReturnType<typeof setInterval> | undefined;
const thumbs = ref<HTMLElement | null>(null);
watch(i, k => { (thumbs.value?.children[k] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest", inline: "nearest" }); });
const onKey = (e: KeyboardEvent) => {
  const el = document.activeElement as HTMLElement | null;
  if (document.querySelector("dialog[open], .modal") || (el && /INPUT|SELECT|TEXTAREA/.test(el.tagName))) return;
  if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1);
};
onMounted(() => { timer = setInterval(() => { if (playing.value && !hold.value && !document.hidden) go(1, false); }, 5000); document.addEventListener("keydown", onKey); });
onBeforeUnmount(() => { clearInterval(timer); document.removeEventListener("keydown", onKey); });
</script>

<template>
  <section class="show" :class="wide ? 'stage' : 'inline'" :aria-label="t.show.label" aria-roledescription="carousel"
    @mouseenter="hold = true" @mouseleave="hold = false" @focusin="hold = true" @focusout="hold = false">
    <template v-if="list.length">
      <div class="show-main">
        <img :key="list[i]" :src="list[i]" :alt="name + ' · ' + fill(t.show.pick, { n: i + 1 })" referrerpolicy="no-referrer" @error="bad(list[i])">
        <template v-if="list.length > 1">
          <button class="show-nav prev" type="button" :aria-label="t.show.prev" @click="go(-1)"><AIcon name="back" /></button>
          <button class="show-nav next" type="button" :aria-label="t.show.next" @click="go(1)"><AIcon name="forward" /></button>
        </template>
        <div class="show-bar">
          <span class="show-count" aria-live="polite">{{ i + 1 }} / {{ list.length }}</span>
          <button v-if="list.length > 1 && !reduce" class="show-ctl" type="button" :aria-label="playing ? t.show.pause : t.show.play" :aria-pressed="playing" @click="playing = !playing"><AIcon :name="playing ? 'pause' : 'play'" /></button>
          <button v-if="canFetch" class="show-ctl" type="button" :aria-label="t.show.refresh" :title="t.show.refresh" :disabled="fetching" @click="emit('refresh')"><AIcon name="refresh" /></button>
        </div>
      </div>
      <div v-if="list.length > 1" ref="thumbs" class="show-thumbs">
        <button v-for="(u, k) in list" :key="u" type="button" :aria-label="fill(t.show.pick, { n: k + 1 })" :aria-current="k === i" @click="pick(k)">
          <img :src="u" alt="" loading="lazy" referrerpolicy="no-referrer" @error="bad(u)"></button>
      </div>
    </template>
    <div v-else class="show-empty">
      <div class="show-art"><CarArt label="" /></div>
      <div class="show-msg" role="status">
        <p v-if="fetching" class="big">{{ t.show.fetching }}</p>
        <template v-else>
          <p class="big">{{ t.show.none }}</p>
          <p v-if="!hasUrl" class="note">{{ t.show.noUrl }}</p>
          <button v-if="canFetch" class="btn" type="button" @click="emit('refresh')"><AIcon name="refresh" :size="20" />{{ t.show.refresh }}</button>
          <template v-if="!hasExt">
            <h3 class="label">{{ t.show.extH }}</h3>
            <p class="note">{{ t.show.ext }}</p>
            <ol class="note steps-ol"><li v-for="s in t.show.extSteps" :key="s">{{ s }}</li></ol>
            <a class="btn primary" :href="base + 'import-hub-extension.zip'" download><AIcon name="download" :size="20" />{{ t.show.extDl }}</a>
          </template>
        </template>
      </div>
    </div>
  </section>
</template>
