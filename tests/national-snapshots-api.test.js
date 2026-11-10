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
    expect(response.body.records.length).toBe(9);
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
    const civic = request("/api/evidence/snapshots?departmentId=civic");
    expect(civic.body.records.some((record) => record.id === "nbs-gdp-q1-2026")).toBe(false);
    const all = request("/api/evidence/snapshots");
    expect(all.body.records.some((record) => record.id === "nbs-gdp-q1-2026")).toBe(true);
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
});
