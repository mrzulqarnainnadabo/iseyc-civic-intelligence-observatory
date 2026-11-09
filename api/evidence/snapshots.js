import snapshotData from "../../src/data/indicators/national-department-snapshots.v1.json" with { type: "json" };

const MAX_RECORDS = 20;
const SOURCE_ID = "iseyc-observatory-national-snapshots-v1";

function send(res, status, body) {
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

/**
 * GET /api/evidence/snapshots
 * GET /api/evidence/snapshots?departmentId=health
 * GET /api/evidence/snapshots?catalog=1
 *
 * Read-only, allowlisted source transcriptions. Not a live publisher API.
 * Each observation retains its own publisher, source URL, geography and period.
 */
export default function handler(req, res) {
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    send(res, 405, { contractVersion: "1.0.0", status: "error", error: "METHOD_NOT_ALLOWED", records: [] });
    return;
  }

  const url = new URL(req.url || "/", "http://localhost");
  const departmentId = url.searchParams.get("departmentId");
  const allowedDepartments = new Set(["education", "health", "software-technology", "civic"]);

  if (departmentId && !allowedDepartments.has(departmentId)) {
    send(res, 400, { contractVersion: "1.0.0", status: "error", error: "DEPARTMENT_NOT_ALLOWED", records: [] });
    return;
  }

  const records = snapshotData.records.slice(0, MAX_RECORDS).filter((record) => {
    if (!departmentId) return true;
    return record.departmentId === departmentId || record.departmentIds?.includes(departmentId);
  });

  if (url.searchParams.get("catalog") === "1") {
    send(res, 200, {
      contractVersion: "1.0.0",
      source: SOURCE_ID,
      retrievedAt: snapshotData.retrievedAt,
      recordCount: records.length,
      records: records.map((record) => ({
        id: record.id,
        title: record.title,
        publisher: record.publisher,
        sourceId: record.sourceId,
        sourceUrl: record.sourceUrl,
        referencePeriod: record.referencePeriod,
        geography: record.geography,
        evidenceType: record.evidenceType,
      })),
      note: "Curated, dated publisher-source transcriptions. This is not a live feed from the listed institutions.",
    });
    return;
  }

  send(res, 200, {
    contractVersion: "1.0.0",
    status: records.length ? "ok" : "empty",
    source: SOURCE_ID,
    retrievedAt: snapshotData.retrievedAt,
    recordCount: records.length,
    records,
    note: snapshotData.note,
    limitations: [
      "Snapshots are manually curated transcriptions and are not continuously refreshed.",
      "Each record's reference period, publisher, geography, evidence type and limitations must remain attached.",
      "A source snapshot is not independent verification or proof of implementation.",
    ],
  });
}
