import { describe, expect, it } from "vitest";
import registry from "../src/data/source-registry.json";

describe("national source registry", () => {
  const sources = registry as unknown as { id: string; url: string; sectors: string[]; limitations: string[] }[];
  const ids = new Set(sources.map((source) => source.id));
  it("keeps a unique, expanding source catalogue", () => {
    expect(ids.size).toBe(sources.length);
    expect(sources.length).toBeGreaterThanOrEqual(65);
    for (const source of sources) {
      if (source.url) expect(source.url).toMatch(/^https?:\/\//);
      else expect(source.id).toBe("iseyc-verification");
      expect(source.limitations.length).toBeGreaterThan(0);
    }
  });
  it("covers the four ISEYC department evidence needs and national macro context", () => {
    for (const id of [
      "fme-annual-school-census", "ubec-statistics", "unicef-nalabe-2022", "nemis-downloads",
      "who-gho-nigeria", "nphcda-phc-progress-2025", "nphcda-phc-functionality-dashboard",
      "federal-ministry-health-msdat", "health-facility-registry", "federal-state-health-report-2024",
      "nitda-dl4all-dashboard", "naseni-innovation-hub", "isn-hub-assessment-2026", "ondi-innovation",
      "nbs-cpi-monthly", "nbs-gdp-quarterly", "cbn-statistics", "imf-article-iv-2026", "imf-weo-oct-2026",
      "budget-office-federal", "inec-voter-register-pvc", "nimc-enrolment-oct-2025",
    ]) expect(ids.has(id), id).toBe(true);
  });
  it("keeps source availability distinct from extracted data", () => {
    const healthRegistry = sources.find((source) => source.id === "health-facility-registry")!;
    expect(healthRegistry.limitations.join(" ")).toMatch(/API key|authenticated data/i);
    const ubec = sources.find((source) => source.id === "ubec-statistics")!;
    expect(ubec.limitations.join(" ")).toMatch(/not been extracted|extracted or validated|reference years/i);
  });
});
