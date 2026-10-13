import { describe, it, expect } from "vitest";
import { FAQ_ITEMS, getFaqById } from "./faq";
import { SCHEME_RULES } from "../eligibility/schemeRules";
import { formatLakhAmount } from "../eligibility/evaluateEligibility";

describe("FAQ Items Configuration", () => {
  const EXPECTED_IDS = [
    "what-is-nbcfdc",
    "who-can-apply",
    "how-much",
    "interest",
    "own-money",
    "repay-start",
    "where-apply",
    "is-it-promise",
    "how-area",
  ];

  const EXPECTED_QUESTIONS: Record<string, string> = {
    "what-is-nbcfdc": "What is NBCFDC?",
    "who-can-apply": "Who can get a loan?",
    "how-much": "How much loan can I get?",
    interest: "How much interest will I pay?",
    "own-money": "How much of my own money do I need?",
    "repay-start": "When do I start paying back?",
    "where-apply": "Where do I apply?",
    "is-it-promise": "Is this app's result a promise?",
    "how-area": "How does the app check my area?",
  };

  it("ids equal exactly specified 9 ids in order", () => {
    expect(FAQ_ITEMS).toHaveLength(9);
    expect(FAQ_ITEMS.map((item) => item.id)).toEqual(EXPECTED_IDS);
  });

  it("each question text equals the spec text exactly", () => {
    FAQ_ITEMS.forEach((item) => {
      expect(item.question).toBe(EXPECTED_QUESTIONS[item.id]);
    });
  });

  it("has non-empty answers for all items", () => {
    FAQ_ITEMS.forEach((item) => {
      expect(item.answer.trim().length).toBeGreaterThan(0);
    });
  });

  it("no answer contains 'not confirmed', 'undefined', 'NaN', 'null', '[object', or any phone number / email", () => {
    const forbidden = ["not confirmed", "undefined", "NaN", "null", "[object"];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

    FAQ_ITEMS.forEach((item) => {
      forbidden.forEach((term) => {
        expect(item.answer.toLowerCase()).not.toContain(term.toLowerCase());
      });
      expect(item.answer).not.toMatch(emailRegex);
      expect(item.answer).not.toMatch(phoneRegex);
    });
  });

  it("validates action links have allowed hrefs", () => {
    const itemsWithLinks = FAQ_ITEMS.filter((item) => item.actionLink);
    const ALLOWED_HREFS = ["/module2/scheme-match", "/module1/opportunity-analysis"];

    itemsWithLinks.forEach((item) => {
      expect(ALLOWED_HREFS).toContain(item.actionLink!.href);
      expect(item.actionLink!.label.trim().length).toBeGreaterThan(0);
    });

    // Items without links must have undefined actionLink
    const itemsWithoutLinks = FAQ_ITEMS.filter((item) => !item.actionLink);
    const unlinkedIds = itemsWithoutLinks.map((item) => item.id);
    expect(unlinkedIds).toEqual([
      "what-is-nbcfdc",
      "interest",
      "own-money",
      "repay-start",
      "where-apply",
      "is-it-promise",
    ]);
  });

  describe("Rule-grounded numerical accuracy", () => {
    const individualRule = SCHEME_RULES.find((r) => r.id === "individual-loan")!;
    const groupRule = SCHEME_RULES.find((r) => r.id === "group-loan")!;
    const slab1 = individualRule.baseRate.slabs[0];
    const slab2 = individualRule.baseRate.slabs[1];

    it("who-can-apply matches incomeLimit from rules", () => {
      const item = getFaqById("who-can-apply")!;
      expect(item).toBeDefined();
      expect(item.answer).toContain(formatLakhAmount(individualRule.incomeLimit));
    });

    it("how-much contains formatted individual-loan and group-loan maxLoan", () => {
      const item = getFaqById("how-much")!;
      expect(item).toBeDefined();
      expect(item.answer).toContain(formatLakhAmount(individualRule.maxLoan));
      expect(item.answer).toContain(formatLakhAmount(groupRule.maxLoan));
    });

    it("interest contains 7%, 8%, 4 years, 7 years, ₹1.25 lakh matching SCHEME_RULES values", () => {
      const item = getFaqById("interest")!;
      expect(item).toBeDefined();
      expect(item.answer).toContain(`${slab1.percent}%`);
      expect(item.answer).toContain(`${slab2.percent}%`);
      expect(item.answer).toContain(`${slab1.repaymentYears} years`);
      expect(item.answer).toContain(`${slab2.repaymentYears} years`);
      expect(item.answer).toContain(formatLakhAmount(slab1.upTo!));
      expect(item.answer).toContain("7%");
      expect(item.answer).toContain("8%");
      expect(item.answer).toContain("4 years");
      expect(item.answer).toContain("7 years");
      expect(item.answer).toContain("₹1.25 lakh");
    });

    it("own-money contains nbcfdcPercent and otherPercent from rules", () => {
      const item = getFaqById("own-money")!;
      expect(item).toBeDefined();
      expect(item.answer).toContain(`${individualRule.split.otherPercent}%`);
      expect(item.answer).toContain(`${individualRule.split.nbcfdcPercent}%`);
    });

    it("repay-start contains moratoriumMonths from the rules", () => {
      const item = getFaqById("repay-start")!;
      expect(item).toBeDefined();
      expect(item.answer).toContain(`${individualRule.moratoriumMonths} months`);
    });
  });

  describe("getFaqById", () => {
    it("returns matching item for valid id", () => {
      expect(getFaqById("what-is-nbcfdc")?.id).toBe("what-is-nbcfdc");
    });

    it("returns undefined for unknown id", () => {
      expect(getFaqById("unknown-id")).toBeUndefined();
    });
  });
});
