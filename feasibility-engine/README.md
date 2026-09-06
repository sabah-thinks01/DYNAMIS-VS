# DYNAMIS Feasibility Engine (Module 1)

This is a standalone Python FastAPI microservice that handles spatial competitor density calculations, threshold-based business rules, and SWOT report synthesis.

## Current State (Mock & Stubs)
Currently, this engine is configured to run entirely offline using:
- **MockBusinessAdapter**: Seeded mock competitor data for deterministic spatial testing.
- **TemplateSynthesizer**: Pre-defined string templates for SWOT generation.
- **GeoPandas/Shapely**: Handled purely in-memory (no PostGIS required).

## Missing Credentials / Stubs
To activate real integrations, the following stubs need credentials and implementation:
1. **Mappls (MapmyIndia) API**: Requires an API key. See `app/adapters/mappls_adapter.py`.
2. **Gemini API**: Requires an API key for live report synthesis. See `app/synthesis/report_synthesizer.py`.
3. **PostGIS**: Spatial math currently runs in-memory via GeoPandas. Swapping to PostGIS spatial queries later is a targeted optimization.
4. **District Registry**: The `district_median_density` is currently passed as an arbitrary parameter. TODO: Wire this up to a real SCA or government open data registry.

## How to Run Locally

```bash
# 1. Create a virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run tests
pytest tests/

# 4. Start the server
uvicorn app.main:app --reload --port 8000
```

Access the OpenAPI docs at http://127.0.0.1:8000/docs
