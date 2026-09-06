import json
from app.models import FeasibilityRequest
from app.main import create_feasibility_report
from app.config import settings

# Explicitly print the settings flags to confirm we are running live
print(f"FEASIBILITY_DATA_SOURCE: {settings.FEASIBILITY_DATA_SOURCE}")
print(f"FEASIBILITY_SYNTHESIS: {settings.FEASIBILITY_SYNTHESIS}")

req = FeasibilityRequest(
    lat=18.1523,
    lon=74.5768,
    radius_km=15.0,
    business_type="Fertilizer",
    location_name="Baramati Rural Hub",
    district_median_density=2
)

print("\nExecuting live feasibility report request...")
try:
    resp = create_feasibility_report(req)
    print("\n--- RAW RESPONSE ---")
    with open("test_output.json", "w", encoding="utf-8") as f:
        f.write(resp.model_dump_json(indent=2))
    print("Response saved to test_output.json successfully.")
except Exception as e:
    import traceback
    print("\n--- EXCEPTION CAUGHT ---")
    traceback.print_exc()
    print("------------------------\n")
