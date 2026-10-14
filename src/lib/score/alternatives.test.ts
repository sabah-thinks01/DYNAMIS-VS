import { describe, it, expect } from "vitest";
import { rankAlternatives, type AlternativeCountInput } from "./alternatives";

describe("rankAlternatives", () => {
  // Row 1: beauty count 6
  it("Row 1: beauty count 6 -> ranked, 13,000/seller, Good", () => {
    const input: AlternativeCountInput[] = [
      { type: "beauty", label: "Beauty parlour", count: 6, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(1);
    expect(res.ranked[0].peoplePerSeller).toBe(13000);
    expect(res.ranked[0].verdict).toBe("goodRoom");
    expect(res.ranked[0].capped).toBe(false);
    expect(res.notSeen).toHaveLength(0);
    expect(res.unchecked).toHaveLength(0);
  });

  // Row 2: kirana count 30 capped:true, peopleInReach 78,000
  it("Row 2: kirana count 30 capped:true, peopleInReach 78,000 -> ranked, verdict manySellers, maxPeoplePerSeller 2,600, sorted after all uncapped", () => {
    const input: AlternativeCountInput[] = [
      { type: "kirana", label: "Kirana store", count: 30, capped: true, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(1);
    expect(res.ranked[0].verdict).toBe("manySellers");
    expect(res.ranked[0].maxPeoplePerSeller).toBe(2600);
    expect(res.ranked[0].capped).toBe(true);
  });

  // Row 3: tailor count 26
  it("Row 3: tailor count 26 -> ranked, 3,000/seller, Some", () => {
    const input: AlternativeCountInput[] = [
      { type: "tailor", label: "Tailoring", count: 26, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(1);
    expect(res.ranked[0].peoplePerSeller).toBe(3000);
    expect(res.ranked[0].verdict).toBe("someRoom");
    expect(res.ranked[0].capped).toBe(false);
  });

  // Row 4: bakery count 30 capped:false, peopleInReach 78,000 (>=30 => capped)
  it("Row 4: bakery count 30 capped:false, peopleInReach 78,000 -> same as row 2 (>=30 => capped)", () => {
    const input: AlternativeCountInput[] = [
      { type: "bakery", label: "Bakery", count: 30, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(1);
    expect(res.ranked[0].verdict).toBe("manySellers");
    expect(res.ranked[0].maxPeoplePerSeller).toBe(2600);
    expect(res.ranked[0].capped).toBe(true);
  });

  // Row 5: medical count 26, capped:false, peopleInReach 50,000
  it("Row 5: medical count 26, capped:false, peopleInReach 50,000 -> ranked, peoplePerSeller 1,923.08, verdict crowded", () => {
    const input: AlternativeCountInput[] = [
      { type: "medical", label: "Medical", count: 26, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 50000, counts: input });
    expect(res.ranked).toHaveLength(1);
    expect(res.ranked[0].verdict).toBe("crowded");
    expect(res.ranked[0].capped).toBe(false);
    expect(res.ranked[0].peoplePerSeller).toBeCloseTo(1923.08, 2);
  });

  // Row 6: dairy count 0
  it("Row 6: dairy count 0 -> notSeen, not ranked", () => {
    const input: AlternativeCountInput[] = [
      { type: "dairy", label: "Dairy products", count: 0, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(0);
    expect(res.notSeen).toHaveLength(1);
    expect(res.notSeen[0]).toEqual({ type: "dairy", label: "Dairy products" });
    expect(res.unchecked).toHaveLength(0);
  });

  // Row 7: salon failed
  it("Row 7: salon failed -> unchecked only", () => {
    const input: AlternativeCountInput[] = [
      { type: "salon", label: "Salon", count: 5, capped: false, failed: true },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(0);
    expect(res.notSeen).toHaveLength(0);
    expect(res.unchecked).toHaveLength(1);
    expect(res.unchecked[0]).toEqual({ type: "salon", label: "Salon" });
  });

  // Row 8: count null
  it("Row 8: count null -> unchecked only", () => {
    const input: AlternativeCountInput[] = [
      { type: "salon", label: "Salon", count: null, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(0);
    expect(res.notSeen).toHaveLength(0);
    expect(res.unchecked).toHaveLength(1);
    expect(res.unchecked[0]).toEqual({ type: "salon", label: "Salon" });
  });

  // Row 9: two types both 13,000/seller ("Bakery", "Beauty parlour")
  it("Row 9: two types both 13,000/seller -> Bakery before Beauty parlour", () => {
    const input: AlternativeCountInput[] = [
      { type: "beauty", label: "Beauty parlour", count: 6, capped: false, failed: false },
      { type: "bakery", label: "Bakery", count: 6, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked).toHaveLength(2);
    expect(res.ranked[0].label).toBe("Bakery");
    expect(res.ranked[1].label).toBe("Beauty parlour");
  });

  // Row 10: peopleInReach 0 / null / NaN
  it("Row 10: peopleInReach 0 / null / NaN -> ranked=[], notSeen=[], all in unchecked", () => {
    const input: AlternativeCountInput[] = [
      { type: "beauty", label: "Beauty parlour", count: 6, capped: false, failed: false },
      { type: "dairy", label: "Dairy products", count: 0, capped: false, failed: false },
    ];

    for (const invalidReach of [0, null, NaN, -100, undefined]) {
      const res = rankAlternatives({ peopleInReach: invalidReach as any, counts: input });
      expect(res.ranked).toEqual([]);
      expect(res.notSeen).toEqual([]);
      expect(res.unchecked).toHaveLength(2);
      expect(res.unchecked[0].type).toBe("beauty");
      expect(res.unchecked[1].type).toBe("dairy");
    }
  });

  // Row 11: exactly 5,000/seller (peopleInReach 75,000, count 15)
  it("Row 11: exactly 5,000/seller (75,000 ÷ 15) -> Good (boundary >=5,000)", () => {
    const input: AlternativeCountInput[] = [
      { type: "farm", label: "Farm supplies", count: 15, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 75000, counts: input });
    expect(res.ranked[0].peoplePerSeller).toBe(5000);
    expect(res.ranked[0].verdict).toBe("goodRoom");
  });

  // Row 12: exactly 2,000/seller (peopleInReach 50,000, count 25 uncapped)
  it("Row 12: exactly 2,000/seller (50,000 ÷ 25 uncapped) -> Some (boundary >=2,000)", () => {
    const input: AlternativeCountInput[] = [
      { type: "repair", label: "Repair services", count: 25, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 50000, counts: input });
    expect(res.ranked[0].peoplePerSeller).toBe(2000);
    expect(res.ranked[0].verdict).toBe("someRoom");
  });

  // Row 13: ranked order mixed Good/Some/Crowded
  it("Row 13: ranked order mixed Good/Some/Crowded -> sorted by people per seller descending", () => {
    const input: AlternativeCountInput[] = [
      { type: "crowdedType", label: "Type C", count: 26, capped: false, failed: false }, // 50,000 / 26 = 1923.08 (Crowded)
      { type: "goodType", label: "Type A", count: 5, capped: false, failed: false }, // 50,000 / 5 = 10000 (Good)
      { type: "someType", label: "Type B", count: 20, capped: false, failed: false }, // 50,000 / 20 = 2500 (Some)
    ];
    const res = rankAlternatives({ peopleInReach: 50000, counts: input });
    expect(res.ranked).toHaveLength(3);
    expect(res.ranked[0].type).toBe("goodType");
    expect(res.ranked[0].verdict).toBe("goodRoom");
    expect(res.ranked[1].type).toBe("someType");
    expect(res.ranked[1].verdict).toBe("someRoom");
    expect(res.ranked[2].type).toBe("crowdedType");
    expect(res.ranked[2].verdict).toBe("crowded");
  });

  // Row 14: count 31 (defensive)
  it("Row 14: count 31 (defensive) -> treated as capped, manySellers", () => {
    const input: AlternativeCountInput[] = [
      { type: "kirana", label: "Kirana store", count: 31, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 78000, counts: input });
    expect(res.ranked[0].capped).toBe(true);
    expect(res.ranked[0].verdict).toBe("manySellers");
    expect(res.ranked[0].maxPeoplePerSeller).toBe(2600);
  });

  // Row 15: uncapped Crowded type and a capped type both present
  it("Row 15: uncapped Crowded type and a capped type both present -> the Crowded uncapped type comes BEFORE the capped type", () => {
    const input: AlternativeCountInput[] = [
      // Capped type with maxPeoplePerSeller = 78000 / 30 = 2600
      { type: "kirana", label: "Kirana store", count: 30, capped: true, failed: false },
      // Uncapped Crowded type with peoplePerSeller = 78000 / 40 -> but count >= 30 is capped!
      // So with peopleInReach: 50,000, medical count 26 gives 1923.08 (< 2000 Crowded, count 26 < 30 uncapped)
      // And capped type with 50,000 / 30 = 1666.67
    ];
    const resMixed = rankAlternatives({
      peopleInReach: 50000,
      counts: [
        { type: "kirana", label: "Kirana store", count: 30, capped: true, failed: false },
        { type: "medical", label: "Medical store", count: 26, capped: false, failed: false },
      ],
    });
    expect(resMixed.ranked).toHaveLength(2);
    // Medical is uncapped (verdict: crowded), Kirana is capped (verdict: manySellers)
    expect(resMixed.ranked[0].type).toBe("medical");
    expect(resMixed.ranked[0].capped).toBe(false);
    expect(resMixed.ranked[0].verdict).toBe("crowded");
    expect(resMixed.ranked[1].type).toBe("kirana");
    expect(resMixed.ranked[1].capped).toBe(true);
    expect(resMixed.ranked[1].verdict).toBe("manySellers");
  });

  // Row 16: count 30, capped:false, peopleInReach 50,000
  it("Row 16: count 30, capped:false, peopleInReach 50,000 -> ranked, verdict manySellers, maxPeoplePerSeller 1,666.67, sorted with the capped group", () => {
    const input: AlternativeCountInput[] = [
      { type: "bakery", label: "Bakery", count: 30, capped: false, failed: false },
    ];
    const res = rankAlternatives({ peopleInReach: 50000, counts: input });
    expect(res.ranked[0].capped).toBe(true);
    expect(res.ranked[0].verdict).toBe("manySellers");
    expect(res.ranked[0].maxPeoplePerSeller).toBeCloseTo(1666.67, 2);
  });
});
