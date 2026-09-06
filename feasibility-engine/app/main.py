from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid
import logging

from app.models import FeasibilityRequest, FeasibilityReportResponse
from app.adapters.mock_business_adapter import MockBusinessAdapter
from app.adapters.mappls_adapter import MapplsAdapter
from app.density.calculator import calculate_density
from app.rules.role_model_check import evaluate_role_model
from app.synthesis.report_synthesizer import generate_swot_template, generate_swot_gemini
from app.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="DYNAMIS Feasibility Engine",
    description="Module 1 backend for computing competitor density and viability.",
    version="0.1.0"
)

# ---------------------------------------------------------
# CORS — origins driven by env var CORS_ORIGINS (comma-separated).
# ⚠️  Defaults to localhost only. Add production frontend URL to CORS_ORIGINS
# in your hosting dashboard before going live.
# ---------------------------------------------------------
_raw_origins = settings.CORS_ORIGINS
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()] if _raw_origins else ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# HEALTH CHECK — use this to verify the deployed backend is reachable
# independently of the frontend. Expected response: {"status": "ok"}
# ---------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "version": "0.1.0",
        "data_source": settings.FEASIBILITY_DATA_SOURCE,
        "synthesis": settings.FEASIBILITY_SYNTHESIS,
    }

# ---------------------------------------------------------
# ADAPTER CONFIGURATION
# ---------------------------------------------------------
if settings.FEASIBILITY_DATA_SOURCE.lower() == "mappls":
    active_adapter = MapplsAdapter()
else:
    active_adapter = MockBusinessAdapter()

@app.post("/feasibility-report", response_model=FeasibilityReportResponse)
def create_feasibility_report(req: FeasibilityRequest):
    """
    Orchestrates the feasibility computation pipeline:
    1. Density Math via Adapter + GeoPandas
    2. Role Model Check (Threshold Rule)
    3. SWOT Synthesis (Template/AI)
    """
    
    # 1. Density Calculation
    density_result = calculate_density(
        adapter=active_adapter,
        lat=req.lat,
        lon=req.lon,
        radius_km=req.radius_km,
        business_type=req.business_type
    )
    
    # 2. Role Model Check (Threshold Rule)
    role_model_result = evaluate_role_model(
        density_count=density_result["count"],
        district_median=req.district_median_density
    )
    is_risk_elevated = density_result["count"] > req.district_median_density
    
    # 3. Report Synthesis
    swot_result = None
    if settings.FEASIBILITY_SYNTHESIS.lower() == "gemini":
        try:
            swot_result = generate_swot_gemini(
                business_type=req.business_type,
                density_count=density_result["count"],
                role_model_risk=is_risk_elevated
            )
        except Exception as e:
            logger.error(f"Gemini synthesis failed, falling back to template: {e}")
            
    if not swot_result:
        swot_result = generate_swot_template(
            business_type=req.business_type,
            density_count=density_result["count"],
            role_model_risk=is_risk_elevated
        )
    
    # 4. Viability Score (Basic heuristic for mock)
    score = 80
    if is_risk_elevated:
        score -= 15
    elif density_result["count"] == 0:
        score += 10
        
    return FeasibilityReportResponse(
        id=f"FR-{uuid.uuid4().hex[:8].upper()}",
        businessName=req.business_type,
        location=req.location_name,
        viabilityScore=score,
        competitorDensity=density_result,
        roleModelRealityCheck=role_model_result,
        swot=swot_result
    )
