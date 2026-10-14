import { describe, it, expect } from "vitest";
import { parseNearbyResponse } from "./useAlternatives";

describe("parseNearbyResponse", () => {
  it("ok, results 6 unique eLocs -> count 6, failed false", () => {
    const data = {
      ok: true,
      capped: false,
      results: [
        { eLoc: "LOC1", placeName: "Place 1" },
        { eLoc: "LOC2", placeName: "Place 2" },
        { eLoc: "LOC3", placeName: "Place 3" },
        { eLoc: "LOC4", placeName: "Place 4" },
        { eLoc: "LOC5", placeName: "Place 5" },
        { eLoc: "LOC6", placeName: "Place 6" },
      ],
    };
    const res = parseNearbyResponse(true, data);
    expect(res).toEqual({
      count: 6,
      capped: false,
      failed: false,
    });
  });

  it("ok, results with duplicate eLoc -> deduped count", () => {
    const data = {
      ok: true,
      capped: false,
      results: [
        { eLoc: "LOC1", placeName: "Place 1" },
        { eLoc: "LOC1", placeName: "Place 1 duplicate" },
        { eLoc: "LOC2", placeName: "Place 2" },
      ],
    };
    const res = parseNearbyResponse(true, data);
    expect(res).toEqual({
      count: 2,
      capped: false,
      failed: false,
    });
  });

  it("ok, 3 results with no eLoc -> count 3", () => {
    const data = {
      ok: true,
      capped: false,
      results: [
        { placeName: "Place A" },
        { placeName: "Place B" },
        { placeName: "Place C" },
      ],
    };
    const res = parseNearbyResponse(true, data);
    expect(res).toEqual({
      count: 3,
      capped: false,
      failed: false,
    });
  });

  it("ok, results [] -> count 0, failed false", () => {
    const data = {
      ok: true,
      capped: false,
      results: [],
    };
    const res = parseNearbyResponse(true, data);
    expect(res).toEqual({
      count: 0,
      capped: false,
      failed: false,
    });
  });

  it("ok, 30 results, capped false -> capped true", () => {
    const data = {
      ok: true,
      capped: false,
      results: Array.from({ length: 30 }, (_, i) => ({
        eLoc: `LOC_${i}`,
        placeName: `Place ${i}`,
      })),
    };
    const res = parseNearbyResponse(true, data);
    expect(res).toEqual({
      count: 30,
      capped: true,
      failed: false,
    });
  });

  it("httpOk false -> failed true", () => {
    const res = parseNearbyResponse(false, { ok: false, errorType: "network" });
    expect(res).toEqual({
      count: null,
      capped: false,
      failed: true,
    });
  });

  it("httpOk true but data.ok === false -> failed true", () => {
    const res = parseNearbyResponse(true, { ok: false, errorType: "rate_limited" });
    expect(res).toEqual({
      count: null,
      capped: false,
      failed: true,
    });
  });

  it("results missing / not an array -> failed true", () => {
    const res1 = parseNearbyResponse(true, { ok: true });
    expect(res1).toEqual({
      count: null,
      capped: false,
      failed: true,
    });

    const res2 = parseNearbyResponse(true, { ok: true, results: "not-an-array" });
    expect(res2).toEqual({
      count: null,
      capped: false,
      failed: true,
    });
  });

  it("data null / not JSON object -> failed true", () => {
    const res1 = parseNearbyResponse(true, null);
    expect(res1).toEqual({
      count: null,
      capped: false,
      failed: true,
    });

    const res2 = parseNearbyResponse(true, "some string");
    expect(res2).toEqual({
      count: null,
      capped: false,
      failed: true,
    });
  });

  it("handles 404 with errorType: 'no_results' as count 0, failed false", () => {
    const res = parseNearbyResponse(false, { ok: false, errorType: "no_results", source: "mappls" });
    expect(res).toEqual({
      count: 0,
      capped: false,
      failed: false,
    });
  });
});
