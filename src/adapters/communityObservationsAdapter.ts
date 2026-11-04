import type { CommunityObservation, CommunityObservationFeed, Sector } from "../data/types";

export const DEFAULT_COMMUNITY_OBSERVATIONS_URL =
  "https://2027-street-mandate.vercel.app/api/v1/community-observations";
const CONTRACT_VERSION = "0.1.0";
const PAGE_SIZE = 50;
const MAX_PAGES = 100;
const VALID_VERIFICATION = new Set(["unverified", "corroborated", "independently-verified", "disputed"]);

export interface CommunityObservationAdapterConfig {
  url?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

type ApiRecord = {
  id: string;
  displayId: string | null;
  contractVersion: string;
  publicationStatus: string;
  verificationStatus: string;
  title: string;
  reportType: string;
  sector: string;
  state: string;
  lga: string | null;
  ward: string | null;
  placeOrFacility: string | null;
  observedOn: string | null;
  description: string;
  evidenceTypes: string[];
  evidenceLink: string | null;
  submittedAt: string;
  publishedAt: string | null;
};

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

const SECTOR_MAP: Record<string, Sector> = {
  Health: "health",
  Education: "education",
  Security: "security",
  Infrastructure: "infrastructure",
  "Water and sanitation": "water-sanitation",
  Employment: "employment",
  "Public finance": "public-finance",
  Governance: "governance",
  Agriculture: "agriculture",
  Environment: "environment",
};

function stateSlug(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (["fct", "abuja", "abuja fct", "federal capital territory"].includes(normalized)) return "fct";
  return normalized.replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/nassarawa/g, "nasarawa");
}

function isRecord(value: unknown): value is ApiRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  return r.contractVersion === CONTRACT_VERSION &&
    r.publicationStatus === "published" &&
    typeof r.id === "string" && r.id.length > 0 &&
    typeof r.title === "string" && r.title.trim().length > 0 &&
    typeof r.description === "string" && r.description.trim().length > 0 &&
    typeof r.reportType === "string" && r.reportType.length > 0 &&
    typeof r.sector === "string" && r.sector.length > 0 &&
    typeof r.state === "string" && r.state.length > 0 &&
    Array.isArray(r.evidenceTypes) && r.evidenceTypes.every((x) => typeof x === "string") &&
    VALID_VERIFICATION.has(String(r.verificationStatus)) &&
    (r.evidenceLink === null || (typeof r.evidenceLink === "string" && r.evidenceLink.startsWith("https://")));
}

function mapRecord(record: ApiRecord): CommunityObservation {
  return {
    id: "observation-" + record.id,
    displayId: record.displayId || null,
    synthetic: false,
    contractVersion: CONTRACT_VERSION,
    publicationStatus: "published",
    verificationStatus: record.verificationStatus as CommunityObservation["verificationStatus"],
    title: record.title,
    reportType: record.reportType,
    description: record.description,
    sector: SECTOR_MAP[record.sector] || null,
    stateId: stateSlug(record.state),
    stateName: record.state,
    lga: record.lga || null,
    ward: record.ward || null,
    placeOrFacility: record.placeOrFacility || null,
    observedOn: record.observedOn || null,
    evidenceTypes: record.evidenceTypes,
    evidenceLink: record.evidenceLink,
    submittedAt: record.submittedAt,
    publishedAt: record.publishedAt || null,
  };
}

function unavailable(message: string): CommunityObservationFeed {
  return { status: "unavailable", records: [], total: null, message };
}

export async function fetchCommunityObservations(
  config: CommunityObservationAdapterConfig = {},
): Promise<CommunityObservationFeed> {
  const url = config.url || DEFAULT_COMMUNITY_OBSERVATIONS_URL;
  const fetchImpl = config.fetchImpl ?? (typeof fetch !== "undefined" ? fetch.bind(globalThis) : undefined);
  const timeoutMs = config.timeoutMs ?? 12_000;
  if (!fetchImpl) return unavailable("The community observation feed cannot be reached in this environment.");

  async function getPage(page: number): Promise<ApiResponse> {
    const target = new URL(url);
    target.searchParams.set("page", String(page));
    target.searchParams.set("pageSize", String(PAGE_SIZE));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(target.toString(), {
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
      first.publicationBoundary !== "published-only" ||
      first.page !== 1 || !Number.isInteger(first.total) || first.total < 0 ||
      !Number.isInteger(first.totalPages) || first.totalPages < 1 ||
      !Array.isArray(first.records)) {
      return { status: "invalid", records: [], total: null, message: "The community observation feed returned an unsupported contract." };
    }
    if (first.truncatedUpstream) {
      return { status: "incomplete", records: [], total: first.total, message: "The source reports an incomplete feed. Records are withheld until completeness can be established." };
    }
    if (first.totalPages > MAX_PAGES) {
      return { status: "incomplete", records: [], total: first.total, message: "The feed exceeds the safe pagination limit. Records are withheld." };
    }

    const all = [...first.records];
    for (let page = 2; page <= first.totalPages; page += 1) {
      const next = await getPage(page);
      if (!next || next.contractVersion !== CONTRACT_VERSION ||
        next.publicationBoundary !== "published-only" ||
        next.page !== page || next.total !== first.total ||
        next.totalPages !== first.totalPages || !Array.isArray(next.records)) {
        return { status: "invalid", records: [], total: first.total, message: "The community observation pagination contract is inconsistent." };
      }
      if (next.truncatedUpstream) {
        return { status: "incomplete", records: [], total: first.total, message: "The source reports an incomplete feed. Records are withheld until completeness can be established." };
      }
      all.push(...next.records);
    }

    if (all.length !== first.total) {
      return { status: "incomplete", records: [], total: first.total, message: "The retrieved record count does not match the source total. Records are withheld." };
    }
    if (!all.every(isRecord)) {
      return { status: "invalid", records: [], total: first.total, message: "One or more published observations failed validation. The feed is withheld." };
    }
    const ids = all.map((record) => record.id);
    if (new Set(ids).size !== ids.length) {
      return { status: "invalid", records: [], total: first.total, message: "The source returned duplicate observation IDs. The feed is withheld." };
    }

    const records = all.map(mapRecord);
    return {
      status: records.length ? "ready" : "empty",
      records,
      total: first.total,
      message: records.length
        ? null
        : "No observations have passed the publication gate yet. An empty feed does not mean services are functioning.",
    };
  } catch {
    return unavailable("The published community observation feed is temporarily unavailable. No substitute or demonstration records are shown.");
  }
}
