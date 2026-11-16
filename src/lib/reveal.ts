import type { Directive } from "vue";

// v-reveal: sections lift in softly as they scroll into view. Content stays visible without JS,
// above the fold, and when the viewer prefers reduced motion.
const io = typeof IntersectionObserver !== "undefined"
  ? new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); e.target.classList.remove("pre"); io!.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
  : null;

export const reveal: Directive<HTMLElement> = {
  mounted(el) {
    el.classList.add("reveal");
    if (!io || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    el.classList.add("pre");
    io.observe(el);
  },
  unmounted(el) { io?.unobserve(el); },
};
