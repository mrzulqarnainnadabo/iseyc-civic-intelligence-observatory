import { describe, expect, it } from "vitest";
import handler from "../api/evidence/source-snapshots.js";

function request(url = "/api/evidence/source-snapshots", method = "GET") {
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

describe("numeric source-snapshot API", () => {
  it("serves a versioned, source-validated observation feed", () => {
    const response = request();
    expect(response.statusCode).toBe(200);
    expect(response.body.contractVersion).toBe("1.0.0");
    expect(response.body.source).toBe("iseyc-observatory-curated-source-snapshots-v1");
    expect(response.body.status).toBe("curated");
    expect(response.body.observations).toHaveLength(90);
    expect(response.body.checkedAt).toBe("2026-11-12");
    expect(response.body.observations.every((item) => item.sourceUrl.startsWith("https://") && item.limitations.length > 0)).toBe(true);
  });

  it("preserves the 34-state H1 health-spending coverage and missing states", () => {
    const response = request();
    const stateRows = response.body.observations.filter((item) => item.id.startsWith("budgit-health-actual-spend-") && item.geoLevel === "state");
    expect(stateRows).toHaveLength(34);
    expect(response.body.stateBudgetCoverage.officialStateSourceRoutesLocated).toBe(19);
    expect(response.body.stateBudgetCoverage.stateSourceRoutesNotYetIndividuallyVerified).toBe(17);
    expect(response.body.stateBudgetCoverage.budgitHealthActualExpenditureMissingStates).toEqual(["Osun", "Rivers"]);
    expect(response.body.stateBudgetCoverage.budgitHealthActualExpenditureReconciliationRequiredStates).toEqual(["Sokoto", "Kogi", "Imo", "Cross River"]);
    expect(stateRows.find((item) => item.geographicCoverage === "Kaduna State")?.value).toBe(18.68);
    expect(stateRows.find((item) => item.geographicCoverage === "Sokoto State")?.verificationStatus).toBe("reconciliation_required");
  });

  it("exposes aggregate report discrepancies instead of hiding them", () => {
    const response = request();
    expect(response.body.reconciliationNotes).toHaveLength(4);
    expect(response.body.reconciliationNotes.some((note) => note.title.includes("health total discrepancy"))).toBe(true);
    expect(response.body.observations.find((item) => item.id === "budgit-health-actual-spend-34-states-h1-2026")?.value).toBe(621.34);
    expect(response.body.observations.find((item) => item.id === "budgit-health-budget-performance-h1-2026")?.value).toBe(40.48);
  });

  it("keeps Kaduna approved allocations separate from actual expenditure", () => {
    const response = request();
    const education = response.body.observations.find((item) => item.id === "kaduna-education-budget-share-2026");
    const health = response.body.observations.find((item) => item.id === "kaduna-health-budget-share-2026");
    expect(education.value).toBe(25);
    expect(health.value).toBe(15);
    expect(education.geographicCoverage).toBe("Kaduna State");
    expect(education.limitations.join(" ")).toMatch(/not actual expenditure/);
  });

  it("supports preflight and rejects writes", () => {
    expect(request("/api/evidence/source-snapshots", "OPTIONS").statusCode).toBe(204);
    const post = request("/api/evidence/source-snapshots", "POST");
    expect(post.statusCode).toBe(405);
    expect(post.body.error).toBe("METHOD_NOT_ALLOWED");
  });
});
