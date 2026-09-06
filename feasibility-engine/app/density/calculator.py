import geopandas as gpd
from shapely.geometry import Point
import pandas as pd
from app.adapters.business_data_adapter import BusinessDataAdapter

def calculate_density(adapter: BusinessDataAdapter, lat: float, lon: float, radius_km: float, business_type: str) -> dict:
    # 1. Fetch a wider net (e.g. 50km) to find unsaturated pockets if any exist
    all_businesses = adapter.get_nearby_businesses(lat, lon, 50.0, business_type)
    
    # Filter by target business type
    competitors = [b for b in all_businesses if b.business_type == business_type]
    
    if not competitors:
        return {
            "count": 0,
            "avgDistanceKm": 0.0,
            "nearestUnsaturatedArea": "Immediate vicinity (0km)"
        }

    # 2. Build GeoDataFrame and Project
    # We use a custom Azimuthal Equidistant (aeqd) projection centered on the requested point.
    # This gives us accurate distance calculations in meters around the central point
    # without needing a PostGIS connection for now.
    df = pd.DataFrame([b.model_dump() for b in competitors])  # fixed dict() deprecation
    gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat), crs="EPSG:4326")
    
    aeqd_crs = f"+proj=aeqd +lat_0={lat} +lon_0={lon} +datum=WGS84 +units=m +no_defs"
    gdf_proj = gdf.to_crs(aeqd_crs)
    
    # Central point is (0, 0) in our custom aeqd projection
    center_pt = Point(0, 0)
    
    # 3. Calculate metrics
    gdf_proj['distance_km'] = gdf_proj.geometry.distance(center_pt) / 1000.0
    
    # Filter those strictly within requested radius
    inside_radius = gdf_proj[gdf_proj['distance_km'] <= radius_km]
    count = int(len(inside_radius))
    
    # Calculate average distance to the nearest 5 competitors
    nearest_5 = gdf_proj.nsmallest(5, 'distance_km')
    avg_dist = float(nearest_5['distance_km'].mean()) if not nearest_5.empty else 0.0
    
    # Find nearest unsaturated pocket (heuristic: furthest competitor in our wider search > radius_km)
    unsaturated = "Outer limits (> 15km)"
    if len(gdf_proj) > count:
        furthest = gdf_proj.nlargest(1, 'distance_km').iloc[0]
        unsaturated = f"Sector near {furthest['lat']:.4f}, {furthest['lon']:.4f} ({furthest['distance_km']:.1f} km away)"

    return {
        "count": count,
        "avgDistanceKm": round(avg_dist, 2),
        "nearestUnsaturatedArea": unsaturated
    }
