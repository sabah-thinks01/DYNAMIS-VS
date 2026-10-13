// ============================================================================
// DYNAMIS — Predefined Help FAQ Items
// ============================================================================
// Deterministic answers grounded in SCHEME_RULES.
// No AI, no network calls. Numbers derive from SCHEME_RULES configuration.
// ============================================================================

import { SCHEME_RULES } from "../eligibility/schemeRules";
import { formatLakhAmount } from "../eligibility/evaluateEligibility";

export interface FaqActionLink {
  href: string;
  label: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  actionLink?: FaqActionLink;
}

const individualRule = SCHEME_RULES.find((r) => r.id === "individual-loan")!;
const groupRule = SCHEME_RULES.find((r) => r.id === "group-loan")!;

const indSlab1 = individualRule.baseRate.slabs[0];
const indSlab2 = individualRule.baseRate.slabs[1];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-nbcfdc",
    question: "What is NBCFDC?",
    answer:
      "NBCFDC is a Government of India company that gives low-interest loans to people from Backward Classes to start or grow a business. The loan reaches you through your state's agency (called an SCA).",
  },
  {
    id: "who-can-apply",
    question: "Who can get a loan?",
    answer: `People from Backward Classes whose family earns up to ${formatLakhAmount(
      individualRule.incomeLimit
    )} a year. Self-help groups can apply together if at least 60% of members are from Backward Classes.`,
    actionLink: {
      href: "/module2/scheme-match",
      label: "Check my eligibility",
    },
  },
  {
    id: "how-much",
    question: "How much loan can I get?",
    answer: `Alone: up to ${formatLakhAmount(
      individualRule.maxLoan
    )}. In a self-help group: up to ${formatLakhAmount(groupRule.maxLoan)} per member.`,
    actionLink: {
      href: "/module2/scheme-match",
      label: "See my schemes",
    },
  },
  {
    id: "interest",
    question: "How much interest will I pay?",
    answer: `${indSlab1.percent}% a year for loans up to ${formatLakhAmount(
      indSlab1.upTo!
    )}, paid back over about ${indSlab1.repaymentYears} years. ${
      indSlab2.percent
    }% a year above that, paid back over about ${
      indSlab2.repaymentYears
    } years. ${individualRule.rebateNote}`,
  },
  {
    id: "own-money",
    question: "How much of my own money do I need?",
    answer: `Up to ${individualRule.split.otherPercent}% of the project cost. NBCFDC gives ${individualRule.split.nbcfdcPercent}%. Sometimes the state agency pays part of your share — ask them.`,
  },
  {
    id: "repay-start",
    question: "When do I start paying back?",
    answer: `There is nothing to pay for the first ${individualRule.moratoriumMonths} months. After that you pay in small parts. Your state agency sets the exact schedule.`,
  },
  {
    id: "where-apply",
    question: "Where do I apply?",
    answer:
      "At your state's channelising agency (SCA) or its district office. An officer there checks your papers and decides. This app helps you get ready before you go.",
  },
  {
    id: "is-it-promise",
    question: "Is this app's result a promise?",
    answer:
      "No. DYNAMIS is a guide, not a guarantee. The final decision is always made by the state agency officer.",
  },
  {
    id: "how-area",
    question: "How does the app check my area?",
    answer:
      "It uses the official 2011 Census population for your district and counts similar shops near you on the map (Mappls). Right now it covers Maharashtra, Tamil Nadu and Delhi.",
    actionLink: {
      href: "/module1/opportunity-analysis",
      label: "Check my area",
    },
  },
];

export function getFaqById(id: string): FaqItem | undefined {
  return FAQ_ITEMS.find((item) => item.id === id);
}
