// Reads a car listing page: details and photo links. Used by the "Add to Import Hub" bookmark and by the Chrome
// extension (extension/reader.js is generated from this file by `npm run build:ext`). No imports on purpose.
export interface ListingData { u: string; t: string; p: string; k: string; y: string; v: string; s: string; l: string; i: string[] }

/**
 * Self-contained on purpose: its source text becomes the bookmark, so it must not use anything from outside the function.
 * With `base` it opens Import Hub; without, it returns what it found (used by the tests).
 */
export function readListing(base?: string): ListingData | void {
  const doc = document;
  const text = (doc.body && doc.body.innerText) || "";
  const flat = (x: any): any[] => (Array.isArray(x) ? x.flatMap(flat) : x && x["@graph"] ? flat(x["@graph"]) : x ? [x] : []);
  const ld: any[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { ld.push(...flat(JSON.parse(s.textContent || ""))); } catch { /* skip broken blocks */ } });
  const isCar = (o: any) => /Car|Vehicle|Product|Offer/i.test(String([].concat(o && o["@type"]).join(" ")));
  const v: any = ld.find(o => /Car|Vehicle/i.test(String([].concat(o["@type"]).join(" ")))) || ld.find(isCar) || {};
  const offer: any = [].concat(v.offers || (/Offer/.test(String(v["@type"])) ? v : []))[0] || {};
  const meta = (p: string) => { const m = doc.querySelector(`meta[property="${p}"],meta[name="${p}"]`); return (m && m.getAttribute("content")) || ""; };
  // Photos: every size variant of one picture counts once (the largest wins). Sources, best first: the listing's
  // structured data, og:image, the gallery on the page (lazy-loaded pictures too), then the gallery array that
  // listing sites embed in their page scripts, read only around the main photo so "similar cars" are left out.
  const found: { k: string; u: string; w: number; o: number }[] = [];
  const bad = /logo|icon|sprite|avatar|badge|placeholder|favicon|banner|flag|staticmap|maps\.|\.svg|\.gif|pixel|tracking|1x1/i;
  const sizeOf = (u: string) => { const m = u.match(/(\d{3,4})x\d{3,4}/) || u.match(/[?&](?:w|width|size|imwidth)=(\d+)/i) || u.match(/[/_-][sw]-?l?(\d{3,4})\b/i); return m ? +m[1] : 0; };
  const keyOf = (u: string) => u.replace(/^https?:/, "").split(/[?#]/)[0].replace(/[-_]?\d{3,4}x\d{3,4}/g, "").replace(/[/_-][sw]-?l?\d{3,4}(?=[._/])/gi, "").toLowerCase();
  const add = (raw: any, w = 0) => {
    let u = typeof raw === "string" ? raw : raw && (raw.url || raw.contentUrl);
    if (!u) return;
    u = String(u).replace(/\\u002F/gi, "/").replace(/\\\//g, "/").replace(/&amp;/g, "&").trim();
    if (u.startsWith("//")) u = "https:" + u;
    if (!/^https?:\/\//.test(u) || bad.test(u)) return;
    const k = keyOf(u), sz = Math.max(w, sizeOf(u)), have = found.find(f => f.k === k);
    if (!have) found.push({ k, u, w: sz, o: found.length });
    else if (sz > have.w) { have.u = u; have.w = sz; }
  };
  const best = (set: string) => { let u = "", w = -1; set.split(/,\s+/).forEach(part => { const [src, d] = part.trim().split(/\s+/); const n = parseFloat(d || "1") * (/x$/.test(d || "") ? 1000 : 1); if (src && n > w) { u = src; w = n; } }); return { u, w }; };
  [].concat(v.image || []).forEach(x => add(x, 1000));
  add(meta("og:image"), 900); add(meta("twitter:image"), 800);
  const all = Array.from(doc.querySelectorAll("img, picture source")) as any[];
  const gallery = new Set<Element>();
  const up = (el: Element | null, n: number, fn: (e: Element) => void) => { for (let i = 0; el && i < n; i++, el = el.parentElement) fn(el); };
  const src = (im: any) => { const set = im.getAttribute("srcset") || im.getAttribute("data-srcset") || ""; const b = set ? best(set) : { u: "", w: 0 }; return { u: b.u || im.currentSrc || im.getAttribute("data-src") || im.getAttribute("data-lazy-src") || im.getAttribute("data-original") || im.src || "", w: b.w > 10 ? b.w : 0 }; };
  all.filter(im => im.tagName === "IMG" && (im.naturalWidth || im.width) >= 480 && (im.naturalHeight || im.height) >= 300)
    .sort((a, b) => (b.naturalWidth || b.width) - (a.naturalWidth || a.width))
    .forEach(im => { const s = src(im); add(s.u, Math.max(s.w, im.naturalWidth || im.width)); up(im.parentElement, 5, e => gallery.add(e)); });
  // Pictures that have not loaded yet (carousels) count when they sit in the same gallery as a large photo.
  all.forEach(im => { let inG = false; up(im.parentElement, 5, e => { if (gallery.has(e)) inG = true; }); if (inG) { const s = src(im); add(s.u, s.w); } });
  doc.querySelectorAll('link[rel="preload"][as="image"]').forEach(l => add(l.getAttribute("href") || best(l.getAttribute("imagesrcset") || "").u, 600));
  const main = found[0];
  if (main && found.length < 40) {
    const urlRe = /https?:(?:\\?\/){2}[^"'\s<>()]+?\.(?:jpe?g|webp|png)(?:\?[^"'\s<>]*)?/gi;
    const host = main.u.split("/")[2];
    doc.querySelectorAll("script:not([src])").forEach(sc => {
      const txt = sc.textContent || "";
      if (txt.length < 200 || !txt.includes(host)) return;
      const hits: { u: string; i: number }[] = []; let m: RegExpExecArray | null;
      urlRe.lastIndex = 0;
      while ((m = urlRe.exec(txt))) hits.push({ u: m[0], i: m.index });
      const at = hits.findIndex(h => keyOf(h.u.replace(/\\\//g, "/")) === main.k);
      if (at < 0) return;
      // Walk out from the main photo while the links stay close together (one gallery array) and on the same host.
      const near = (a: { u: string; i: number }, b: { u: string; i: number }) => Math.abs(a.i - b.i) < 5000 && b.u.replace(/\\\//g, "/").split("/")[2] === host;
      let lo = at, hi = at;
      while (lo > 0 && near(hits[lo], hits[lo - 1])) lo--;
      while (hi < hits.length - 1 && near(hits[hi], hits[hi + 1])) hi++;
      hits.slice(lo, hi + 1).forEach(h => add(h.u));
    });
  }
  // Sites that name sizes in the link (…-152x114.jpg / …-1024x768.jpg) have every size of every photo: use the largest
  // size seen on that host for all its photos, so thumbnails don't end up as blurry main photos.
  const dim = /-(\d{2,4})x(\d{2,4})(\.(?:jpe?g|webp|png))/i;
  const top: Record<string, string> = {};
  found.forEach(f => { const m = f.u.match(dim), h = f.u.split("/")[2]; if (m && (!top[h] || +m[1] > +(top[h].match(/\d+/) || [0])[0])) top[h] = "-" + m[1] + "x" + m[2]; });
  found.forEach(f => { const m = f.u.match(dim), h = f.u.split("/")[2]; if (m && top[h]) f.u = f.u.replace(dim, top[h] + m[3]); });
  const imgs = found.sort((a, b) => a.o - b.o).map(f => f.u);
  const vinRe = /\b([A-HJ-NPR-Z0-9]{17})\b/;
  const near = text.match(/(?:VIN|NIV|Vehicle Identification)[^A-Z0-9]{0,12}([A-HJ-NPR-Z0-9]{17})/i);
  const vin = String(v.vehicleIdentificationNumber || (near && near[1]) || (text.match(/\bWA1[A-HJ-NPR-Z0-9]{14}\b/) || [])[0] || (text.match(vinRe) || [])[1] || "").toUpperCase();
  const odo = v.mileageFromOdometer || {};
  const kmText = text.match(/([\d][\d\s.,]{2,9})\s*(km|kilom)/i);
  const title = String(v.name || meta("og:title") || doc.title || "").trim();
  const year = String(v.vehicleModelDate || v.modelDate || v.productionDate || (title.match(/\b(19|20)\d{2}\b/) || [""])[0]);
  const seller = offer.seller || v.seller || {};
  const addr = (seller.address && (seller.address.addressLocality || seller.address.addressRegion)) || "";
  const data = {
    u: location.href.split("#")[0], t: title.slice(0, 120), p: String(offer.price || v.price || meta("product:price:amount") || ""),
    k: String(odo.value || (kmText ? kmText[1] : "")), y: year, v: vin.length === 17 ? vin : "",
    s: String(seller.name || "").slice(0, 80), l: String(addr).slice(0, 60), i: imgs.slice(0, 40),
  };
  if (!base) return data;
  window.open(base + "#/cars?add=" + encodeURIComponent(JSON.stringify(data)), "_blank");
}

