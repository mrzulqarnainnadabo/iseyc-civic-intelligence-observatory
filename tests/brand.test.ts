import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("ISEYC institutional brand", () => {
  it("uses the supplied seal in the approved full wordmark and Observatory shell", () => {
    const wordmark = readFileSync("public/iseyc-wordmark.svg", "utf8");
    const seal = readFileSync("public/iseyc-seal.svg", "utf8");
    const shell = readFileSync("src/design/layout.tsx", "utf8");
    const guide = readFileSync("docs/ISEYC-BRAND-SYSTEM.md", "utf8");
    const architecture = readFileSync("public/iseyc-system-architecture.svg", "utf8");
    expect(wordmark).toContain('href="data:image/png;base64,');
    expect(wordmark).toContain("Empowering Youth, Shaping Communities");
    expect(seal).toContain("ISEYC official seal");
    expect(shell).toContain('src="/iseyc-wordmark.svg"');
    expect(guide).toContain("The supplied official seal is the source of truth");
    for (const label of ["Civic Mandate", "Intelligence Observatory", "Civic Brain", "Education", "Health", "Software", "Civic Department", "Digital Operations Centre"]) expect(architecture).toContain(label);
  });
});
