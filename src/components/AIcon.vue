<script setup lang="ts">
// Icons from @audi/audi-icon (Apache-2.0, © Audi; licence shipped as LICENSE-audi-icon.txt). Interface icons only, never logos.
// Only the icons listed here are bundled. They draw with currentColor, so they follow the theme.
import { computed } from "vue";
import forward from "@audi/audi-icon/dist/svg/static/forward-small.svg?raw";
import back from "@audi/audi-icon/dist/svg/static/back-small.svg?raw";
import cancel from "@audi/audi-icon/dist/svg/static/cancel-small.svg?raw";
import search from "@audi/audi-icon/dist/svg/static/search-small.svg?raw";
import edit from "@audi/audi-icon/dist/svg/static/edit-small.svg?raw";
import user from "@audi/audi-icon/dist/svg/static/user-small.svg?raw";
import arrowDown from "@audi/audi-icon/dist/svg/static/arrow-down-small.svg?raw";
import calculator from "@audi/audi-icon/dist/svg/static/calculator-small.svg?raw";
import car from "@audi/audi-icon/dist/svg/static/car-small.svg?raw";
import carSearch from "@audi/audi-icon/dist/svg/static/car-search-small.svg?raw";
import documents from "@audi/audi-icon/dist/svg/static/documents-small.svg?raw";
import share from "@audi/audi-icon/dist/svg/static/share-small.svg?raw";

const ICONS = { forward, back, cancel, search, edit, user, "arrow-down": arrowDown, calculator, car, "car-search": carSearch, documents, share };
export type IconName = keyof typeof ICONS;
const props = defineProps<{ name: IconName; size?: number }>();
// Drop the <title> so the icon stays decorative; the button or link around it carries the label.
const svg = computed(() => ICONS[props.name].replace(/<title>[\s\S]*?<\/title>/, "").replace(/width="\d+" height="\d+"/, `width="${props.size || 24}" height="${props.size || 24}"`));
</script>
<template><span class="aicon" aria-hidden="true" v-html="svg"></span></template>
