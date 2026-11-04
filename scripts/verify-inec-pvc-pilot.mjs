import assert from "node:assert/strict";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("data/indicators/inec-pvc-2023.json", "utf8"));
const appData = fs.readFileSync("src/data/indicators/inec-pvc-2023.json", "utf8");
const sourceData = fs.readFileSync("data/indicators/inec-pvc-2023.json", "utf8");

assert.equal(appData, sourceData, "source and app data copies must stay identical");
assert.equal(data.datasetId, "inec-2023-registered-voters-pvc-collection");
assert.equal(data.sourceReferenceDate, "2023-02-05");
assert.equal(data.geographicCoverage, "36 states and Federal Capital Territory");
assert.equal(data.records.length, 37);
assert.equal(new Set(data.records.map((r) => r.state)).size, 37);
assert.equal(data.records.reduce((n, r) => n + r.registeredVoters, 0), 93469008);
assert.equal(data.records.reduce((n, r) => n + r.collectedPVCs, 0), 87209007);
assert.equal(data.sumOfStateRows.registeredVoters, 93469008);
assert.equal(data.sumOfStateRows.collectedPVCs, 87209007);
assert.equal(data.sumOfStateRows.uncollectedPVCsReported, 6259231);
assert.equal(data.sumOfStateRows.uncollectedPVCsCalculated, 6260001);
assert.equal(data.reconciliation.stateRowsWithUncollectedArithmeticDiscrepancy.length, 16);
assert.equal(data.sourceReportedNationalTotals.uncollectedPVCs, 6259229);
assert.equal(data.records.find((r) => r.state === "Kaduna").registeredVoters, 4335208);
assert.equal(data.records.find((r) => r.state === "Kaduna").collectedPVCs, 4164473);
assert.ok(data.limitations.some((x) => x.includes("Historical 2023")));
assert.ok(data.limitations.some((x) => x.includes("arithmetic inconsistencies")));
console.log("verify-inec-pvc-pilot: PASS (37 geographies; source arithmetic warnings retained)");
