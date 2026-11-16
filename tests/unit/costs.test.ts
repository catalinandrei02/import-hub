import { describe, expect, it } from "vitest";
import { landed, carGst, numCosts } from "../../src/lib/costs";
import { decodeVin } from "../../src/lib/vin";
import { DEF_COSTS } from "../../src/lib/constants";
import { fillTemplate, templateValues } from "../../src/lib/templates";

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

describe("message templates", () => {
  it("fills known placeholders and leaves the rest marked", () => {
    const vals = templateValues({ title: "Audi Q5", year: 2023, vin: "WA1EAAFY2P2004677", stock: "H1972", price: 27890, offer: 26500, contact: "Florence Tremblay", seller: "VW", sellerType: "dealer" } as any, "fr");
    const out = fillTemplate("Bonjour [PRÉNOM], budget [PRIX] $ pour le [MODÈLE] [ANNÉE]. [NOM]", vals);
    expect(out.plain).toBe("Bonjour Florence, budget 26 500 $ pour le Audi Q5 Progressiv 2023. [NOM]");
    expect(out.parts.filter(p => p.kind === "missing").map(p => p.text)).toEqual(["[NOM]"]);
  });
});
