export interface MarketReachData {
  estimatedReachRadiusKm: number;
  populationInReach: number;
  footfallPotential: "Low" | "Medium" | "High";
  drivingFactors: string[];
}

export interface CompetitorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  typeMatch: string;
}

export interface CompetitorDensity {
  count: number;
  avgDistanceKm: number;
  nearestUnsaturatedArea: string;
  centerLat?: number;
  centerLng?: number;
  competitors?: CompetitorLocation[];
}

export interface ProductMarketValue {
  suggestedPriceRange: string;
  localComparison: string;
  purchasingPowerIndicator: "Low" | "Medium" | "High";
}

export interface RoleModelRealityCheck {
  title: string;
  story: string;
  keyTakeaway: string;
  monthlyTurnover: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface FeasibilityReport {
  id: string;
  businessName: string;
  location: string;
  viabilityScore: number; // 0 - 100
  competitorDensity: CompetitorDensity;
  roleModelRealityCheck: RoleModelRealityCheck;
  swot: SWOT;
  productMarketValue?: ProductMarketValue; // Optional for backward compatibility with mock
  marketReach?: MarketReachData;
}

export interface SchemeMatch {
  schemeName: string;
  marginMoneyPercent: number; // e.g. 10%
  bankLoanPercent: number;    // e.g. 90%
  interestRatePercent: number;
  estimatedEMI: number;
  maxLoanAmount: number;
}

export type ApplicantStatus = 'pending' | 'needs_review' | 'approved';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Applicant {
  id: string;
  name: string;
  businessType: string;
  viabilityScore: number;
  schemeTier: string;
  status: ApplicantStatus;
  riskLevel: RiskLevel;
  submittedDate: string;
  projectCost: number;
}

export interface OfficerStats {
  totalPending: number;
  highRiskCount: number;
  approvedThisQuarter: number;
  totalDisbursedAmount: number;
}
