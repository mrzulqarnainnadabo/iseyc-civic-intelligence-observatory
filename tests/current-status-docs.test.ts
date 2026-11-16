import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Observatory status documentation", () => {
  it("marks the old Stage 1 note as historical rather than current main", () => {
    const historical = readFileSync("docs/STAGE1-STATUS.md", "utf8");
    expect(historical).toContain("Archived historical snapshot");
    expect(historical).toContain("does not describe current `main`");
  });

  it("documents current adapter selection without claiming production readiness", () => {
    const status = readFileSync("docs/implementation-status.md", "utf8");
    const architecture = readFileSync("docs/system-architecture.md", "utf8");
    expect(status).toContain("published Civic Mandate CommunityRecord adapter by default");
    expect(status).toContain("founder release gate");
    expect(status).toContain("production gateway/feed was not contacted");
    expect(architecture).toContain("explicit recognized `?demo=` selection");
    expect(architecture).toContain("Only reviewed, published, allowlisted fields");
    expect(architecture).not.toContain("Live adapters disabled by default");
  });
});
