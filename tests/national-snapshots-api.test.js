import { describe, expect, it } from "vitest";
import handler, { selectSnapshotRecords } from "../api/evidence/snapshots.js";

function request(url, method = "GET") {
  const res = {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name] = value; },
    end(body = "") { this.body = body; },
  };
  handler({ method, url }, res);
  return { statusCode: res.statusCode, headers: res.headers, body: res.body ? JSON.parse(res.body) : null };
}

describe("national source snapshot endpoint", () => {
  it("returns the curated snapshot feed with publisher provenance", () => {
    const response = request("/api/evidence/snapshots");
    expect(response.statusCode).toBe(200);
    expect(response.body.contractVersion).toBe("1.0.0");
    expect(response.body.source).toBe("iseyc-observatory-national-snapshots-v1");
    expect(response.body.status).toBe("ok");
    expect(response.body.records.length).toBe(17);
    expect(response.body.observations.length).toBe(48);
    expect(response.body.observations.some((item) => item.id === "ngf-state-budget-education-share-2026" && item.value === 14.4)).toBe(true);
    expect(response.body.observations.some((item) => item.id === "ngf-state-budget-health-share-2026" && item.value === 9.3)).toBe(true);
    expect(response.body.checkedAt).toBe("2026-11-12");
    expect(response.body.records.every((record) => record.sourceUrl && record.referencePeriod && record.limitations.length)).toBe(true);
    expect(response.body.records.some((record) => record.id === "fme-annual-school-census-national-2024-25")).toBe(true);
    expect(response.body.records.some((record) => record.id === "fme-annual-school-census-kaduna-2024-25")).toBe(true);
    expect(response.body.records.some((record) => record.id === "worldbank-ndu-2026-10")).toBe(true);
    expect(response.body.note).toMatch(/not a continuously refreshed data feed/);
  });

  it("filters to evidence explicitly linked to a department", () => {
    const education = request("/api/evidence/snapshots?departmentId=education");
    expect(education.statusCode).toBe(200);
    expect(education.body.records.some((record) => record.id === "nitda-dl4all-2026-10")).toBe(true);
    expect(education.body.records.some((record) => record.id === "naseni-innovatenaija-2025")).toBe(true);
    expect(education.body.records.some((record) => record.id === "isn-innovation-hub-assessment-2026")).toBe(true);
    expect(education.body.records.some((record) => record.id === "nimc-enrolment-2025-10")).toBe(false);
    const software = request("/api/evidence/snapshots?departmentId=digital-systems");
    expect(software.statusCode).toBe(200);
    expect(software.body.records.some((record) => record.id === "nitda-dl4all-2026-10")).toBe(true);
    expect(software.body.records.find((record) => record.id === "nitda-dl4all-2026-10").departmentIds).toContain("digital-systems");
  });

  it("filters department records before applying the response cap", () => {
    const records = Array.from({ length: 25 }, (_, index) => ({
      id: `record-${index}`,
      departmentId: index < 20 ? "education" : "health",
    }));
    expect(selectSnapshotRecords(records, "health").map((record) => record.id)).toEqual([
      "record-20", "record-21", "record-22", "record-23", "record-24",
    ]);
    expect(selectSnapshotRecords(records, null)).toHaveLength(20);
  });

  it("keeps national context outside the four department-specific feeds", () => {
    const civic = request("/api/evidence/snapshots?departmentId=civic-affairs");
    expect(civic.body.records.some((record) => record.id === "nimc-enrolment-2025-10")).toBe(true);
    expect(civic.body.records.find((record) => record.id === "nimc-enrolment-2025-10").departmentId).toBe("civic-affairs");
    expect(civic.body.records.some((record) => record.id === "nbs-gdp-q1-2026")).toBe(false);
    const legacyCivic = request("/api/evidence/snapshots?departmentId=civic");
    expect(legacyCivic.body.records.some((record) => record.id === "nimc-enrolment-2025-10")).toBe(true);
    const all = request("/api/evidence/snapshots");
    expect(all.body.records.some((record) => record.id === "nbs-gdp-q1-2026")).toBe(true);
  });

  it("returns the same observations contract used by Civic Brain and filters both schemas by department", () => {
    const health = request("/api/evidence/snapshots?departmentId=health");
    expect(health.body.observations.some((item) => item.id === "ngf-state-budget-health-share-2026")).toBe(true);
    expect(health.body.observations.some((item) => item.id === "ngf-state-budget-education-share-2026")).toBe(false);
    expect(health.body.records.some((record) => record.id === "nphcda-phc-infrastructure-progress-2025")).toBe(true);
    const education = request("/api/evidence/snapshots?departmentId=education");
    expect(education.body.observations.some((item) => item.id === "ngf-state-budget-education-share-2026")).toBe(true);
    expect(education.body.observations.some((item) => item.id === "ngf-state-budget-health-share-2026")).toBe(false);
  });

  it("rejects unknown departments and unsupported methods", () => {
    expect(request("/api/evidence/snapshots?departmentId=finance").statusCode).toBe(400);
    const post = request("/api/evidence/snapshots", "POST");
    expect(post.statusCode).toBe(405);
    expect(post.body.records).toEqual([]);
  });

  it("is read-only and sends public cache and CORS headers", () => {
    const response = request("/api/evidence/snapshots");
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(response.headers["Cache-Control"]).toContain("s-maxage=1800");
  });

  it("includes dated NPHCDA programme snapshots without implying current facility functionality", () => {
    const health = request("/api/evidence/snapshots?departmentId=health");
    expect(health.statusCode).toBe(200);
    const ids = health.body.records.map((record) => record.id);
    for (const id of [
      "nphcda-phc-infrastructure-progress-2025",
      "nphcda-bhcpf-funding-and-upgrades-2025",
      "nphcda-phc-workforce-progress-2025",
      "nphcda-multistate-service-support-2025",
      "nphcda-kaduna-yobe-recruitment-2025",
    ]) expect(ids).toContain(id);
    const combined = health.body.records.find((record) => record.id === "nphcda-kaduna-yobe-recruitment-2025");
    expect(combined.geography.label).toMatch(/Kaduna State \+ Yobe State/);
    expect(combined.geography.label).toMatch(/combined totals; state split not published/);
    expect(combined.metrics.find((metric) => metric.label === "Skilled birth attendants recruited").value).toBe("380");
    expect(combined.limitations.join(" ")).toMatch(/do not assign either total to Kaduna State alone/);
    const education = request("/api/evidence/snapshots?departmentId=education");
    expect(education.body.records.some((record) => record.id.startsWith("nphcda-"))).toBe(false);
  });

});
