from .business_data_adapter import BusinessDataAdapter, BusinessListing

class MockBusinessAdapter(BusinessDataAdapter):
    def get_nearby_businesses(self, lat: float, lon: float, radius_km: float, business_type: str) -> list[BusinessListing]:
        """
        Returns a deterministic, seeded set of fake business listings relative to the given lat/lon.
        """
        
        # We generate a mix of items inside a typical 5km radius and outside.
        # We explicitly set their types so we can test the filtering logic.
        
        # If the requested business_type matches our seeded logic ("Bio-Fertilizer Unit"),
        # we return this mock array where some match and some don't.
        # Otherwise, we just return an empty list or a list where nothing matches.
        
        # For tests, we assume the primary requested type is "Bio-Fertilizer Unit"
        main_type = "Bio-Fertilizer Unit"
        
        return [
            BusinessListing(id="mock-1", name="Local Comp A", business_type=main_type, lat=lat+0.01, lon=lon),
            BusinessListing(id="mock-2", name="Local Comp B", business_type=main_type, lat=lat+0.02, lon=lon),
            BusinessListing(id="mock-3", name="Local Comp C (Diff Cat)", business_type="Dairy", lat=lat+0.015, lon=lon),
            BusinessListing(id="mock-4", name="Mid-Range Comp D", business_type=main_type, lat=lat+0.06, lon=lon),
            BusinessListing(id="mock-5", name="Far Comp E", business_type=main_type, lat=lat+0.20, lon=lon),
        ]
