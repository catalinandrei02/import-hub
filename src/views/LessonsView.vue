<script setup lang="ts">
import { LESSONS, LINKS } from "../i18n/content";
import { fill, lang, t } from "../i18n";
import HeroSection from "../components/HeroSection.vue";
</script>

<template>
  <HeroSection :title="t.lessons.h" :lead="t.lessons.lead">
    <template #proof><span class="dot" aria-hidden="true"></span><span>{{ fill(t.chip.lessons, { n: LESSONS[lang].length }) }}</span></template>
  </HeroSection>
  <div class="content solo">
    <div class="main">
      <div class="cols">
        <section v-for="(x, i) in LESSONS[lang]" :key="i" class="glass card lesson" :class="{ good: x[0] }">
          <span class="tag">{{ String(i + 1).padStart(2, "0") }}</span>
          <p class="quote">{{ x[1] }}</p>
          <p class="note">{{ x[2] }}</p>
        </section>
      </div>
      <section class="glass pad" style="display:grid;gap:12px">
        <h2 class="label">{{ t.lessons.links }}</h2>
        <ul class="links"><li v-for="l in LINKS" :key="l[1]"><a :href="l[1]" target="_blank" rel="noopener">{{ l[0] }}</a></li></ul>
      </section>
    </div>
  </div>
</template>
