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
      expect(record.retrievedAt).toMatch(/^2026-11-\d{2}$/);
      for (const metric of [...record.metrics, ...(record.additionalMetrics ?? [])]) {
        expect(metric.measurementType, `${record.id}: ${metric.label}`).toBeTruthy();
      }
    }
  });
  it("uses the current WHO Nigeria profile and preserves indicator-specific periods and uncertainty", () => {
    const who = snapshots.records.find((record) => record.id === "who-nigeria-health-2021-23")!;
    expect(who.sourceUrl).toBe("https://data.who.int/countries/566");
    expect(who.metrics).toHaveLength(1);
    expect(who.metrics[0]).toMatchObject({
      label: "Under-five mortality",
      value: "117.46",
      period: "2022",
      interval: "104.01–132.8",
    });
    expect(who.additionalMetrics?.find((item) => item.label === "Life expectancy at birth")).toMatchObject({
      value: "62.9",
      period: "2023",
      interval: "59.8–66.2",
    });
    expect(who.additionalMetrics?.find((item) => item.label === "New HIV infections")).toMatchObject({
      value: "0.27",
      period: "2025",
      interval: "0.21–0.39",
    });
    expect(who.limitations.join(" ")).toMatch(/no 2023 value for new HIV infections/);
    expect(who.additionalMetrics?.some((item) => item.measurementType === "modelled estimate")).toBe(true);
    expect(who.metrics.every((item) => Boolean(item.interval))).toBe(true);
    expect(who.limitations.join(" ")).toMatch(/statistical\/modelled estimates/);
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
    expect(nitda.additionalMetrics?.some((item) => item.label === "Persons with disabilities trained")).toBe(true);
  });
  it("cross-links digital literacy and innovation evidence to both education and technology", () => {
    const nitda = snapshots.records.find((record) => record.id === "nitda-dl4all-2026-10")!;
    const naseni = snapshots.records.find((record) => record.id === "naseni-innovatenaija-2025")!;
    expect(nitda.departmentIds).toEqual(["software-technology", "education"]);
    expect(naseni.departmentIds).toEqual(["software-technology", "education"]);
  });
  it("keeps NASENI prize terms as an announcement, not a delivery claim", () => {
    const naseni = snapshots.records.find((record) => record.id === "naseni-innovatenaija-2025")!;
    expect(naseni.evidenceType).toMatch(/announcement/);
    expect(naseni.limitations.join(" ")).toMatch(/not evidence that the funds were disbursed/);
    expect(naseni.metrics.find((item) => item.label === "Application status")?.value).toBe("Closed");
    expect(naseni.metrics.find((item) => item.label === "Phase 2 public voting")?.value).toBe("Ended");
    expect(naseni.relatedSources?.[0].title).toContain("announcement");
  });
  it("preserves the ISN assessment as a survey summary, not a hub census or target result", () => {
    const isn = snapshots.records.find((record) => record.id === "isn-innovation-hub-assessment-2026")!;
    expect(isn.metrics.find((item) => item.label === "Hubs with fewer than 10 full-time employees")?.value).toBe("68.35%");
    expect(isn.additionalMetrics?.find((item) => item.label === "Hubs reporting recurrent power outages")?.value).toBe(">60%");
    expect(isn.limitations.join(" ")).toMatch(/not a census share of all Nigerian hubs/);
    expect(isn.limitations.join(" ")).toMatch(/strategic targets, not achieved results/);
    expect(isn.departmentIds).toEqual(["software-technology", "education"]);
  });
  it("keeps NBS national GDP context outside the four operational departments", () => {
    const gdp = snapshots.records.find((record) => record.id === "nbs-gdp-q1-2026")!;
    expect(gdp.departmentId).toBeNull();
    expect(gdp.metrics[0].value).toBe("3.89%");
    expect(gdp.limitations.join(" ")).toMatch(/not a Kaduna State or LGA growth rate/);
  });

  it("uses the current Federal Ministry of Education school-census snapshot with its reporting limitation", () => {
    const national = snapshots.records.find((record) => record.id === "fme-annual-school-census-national-2024-25")!;
    const kaduna = snapshots.records.find((record) => record.id === "fme-annual-school-census-kaduna-2024-25")!;
    expect(national.sourceId).toBe("fme-annual-school-census");
    expect(national.metrics.find((item) => item.label === "Reporting rate")?.value).toBe("53.7%");
    expect(national.metrics.find((item) => item.label === "Schools reported")?.value).toBe("124,066");
    expect(national.metrics.find((item) => item.label === "Total schools displayed")?.value).toBe("230,844");
    expect(national.limitations.join(" ")).toMatch(/53.7% reporting rate/);
    expect(kaduna.geography.label).toBe("Kaduna State");
    expect(kaduna.metrics.find((item) => item.label === "Learners")?.value).toBe("2,718,125");
    expect(kaduna.metrics.find((item) => item.label === "Learner–teacher ratio")?.value).toBe("51.3");
    expect(kaduna.limitations.join(" ")).toMatch(/not Kaduna South/);
  });

  it("keeps World Bank national macroeconomic figures tied to their distinct observed periods", () => {
    const wb = snapshots.records.find((record) => record.id === "worldbank-ndu-2026-10")!;
    expect(wb.departmentId).toBeNull();
    expect(wb.metrics.find((item) => item.label === "Real GDP growth")?.value).toBe("4.2%");
    expect(wb.metrics.find((item) => item.label === "Real GDP growth")?.period).toBe("H1 2026");
    expect(wb.metrics.find((item) => item.label === "Current account surplus")?.period).toBe("Q1 2026");
    expect(wb.limitations.join(" ")).toMatch(/not a state, LGA or household growth rate/);
  });


  it("keeps NPHCDA PHC programme outputs dated and separates national, multi-state and combined Kaduna/Yobe geography", () => {
    const ids = [
      "nphcda-phc-infrastructure-progress-2025",
      "nphcda-bhcpf-funding-and-upgrades-2025",
      "nphcda-phc-workforce-progress-2025",
      "nphcda-multistate-service-support-2025",
      "nphcda-kaduna-yobe-recruitment-2025",
    ];
    const records = ids.map((id) => snapshots.records.find((record) => record.id === id)!);
    expect(records.every((record) => record.sourceId === "nphcda-phc-progress-2025")).toBe(true);
    expect(records.every((record) => record.departmentId === "health")).toBe(true);
    expect(records.every((record) => record.retrievedAt === "2026-11-09")).toBe(true);
    const combined = records[4];
    expect(combined.geography.label).toBe("Kaduna State + Yobe State · combined totals; state split not published");
    expect(combined.metrics.find((metric) => metric.label === "Skilled birth attendants recruited")?.value).toBe("380");
    expect(combined.metrics.find((metric) => metric.label === "Community-based health workers recruited")?.value).toBe("1,227");
    expect(combined.limitations.join(" ")).toMatch(/do not assign either total to Kaduna State alone/);
    const funding = records[1];
    expect(funding.metrics.find((metric) => metric.label === "BHCPF disbursement in first half of 2025")?.measurementType).toContain("included in the wider");
    expect(funding.interpretation).toMatch(/part of—not additional to/);
    expect(records[3].geography.level).toBe("varies");
    expect(records[3].limitations.join(" ")).toMatch(/does not name the 10 states/);
    expect(records[0].limitations.join(" ")).toMatch(/not a current 2026 status/);
  });

});
