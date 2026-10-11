/**
 * Shared Plain-Language Word List
 * The plain term is shown large, the technical term in small text beneath it.
 */

export const PLAIN_TERMS: Record<string, { plain: string; technical: string }> = {
  viabilityScore: {
    plain: "Chance of success",
    technical: "Viability Score",
  },
  marketSaturation: {
    plain: "How many sellers are already here",
    technical: "Market Saturation",
  },
  competitorDensity: {
    plain: "How many sellers are already here",
    technical: "Competitor Density",
  },
  footfallPotential: {
    plain: "How many people pass by",
    technical: "Footfall Potential",
  },
  populationInReach: {
    plain: "People you can sell to",
    technical: "Population in Reach",
  },
  reachRadius: {
    plain: "How far your customers live",
    technical: "Estimated Reach Radius",
  },
  purchasingPower: {
    plain: "How much people here can spend",
    technical: "Purchasing Power",
  },
  opportunityAnalysis: {
    plain: "Is this a good business here?",
    technical: "Opportunity Analysis",
  },
  swot: {
    plain: "What helps you / What could hurt you",
    technical: "SWOT Analysis",
  },
  productMarketValue: {
    plain: "What price can you sell at?",
    technical: "Product Market Value",
  },
  marginMoney: {
    plain: "Money you put in yourself",
    technical: "Margin money",
  },
  emi: {
    plain: "Monthly payment",
    technical: "EMI",
  },
  tenure: {
    plain: "How long you pay back",
    technical: "Repayment period",
  },
  moratorium: {
    plain: "Months before your first payment",
    technical: "Moratorium",
  },
  interestRate: {
    plain: "Extra you pay on the loan, per year",
    technical: "Rate of interest",
  },
  projectCost: {
    plain: "Total money needed to start",
    technical: "Project cost",
  },
  eligible: {
    plain: "You can apply",
    technical: "Eligible",
  },
  notEligible: {
    plain: "You can't apply yet",
    technical: "Not eligible",
  },
  sca: {
    plain: "Your state loan office",
    technical: "State Channelising Agency (SCA)",
  },
};
