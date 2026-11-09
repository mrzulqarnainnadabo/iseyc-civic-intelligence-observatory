import { describe, expect, it } from "vitest";
import hubs from "../src/data/innovation-hubs.v1.json";
import sources from "../src/data/source-registry.json";

describe("selected ISN innovation hub directory", () => {
  it("contains unique selected listings linked to the registered ISN directory", () => {
    const ids = hubs.hubs.map((hub) => hub.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(hubs.hubs).toHaveLength(8);
    expect(sources.some((source) => source.id === hubs.sourceId && source.url === hubs.sourceUrl)).toBe(true);
  });
  it("includes the Kaduna and Kano listings needed for northern ecosystem discovery", () => {
    expect(hubs.hubs.find((hub) => hub.id === "startzone-kaduna")).toMatchObject({
      name: "StartZone Kaduna", city: "Kaduna", state: "Kaduna", isnStatus: "Network Member",
    });
    expect(hubs.hubs.find((hub) => hub.id === "kano-digital-innovation-hub")).toMatchObject({
      name: "Kano Digital Innovation Hub", city: "Kano", state: "Kano", isnStatus: "ISO Certified",
    });
  });
  it("uses only directory-listed status labels and sector tags", () => {
    for (const hub of hubs.hubs) {
      expect(["ISO Certified", "Network Member"]).toContain(hub.isnStatus);
      expect(hub.focus.length).toBeGreaterThan(0);
      expect(hub.state).toBeTruthy();
      expect(hub.city).toBeTruthy();
    }
  });
});
