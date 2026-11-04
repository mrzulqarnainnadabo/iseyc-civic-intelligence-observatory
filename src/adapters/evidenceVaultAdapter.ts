import type { EvidenceVaultFeed, EvidenceVaultRecord } from "../data/types";

export const DEFAULT_EVIDENCE_VAULT_URL =
  "https://2027-street-mandate.vercel.app/api/v1/evidence-records";
const CONTRACT_VERSION = "0.1.0";
const PAGE_SIZE = 50;
const MAX_PAGES = 100;
const VERIFICATION = new Set([
  "unverified", "source_confirmed", "content_corroborated", "disputed",
  "corrected", "superseded", "withdrawn",
]);
const RELATIONS = new Set(["not-assessed", "context-only", "corroborates", "contradicts", "unrelated"]);
const LINK_REVIEW = new Set(["not-reviewed", "source-reachable", "content-checked", "disputed"]);
const VALUE_STATUS = new Set(["observed", "estimated", "provisional", "missing", "revised"]);
const PUBLIC_KEYS = new Set([
  "id", "displayId", "contractVersion", "publicationStatus", "verificationStatus",
  "evidenceType", "evidenceScope", "title", "sourceTitle", "sourceUrl", "sourceId",
  "publisher", "indicatorCode", "measure", "unit", "observedValue", "valueStatus",
  "geographicLevel", "geographicUnit", "referencePeriod", "retrievedAt", "methodology",
  "limitations", "dataStatus", "evidenceLinkReview", "evidenceRelation",
  "linkedCommunityObservationId", "linkedDemandId", "createdAt",
]);

export interface EvidenceVaultAdapterConfig {
  url?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

type ApiRecord = EvidenceVaultRecord;

type ApiResponse = {
  contractVersion: string;
  publicationBoundary: string;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  truncatedUpstream: boolean;
  records: ApiRecord[];
};

function unavailable(message: string): EvidenceVaultFeed {
  return { status: "unavailable", records: [], total: null, message };
}

function nullableString(value: unknown): boolean {
  return value === null || typeof value === "string";
}

function isRecord(value: unknown): value is ApiRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  if (Object.keys(r).some((key) => !PUBLIC_KEYS.has(key))) return false;
  if (r.contractVersion !== CONTRACT_VERSION || r.publicationStatus !== "published") return false;
  if (typeof r.id !== "string" || !r.id || !nullableString(r.displayId)) return false;
  if (typeof r.title !== "string" || !r.title.trim()) return false;
  if (typeof r.sourceUrl !== "string" || !r.sourceUrl.startsWith("https://")) return false;
  if (typeof r.evidenceType !== "string" || !r.evidenceType) return false;
  if (typeof r.evidenceScope !== "string" || !r.evidenceScope) return false;
  if (typeof r.verificationStatus !== "string" || !VERIFICATION.has(r.verificationStatus)) return false;
  if (typeof r.evidenceRelation !== "string" || !RELATIONS.has(r.evidenceRelation)) return false;
  if (!nullableString(r.sourceTitle) || !nullableString(r.sourceId) || !nullableString(r.publisher)) return false;
  if (!nullableString(r.indicatorCode) || !nullableString(r.measure) || !nullableString(r.unit)) return false;
  if (r.observedValue !== null && (typeof r.observedValue !== "number" || !Number.isFinite(r.observedValue))) return false;
  if (r.valueStatus !== null && (typeof r.valueStatus !== "string" || !VALUE_STATUS.has(r.valueStatus))) return false;
  if (!nullableString(r.geographicLevel) || !nullableString(r.geographicUnit) || !nullableString(r.referencePeriod)) return false;
  if (!nullableString(r.retrievedAt) || !nullableString(r.methodology) || !nullableString(r.limitations)) return false;
  if (!nullableString(r.dataStatus) || !nullableString(r.evidenceLinkReview) || !nullableString(r.linkedCommunityObservationId) || !nullableString(r.linkedDemandId)) return false;
  if (r.evidenceLinkReview !== null && !LINK_REVIEW.has(String(r.evidenceLinkReview))) return false;
  if (typeof r.createdAt !== "string") return false;

  if (r.evidenceRelation === "corroborates" &&
    (r.verificationStatus !== "content_corroborated" || r.evidenceLinkReview !== "content-checked" || !r.linkedCommunityObservationId)) return false;
  if (r.evidenceRelation === "contradicts" &&
    (r.verificationStatus !== "disputed" || r.evidenceLinkReview !== "content-checked" || !r.linkedCommunityObservationId)) return false;
  return true;
}

export async function fetchEvidenceVaultRecords(
  config: EvidenceVaultAdapterConfig = {},
): Promise<EvidenceVaultFeed> {
  const url = config.url || DEFAULT_EVIDENCE_VAULT_URL;
  const fetchImpl = config.fetchImpl ?? (typeof fetch !== "undefined" ? fetch.bind(globalThis) : undefined);
  const timeoutMs = config.timeoutMs ?? 12_000;
  if (!fetchImpl) return unavailable("The published Evidence Vault feed cannot be reached in this environment.");
  const request = fetchImpl as typeof fetch;

  async function getPage(page: number): Promise<ApiResponse> {
    const target = new URL(url);
    target.searchParams.set("page", String(page));
    target.searchParams.set("pageSize", String(PAGE_SIZE));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await request(target.toString(), {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json() as ApiResponse;
    } finally {
      clearTimeout(timer);
    }
  }

  try {
    const first = await getPage(1);
    if (!first || first.contractVersion !== CONTRACT_VERSION ||
      first.publicationBoundary !== "published-and-dual-reviewed-only" ||
      first.page !== 1 || !Number.isInteger(first.total) || first.total < 0 ||
      !Number.isInteger(first.totalPages) || first.totalPages < 1 || !Array.isArray(first.records)) {
      return { status: "invalid", records: [], total: null, message: "The Evidence Vault returned an unsupported contract." };
    }
    if (first.truncatedUpstream) {
      return { status: "incomplete", records: [], total: first.total, message: "The Evidence Vault source reports incomplete retrieval. Records are withheld." };
    }
    if (first.totalPages > MAX_PAGES) {
      return { status: "incomplete", records: [], total: first.total, message: "The Evidence Vault feed exceeds the safe pagination limit." };
    }

    const all = [...first.records];
    for (let page = 2; page <= first.totalPages; page += 1) {
      const next = await getPage(page);
      if (!next || next.contractVersion !== CONTRACT_VERSION ||
        next.publicationBoundary !== "published-and-dual-reviewed-only" ||
        next.page !== page || next.total !== first.total || next.totalPages !== first.totalPages ||
        !Array.isArray(next.records)) {
        return { status: "invalid", records: [], total: first.total, message: "Evidence Vault pagination is inconsistent." };
      }
      if (next.truncatedUpstream) {
        return { status: "incomplete", records: [], total: first.total, message: "The Evidence Vault source reports incomplete retrieval." };
      }
      all.push(...next.records);
    }

    if (all.length !== first.total) {
      return { status: "incomplete", records: [], total: first.total, message: "The retrieved evidence count does not match the source total." };
    }
    if (!all.every(isRecord)) {
      return { status: "invalid", records: [], total: first.total, message: "One or more evidence records failed the public allowlist or relation checks." };
    }
    if (new Set(all.map((record) => record.id)).size !== all.length) {
      return { status: "invalid", records: [], total: first.total, message: "Duplicate Evidence Vault record IDs were returned." };
    }
    return {
      status: all.length ? "ready" : "empty",
      records: all,
      total: first.total,
      message: all.length ? null : "No evidence records have passed the publication gate yet.",
    };
  } catch {
    return unavailable("The published Evidence Vault feed is temporarily unavailable. No source registry or synthetic records are substituted.");
  }
}
