from app.density.calculator import calculate_density
from app.adapters.mock_business_adapter import MockBusinessAdapter

def test_density_calculator_counts_and_math():
    """
    Tests the spatial arithmetic inside calculate_density using the MockBusinessAdapter.
    
    Mock seed logic at (18.52, 73.85):
    - mock-1: +0.01 lat (approx +1.11 km)
    - mock-2: +0.02 lat (approx +2.22 km)
    - mock-3: diff category (ignored)
    - mock-4: +0.06 lat (approx +6.66 km)
    - mock-5: +0.20 lat (approx +22.2 km)
    
    With a 5km radius, only mock-1 and mock-2 should be counted.
    """
    adapter = MockBusinessAdapter()
    lat, lon = 18.5204, 73.8567 # e.g. Pune center
    radius = 5.0
    
    result = calculate_density(adapter, lat, lon, radius, business_type="Bio-Fertilizer Unit")
    
    # Count should be 2 (mock-1 and mock-2 are inside 5km)
    assert result["count"] == 2
    
    # Average distance of nearest 5
    # Our matched competitors are 4 total (~1.1, ~2.2, ~6.6, ~22.2)
    # The average of these 4 should be around 8.0 km
    assert 7.0 < result["avgDistanceKm"] < 9.0
    
    # Nearest unsaturated pocket should flag the furthest mock item
    assert "Sector near" in result["nearestUnsaturatedArea"]
    assert "22." in result["nearestUnsaturatedArea"] # It's roughly 22.2km away

def test_density_calculator_no_competitors():
    adapter = MockBusinessAdapter()
    
    # Passing a business type that has no matching seeds
    result = calculate_density(adapter, 18.52, 73.85, 5.0, business_type="Nonexistent Sector")
    
    assert result["count"] == 0
    assert result["avgDistanceKm"] == 0.0
    assert "Immediate vicinity" in result["nearestUnsaturatedArea"]
