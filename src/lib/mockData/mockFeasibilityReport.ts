import { FeasibilityReport } from "@/types";

// TODO: Replace mockFeasibilityReport with real API fetch call from backend feasibility service
export const mockFeasibilityReport: FeasibilityReport = {
  id: "FR-2026-8842",
  businessName: "Gramin Organic Bio-Fertilizer Unit",
  location: "Baramati Rural Hub, Pune District, Maharashtra",
  viabilityScore: 84,
  competitorDensity: {
    count: 3,
    avgDistanceKm: 14.5,
    nearestUnsaturatedArea: "Indapur East Sector (28 km away)",
    centerLat: 18.1523,
    centerLng: 74.5768, // Baramati approximate center
    competitors: [
      { id: "c1", name: "Shree Ganesh Agro", lat: 18.1720, lng: 74.5610, distanceKm: 2.3, typeMatch: "Exact match (Organic)" },
      { id: "c2", name: "Kisan Bio Inputs", lat: 18.1250, lng: 74.5900, distanceKm: 3.5, typeMatch: "Partial match (Mixed fertilizers)" },
      { id: "c3", name: "GreenEarth Fertilizer Co", lat: 18.2100, lng: 74.5100, distanceKm: 8.2, typeMatch: "Similar (Vermicompost)" }
    ]
  },
  productMarketValue: {
    // TODO: Connect to real pricing / purchasing-power data layer
    suggestedPriceRange: "₹350 – ₹420 per 25kg bag",
    localComparison: "Similar businesses in this area price between ₹380 and ₹450. A slightly lower entry price is suggested to capture initial market share.",
    purchasingPowerIndicator: "Medium",
  },
  roleModelRealityCheck: {
    title: "Role Model Reality Check: Sunita Kolhe's Bio-Input Unit (Satara)",
    story: "Sunita started a rural vermicompost unit with ₹3.5 Lakhs capital. By tapping local sugarcane farmer cooperatives and offering home-delivery bag sizes (25kg), she scaled to 12 villages within 18 months.",
    keyTakeaway: "Working directly with local farmer producer groups (FPOs) reduces distribution overheads by 35% compared to retail agro-dealers.",
    monthlyTurnover: "₹1,45,000 / month",
  },
  swot: {
    strengths: [
      "High local availability of raw bovine manure & crop residue",
      "Proximity to 4 active Sugarcane Cooperatives",
      "Low initial equipment maintenance overheads",
    ],
    weaknesses: [
      "Seasonal demand fluctuation aligned with monsoon crop sowing",
      "Limited initial storage capacity during peak rains",
    ],
    opportunities: [
      "Government subsidy support under NBCFDC Agro-allied scheme",
      "Growing regional demand for certified organic produce",
      "Potential bulk supply contracts with local horticulture nurseries",
    ],
    threats: [
      "Unregulated price swings in raw organic inputs",
      "Competing chemical fertilizer subsidies from local distributors",
    ],
  },
};
