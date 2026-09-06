from pydantic import BaseModel

class CompetitorDensity(BaseModel):
    count: int
    avgDistanceKm: float
    nearestUnsaturatedArea: str

class RoleModelRealityCheck(BaseModel):
    title: str
    story: str
    keyTakeaway: str
    monthlyTurnover: str

class SWOT(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    opportunities: list[str]
    threats: list[str]

class FeasibilityReportResponse(BaseModel):
    id: str
    businessName: str
    location: str
    viabilityScore: int
    competitorDensity: CompetitorDensity
    roleModelRealityCheck: RoleModelRealityCheck
    swot: SWOT

class FeasibilityRequest(BaseModel):
    business_type: str
    lat: float
    lon: float
    radius_km: float
    district_median_density: float
    location_name: str
