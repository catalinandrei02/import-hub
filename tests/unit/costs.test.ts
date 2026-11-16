import { describe, expect, it } from "vitest";
import { landed, carGst, numCosts } from "../../src/lib/costs";
import { decodeVin } from "../../src/lib/vin";
import { DEF_COSTS } from "../../src/lib/constants";

describe("landed cost (CLAUDE.md §5)", () => {
  it("25,000 CAD with GST lands at about 27,028 €", () => {
    expect(Math.round(landed(25000, true, DEF_COSTS).total)).toBe(27028);
  });
  it("matches the formula step by step", () => {
    const r = landed(25000, true, DEF_COSTS);
    expect(r.car).toBeCloseTo(16000);
    expect(r.gst).toBeCloseTo(800);
    expect(r.ship).toBeCloseTo(1290.5);
    expect(r.ins).toBeCloseTo(240);
    expect(r.cif).toBeCloseTo(18330.5);
    expect(r.duty).toBeCloseTo(1833.05);
    expect(r.vat).toBeCloseTo(4234.3455);
  });
  it("each 1,000 CAD off saves about 900 € with GST, 865 € without", () => {
    expect(Math.round(landed(25000, true, DEF_COSTS).perK)).toBe(907);
    expect(Math.round(landed(25000, false, DEF_COSTS).perK)).toBe(865);
  });
  it("defaults GST by seller type unless set per car", () => {
    expect(carGst({ sellerType: "dealer" })).toBe(true);
    expect(carGst({ sellerType: "private" })).toBe(false);
    expect(carGst({ sellerType: "dealer", gst: false })).toBe(false);
  });
  it("coerces stored rates and falls back to defaults", () => {
    expect(numCosts({ cadEur: "0.65", vatPct: "", shipUsd: null })).toMatchObject({ cadEur: 0.65, vatPct: 21, shipUsd: 1450 });
  });
});

describe("VIN decoder (CLAUDE.md §5)", () => {
  it("reads trim, year and model", () => {
    expect(decodeVin("WA1FAAFY2M2004811")).toMatchObject({ trim: "Technik", year: 2021, isQ5: true, phev: false });
    expect(decodeVin("WA1EAAFY2P2004677")).toMatchObject({ trim: "Progressiv", year: 2023 });
  });
  it("flags plug-in hybrids and non-Q5", () => {
    expect(decodeVin("WA1F2AFY2M2004811")).toMatchObject({ phev: true });
    expect(decodeVin("WA1FAAXX2M2004811")).toMatchObject({ isQ5: false });
  });
  it("rejects wrong length", () => expect(decodeVin("WA1")).toEqual({ err: "bad" }));
});

import { matchCars, siteLinks, splitModel } from "../../src/lib/search";

describe("search", () => {
  const q = { text: "Audi Q5", yearMin: 2021, yearMax: 2024, maxPrice: 28000, maxKm: 120000, center: "Laval", radiusKm: 100 };
  it("splits make and model", () => expect(splitModel("Audi Q5 Technik")).toEqual({ make: "audi", model: "q5", rest: "Technik" }));
  it("builds AutoTrader and Kijiji links with filters in the URL", () => {
    const l = Object.fromEntries(siteLinks(q, ["autotrader", "kijiji", "cargurus"]).map(x => [x.id, x.url]));
    expect(l.autotrader).toBe("https://www.autotrader.ca/cars/audi/q5/reg_qc/cit_laval/ot_used/pr_28000?modelyearfrom=2021&modelyearto=2024&kmto=120000&radius=100");
    expect(l.kijiji).toBe("https://www.kijiji.ca/b-cars-trucks/quebec/audi-q5/k0c174l9001?price=__28000&caryear=2021__2024&carmileageinkms=__120000");
    expect(decodeURIComponent(l.cargurus)).toContain('site:cargurus.ca "Audi Q5" 2021..2024 Laval');
  });
  it("only lists the chosen sites", () => expect(siteLinks(q, ["kijiji"]).map(x => x.id)).toEqual(["kijiji"]));
  it("matches saved cars by text and filters, never by unknown equipment", () => {
    const cars = [
      { _id: "a", title: "Audi Q5", year: 2021, price: 27000, km: 80000, cam: "", status: "watching", vin: "WA1FAAFY2M2004811" },
      { _id: "b", title: "Audi Q5", year: 2023, price: 31000, km: 40000, status: "watching" },
      { _id: "c", title: "Audi Q5", year: 2021, price: 25000, km: 90000, cam: "no", status: "watching" },
      { _id: "d", title: "Audi Q5", year: 2022, price: 26000, km: 50000, status: "dropped" },
    ] as any;
    expect(matchCars(cars, { ...q, must360: true }).map(c => c._id)).toEqual(["a"]);
    expect(matchCars(cars, { text: "technik" }).map(c => c._id)).toEqual(["a"]);
  });
});

import { cleanNum, parseImport } from "../../src/lib/importer";

describe("listing import", () => {
  it("reads prices and kilometres in any format", () => {
    expect(cleanNum("27,999.00")).toBe(27999);
    expect(cleanNum("29 750 $")).toBe(29750);
    expect(cleanNum("88 000 km")).toBe(88000);
    expect(cleanNum("$31,490")).toBe(31490);
    expect(cleanNum("")).toBeNull();
  });
  it("turns the bookmark payload into a prefilled car", () => {
    const car = parseImport(JSON.stringify({ u: "https://www.example.ca/listing/1", t: "2021 Audi Q5 Technik 45 TFSI quattro", p: "29750.00", k: "88 000", y: "", v: "wa1faafy2m2004811", s: "Example Motors", l: "Laval", i: ["https://img.example.ca/1.jpg", "javascript:alert(1)", "https://img.example.ca/2.jpg"] }));
    expect(car).toMatchObject({ title: "Audi Q5", year: 2021, vin: "WA1FAAFY2M2004811", trim: "Technik", price: 29750, km: 88000, seller: "Example Motors", location: "Laval" });
    expect(car!.photos).toEqual(["https://img.example.ca/1.jpg", "https://img.example.ca/2.jpg"]);
  });
  it("rejects broken payloads", () => expect(parseImport("{not json")).toBeNull());
});

describe("parseImport: site data", () => {
  it("takes seller type and the trim from the version text when there is no VIN", () => {
    const c = parseImport(JSON.stringify({ u: "https://www.autotrader.ca/offers/x", t: "2023 Audi Q5 45 TFSI", p: "$ 36,895", k: "28669", y: "2023", v: "", s: "Dealer", l: "Laval", st: "dealer", tr: "PROGRESSIV QUATTRO 19 PCS", i: [] }))!;
    expect([c.title, c.year, c.trim, c.price, c.km, c.sellerType]).toEqual(["Audi Q5", 2023, "Progressiv", 36895, 28669, "dealer"]);
  });
  it("keeps up to 40 photos", () => {
    const c = parseImport(JSON.stringify({ i: Array.from({ length: 45 }, (_, k) => `https://x.test/${k}.jpg`) }))!;
    expect(c.photos!.length).toBe(40);
  });
});

import { pluralForm } from "../../src/lib/plural";
describe("pluralForm (view counts)", () => {
  it("uses Romanian, French and English plural forms", () => {
    expect([0, 1, 2, 19, 20, 101, 120, 200].map(n => pluralForm(n, "ro"))).toEqual(["few", "one", "few", "few", "many", "few", "many", "many"]);
    expect([0, 1, 2].map(n => pluralForm(n, "fr"))).toEqual(["one", "one", "few"]);
    expect([0, 1, 20].map(n => pluralForm(n, "en"))).toEqual(["few", "one", "few"]);
  });
});

import { splitChunks } from "../../src/data/files";
describe("PDF pieces", () => {
  it("splits base64 into pieces under the Firestore limit and joins back", () => {
    const s = "A".repeat(1_500_001);
    const parts = splitChunks(s);
    expect(parts.length).toBe(3);
    expect(Math.max(...parts.map(p => p.length))).toBeLessThan(1_000_000);
    expect(parts.join("")).toBe(s);
  });
});
