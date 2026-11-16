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
