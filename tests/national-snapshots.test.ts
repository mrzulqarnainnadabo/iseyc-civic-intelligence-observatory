import { describe, expect, it } from "vitest";
import snapshots from "../src/data/indicators/national-department-snapshots.v1.json";
import registry from "../src/data/source-registry.json";

describe("dated national evidence snapshots", () => {
  const sources = registry as unknown as { id: string; url: string | null }[];
  it("uses unique snapshot IDs and only registered source IDs", () => {
    const ids = snapshots.records.map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const record of snapshots.records) {
      const source = sources.find((item) => item.id === record.sourceId);
      expect(source, record.id).toBeTruthy();
      expect(source?.url).toBeTruthy();
      expect(new URL(record.sourceUrl).origin).toBe(new URL(source!.url!).origin);
      expect(record.metrics.length).toBeGreaterThan(0);
      expect(record.limitations.length).toBeGreaterThan(0);
      expect(record.retrievedAt).toMatch(/^2026-11-09$/);
    }
  });
  it("preserves WHO estimate intervals and separate reference years", () => {
    const who = snapshots.records.find((record) => record.id === "who-nigeria-health-2025")!;
    expect(who.metrics.map((item) => item.period)).toEqual(["2025", "2023", "2022"]);
    expect(who.metrics.every((item) => Boolean(item.interval))).toBe(true);
    expect(who.limitations.join(" ")).toMatch(/statistical estimates/);
  });
  it("does not turn NIMC enrolment into population coverage or local data", () => {
    const nimc = snapshots.records.find((record) => record.id === "nimc-enrolment-2025-10")!;
    expect(nimc.metrics[0].value).toBe("123,906,318");
    expect(nimc.metrics[1].value).toBe("7,326,730");
    expect(nimc.limitations.join(" ")).toMatch(/not a population census/);
    expect(nimc.limitations.join(" ")).toMatch(/Kaduna State is not Kaduna South/);
  });
  it("labels NITDA progress as programme target progress, not national literacy prevalence", () => {
    const nitda = snapshots.records.find((record) => record.id === "nitda-dl4all-2026-10")!;
    expect(nitda.metrics.find((item) => item.label === "Progress against 50m programme target")?.value).toBe("5.57%");
    expect(nitda.limitations.join(" ")).toMatch(/not Nigeria's national digital literacy rate/);
  });
  it("keeps NASENI prize terms as an announcement, not a delivery claim", () => {
    const naseni = snapshots.records.find((record) => record.id === "naseni-innovatenaija-2025")!;
    expect(naseni.evidenceType).toMatch(/announcement/);
    expect(naseni.limitations.join(" ")).toMatch(/not evidence that the funds were disbursed/);
  });
  it("keeps NBS national GDP context outside the four operational departments", () => {
    const gdp = snapshots.records.find((record) => record.id === "nbs-gdp-q1-2026")!;
    expect(gdp.departmentId).toBeNull();
    expect(gdp.metrics[0].value).toBe("3.89%");
    expect(gdp.limitations.join(" ")).toMatch(/not a Kaduna State or LGA growth rate/);
  });
});
