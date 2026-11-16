<script setup lang="ts">
// Night sky behind the whole site: gradient, light beam, seeded stars with a Milky Way band, two ridges.
// Colours come from CSS tokens, so it redraws for light/dark. Static (no animation).
import { onBeforeUnmount, onMounted, ref } from "vue";

const el = ref<HTMLCanvasElement | null>(null);
let raf = 0;

function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }
const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function ridge(x: CanvasRenderingContext2D, w: number, h: number, color: string, pts: [number, number][]) {
  x.fillStyle = color; x.beginPath(); x.moveTo(0, h);
  x.lineTo(0, pts[0][1] * h);
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i];
    x.bezierCurveTo((px + (cx - px) / 2) * w, py * h, (px + (cx - px) / 2) * w, cy * h, cx * w, cy * h);
  }
  x.lineTo(w, h); x.closePath(); x.fill();
}

function draw() {
  const c = el.value; if (!c) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = window.innerWidth, h = window.innerHeight;
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
  const x = c.getContext("2d"); if (!x) return;
  x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, css("--sky-top")); g.addColorStop(0.5, css("--sky-mid")); g.addColorStop(1, css("--sky-low"));
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  const bx = w * 0.12, by = -h * 0.08, b = x.createRadialGradient(bx, by, 0, bx, by, Math.max(w, h) * 0.85);
  b.addColorStop(0, css("--beam")); b.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = b; x.fillRect(0, 0, w, h);
  // Soft glow behind the hero, like moonlight on haze.
  const gx = w * 0.4, gy = h * 0.42, gl = x.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.5);
  gl.addColorStop(0, css("--glow")); gl.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = gl; x.fillRect(0, 0, w, h);

  const density = parseFloat(css("--stars")) || 0;
  if (density > 0) {
    const r = rng(20261116); x.fillStyle = css("--star");
    const field = Math.round((w * h) / 2600 * density);
    for (let i = 0; i < field; i++) {
      const sx = r() * w, sy = r() * h * 0.82, fade = 1 - sy / (h * 0.9);
      x.globalAlpha = Math.max(0, (0.25 + r() * 0.75) * fade);
      const s = r() < 0.03 ? 1.6 : 0.5 + r() * 0.7;
      x.fillRect(sx, sy, s, s);
    }
    // Milky Way: a soft diagonal band of fine stars from upper middle towards the left.
    const band = Math.round(field * 0.9);
    for (let i = 0; i < band; i++) {
      const t = r(), cx = w * (0.62 - t * 0.38), cy = h * (0.02 + t * 0.5);
      const off = (r() + r() + r() - 1.5) * Math.min(w, h) * 0.09;
      x.globalAlpha = (0.15 + r() * 0.55) * (1 - t * 0.6);
      x.fillRect(cx + off * 0.8, cy + off * 0.6, 0.6, 0.6);
    }
    x.globalAlpha = 1;
  }
  ridge(x, w, h, css("--ridge-2"), [[0, 0.86], [0.3, 0.8], [0.55, 0.86], [0.8, 0.83], [1, 0.88]]);
  ridge(x, w, h, css("--ridge"), [[0, 0.9], [0.18, 0.84], [0.32, 0.79], [0.44, 0.83], [0.62, 0.93], [0.85, 0.95], [1, 0.92]]);
}

const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const mo = new MutationObserver(schedule);
onMounted(() => {
  draw();
  window.addEventListener("resize", schedule);
  mq.addEventListener("change", schedule);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
});
onBeforeUnmount(() => { window.removeEventListener("resize", schedule); mq.removeEventListener("change", schedule); mo.disconnect(); });
</script>

<template><canvas ref="el" class="sky" aria-hidden="true"></canvas></template>
