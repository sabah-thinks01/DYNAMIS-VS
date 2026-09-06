import type { MarketReachData } from "@/types";

// TODO: Replace this mock data with a real API fetch call from backend feasibility service
// (e.g. from the feasibility-engine's geospatial or census data layer).
export const mockMarketReach: MarketReachData = {
  estimatedReachRadiusKm: 12.5,
  populationInReach: 45200,
  footfallPotential: "High",
  drivingFactors: [
    "Proximity to regional transport hub (2 km)",
    "Located along the primary agricultural supply route",
    "High density of local farmer cooperatives in adjacent villages"
  ]
};
