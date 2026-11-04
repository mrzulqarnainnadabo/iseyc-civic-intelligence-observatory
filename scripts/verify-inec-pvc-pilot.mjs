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

const ekiti = JSON.parse(fs.readFileSync("data/indicators/inec-ekiti-2026.json", "utf8"));
const ekitiApp = fs.readFileSync("src/data/indicators/inec-ekiti-2026.json", "utf8");
const ekitiSource = fs.readFileSync("data/indicators/inec-ekiti-2026.json", "utf8");
assert.equal(ekitiApp, ekitiSource, "Ekiti source and app copies must stay identical");
assert.equal(ekiti.records[0].registeredVotersForElection, 1059360);
assert.equal(ekiti.records[0].baseRegister2023, 987647);
assert.equal(ekiti.records[0].newRegistrantsReported, 66664);
assert.equal(ekiti.records[0].calculatedBasePlusNew, 1054311);
assert.equal(ekiti.records[0].unreconciledDifference, 5049);
assert.equal(ekiti.records[0].doubleRegistrationsInvalidatedReported, 2103);
assert.ok(ekiti.limitations.some((x) => x.includes("not a nationwide")));
console.log("verify-inec-ekiti-2026: PASS (state register discrepancy retained)");
