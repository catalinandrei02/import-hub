<script setup lang="ts">
// Original hero illustration: the car's route from Québec over the Atlantic to Rotterdam and on to Romania.
// Flat shapes in the page tokens (sky, sea, sand, terracotta); purely decorative.
</script>
<template>
  <svg class="routeart" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="ra-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky-1)" /><stop offset="1" style="stop-color:var(--sky-2)" /></linearGradient>
      <linearGradient id="ra-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sea-1)" /><stop offset="1" style="stop-color:var(--sea-2)" /></linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#ra-sky)" />
    <circle cx="1270" cy="250" r="120" style="fill:var(--sun)" />
    <path d="M0 560 C 260 520 420 540 640 575 S 1100 610 1600 560 V 900 H 0 Z" fill="url(#ra-sea)" />
    <path d="M0 610 C 300 590 520 610 760 630 S 1200 660 1600 620" fill="none" style="stroke:var(--sea-line)" stroke-width="3" />
    <path d="M0 680 C 340 660 560 690 820 700 S 1260 720 1600 690" fill="none" style="stroke:var(--sea-line)" stroke-width="3" opacity=".7" />
    <!-- coasts -->
    <path d="M0 540 L 0 430 C 60 420 110 440 160 470 C 210 500 250 520 300 540 Z" style="fill:var(--land)" />
    <path d="M1600 540 L 1600 420 C 1520 410 1470 440 1420 470 C 1380 495 1340 520 1300 540 Z" style="fill:var(--land)" />
    <!-- route -->
    <path d="M190 505 C 520 330 1060 330 1380 495" fill="none" style="stroke:var(--route)" stroke-width="4" stroke-dasharray="2 16" stroke-linecap="round" />
    <circle cx="190" cy="505" r="11" style="fill:var(--route)" /><circle cx="1380" cy="495" r="11" style="fill:var(--route)" />
    <!-- ship -->
    <g transform="translate(700 552)">
      <path d="M0 0 H 230 L 205 38 H 22 Z" style="fill:var(--hull)" />
      <rect x="40" y="-34" width="34" height="34" style="fill:var(--box-1)" /><rect x="78" y="-34" width="34" height="34" style="fill:var(--box-2)" />
      <rect x="116" y="-34" width="34" height="34" style="fill:var(--box-1)" /><rect x="78" y="-68" width="34" height="34" style="fill:var(--box-3)" />
      <rect x="158" y="-56" width="40" height="56" style="fill:var(--bridge)" />
    </g>
  </svg>
</template>
